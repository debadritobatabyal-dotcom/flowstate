from typing import Generator, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.identity import User

security = HTTPBearer(auto_error=False)

ROLE_ALIASES = {
    "SUPER_ADMIN": "SYSTEM_ADMIN",
    "SYSTEM_ADMIN": "SYSTEM_ADMIN",
    "REG_ADMIN": "REGULATORY_ADMIN",
    "REGULATORY_ADMIN": "REGULATORY_ADMIN",
    "ADMIN_EXEC": "EXECUTIVE",
    "EXECUTIVE": "EXECUTIVE",
    "OFFICER": "REGIONAL_OFFICER",
    "REGIONAL_OFFICER": "REGIONAL_OFFICER",
    "INSTITUTION": "INSTITUTION_ADMIN",
    "INSTITUTION_ADMIN": "INSTITUTION_ADMIN",
    "EVC_EXPERT": "EVC_EXPERT",
    "AUDITOR": "AUDITOR",
}


def canonical_role(role: str) -> str:
    return ROLE_ALIASES.get(role, role)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )
    return user


def require_roles(allowed_roles: List[str]):
    # Allow matching either canonical role or historical alias
    expanded_allowed = set()
    for r in allowed_roles:
        expanded_allowed.add(r)
        expanded_allowed.add(canonical_role(r))
        for k, v in ROLE_ALIASES.items():
            if v == r or k == r:
                expanded_allowed.add(k)
                expanded_allowed.add(v)

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        c_role = canonical_role(current_user.role)
        if c_role not in expanded_allowed and current_user.role not in expanded_allowed and c_role != "SYSTEM_ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles} roles.",
            )
        return current_user
    return role_checker


def enforce_institution_access(current_user: User, institution_id: Optional[str]):
    """Strictly prevent institution accounts from accessing other institutions' data."""
    c_role = canonical_role(current_user.role)
    if c_role == "INSTITUTION_ADMIN":
        if not current_user.institution_id or current_user.institution_id != institution_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are only authorized to access records belonging to your institution.",
            )

