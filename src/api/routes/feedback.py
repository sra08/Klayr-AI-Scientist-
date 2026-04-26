from fastapi import APIRouter, Depends
from pydantic import BaseModel
from src.api.dependencies import get_repo
from src.domain.entities.experiment import FeedbackEntry
import uuid
import datetime

router = APIRouter()

class FeedbackRequest(BaseModel):
    plan_id: uuid.UUID
    section: str
    original_content: str
    correction: str
    experiment_domain: str

@router.post("/feedback")
async def submit_feedback(
    body: FeedbackRequest,
    repo = Depends(get_repo)
):
    entry = FeedbackEntry(
        feedback_id=uuid.uuid4(),
        plan_id=body.plan_id,
        section=body.section,
        original_content=body.original_content,
        correction=body.correction,
        experiment_domain=body.experiment_domain,
        created_at=datetime.datetime.utcnow()
    )
    await repo.save_feedback(entry)
    return {"status": "stored", "feedback_id": str(entry.feedback_id)}
