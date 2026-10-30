import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Boolean, Integer, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class RegulationDocument(Base):
    __tablename__ = "regulation_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False, unique=True, index=True)
    academic_years = Column(String(50), nullable=False)  # e.g., "2024-2027"
    effective_date = Column(DateTime, nullable=False)
    publication_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    source_file = Column(String(255), nullable=True)
    total_clauses = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    clauses = relationship("Clause", back_populates="document", cascade="all, delete-orphan")


class Clause(Base):
    __tablename__ = "clauses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("regulation_documents.id"), nullable=False, index=True)
    clause_number = Column(String(50), nullable=False, index=True)  # e.g., "1.8", "1.8(g)", "1.9", "1.11", "2.24"
    title = Column(String(255), nullable=False)
    section = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    hierarchy_level = Column(Integer, default=1)
    parent_clause_id = Column(String(36), ForeignKey("clauses.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    embedding_vector = Column(JSON, nullable=True)  # Stored embedding array
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("RegulationDocument", back_populates="clauses")
    rules = relationship("Rule", back_populates="clause")
    deadline_rules = relationship("DeadlineRule", back_populates="clause")


class ClauseLink(Base):
    __tablename__ = "clause_links"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_clause_id = Column(String(36), ForeignKey("clauses.id"), nullable=False, index=True)
    target_clause_id = Column(String(36), ForeignKey("clauses.id"), nullable=False, index=True)
    link_type = Column(String(50), nullable=False)  # REFERENCES, DEPENDS_ON, MODIFIES, OVERRIDES
    description = Column(String(255), nullable=True)


class Rule(Base):
    __tablename__ = "rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    clause_id = Column(String(36), ForeignKey("clauses.id"), nullable=False, index=True)
    rule_code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    verification_status = Column(String(50), default="VERIFIED", nullable=False)  # VERIFIED, UNVERIFIED_SYNTHETIC
    evaluation_logic = Column(JSON, nullable=True)  # Structured condition schema
    required_fields = Column(JSON, default=list)  # ["land_area_acres", "fire_safety_cert_expiry", etc.]
    applicability_scope = Column(String(100), default="ALL")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    clause = relationship("Clause", back_populates="rules")


class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_type = Column(String(100), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status_label = Column(String(50), default="VERIFIED")  # VERIFIED or UNVERIFIED_SYNTHETIC
    stages_json = Column(JSON, nullable=False)  # ordered list of stages and transitions
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    rule_dependencies = relationship("WorkflowTemplateRuleDep", back_populates="workflow_template")


class WorkflowTemplateRuleDep(Base):
    __tablename__ = "workflow_template_rule_deps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workflow_template_id = Column(String(36), ForeignKey("workflow_templates.id"), nullable=False)
    rule_id = Column(String(36), ForeignKey("rules.id"), nullable=False)
    stage = Column(String(100), nullable=False)  # e.g., "SCRUTINY", "EVC", "RE_SCRUTINY"
    requirement_type = Column(String(50), default="MANDATORY")

    workflow_template = relationship("WorkflowTemplate", back_populates="rule_dependencies")
    rule = relationship("Rule")


class DeadlineRule(Base):
    __tablename__ = "deadline_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rule_code = Column(String(100), unique=True, nullable=False, index=True)
    clause_id = Column(String(36), ForeignKey("clauses.id"), nullable=True)
    trigger_event = Column(String(100), nullable=False, index=True)
    duration_days = Column(Integer, nullable=False)
    duration_type = Column(String(50), default="CALENDAR_DAYS")  # CALENDAR_DAYS or WORKING_DAYS
    responsible_party = Column(String(50), nullable=False)  # INSTITUTION, OFFICER, SAC, EC
    description = Column(Text, nullable=False)
    legal_interpretation = Column(Text, nullable=True)
    academic_cutoff_applicable = Column(Boolean, default=False)

    clause = relationship("Clause", back_populates="deadline_rules")
