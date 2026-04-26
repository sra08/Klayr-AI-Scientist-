from fastapi import APIRouter, Depends, Body
from pydantic import BaseModel
from src.api.dependencies import get_researcher_repo, get_notification_repo
from src.domain.entities.collaboration import CollaborationRequest, Notification
from uuid import UUID
import uuid
import datetime

router = APIRouter()

class CollabRequestBody(BaseModel):
    from_user_id: UUID
    to_user_id: UUID
    plan_id: UUID
    message: str

@router.post("/request", response_model=CollaborationRequest)
async def send_request(
    body: CollabRequestBody,
    repo=Depends(get_researcher_repo),
    notif_repo=Depends(get_notification_repo)
):
    req = CollaborationRequest(
        request_id=uuid.uuid4(),
        created_at=datetime.datetime.utcnow(),
        status="pending",
        **body.model_dump()
    )
    await repo.save_collab_request(req)
    
    # Notify the recipient
    await notif_repo.create(Notification(
        notification_id=uuid.uuid4(),
        user_id=req.to_user_id,
        type="collab_request",
        payload={
            "request_id": str(req.request_id),
            "from_user_id": str(req.from_user_id),
            "message": req.message,
            "plan_id": str(req.plan_id)
        },
        read=False,
        created_at=datetime.datetime.utcnow()
    ))
    return req

@router.patch("/request/{request_id}")
async def respond_to_request(
    request_id: UUID,
    status: str = Body(..., embed=True),          # "accepted" or "declined"
    repo=Depends(get_researcher_repo),
    notif_repo=Depends(get_notification_repo)
):
    req = await repo.update_collab_status(request_id, status)
    
    # Notify the original sender
    await notif_repo.create(Notification(
        notification_id=uuid.uuid4(),
        user_id=req.from_user_id,
        type=f"request_{status}",
        payload={"request_id": str(request_id), "status": status},
        read=False,
        created_at=datetime.datetime.utcnow()
    ))
    return {"status": status}
