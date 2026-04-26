import json
import logging
from typing import Any, List, Optional
from src.domain.entities.experiment import (
    ProtocolStep, Reagent, Budget, TimelinePhase, ValidationApproach, 
    LiteratureResult, NoveltySignal, Paper
)

logger = logging.getLogger(__name__)

def _clean_json(raw: str) -> str:
    """Extract the first valid-looking JSON object from the string."""
    try:
        # Find the first '{' and the last '}'
        start = raw.find('{')
        end = raw.rfind('}')
        if start != -1 and end != -1:
            return raw[start:end+1]
        return raw.strip()
    except Exception:
        return raw.strip()

def parse_hypothesis(raw: str) -> str:
    try:
        data = json.loads(_clean_json(raw))
        return data.get("refined_hypothesis", "")
    except Exception as e:
        logger.error(f"Hypothesis parse failed: {e}\nRaw: {raw[:300]}")
        return ""

def parse_literature(raw: str) -> LiteratureResult:
    try:
        data = json.loads(_clean_json(raw))
        return LiteratureResult(
            novelty_signal=NoveltySignal(data.get("novelty_signal", "not_found")),
            references=[] # Papers are fetched separately via search tools
        )
    except Exception as e:
        logger.error(f"Literature parse failed: {e}\nRaw: {raw[:300]}")
        return LiteratureResult(novelty_signal=NoveltySignal.NOT_FOUND, references=[])

def parse_protocol(raw: str) -> List[ProtocolStep]:
    try:
        data = json.loads(_clean_json(raw))
        steps = data.get("steps", [])
        return [ProtocolStep(**s) for s in steps]
    except Exception as e:
        logger.error(f"Protocol parse failed: {e}\nRaw: {raw[:300]}")
        return []

def parse_materials(raw: str) -> List[Reagent]:
    try:
        data = json.loads(_clean_json(raw))
        materials = data.get("materials", [])
        return [Reagent(**m) for m in materials]
    except Exception as e:
        logger.error(f"Materials parse failed: {e}\nRaw: {raw[:300]}")
        return []

def parse_budget(raw: str) -> Budget:
    try:
        data = json.loads(_clean_json(raw))
        return Budget(**data)
    except Exception as e:
        logger.error(f"Budget parse failed: {e}\nRaw: {raw[:300]}")
        return Budget(line_items=[], grand_total_usd=0.0)

def parse_timeline(raw: str) -> List[TimelinePhase]:
    try:
        data = json.loads(_clean_json(raw))
        phases = data.get("timeline", [])
        return [TimelinePhase(**p) for p in phases]
    except Exception as e:
        logger.error(f"Timeline parse failed: {e}\nRaw: {raw[:300]}")
        return []

def parse_validation(raw: str) -> ValidationApproach:
    try:
        data = json.loads(_clean_json(raw))
        return ValidationApproach(**data)
    except Exception as e:
        logger.error(f"Validation parse failed: {e}\nRaw: {raw[:300]}")
        return ValidationApproach(
            primary_metric="Unknown",
            success_threshold="N/A",
            statistical_test="N/A",
            controls=[]
        )
