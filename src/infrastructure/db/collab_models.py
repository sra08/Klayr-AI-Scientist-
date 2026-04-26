from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY
from pgvector.sqlalchemy import Vector
from sqlalchemy.ext.declarative import declarative_base
import uuid, datetime

Base = declarative_base()

class ResearcherProfileModel(Base):
    __tablename__ = "researcher_profiles"
    user_id     = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String, nullable=False)
    email       = Column(String, unique=True, nullable=False)
    institution = Column(String, nullable=True)
    domains     = Column(ARRAY(String), nullable=False, default=[])
    bio         = Column(Text, nullable=True)
    password    = Column(String, nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

class HypothesisEmbeddingModel(Base):
    __tablename__ = "hypothesis_embeddings"
    id           = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    plan_id      = Column(PG_UUID(as_uuid=True), nullable=False)
    hypothesis   = Column(Text, nullable=False)
    embedding    = Column(Vector(384))   # 384 dims = all-MiniLM-L6-v2 output size
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

class CollaborationRequestModel(Base):
    __tablename__ = "collaboration_requests"
    request_id    = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_user_id  = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    to_user_id    = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    plan_id       = Column(PG_UUID(as_uuid=True), nullable=False)
    message       = Column(Text, nullable=False)
    status        = Column(String, default="pending")
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

class NotificationModel(Base):
    __tablename__ = "notifications"
    notification_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    type            = Column(String, nullable=False)
    payload         = Column(JSON, nullable=False)
    read            = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.datetime.utcnow)
