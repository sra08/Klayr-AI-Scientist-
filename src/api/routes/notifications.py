from fastapi import APIRouter, Depends, Query
from src.api.dependencies import get_notification_repo
from src.domain.entities.collaboration import Notification
from uuid import UUID
from typing import List

router = APIRouter()

@router.get("/{user_id}", response_model=List[Notification])
async def get_notifications(
    user_id: UUID,
    unread_only: bool = Query(default=False),
    repo=Depends(get_notification_repo)
):
    if unread_only:
        return await repo.get_unread(user_id)
    return await repo.get_all(user_id, limit=50)

@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    repo=Depends(get_notification_repo)
):
    await repo.mark_read(notification_id)
    return {"status": "ok"}
