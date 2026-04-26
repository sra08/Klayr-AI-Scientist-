from src.domain.entities.experiment import Paper

SYSTEM = """You are a scientific literature analyst. You evaluate the novelty of a hypothesis against existing research. You must identify if the work is truly novel, if similar work exists, or if an exact match is found."""

def build(hypothesis: str, papers: list[Paper]) -> str:
    papers_context = "\n".join([f"- {p.title} ({p.year}): {p.abstract_summary}" for p in papers])
    
    return f"""
Hypothesis: {hypothesis}

Relevant Literature:
{papers_context}

Evaluate the novelty of the hypothesis based on the provided literature. Return ONLY valid JSON matching this schema:
{{
  "novelty_signal": "not_found" | "similar_work_exists" | "exact_match_found",
  "reasoning": str
}}
""".strip()
