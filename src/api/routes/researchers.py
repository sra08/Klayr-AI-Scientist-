from fastapi import APIRouter, Depends, HTTPException, Query
from src.api.dependencies import get_researcher_repo, get_repo
from src.domain.entities.collaboration import ResearcherProfile, SimilarResearcher
from uuid import UUID
from typing import List

router = APIRouter()

@router.get("/search", response_model=List[ResearcherProfile])
async def search_researchers(
    q: str = Query(..., min_length=2),
    repo=Depends(get_researcher_repo)
):
    return await repo.search(query=q, limit=10)

@router.get("/similar", response_model=List[SimilarResearcher])
async def get_similar_researchers(
    plan_id: UUID = Query(...),
    user_id: UUID = Query(...),
    plan_repo=Depends(get_repo),
    researcher_repo=Depends(get_researcher_repo)
):
    plan = await plan_repo.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return await researcher_repo.find_similar(
        hypothesis=plan.hypothesis,
        exclude_user_id=user_id,
        limit=5
    )

@router.get("/novelty")
async def check_hypothesis_novelty(
    q: str = Query(..., min_length=5),
    repo=Depends(get_researcher_repo)
):
    result = await repo.check_novelty(q)
    return result or {"status": "New"}
