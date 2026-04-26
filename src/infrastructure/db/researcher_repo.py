import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text, update
from src.domain.ports.researcher_repo import IResearcherRepo
from src.domain.entities.collaboration import ResearcherProfile, SimilarResearcher, CollaborationRequest
from src.infrastructure.db.collab_models import (
    ResearcherProfileModel, HypothesisEmbeddingModel, 
    CollaborationRequestModel, Base
)
from uuid import UUID
from typing import List, Optional
import datetime

_embed_model = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        from sentence_transformers import SentenceTransformer
        _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embed_model

def embed(text_input: str) -> List[float]:
    return get_embed_model().encode(text_input, normalize_embeddings=True).tolist()

class ResearcherRepoImpl(IResearcherRepo):
    def __init__(self):
        db_url = os.environ.get("DATABASE_URL", "")
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        # asyncpg doesn't support sslmode or channel_binding in the URL
        if "?" in db_url:
            base_url, query = db_url.split("?", 1)
            # We strip them for now to avoid TypeError, as Neon works with default ssl if not specified 
            # or we can pass ssl=True in connect_args
            db_url = base_url

        self.engine = create_async_engine(
            db_url,
            connect_args={"ssl": True} if "neon.tech" in db_url else {}
        )
        self.async_session = sessionmaker(
            self.engine, expire_on_commit=False, class_=AsyncSession
        )

    async def save_profile(self, profile: ResearcherProfile) -> None:
        async with self.async_session() as session:
            model = ResearcherProfileModel(
                user_id=profile.user_id,
                name=profile.name,
                email=profile.email,
                institution=profile.institution,
                domains=profile.domains,
                bio=profile.bio,
                created_at=profile.created_at
            )
            session.add(model)
            await session.commit()

    async def get_profile(self, user_id: UUID) -> Optional[ResearcherProfile]:
        async with self.async_session() as session:
            result = await session.execute(select(ResearcherProfileModel).where(ResearcherProfileModel.user_id == user_id))
            model = result.scalar_one_or_none()
            if not model:
                return None
            return self._to_entity(model)

    async def get_profile_by_email(self, email: str) -> Optional[ResearcherProfile]:
        async with self.async_session() as session:
            result = await session.execute(select(ResearcherProfileModel).where(ResearcherProfileModel.email == email))
            model = result.scalar_one_or_none()
            if not model:
                return None
            return self._to_entity(model)

    async def search(self, query: str, limit: int = 10) -> List[ResearcherProfile]:
        sql = text("""
            SELECT * FROM researcher_profiles
            WHERE
                name ILIKE :q OR
                institution ILIKE :q OR
                bio ILIKE :q OR
                :raw_q = ANY(domains)
            LIMIT :limit
        """)
        async with self.async_session() as session:
            rows = await session.execute(sql, {
                "q": f"%{query}%",
                "raw_q": query.lower(),
                "limit": limit
            })
            return [self._to_entity_from_row(r) for r in rows.fetchall()]

    async def find_similar(self, hypothesis: str, exclude_user_id: UUID, limit: int = 5) -> List[SimilarResearcher]:
        query_vec = embed(hypothesis)
        sql = text("""
            SELECT
                he.user_id,
                he.plan_id,
                he.hypothesis,
                1 - (he.embedding <=> :vec) AS score
            FROM hypothesis_embeddings he
            WHERE he.user_id != :exclude_uid
            ORDER BY he.embedding <=> :vec
            LIMIT :limit
        """)
        async with self.async_session() as session:
            rows = await session.execute(sql, {
                "vec": str(query_vec),
                "exclude_uid": str(exclude_user_id),
                "limit": limit
            })
            results = rows.fetchall()

        similar = []
        for row in results:
            profile = await self.get_profile(row.user_id)
            if profile and row.score > 0.65:
                similar.append(SimilarResearcher(
                    profile=profile,
                    similarity_score=round(float(row.score), 3),
                    matching_hypothesis=row.hypothesis,
                    shared_plan_id=row.plan_id
                ))
    async def check_novelty(self, hypothesis: str, limit: int = 1) -> Optional[dict]:
        query_vec = embed(hypothesis)
        sql = text("""
            SELECT
                he.user_id,
                he.plan_id,
                he.hypothesis,
                1 - (he.embedding <=> :vec) AS score
            FROM hypothesis_embeddings he
            ORDER BY he.embedding <=> :vec
            LIMIT :limit
        """)
        async with self.async_session() as session:
            rows = await session.execute(sql, {
                "vec": str(query_vec),
                "limit": limit
            })
            row = rows.fetchone()
            if row and row.score > 0.85:
                # Find the plan status (mocked for now, but usually would join with experiment_plans)
                return {
                    "matching_hypothesis": row.hypothesis,
                    "similarity_score": round(float(row.score), 3),
                    "status": "In Progress" if row.score < 0.95 else "Already Done",
                    "plan_id": row.plan_id
                }
            return None

    async def save_hypothesis_embedding(self, user_id: UUID, plan_id: UUID, hypothesis: str, embedding: List[float]) -> None:
        async with self.async_session() as session:
            model = HypothesisEmbeddingModel(
                user_id=user_id,
                plan_id=plan_id,
                hypothesis=hypothesis,
                embedding=embedding
            )
            session.add(model)
            await session.commit()

    async def save_collab_request(self, request: CollaborationRequest) -> None:
        async with self.async_session() as session:
            model = CollaborationRequestModel(
                request_id=request.request_id,
                from_user_id=request.from_user_id,
                to_user_id=request.to_user_id,
                plan_id=request.plan_id,
                message=request.message,
                status=request.status,
                created_at=request.created_at
            )
            session.add(model)
            await session.commit()

    async def update_collab_status(self, request_id: UUID, status: str) -> CollaborationRequest:
        async with self.async_session() as session:
            stmt = update(CollaborationRequestModel).where(CollaborationRequestModel.request_id == request_id).values(status=status).returning(CollaborationRequestModel)
            result = await session.execute(stmt)
            model = result.scalar_one()
            await session.commit()
            return CollaborationRequest(
                request_id=model.request_id,
                from_user_id=model.from_user_id,
                to_user_id=model.to_user_id,
                plan_id=model.plan_id,
                message=model.message,
                status=model.status,
                created_at=model.created_at
            )

    def _to_entity(self, model) -> ResearcherProfile:
        return ResearcherProfile(
            user_id=model.user_id,
            name=model.name,
            email=model.email,
            institution=model.institution,
            domains=model.domains,
            bio=model.bio,
            created_at=model.created_at
        )

    def _to_entity_from_row(self, row) -> ResearcherProfile:
        return ResearcherProfile(
            user_id=row.user_id,
            name=row.name,
            email=row.email,
            institution=row.institution,
            domains=row.domains,
            bio=row.bio,
            created_at=row.created_at
        )
