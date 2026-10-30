from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.core.audit import record_audit_event
from app.models.identity import User
from app.schemas.auth import LoginRequest, TokenResponse, UserProfile
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    token = create_access_token(data={"sub": user.id, "role": user.role, "email": user.email})

    record_audit_event(
        db=db,
        action="USER_LOGIN",
        entity_type="USER",
        entity_id=user.id,
        actor_id=user.id,
        actor_role=user.role,
        details={"email": user.email},
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        institution_id=user.institution_id,
    )


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        full_name=current_user.full_name,
        institution_id=current_user.institution_id,
        institution_name=current_user.institution.name if current_user.institution else None,
        is_active=current_user.is_active,
    )
