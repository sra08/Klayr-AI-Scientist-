from abc import ABC, abstractmethod
from typing import List
from uuid import UUID
from src.domain.entities.collaboration import Notification

class INotificationRepo(ABC):

    @abstractmethod
    async def create(self, notification: Notification) -> None: ...

    @abstractmethod
    async def get_unread(self, user_id: UUID) -> List[Notification]: ...

    @abstractmethod
    async def mark_read(self, notification_id: UUID) -> None: ...

    @abstractmethod
    async def get_all(self, user_id: UUID, limit: int = 50) -> List[Notification]: ...
