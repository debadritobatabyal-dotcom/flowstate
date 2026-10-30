from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.identity import User
from app.models.application import Application, ApplicationEvent
from app.models.deficiency import Deficiency
from app.schemas.application import (
    ApplicationCreate,
    ApplicationSummaryResponse,
    ApplicationDetailResponse,
    ApplicationTransitionRequest,
)
from app.engines.workflow_engine import WorkflowEngine
from app.engines.deadline_engine import DeadlineEngine
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[ApplicationSummaryResponse])
def list_applications(
    stage: Optional[str] = None,
    status: Optional[str] = None,
    region: Optional[str] = None,
    app_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Application)

    # Server-side institution-level isolation
    if current_user.role == "INSTITUTION":
        if not current_user.institution_id:
            return []
        query = query.filter(Application.institution_id == current_user.institution_id)

    if stage:
        query = query.filter(Application.current_stage == stage)
    if status:
        query = query.filter(Application.status == status)
    if app_type:
        query = query.filter(Application.application_type == app_type)
    if region and current_user.role != "INSTITUTION":
        query = query.join(Application.institution).filter(Application.institution.has(region=region))
    if search:
        query = query.filter(Application.application_number.ilike(f"%{search}%"))

    apps = query.order_by(Application.submission_date.desc()).offset(skip).limit(limit).all()

    results = []
    for app in apps:
        results.append(ApplicationSummaryResponse(
            id=app.id,
            application_number=app.application_number,
            institution_id=app.institution_id,
            institution_name=app.institution.name if app.institution else None,
            application_type=app.application_type,
            current_stage=app.current_stage,
            status=app.status,
            workflow_template_version=app.workflow_template_version,
            regulation_version=app.regulation_version,
            submission_date=app.submission_date,
            overall_risk_score=app.overall_risk_score,
            delay_risk_predicted=app.delay_risk_predicted,
            remaining_days_predicted=app.remaining_days_predicted,
            created_at=app.created_at,
        ))
    return results


@router.get("/{id}", response_model=ApplicationDetailResponse)
def get_application_detail(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    # Isolation check
    if current_user.role == "INSTITUTION" and app.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Access forbidden: you can only view your own institution's applications.")

    events_data = [
        {
            "id": e.id,
            "event_type": e.event_type,
            "from_stage": e.from_stage,
            "to_stage": e.to_stage,
            "actor_role": e.actor_role,
            "metadata": e.metadata_json or {},
            "created_at": e.created_at.isoformat(),
        }
        for e in sorted(app.events, key=lambda x: x.created_at)
    ]

    docs_data = [
        {
            "id": d.id,
            "document_type": d.document_type,
            "original_filename": d.original_filename,
            "file_size_bytes": d.file_size_bytes,
            "page_count": d.page_count,
            "status": d.status,
            "uploaded_at": d.uploaded_at.isoformat(),
        }
        for d in app.documents
    ]

    total_defs = len(app.deficiencies)
    active_defs = len([d for d in app.deficiencies if d.status in ("OPEN", "RESUBMITTED", "UNRESOLVED")])

    return ApplicationDetailResponse(
        id=app.id,
        application_number=app.application_number,
        institution_id=app.institution_id,
        institution_name=app.institution.name if app.institution else None,
        application_type=app.application_type,
        current_stage=app.current_stage,
        status=app.status,
        workflow_template_version=app.workflow_template_version,
        regulation_version=app.regulation_version,
        assigned_officer_id=app.assigned_officer_id,
        assigned_officer_name=app.assigned_officer.full_name if app.assigned_officer else None,
        submission_date=app.submission_date,
        target_completion_date=app.target_completion_date,
        overall_risk_score=app.overall_risk_score,
        delay_risk_predicted=app.delay_risk_predicted,
        remaining_days_predicted=app.remaining_days_predicted,
        shap_explanation=app.shap_explanation,
        events=events_data,
        documents=docs_data,
        deficiencies_count=total_defs,
        active_deficiencies_count=active_defs,
        created_at=app.created_at,
    )


@router.post("/{id}/transition")
def transition_application_stage(
    id: str,
    req: ApplicationTransitionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if current_user.role not in ("OFFICER", "ADMIN_EXEC", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Stage transitions require authorized officer permissions.")

    success, message = WorkflowEngine.transition_stage(
        db=db,
        application=app,
        to_stage=req.to_stage,
        actor_id=current_user.id,
        actor_role=current_user.role,
        notes=req.notes,
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {"success": True, "message": message, "current_stage": app.current_stage}


@router.get("/{id}/deadlines")
def get_application_deadlines(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if current_user.role == "INSTITUTION" and app.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    deadlines = DeadlineEngine.get_active_deadlines_for_application(db, app)
    return {"application_id": id, "deadlines": deadlines}
