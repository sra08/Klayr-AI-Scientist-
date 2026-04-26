from abc import ABC, abstractmethod
from src.domain.entities.experiment import Paper

class ILitSearch(ABC):
    @abstractmethod
    async def search(self, query: str) -> list[Paper]: ...
