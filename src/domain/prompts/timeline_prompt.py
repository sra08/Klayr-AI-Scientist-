SYSTEM = """You are a project manager for scientific research. You estimate durations and task dependencies based on a laboratory protocol and available resources."""

def build(protocol_steps: list, budget) -> str:
    steps_txt = "\n".join([f"{s.step_number}. {s.title} ({s.duration_minutes} min)" for s in protocol_steps])
    
    return f"""
Protocol Steps:
{steps_txt}

Budget Context: ${budget.grand_total_usd if budget else 'N/A'}

Generate a project timeline with phases. Return ONLY valid JSON matching this schema:
{{
  "timeline": [
    {{
      "phase_name": str,
      "duration_days": int,
      "tasks": [str],
      "depends_on": [str]
    }}
  ]
}}
""".strip()
