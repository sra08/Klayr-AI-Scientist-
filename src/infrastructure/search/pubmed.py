import os
import httpx
import xml.etree.ElementTree as ET
from src.domain.ports.lit_search import ILitSearch
from src.domain.entities.experiment import Paper

class PubMedClient(ILitSearch):
    ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    EFETCH  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    API_KEY = os.environ.get("NCBI_API_KEY", "")

    async def search(self, query: str) -> list[Paper]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            search_resp = await client.get(self.ESEARCH, params={
                "db": "pubmed",
                "term": query,
                "retmax": 15,
                "retmode": "json",
                "api_key": self.API_KEY
            })
            search_resp.raise_for_status()
            ids = search_resp.json().get("esearchresult", {}).get("idlist", [])
            if not ids:
                return []

            fetch_resp = await client.get(self.EFETCH, params={
                "db": "pubmed",
                "id": ",".join(ids),
                "retmode": "xml",
                "rettype": "abstract",
                "api_key": self.API_KEY
            })
            fetch_resp.raise_for_status()

        return self._parse_xml(fetch_resp.text)

    def _parse_xml(self, xml_text: str) -> list[Paper]:
        root = ET.fromstring(xml_text)
        papers = []
        for article in root.findall(".//PubmedArticle"):
            try:
                medline = article.find("MedlineCitation")
                art = medline.find("Article")

                title = art.findtext("ArticleTitle", default="")
                year_el = art.find("Journal/JournalIssue/PubDate/Year")
                year = int(year_el.text) if year_el is not None else 0

                authors = []
                for a in art.findall("AuthorList/Author")[:3]:
                    last = a.findtext("LastName", "")
                    fore = a.findtext("ForeName", "")
                    if last:
                        authors.append(f"{fore} {last}".strip())

                abstract_parts = art.findall("Abstract/AbstractText")
                abstract = " ".join(
                    (el.get("Label", "") + ": " if el.get("Label") else "") + (el.text or "")
                    for el in abstract_parts
                ).strip() or None

                pmid = medline.findtext("PMID", "")
                doi_el = article.find(".//ArticleId[@IdType='doi']")
                doi = doi_el.text if doi_el is not None else None

                papers.append(Paper(
                    title=title,
                    authors=authors,
                    year=year,
                    url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    abstract=abstract,
                    abstract_summary=None,
                    source="pubmed",
                    relevance_note=doi or ""
                ))
            except Exception:
                continue

        return papers
