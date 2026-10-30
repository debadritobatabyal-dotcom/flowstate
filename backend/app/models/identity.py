import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    aicte_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    region = Column(String(50), nullable=False, index=True)  # Northern, Southern, Western, Eastern, South-Western
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    type = Column(String(100), nullable=False)  # Private-Self Financed, Govt, Govt-Aided
    address = Column(Text, nullable=True)
    pin_code = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    users = relationship("User", back_populates="institution")
    applications = relationship("Application", back_populates="institution")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)  # ADMIN_EXEC, OFFICER, INSTITUTION, REG_ADMIN, SUPER_ADMIN
    full_name = Column(String(255), nullable=False)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="users")
    officer_profile = relationship("Officer", back_populates="user", uselist=False)
    expert_profile = relationship("Expert", back_populates="user", uselist=False)


class Officer(Base):
    __tablename__ = "officers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    regional_office = Column(String(50), nullable=False, index=True)
    designation = Column(String(100), nullable=False)
    workload_count = Column(Integer, default=0)

    user = relationship("User", back_populates="officer_profile")


class Expert(Base):
    __tablename__ = "experts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=True)
    full_name = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    designation = Column(String(100), nullable=False)
    expertise_areas = Column(JSON, default=list)  # ["Civil Engineering", "Computer Science", etc.]
    conflict_institutions = Column(JSON, default=list)  # list of institution IDs with conflicts
    city = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="expert_profile")
