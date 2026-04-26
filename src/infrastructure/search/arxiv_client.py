import httpx
import xml.etree.ElementTree as ET
from src.domain.ports.lit_search import ILitSearch
from src.domain.entities.experiment import Paper

class ArXivClient(ILitSearch):
    BASE_URL = "http://export.arxiv.org/api/query"

    async def search(self, query: str) -> list[Paper]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(self.BASE_URL, params={
                "search_query": f"all:{query}",
                "start": 0,
                "max_results": 15,
                "sortBy": "relevance",
                "sortOrder": "descending"
            })
            resp.raise_for_status()

        return self._parse(resp.text)

    def _parse(self, xml_text: str) -> list[Paper]:
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        root = ET.fromstring(xml_text)
        papers = []

        for entry in root.findall("atom:entry", ns):
            try:
                title = (entry.findtext("atom:title", "", ns) or "").strip().replace("\n", " ")
                abstract = (entry.findtext("atom:summary", "", ns) or "").strip().replace("\n", " ")
                
                authors = [
                    a.findtext("atom:name", "", ns)
                    for a in entry.findall("atom:author", ns)
                ][:3]

                published = entry.findtext("atom:published", "", ns)
                year = int(published[:4]) if published else 0

                # Prefer the abs page URL over the pdf link
                url = ""
                for link in entry.findall("atom:link", ns):
                    if link.get("type") == "text/html":
                        url = link.get("href", "")
                        break
                if not url:
                    url = entry.findtext("atom:id", "", ns)

                # arXiv has no DOI natively — use arxiv ID for dedup in CombinedLitSearch
                arxiv_id = url.split("/abs/")[-1] if "/abs/" in url else url

                papers.append(Paper(
                    title=title,
                    authors=authors,
                    year=year,
                    url=url,
                    abstract=abstract or None,
                    abstract_summary=None,
                    source="arxiv",
                    relevance_note=arxiv_id   # used for dedup in CombinedLitSearch
                ))
            except Exception:
                continue

        return papers
