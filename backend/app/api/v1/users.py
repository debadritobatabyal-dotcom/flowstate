from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password
from app.core.audit import record_audit_event
from app.models.identity import User, Institution, Officer
from app.schemas.auth import (
    UserProfile,
    UserCreateRequest,
    UserStatusUpdateRequest,
    UserRoleUpdateRequest,
)
from app.api.deps import get_current_user, require_roles, canonical_role

router = APIRouter()


@router.get("", response_model=List[UserProfile])
def list_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN"])),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.order_by(User.created_at.desc()).all()
    return [
        UserProfile(
            id=u.id,
            email=u.email,
            role=canonical_role(u.role),
            full_name=u.full_name,
            institution_id=u.institution_id,
            institution_name=u.institution.name if u.institution else None,
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.post("/invite", response_model=UserProfile)
def invite_user(
    req: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN"])),
):
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Validate institution if provided
    inst = None
    if req.institution_id:
        inst = db.query(Institution).filter(Institution.id == req.institution_id).first()
        if not inst:
            raise HTTPException(status_code=404, detail="Institution not found.")

    c_role = canonical_role(req.role)
    new_user = User(
        email=req.email.lower().strip(),
        hashed_password=hash_password(req.temp_password or "Password123!"),
        full_name=req.full_name.strip(),
        role=c_role,
        institution_id=req.institution_id,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    if c_role == "REGIONAL_OFFICER" and req.regional_office:
        officer = Officer(
            user_id=new_user.id,
            regional_office=req.regional_office,
            designation="Regional Officer",
            workload_count=0,
        )
        db.add(officer)

    db.commit()
    db.refresh(new_user)

    record_audit_event(
        db=db,
        action="USER_INVITED",
        entity_type="USER",
        entity_id=new_user.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        details={
            "invited_email": new_user.email,
            "assigned_role": new_user.role,
            "institution_id": new_user.institution_id,
            "regional_office": req.regional_office,
        },
    )

    return UserProfile(
        id=new_user.id,
        email=new_user.email,
        role=canonical_role(new_user.role),
        full_name=new_user.full_name,
        institution_id=new_user.institution_id,
        institution_name=new_user.institution.name if new_user.institution else None,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
    )


@router.patch("/{user_id}/status", response_model=UserProfile)
def update_user_status(
    user_id: str,
    req: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN"])),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_status = user.is_active
    user.is_active = req.is_active
    db.commit()
    db.refresh(user)

    record_audit_event(
        db=db,
        action="USER_STATUS_CHANGE",
        entity_type="USER",
        entity_id=user.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        details={
            "user_email": user.email,
            "old_active": old_status,
            "new_active": user.is_active,
            "reason": req.reason,
        },
    )

    return UserProfile(
        id=user.id,
        email=user.email,
        role=canonical_role(user.role),
        full_name=user.full_name,
        institution_id=user.institution_id,
        institution_name=user.institution.name if user.institution else None,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.patch("/{user_id}/role", response_model=UserProfile)
def update_user_role(
    user_id: str,
    req: UserRoleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN"])),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_role = user.role
    c_role = canonical_role(req.role)
    user.role = c_role
    if req.institution_id is not None:
        user.institution_id = req.institution_id
    db.commit()
    db.refresh(user)

    record_audit_event(
        db=db,
        action="USER_ROLE_CHANGE",
        entity_type="USER",
        entity_id=user.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        details={
            "user_email": user.email,
            "old_role": old_role,
            "new_role": user.role,
        },
    )

    return UserProfile(
        id=user.id,
        email=user.email,
        role=canonical_role(user.role),
        full_name=user.full_name,
        institution_id=user.institution_id,
        institution_name=user.institution.name if user.institution else None,
        is_active=user.is_active,
        created_at=user.created_at,
    )
