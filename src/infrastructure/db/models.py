from sqlalchemy import Column, String, JSON, DateTime, Integer, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
import datetime

Base = declarative_base()

class ExperimentPlanModel(Base):
    __tablename__ = "experiment_plans"
    plan_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), index=True)
    hypothesis = Column(String, nullable=False)
    literature_result = Column(JSON)
    protocol_steps = Column(JSON)
    materials = Column(JSON)
    budget = Column(JSON)
    timeline = Column(JSON)
    validation = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    feedback_incorporated = Column(Boolean, default=False)

class FeedbackEntryModel(Base):
    __tablename__ = "feedback_entries"
    feedback_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(PG_UUID(as_uuid=True), nullable=False)
    section = Column(String, nullable=False)
    original_content = Column(String)
    correction = Column(String, nullable=False)
    experiment_domain = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
