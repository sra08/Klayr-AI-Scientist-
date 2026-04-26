from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from src.api.dependencies import get_researcher_repo
from src.domain.entities.collaboration import ResearcherProfile
from uuid import UUID
import uuid
import datetime
from typing import Optional, List

router = APIRouter()

class CreateProfileRequest(BaseModel):
    name: str
    email: str
    institution: Optional[str] = None
    domains: List[str]
    bio: Optional[str] = None
    password: Optional[str] = None

@router.post("/profile", response_model=ResearcherProfile)
async def create_profile(body: CreateProfileRequest, repo=Depends(get_researcher_repo)):
    existing = await repo.get_profile_by_email(body.email)
    if existing:
        raise HTTPException(status_code=400, detail="A profile with this email already exists.")
        
    profile = ResearcherProfile(
        user_id=uuid.uuid4(),
        created_at=datetime.datetime.utcnow(),
        **body.model_dump()
    )
    await repo.save_profile(profile)
    return profile

@router.get("/profile/{user_id}", response_model=ResearcherProfile)
async def get_profile(user_id: UUID, repo=Depends(get_researcher_repo)):
    profile = await repo.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/profile/email/{email}", response_model=ResearcherProfile)
async def get_profile_by_email(email: str, repo=Depends(get_researcher_repo)):
    profile = await repo.get_profile_by_email(email)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
