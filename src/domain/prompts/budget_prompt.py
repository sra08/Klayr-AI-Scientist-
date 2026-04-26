SYSTEM = """You are a research budget analyst. You aggregate costs from material lists and add overheads, personnel costs, and equipment maintenance to create a comprehensive budget. DO NOT include any prose, commentary, or Python code. Return ONLY a single JSON object."""

def build(materials: list, few_shots: list = None) -> str:
    materials_txt = "\n".join([f"- {m.name}: ${m.total_cost_usd}" for m in materials])
    
    shot_block = ""
    if few_shots:
        # Filter for budget related feedback
        budget_feedback = [s for s in few_shots if s.section == "Budget"]
        if budget_feedback:
            corrections = "\n".join(f"- {s.correction}" for s in budget_feedback)
            shot_block = f"\nPRIOR BUDGET CORRECTIONS (incorporate these):\n{corrections}"

    return f"""
Materials and Costs:
{materials_txt}
{shot_block}

Generate a comprehensive budget. Return ONLY valid JSON matching this schema:
{{
  "line_items": [
    {{
      "category": str,
      "description": str,
      "cost_usd": float
    }}
  ],
  "grand_total_usd": float,
  "currency_note": str
}}
""".strip()
