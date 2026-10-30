import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Amendment(Base):
    __tablename__ = "amendments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    amendment_number = Column(String(50), unique=True, index=True, nullable=False)  # e.g., "APH-AMD-2024-01"
    title = Column(String(255), nullable=False)
    gazette_notification_no = Column(String(100), nullable=True)
    issue_date = Column(DateTime, nullable=False)
    effective_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="PROPOSED")  # DRAFT, PROPOSED, APPROVED, REJECTED
    document_path = Column(String(500), nullable=True)
    summary = Column(Text, nullable=False)
    is_synthetic_demonstration = Column(Boolean, default=True)
    approved_by_id = Column(String(36), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    diffs = relationship("ClauseDiff", back_populates="amendment", cascade="all, delete-orphan")
    impact_reports = relationship("ImpactReport", back_populates="amendment", cascade="all, delete-orphan")


class ClauseDiff(Base):
    __tablename__ = "clause_diffs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    amendment_id = Column(String(36), ForeignKey("amendments.id"), nullable=False, index=True)
    clause_number = Column(String(50), nullable=False, index=True)  # e.g., "Clause 1.8", "Table 2.3"
    diff_type = Column(String(50), nullable=False)  # ADDED, MODIFIED, REMOVED
    old_text = Column(Text, nullable=True)
    new_text = Column(Text, nullable=False)
    impact_summary = Column(Text, nullable=True)

    amendment = relationship("Amendment", back_populates="diffs")


class ImpactReport(Base):
    __tablename__ = "impact_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    amendment_id = Column(String(36), ForeignKey("amendments.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="PENDING_REVIEW")  # PENDING_REVIEW, APPROVED, REJECTED, PARTIALLY_APPROVED
    summary_metrics = Column(JSON, default=dict)  # {"rules_affected": 2, "templates_affected": 1, "applications_affected": 12, "ambiguous_count": 3}
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    approved_at = Column(DateTime, nullable=True)
    approved_by_id = Column(String(36), nullable=True)

    amendment = relationship("Amendment", back_populates="impact_reports")
    items = relationship("ImpactItem", back_populates="impact_report", cascade="all, delete-orphan")


class ImpactItem(Base):
    __tablename__ = "impact_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    impact_report_id = Column(String(36), ForeignKey("impact_reports.id"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)  # RULE, WORKFLOW_TEMPLATE, APPLICATION, DEADLINE, DOCUMENT
    entity_id = Column(String(100), nullable=False, index=True)
    entity_label = Column(String(255), nullable=False)
    clause_number = Column(String(50), nullable=False)
    impact_type = Column(String(100), nullable=False)  # REQUIREMENT_TIGHTENED, NEW_STAGE_REQUIRED, RETROSPECTIVE_CHECK, DEADLINE_ALTERED
    applicability = Column(String(50), nullable=False)  # UNAMBIGUOUS_PROSPECTIVE, AMBIGUOUS_RETROSPECTIVE, EXEMPT
    recommended_action = Column(Text, nullable=False)
    explanation_chain = Column(JSON, default=list)  # ["Amendment AMD-01", "Clause 1.9", "Rule FIRE-01", "App MIT-2024-001"]
    approval_status = Column(String(50), default="PENDING")  # PENDING, APPROVED, REJECTED
    officer_notes = Column(Text, nullable=True)
    reviewed_by_id = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    impact_report = relationship("ImpactReport", back_populates="items")
