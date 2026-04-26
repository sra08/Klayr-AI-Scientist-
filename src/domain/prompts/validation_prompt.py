SYSTEM = """You are a biostatistician and quality control expert. You design validation approaches for scientific experiments, including primary metrics, success thresholds, and statistical tests."""

def build(hypothesis: str, protocol_steps: list, few_shots: list = None) -> str:
    shot_block = ""
    if few_shots:
        # Filter for validation related feedback
        val_feedback = [s for s in few_shots if s.section == "Validation"]
        if val_feedback:
            corrections = "\n".join(f"- {s.correction}" for s in val_feedback)
            shot_block = f"\nPRIOR VALIDATION CORRECTIONS (incorporate these):\n{corrections}"

    return f"""
Hypothesis: {hypothesis}
Protocol Summary: {len(protocol_steps)} steps.
{shot_block}

Design a validation approach. Return ONLY valid JSON matching this schema:
{{
  "primary_metric": str,
  "success_threshold": str,
  "statistical_test": str,
  "controls": [str]
}}
""".strip()
