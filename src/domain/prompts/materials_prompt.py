SYSTEM = """You are a resource and procurement specialist. You identify all tools, equipment, materials, and services required for a given protocol. You provide estimated costs from industry-standard suppliers and vendors relevant to the research domain."""

def build(protocol_steps: list, few_shots: list = None) -> str:
    steps_txt = "\n".join([f"{s.step_number}. {s.title}: {s.description}" for s in protocol_steps])
    
    shot_block = ""
    if few_shots:
        # Filter for materials related feedback
        mat_feedback = [s for s in few_shots if s.section == "Materials"]
        if mat_feedback:
            corrections = "\n".join(f"- {s.correction}" for s in mat_feedback)
            shot_block = f"\nPRIOR MATERIALS CORRECTIONS (incorporate these):\n{corrections}"

    return f"""
Protocol:
{steps_txt}
{shot_block}

Identify all required reagents and materials. Return ONLY valid JSON matching this schema:
{{
  "materials": [
    {{
      "name": str,
      "catalog_number": str,
      "supplier": str,
      "quantity": str,
      "unit_cost_usd": float,
      "total_cost_usd": float
    }}
  ]
}}
If you cannot find a specific catalog number, use the string 'CATALOG_TBD' and flag it.
""".strip()
