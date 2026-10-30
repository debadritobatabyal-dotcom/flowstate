import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Deficiency(Base):
    __tablename__ = "deficiencies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    deficiency_number = Column(String(50), unique=True, index=True, nullable=False)  # e.g., "DEF-2024-001"
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False, index=True)
    aph_clause_number = Column(String(50), nullable=False, index=True)  # e.g., "Clause 1.8", "Clause 1.9"
    rule_code = Column(String(100), nullable=False)
    observation = Column(Text, nullable=False)
    original_document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    original_page_number = Column(Integer, nullable=True)
    evidence_snippet = Column(Text, nullable=True)

    stage_raised = Column(String(50), default="SCRUTINY", nullable=False)  # SCRUTINY, EVC
    date_raised = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    responsible_party = Column(String(50), default="INSTITUTION")
    status = Column(String(50), default="OPEN", index=True)  # OPEN, RESUBMITTED, RESOLVED, UNRESOLVED
    severity = Column(String(50), default="CRITICAL")  # MINOR, MAJOR, CRITICAL

    resubmitted_document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    resubmitted_page_number = Column(Integer, nullable=True)
    resubmission_notes = Column(Text, nullable=True)
    resubmitted_at = Column(DateTime, nullable=True)

    verification_round = Column(Integer, default=1)
    resolution_status = Column(String(50), nullable=True)  # COMPLIED, DEFICIENT_REMAINS
    officer_resolution_notes = Column(Text, nullable=True)
    resolved_by_id = Column(String(36), nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="deficiencies")
    events = relationship("DeficiencyEvent", back_populates="deficiency", cascade="all, delete-orphan")


class DeficiencyEvent(Base):
    __tablename__ = "deficiency_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    deficiency_id = Column(String(36), ForeignKey("deficiencies.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)  # RAISED, EVIDENCE_RESUBMITTED, RE_SCRUTINISED, RESOLVED, REJECTED
    actor_id = Column(String(36), nullable=True)
    actor_role = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    document_id = Column(String(36), nullable=True)
    page_number = Column(Integer, nullable=True)
    status_before = Column(String(50), nullable=True)
    status_after = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    deficiency = relationship("Deficiency", back_populates="events")


class RescrutinyChecklist(Base):
    """
    Locked checklist enforcing APH Clause 1.8(g):
    Re-scrutiny verifies ONLY deficiencies previously identified by the Scrutiny Committee.
    """
    __tablename__ = "rescrutiny_checklists"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    round_number = Column(Integer, default=1)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, LOCKED_COMPLETED
    is_locked = Column(Boolean, default=True)  # Scope cannot be dynamically expanded
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    locked_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    verified_by_id = Column(String(36), nullable=True)

    items = relationship("RescrutinyItem", back_populates="checklist", cascade="all, delete-orphan")
    new_findings = relationship("NewFinding", back_populates="checklist", cascade="all, delete-orphan")


class RescrutinyItem(Base):
    __tablename__ = "rescrutiny_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    checklist_id = Column(String(36), ForeignKey("rescrutiny_checklists.id"), nullable=False, index=True)
    deficiency_id = Column(String(36), ForeignKey("deficiencies.id"), nullable=False, index=True)
    original_finding_summary = Column(Text, nullable=False)
    aph_clause_number = Column(String(50), nullable=False)
    resubmitted_document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    resubmitted_page_number = Column(Integer, nullable=True)
    verification_status = Column(String(50), default="PENDING")  # PENDING, RESOLVED, UNRESOLVED
    officer_comment = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    checklist = relationship("RescrutinyChecklist", back_populates="items")
    deficiency = relationship("Deficiency")


class NewFinding(Base):
    """
    APH 1.8(g) Enforcement:
    Any newly observed issues during re-scrutiny outside the locked checklist
    must be isolated in this out-of-scope review panel, never silently added to re-scrutiny.
    """
    __tablename__ = "new_findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    checklist_id = Column(String(36), ForeignKey("rescrutiny_checklists.id"), nullable=False, index=True)
    observation = Column(Text, nullable=False)
    clause_number = Column(String(50), nullable=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    page_number = Column(Integer, nullable=True)
    status = Column(String(50), default="OUT_OF_SCOPE_FLAGGED")  # OUT_OF_SCOPE_FLAGGED, ESCALATED_TO_COMMITTEE, DISMISSED
    officer_notes = Column(Text, nullable=True)
    officer_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    checklist = relationship("RescrutinyChecklist", back_populates="new_findings")
