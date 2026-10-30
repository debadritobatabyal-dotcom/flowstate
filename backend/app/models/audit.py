import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, JSON, Text, ForeignKey, Boolean
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class AuditLog(Base):
    __tablename__ = "audit_log"

    sequence_id = Column(Integer, primary_key=True, autoincrement=True)
    id = Column(String(36), default=generate_uuid, unique=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    actor_id = Column(String(36), nullable=True, index=True)
    actor_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(100), nullable=False, index=True)
    entity_id = Column(String(100), nullable=False, index=True)
    details = Column(JSON, nullable=True)
    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)


class AiInteraction(Base):
    __tablename__ = "ai_interactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    model = Column(String(100), nullable=False)
    duration_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    grounded_citations = Column(JSON, nullable=True)
    user_id = Column(String(36), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
