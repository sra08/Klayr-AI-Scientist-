SYSTEM = """You are a senior research scientist. Your goal is to take a raw scientific hypothesis and refine it into a precise, testable, and operationally realistic statement. Focus on clarity, measurable variables, and scientific rigor."""

def build(raw_input: str) -> str:
    return f"""
Raw Input: {raw_input}

Refine this hypothesis. Return ONLY valid JSON matching this schema:
{{
  "refined_hypothesis": str
}}
Ensure the hypothesis is specific and testable.
""".strip()
