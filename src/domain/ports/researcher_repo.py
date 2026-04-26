from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from src.domain.entities.collaboration import ResearcherProfile, SimilarResearcher, CollaborationRequest

class IResearcherRepo(ABC):

    @abstractmethod
    async def save_profile(self, profile: ResearcherProfile) -> None: ...

    @abstractmethod
    async def get_profile(self, user_id: UUID) -> Optional[ResearcherProfile]: ...

    @abstractmethod
    async def get_profile_by_email(self, email: str) -> Optional[ResearcherProfile]: ...

    @abstractmethod
    async def search(self, query: str, limit: int = 10) -> List[ResearcherProfile]:
        """Full-text search on name, institution, domains, bio."""
        ...

    @abstractmethod
    async def find_similar(
        self,
        hypothesis: str,
        exclude_user_id: UUID,
        limit: int = 5
    ) -> List[SimilarResearcher]:
        """
        Returns researchers whose saved hypotheses are semantically similar
        to the given hypothesis. Uses pgvector cosine similarity.
        """
        ...

    @abstractmethod
    async def save_hypothesis_embedding(
        self,
        user_id: UUID,
        plan_id: UUID,
        hypothesis: str,
        embedding: List[float]
    ) -> None: ...

    @abstractmethod
    async def save_collab_request(self, request: CollaborationRequest) -> None: ...

    @abstractmethod
    async def update_collab_status(self, request_id: UUID, status: str) -> CollaborationRequest: ...

    @abstractmethod
    async def check_novelty(self, hypothesis: str) -> Optional[dict]: ...
