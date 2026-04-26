import asyncio
from src.domain.ports.lit_search import ILitSearch
from src.domain.ports.llm_client import ILLMClient
from src.domain.entities.experiment import Paper
from src.infrastructure.search.arxiv_client import ArXivClient
from src.infrastructure.search.pubmed import PubMedClient

SUMMARIZE_SYSTEM = "You are a scientific assistant. Summarize the following abstract in 2-3 sentences, plain English, focusing on what was done and what was found. Return only the summary, no preamble."

class CombinedLitSearch(ILitSearch):
    def __init__(self, llm: ILLMClient):
        self._ss = ArXivClient()
        self._pm = PubMedClient()
        self._llm = llm

    async def search(self, query: str) -> list[Paper]:
        ss_results, pm_results = await asyncio.gather(
            self._safe_search(self._ss, query),
            self._safe_search(self._pm, query)
        )

        seen_dois, seen_titles, merged = set(), set(), []
        for paper in pm_results + ss_results:
            doi = paper.relevance_note.strip()
            title_key = paper.title.lower()[:60]
            if (doi and doi in seen_dois) or title_key in seen_titles:
                continue
            if doi:
                seen_dois.add(doi)
            seen_titles.add(title_key)
            merged.append(paper)

        # Return more results for the UI, limit summaries to top 6
        results = merged[:8]

        summaries = await asyncio.gather(*[
            self._summarize(p) for p in results[:6]
        ])
        
        for i, paper in enumerate(results):
            if i < len(summaries):
                paper.abstract_summary = summaries[i]
            else:
                paper.abstract_summary = (paper.abstract[:200] + "...") if paper.abstract else "No summary."
            paper.relevance_note = ""

        return results

    async def _safe_search(self, client: ILitSearch, query: str) -> list[Paper]:
        try:
            return await client.search(query)
        except Exception:
            return []

    async def _summarize(self, paper: Paper) -> str:
        if not paper.abstract:
            return "Abstract not available."
        try:
            return await self._llm.complete(
                system=SUMMARIZE_SYSTEM,
                prompt=paper.abstract
            )
        except Exception:
            return paper.abstract[:300] + "..."
