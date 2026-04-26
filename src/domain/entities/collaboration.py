from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
import datetime

class ResearcherProfile(BaseModel):
    user_id: UUID
    name: str
    email: str
    institution: Optional[str] = None
    domains: List[str]           # e.g. ["cell_biology", "diagnostics", "climate"]
    bio: Optional[str] = None
    password: Optional[str] = None
    created_at: datetime.datetime

class SimilarResearcher(BaseModel):
    profile: ResearcherProfile
    similarity_score: float      # 0.0 – 1.0, cosine similarity on hypothesis embeddings
    matching_hypothesis: str     # their hypothesis text — shows WHY they matched
    shared_plan_id: UUID         # the plan that caused the match

class CollaborationRequest(BaseModel):
    request_id: UUID
    from_user_id: UUID
    to_user_id: UUID
    plan_id: UUID
    message: str
    status: str = "pending"      # "pending" | "accepted" | "declined"
    created_at: datetime.datetime

class Notification(BaseModel):
    notification_id: UUID
    user_id: UUID
    type: str                    # "similar_researcher_found" | "collab_request" | "request_accepted" | "request_declined"
    payload: dict                # flexible — store whatever the frontend needs to render
    read: bool = False
    created_at: datetime.datetime
