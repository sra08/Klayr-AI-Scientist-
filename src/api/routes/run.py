from fastapi import APIRouter, Depends, BackgroundTasks, Query
from pydantic import BaseModel
from src.api.dependencies import get_llm_client, get_lit_search, get_repo, get_cache, get_researcher_repo, get_notification_repo
from src.domain.pipeline.graph import build_pipeline
from src.domain.pipeline.state import PipelineState
from src.domain.entities.experiment import ExperimentPlan
from src.domain.entities.collaboration import Notification
from src.infrastructure.db.researcher_repo import embed
import uuid
import datetime
import logging

router = APIRouter()
 
@router.get("/literature/search")
async def search_literature(
    q: str = Query(..., min_length=2),
    lit = Depends(get_lit_search)
):
    papers = await lit.search(q)
    return [p.model_dump() for p in papers]

class RunRequest(BaseModel):
    hypothesis: str
    domain: str
    user_id: uuid.UUID

def assemble_plan(state: PipelineState, user_id: uuid.UUID, similar_researchers: list = []) -> ExperimentPlan:
    return ExperimentPlan(
        plan_id=uuid.uuid4(),
        user_id=user_id,
        hypothesis=state["refined_hypothesis"],
        literature_result=state["literature_result"],
        protocol_steps=state["protocol_steps"],
        materials=state["materials"],
        budget=state["budget"],
        timeline=state["timeline"],
        validation=state["validation"],
        created_at=datetime.datetime.utcnow(),
        feedback_incorporated=False,
        similar_researchers=similar_researchers
    )

@router.post("/run")
async def run_pipeline(
    body: RunRequest,
    background_tasks: BackgroundTasks,
    llm = Depends(get_llm_client),
    lit = Depends(get_lit_search),
    repo = Depends(get_repo),
    cache = Depends(get_cache),
    researcher_repo = Depends(get_researcher_repo),
    notification_repo = Depends(get_notification_repo)
):
    # Fetch few-shot feedback for this domain
    shots = await repo.get_recent_feedback(domain=body.domain, limit=3)

    pipeline = build_pipeline(llm, lit)
    initial_state: PipelineState = {
        "raw_input": body.hypothesis,
        "refined_hypothesis": "",
        "literature_result": None,
        "protocol_steps": None,
        "materials": None,
        "budget": None,
        "timeline": None,
        "validation": None,
        "few_shot_examples": shots,
        "errors": [],
        "final_plan": None,
    }

    result = await pipeline.ainvoke(initial_state)
    
    # Find similar researchers (limit 3 as requested)
    matches = []
    try:
        matches = await researcher_repo.find_similar(
            hypothesis=result["refined_hypothesis"] or body.hypothesis,
            exclude_user_id=body.user_id,
            limit=3
        )
    except Exception as e:
        logging.error(f"Failed to fetch similar researchers during run: {e}")

    plan = assemble_plan(result, body.user_id, matches)
    await repo.save(plan)

    background_tasks.add_task(
        _match_and_notify,
        plan=plan,
        user_id=body.user_id,
        researcher_repo=researcher_repo,
        notification_repo=notification_repo
    )

    return {"plan_id": str(plan.plan_id), "plan": plan.model_dump()}

async def _match_and_notify(plan, user_id, researcher_repo, notification_repo):
    try:
        # Save this user's hypothesis embedding for future matching
        embedding = embed(plan.hypothesis)
        await researcher_repo.save_hypothesis_embedding(
            user_id=user_id,
            plan_id=plan.plan_id,
            hypothesis=plan.hypothesis,
            embedding=embedding
        )
        # Find similar researchers
        matches = await researcher_repo.find_similar(
            hypothesis=plan.hypothesis,
            exclude_user_id=user_id,
            limit=3
        )
        if not matches:
            return
        # Notify the submitting user of the matches
        notif = Notification(
            notification_id=uuid.uuid4(),
            user_id=user_id,
            type="similar_researcher_found",
            payload={
                "count": len(matches),
                "matches": [
                    {
                        "name": m.profile.name,
                        "institution": m.profile.institution,
                        "score": m.similarity_score,
                        "hypothesis": m.matching_hypothesis[:120]
                    }
                    for m in matches
                ],
                "plan_id": str(plan.plan_id)
            },
            read=False,
            created_at=datetime.datetime.utcnow()
        )
        await notification_repo.create(notif)
    except Exception as e:
        # Never let collab matching crash the main pipeline
        logging.error(f"Collab match failed: {e}")
