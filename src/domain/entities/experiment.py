from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List
from uuid import UUID
import datetime

class NoveltySignal(str, Enum):
    NOT_FOUND = "not_found"
    SIMILAR_EXISTS = "similar_work_exists"
    EXACT_MATCH = "exact_match_found"

class Paper(BaseModel):
    title: str
    authors: List[str]
    year: int
    url: str
    abstract: Optional[str] = None        # raw abstract from source API
    abstract_summary: Optional[str] = None  # 2-3 sentence LLM summary, generated post-fetch
    source: str = "unknown"               # "pubmed" | "semantic_scholar"
    relevance_note: str

class LiteratureResult(BaseModel):
    novelty_signal: NoveltySignal
    references: List[Paper]  # max 3

class ProtocolStep(BaseModel):
    step_number: int
    title: str
    description: str
    duration_minutes: int
    notes: Optional[str] = None

class Reagent(BaseModel):
    name: str
    catalog_number: str
    supplier: str
    quantity: str
    unit_cost_usd: float
    total_cost_usd: float

class BudgetLine(BaseModel):
    category: str  # e.g. "reagents", "equipment", "personnel"
    description: str
    cost_usd: float

class Budget(BaseModel):
    line_items: List[BudgetLine]
    grand_total_usd: float
    currency_note: str = "All costs in USD, estimates based on current catalog prices"

class TimelinePhase(BaseModel):
    phase_name: str
    duration_days: int
    tasks: List[str]
    depends_on: List[str] = []

class ValidationApproach(BaseModel):
    primary_metric: str
    success_threshold: str
    statistical_test: str
    controls: List[str]

from src.domain.entities.collaboration import SimilarResearcher

class ExperimentPlan(BaseModel):
    plan_id: UUID
    user_id: Optional[UUID] = None
    hypothesis: str
    literature_result: LiteratureResult
    protocol_steps: List[ProtocolStep]
    materials: List[Reagent]
    budget: Budget
    timeline: List[TimelinePhase]
    validation: ValidationApproach
    created_at: datetime.datetime
    feedback_incorporated: bool = False
    similar_researchers: List[SimilarResearcher] = []

class FeedbackEntry(BaseModel):
    feedback_id: UUID
    plan_id: UUID
    section: str  # "protocol" | "materials" | "budget" | "timeline" | "validation"
    original_content: str
    correction: str
    experiment_domain: str  # e.g. "cell_biology", "diagnostics"
    created_at: datetime.datetime
