from fastapi import APIRouter, Depends, HTTPException, Query
from src.api.dependencies import get_repo
from uuid import UUID

router = APIRouter()

@router.get("/plan/{plan_id}")
async def get_plan(
    plan_id: UUID,
    repo = Depends(get_repo)
):
    plan = await repo.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Experiment plan not found")
    return plan.model_dump()

@router.get("/plans")
async def list_plans(
    user_id: UUID = Query(...),
    repo = Depends(get_repo)
):
    plans = await repo.get_plans_by_user(user_id)
    return [p.model_dump() for p in plans]
