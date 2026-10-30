import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Boolean, Integer, Date
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Committee(Base):
    __tablename__ = "committees"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    committee_type = Column(String(50), nullable=False, index=True)  # SCRUTINY, RE_SCRUTINY, EVC, SHC, SAC, EC
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    scheduled_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="SCHEDULED")  # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    meeting_link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    members = relationship("CommitteeMember", back_populates="committee", cascade="all, delete-orphan")
    reports = relationship("CommitteeReport", back_populates="committee", cascade="all, delete-orphan")


class CommitteeMember(Base):
    __tablename__ = "committee_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    committee_id = Column(String(36), ForeignKey("committees.id"), nullable=False, index=True)
    expert_id = Column(String(36), ForeignKey("experts.id"), nullable=False)
    role = Column(String(50), default="MEMBER")  # CHAIRMAN, CONVENOR, MEMBER
    attendance_status = Column(String(50), default="CONFIRMED")

    committee = relationship("Committee", back_populates="members")
    expert = relationship("Expert")


class ExpertAvailability(Base):
    __tablename__ = "expert_availability"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    expert_id = Column(String(36), ForeignKey("experts.id"), nullable=False, index=True)
    available_date = Column(Date, nullable=False, index=True)
    is_booked = Column(Boolean, default=False)

    expert = relationship("Expert")


class EvcVisit(Base):
    __tablename__ = "evc_visits"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False, index=True)
    scheduled_date = Column(DateTime, nullable=False)
    visit_mode = Column(String(50), default="PHYSICAL")  # PHYSICAL, ONLINE
    status = Column(String(50), default="SUGGESTED")  # SUGGESTED, CONFIRMED, COMPLETED, CANCELLED
    report_summary = Column(Text, nullable=True)
    conflict_free_verified = Column(Boolean, default=False)
    panel_size = Column(Integer, default=3)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class CommitteeReport(Base):
    __tablename__ = "committee_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    committee_id = Column(String(36), ForeignKey("committees.id"), nullable=False, index=True)
    recommendations = Column(Text, nullable=False)
    is_unanimous = Column(Boolean, default=True)
    dissenting_notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    file_path = Column(String(500), nullable=True)

    committee = relationship("Committee", back_populates="reports")
