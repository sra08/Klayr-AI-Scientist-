from typing import TypedDict, Optional, List
from src.domain.entities.experiment import (
    LiteratureResult, ExperimentPlan, ProtocolStep,
    Reagent, Budget, TimelinePhase, ValidationApproach, FeedbackEntry
)

class PipelineState(TypedDict):
    raw_input: str
    refined_hypothesis: str
    literature_result: Optional[LiteratureResult]
    protocol_steps: Optional[List[ProtocolStep]]
    materials: Optional[List[Reagent]]
    budget: Optional[Budget]
    timeline: Optional[List[TimelinePhase]]
    validation: Optional[ValidationApproach]
    few_shot_examples: List[FeedbackEntry]   # injected before run starts
    errors: List[str]
    final_plan: Optional[ExperimentPlan]
