from typing import Optional
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


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
