import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Boolean, Integer, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_number = Column(String(50), unique=True, index=True, nullable=False)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False, index=True)
    application_type = Column(String(100), nullable=False, index=True)  # New Programme/Level, EoA Self-Disclosure, etc.
    current_stage = Column(String(100), nullable=False, index=True)  # SUBMITTED, SCRUTINY, DEFICIENCY_ISSUED, RE_SCRUTINY, EVC_SCHEDULED, EC_APPROVAL, APPROVED, REJECTED
    status = Column(String(50), default="IN_PROGRESS", index=True)  # IN_PROGRESS, APPROVED, REJECTED, DEFICIENT
    workflow_template_version = Column(String(50), nullable=False)
    regulation_version = Column(String(50), default="APH-2024-27-v1.0")
    assigned_officer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    submission_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    target_completion_date = Column(DateTime, nullable=True)

    # ML & Risk predictions
    overall_risk_score = Column(Float, default=0.0)
    delay_risk_predicted = Column(Float, default=0.0)  # probability 0-1
    remaining_days_predicted = Column(Float, default=0.0)
    shap_explanation = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="applications")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])
    events = relationship("ApplicationEvent", back_populates="application", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    requirement_evidence_links = relationship("RequirementEvidenceLink", back_populates="application", cascade="all, delete-orphan")
    deficiencies = relationship("Deficiency", back_populates="application", cascade="all, delete-orphan")
    integrity_flags = relationship("IntegrityFlag", back_populates="application", cascade="all, delete-orphan")


class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)  # STAGE_TRANSITION, DEFICIENCY_RAISED, DOCUMENT_UPLOADED, RESCRUTINY_SUBMITTED, EVC_VISITED, EC_DECIDED
    from_stage = Column(String(100), nullable=True)
    to_stage = Column(String(100), nullable=True)
    triggered_by_id = Column(String(36), nullable=True)
    actor_role = Column(String(50), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="events")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    document_type = Column(String(100), nullable=False, index=True)  # LAND_DOCUMENT, FIRE_SAFETY_CERT, FACULTY_LIST, FINANCIAL_STATEMENT
    original_filename = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    file_hash_sha256 = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    page_count = Column(Integer, default=1)
    status = Column(String(50), default="PROCESSED")  # UPLOADED, PROCESSING, PROCESSED, ERROR
    is_resubmission = Column(Boolean, default=False)
    replaces_document_id = Column(String(36), nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    raw_text = Column(Text, nullable=True)
    ocr_applied = Column(Boolean, default=False)
    thumbnail_path = Column(String(500), nullable=True)

    document = relationship("Document", back_populates="pages")
    extractions = relationship("Extraction", back_populates="page", cascade="all, delete-orphan")


class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    page_id = Column(String(36), ForeignKey("document_pages.id"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    field_name = Column(String(100), nullable=False)  # land_area, valid_until, reg_number, faculty_name, qualification
    extracted_value = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    provenance = Column(String(50), default="RULE-COMPUTED")  # RULE-COMPUTED, SUGGESTED, VERIFIED, SIMULATED
    verification_status = Column(String(50), default="UNVERIFIED")  # UNVERIFIED, VERIFIED, REJECTED
    verified_by_id = Column(String(36), nullable=True)
    verified_at = Column(DateTime, nullable=True)

    page = relationship("DocumentPage", back_populates="extractions")


class RequirementEvidenceLink(Base):
    __tablename__ = "requirement_evidence_links"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    rule_id = Column(String(36), ForeignKey("rules.id"), nullable=False, index=True)
    rule_code = Column(String(100), nullable=False)
    aph_clause_number = Column(String(50), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    page_number = Column(Integer, nullable=True)
    extraction_id = Column(String(36), ForeignKey("extractions.id"), nullable=True)
    evidence_snippet = Column(Text, nullable=True)
    validation_result = Column(String(50), default="COMPLIANT")  # COMPLIANT, DEFICIENT, INCOMPLETE, PENDING_REVIEW
    provenance = Column(String(50), default="RULE-COMPUTED")  # RULE-COMPUTED, SUGGESTED, VERIFIED, SIMULATED
    officer_verification_status = Column(String(50), default="PENDING")  # PENDING, VERIFIED, DEFICIENCY_RAISED
    officer_notes = Column(Text, nullable=True)
    verified_by_id = Column(String(36), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="requirement_evidence_links")
    rule = relationship("Rule")
    document = relationship("Document")


class IntegrityFlag(Base):
    __tablename__ = "integrity_flags"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    flag_type = Column(String(100), nullable=False)  # EXPIRED_CERTIFICATE, POSSIBLE_DUPLICATE, INCONSISTENCY, MISSING_MANDATORY_FIELD
    severity = Column(String(50), default="WARNING")  # INFO, WARNING, CRITICAL
    description = Column(Text, nullable=False)  # "Possible inconsistency — requires review." Never "fraud".
    status = Column(String(50), default="ACTIVE")  # ACTIVE, DISMISSED, RESOLVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="integrity_flags")
