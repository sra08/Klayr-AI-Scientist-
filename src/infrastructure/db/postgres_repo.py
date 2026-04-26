import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from src.domain.ports.experiment_repo import IExperimentRepo
from src.domain.entities.experiment import ExperimentPlan, FeedbackEntry
from src.infrastructure.db.models import ExperimentPlanModel, FeedbackEntryModel, Base
from uuid import UUID

class PostgresRepo(IExperimentRepo):
    def __init__(self):
        db_url = os.environ.get("DATABASE_URL", "")
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        # asyncpg doesn't support sslmode or channel_binding in the URL
        if "?" in db_url:
            base_url, query = db_url.split("?", 1)
            db_url = base_url

        self.engine = create_async_engine(
            db_url,
            connect_args={"ssl": True} if "neon.tech" in db_url else {}
        )
        self.async_session = sessionmaker(
            self.engine, expire_on_commit=False, class_=AsyncSession
        )

    async def save(self, plan: ExperimentPlan) -> None:
        async with self.async_session() as session:
            model = ExperimentPlanModel(
                plan_id=plan.plan_id,
                user_id=plan.user_id,
                hypothesis=plan.hypothesis,
                literature_result=plan.literature_result.model_dump() if plan.literature_result else None,
                protocol_steps=[s.model_dump() for s in plan.protocol_steps] if plan.protocol_steps else [],
                materials=[m.model_dump() for m in plan.materials] if plan.materials else [],
                budget=plan.budget.model_dump() if plan.budget else None,
                timeline=[p.model_dump() for p in plan.timeline] if plan.timeline else [],
                validation=plan.validation.model_dump() if plan.validation else None,
                created_at=plan.created_at,
                feedback_incorporated=plan.feedback_incorporated
            )
            session.add(model)
            await session.commit()

    async def get_plan(self, plan_id: UUID) -> ExperimentPlan:
        async with self.async_session() as session:
            result = await session.execute(select(ExperimentPlanModel).where(ExperimentPlanModel.plan_id == plan_id))
            model = result.scalar_one_or_none()
            if not model:
                return None
            data = model.__dict__.copy()
            data.pop('_sa_instance_state', None)
            return ExperimentPlan(**data)

    async def get_plans_by_user(self, user_id: UUID) -> list[ExperimentPlan]:
        async with self.async_session() as session:
            result = await session.execute(
                select(ExperimentPlanModel)
                .where(ExperimentPlanModel.user_id == user_id)
                .order_by(ExperimentPlanModel.created_at.desc())
            )
            models = result.scalars().all()
            plans = []
            for m in models:
                data = m.__dict__.copy()
                data.pop('_sa_instance_state', None)
                plans.append(ExperimentPlan(**data))
            return plans

    async def save_feedback(self, entry: FeedbackEntry) -> None:
        async with self.async_session() as session:
            model = FeedbackEntryModel(
                feedback_id=entry.feedback_id,
                plan_id=entry.plan_id,
                section=entry.section,
                original_content=entry.original_content,
                correction=entry.correction,
                experiment_domain=entry.experiment_domain,
                created_at=entry.created_at
            )
            session.add(model)
            await session.commit()

    async def get_recent_feedback(self, domain: str, limit: int = 3) -> list[FeedbackEntry]:
        async with self.async_session() as session:
            result = await session.execute(
                select(FeedbackEntryModel)
                .where(FeedbackEntryModel.experiment_domain == domain)
                .order_by(FeedbackEntryModel.created_at.desc())
                .limit(limit)
            )
            models = result.scalars().all()
            return [FeedbackEntry(
                feedback_id=m.feedback_id,
                plan_id=m.plan_id,
                section=m.section,
                original_content=m.original_content,
                correction=m.correction,
                experiment_domain=m.experiment_domain,
                created_at=m.created_at
            ) for m in models]
