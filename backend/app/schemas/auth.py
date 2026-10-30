from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "INSTITUTION_ADMIN"
    institution_id: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str


class GoogleAuthRequest(BaseModel):
    id_token: str
    email: Optional[EmailStr] = None
    name: Optional[str] = None


class DemoLoginRequest(BaseModel):
    role: str  # e.g. EXECUTIVE, REGIONAL_OFFICER, INSTITUTION_ADMIN, REGULATORY_ADMIN, EVC_EXPERT, AUDITOR, SYSTEM_ADMIN


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    email: str
    full_name: str
    institution_id: Optional[str] = None


class UserProfile(BaseModel):
    id: str
    email: str
    role: str
    full_name: str
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None


class UserCreateRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    institution_id: Optional[str] = None
    regional_office: Optional[str] = None
    temp_password: Optional[str] = "Password123!"


class UserStatusUpdateRequest(BaseModel):
    is_active: bool
    reason: Optional[str] = None


class UserRoleUpdateRequest(BaseModel):
    role: str
    institution_id: Optional[str] = None
    regional_office: Optional[str] = None

