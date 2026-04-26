from abc import ABC, abstractmethod
from src.domain.entities.experiment import ExperimentPlan, FeedbackEntry
from uuid import UUID

class IExperimentRepo(ABC):
    @abstractmethod
    async def save(self, plan: ExperimentPlan) -> None: ...

    @abstractmethod
    async def get_plan(self, plan_id: UUID) -> ExperimentPlan: ...

    @abstractmethod
    async def save_feedback(self, entry: FeedbackEntry) -> None: ...

    @abstractmethod
    async def get_recent_feedback(self, domain: str, limit: int = 3) -> list[FeedbackEntry]: ...
