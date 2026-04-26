# domain/prompts/protocol_prompt.py

SYSTEM = """You are an expert research and development protocol writer.
You ground every protocol step in established methodologies, industry standards,
or peer-reviewed sources. You always return valid JSON matching the schema provided."""

def build(hypothesis: str, lit_result, few_shots) -> str:
    shot_block = ""
    if few_shots:
        corrections = "\n".join(f"- {s.correction}" for s in few_shots)
        shot_block = f"\nPRIOR SCIENTIST CORRECTIONS (incorporate these):\n{corrections}"

    return f"""
Hypothesis: {hypothesis}
Novelty signal: {lit_result.novelty_signal if lit_result else 'unknown'}
{shot_block}

Generate a step-by-step laboratory protocol. Return JSON matching this schema:
{{
  "steps": [
    {{
      "step_number": int,
      "title": str,
      "description": str,
      "duration_minutes": int,
      "notes": str | null
    }}
  ]
}}
Minimum 6 steps. Ground each step in real published methodology.
""".strip()
