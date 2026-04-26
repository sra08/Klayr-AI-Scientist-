from abc import ABC, abstractmethod

class ILLMClient(ABC):
    @abstractmethod
    async def complete(self, system: str, prompt: str) -> str: ...
