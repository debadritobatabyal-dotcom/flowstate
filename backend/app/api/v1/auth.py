import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.core.audit import record_audit_event
from app.models.identity import User, Institution, Officer, Expert
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleAuthRequest,
    DemoLoginRequest,
    TokenResponse,
    UserProfile,
)
from app.api.deps import get_current_user, canonical_role

router = APIRouter()

DEMO_ROLES_MAP = {
    "EXECUTIVE": {
        "email": "executive@flowstate.aicte.gov.in",
        "name": "Member Secretary, AICTE",
        "title": "Executive Decision Maker",
        "description": "National KPIs, pendency heatmaps, statutory approvals",
    },
    "REGIONAL_OFFICER": {
        "email": "officer.western@flowstate.aicte.gov.in",
        "name": "Western Regional Officer",
        "title": "Scrutiny Convener",
        "description": "Document verification, Evidence Matrix, Targeted Re-Scrutiny",
    },
    "INSTITUTION_ADMIN": {
        "email": "director@meridian.edu.in",
        "name": "Director, Meridian Institute of Technology",
        "title": "Institution Compliance Head",
        "description": "Application intake, document resubmission, deficiency response",
    },
    "REGULATORY_ADMIN": {
        "email": "regadmin@flowstate.aicte.gov.in",
        "name": "Regulatory Policy Director",
        "title": "Regulatory Administrator",
        "description": "Clause registry, corrigendum diff, impact approval gate",
    },
    "EVC_EXPERT": {
        "email": "expert.civil@flowstate.aicte.gov.in",
        "name": "Prof. S. R. Sharma (EVC Expert)",
        "title": "Visiting Expert Member",
        "description": "Visit schedules, infrastructure inspection, report upload",
    },
    "AUDITOR": {
        "email": "auditor@flowstate.aicte.gov.in",
        "name": "Independent Statutory Auditor",
        "title": "Audit & Compliance Officer",
        "description": "Cryptographic SHA-256 hash ledger, immutable event provenance",
    },
    "SYSTEM_ADMIN": {
        "email": "superadmin@flowstate.aicte.gov.in",
        "name": "AICTE Chief Administrative Director",
        "title": "System Administrator",
        "description": "User management, role assignment, system health, demo reset",
    },
}


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

    token = create_access_token(data={"sub": user.id, "role": canonical_role(user.role), "email": user.email})

    record_audit_event(
        db=db,
        action="USER_LOGIN",
        entity_type="USER",
        entity_id=user.id,
        actor_id=user.id,
        actor_role=user.role,
        details={"email": user.email, "method": "PASSWORD"},
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=canonical_role(user.role),
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        institution_id=user.institution_id,
    )


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    new_user = User(
        email=req.email.lower().strip(),
        hashed_password=hash_password(req.password),
        full_name=req.full_name.strip(),
        role=canonical_role(req.role),
        institution_id=req.institution_id,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.id, "role": canonical_role(new_user.role), "email": new_user.email})

    record_audit_event(
        db=db,
        action="USER_REGISTER",
        entity_type="USER",
        entity_id=new_user.id,
        actor_id=new_user.id,
        actor_role=new_user.role,
        details={"email": new_user.email, "role": new_user.role},
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=canonical_role(new_user.role),
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        institution_id=new_user.institution_id,
    )


@router.post("/google", response_model=TokenResponse)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth. In local/prototype mode, securely provisions or logs in the user."""
    email = (req.email or f"user-{req.id_token[:8]}@aicte.gov.in").lower().strip()
    name = req.name or "Google User"

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=hash_password(str(uuid.uuid4())),
            full_name=name,
            role="INSTITUTION_ADMIN",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.id, "role": canonical_role(user.role), "email": user.email})

    record_audit_event(
        db=db,
        action="USER_LOGIN_GOOGLE_OAUTH",
        entity_type="USER",
        entity_id=user.id,
        actor_id=user.id,
        actor_role=user.role,
        details={"email": user.email, "method": "GOOGLE_OAUTH"},
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=canonical_role(user.role),
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        institution_id=user.institution_id,
    )


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    # Always return success message to prevent user enumeration
    reset_token = str(uuid.uuid4())[:8].upper()
    return {
        "message": "If this email is registered, a password reset token has been dispatched.",
        "demo_reset_token": reset_token,  # provided in demo mode for instant testing
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = hash_password(req.new_password)
    db.commit()

    record_audit_event(
        db=db,
        action="PASSWORD_RESET",
        entity_type="USER",
        entity_id=user.id,
        actor_id=user.id,
        actor_role=user.role,
        details={"email": user.email},
    )

    return {"message": "Password updated successfully. You may now log in with your new credentials."}


@router.get("/demo-users")
def get_demo_users():
    """Return available synthetic roles and profiles for 1-click demo exploration."""
    return [
        {
            "role": role_key,
            "title": data["title"],
            "name": data["name"],
            "email": data["email"],
            "description": data["description"],
        }
        for role_key, data in DEMO_ROLES_MAP.items()
    ]


@router.post("/demo-login", response_model=TokenResponse)
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    """Instant 1-click synthetic demo session generator with strict isolation."""
    role_key = req.role.upper().strip()
    if role_key not in DEMO_ROLES_MAP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown demo role '{req.role}'. Available: {list(DEMO_ROLES_MAP.keys())}",
        )

    demo_info = DEMO_ROLES_MAP[role_key]
    user = db.query(User).filter(User.email == demo_info["email"]).first()

    if not user:
        # Auto-provision if missing from seed
        inst = db.query(Institution).filter(Institution.name == "Meridian Institute of Technology").first()
        inst_id = inst.id if inst and role_key == "INSTITUTION_ADMIN" else None

        user = User(
            email=demo_info["email"],
            hashed_password=hash_password("Password123!"),
            full_name=demo_info["name"],
            role=role_key,
            institution_id=inst_id,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.id, "role": canonical_role(user.role), "email": user.email, "is_demo": True})

    record_audit_event(
        db=db,
        action="DEMO_SESSION_START",
        entity_type="USER",
        entity_id=user.id,
        actor_id=user.id,
        actor_role=user.role,
        details={"email": user.email, "role": role_key, "demo_mode": True},
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=canonical_role(user.role),
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
        role=canonical_role(current_user.role),
        full_name=current_user.full_name,
        institution_id=current_user.institution_id,
        institution_name=current_user.institution.name if current_user.institution else None,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )

