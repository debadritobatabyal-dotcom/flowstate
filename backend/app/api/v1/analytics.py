from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.application import Application
from app.models.identity import Officer, Institution
from app.models.deficiency import Deficiency
from app.models.impact import Amendment
from app.ml.predict import PredictionEngine
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/dashboard-kpis")
def get_dashboard_kpis(
    region: Optional[str] = None,
    application_type: Optional[str] = None,
    current_stage: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = db.query(Application)
    if application_type:
        base_query = base_query.filter(Application.application_type == application_type)
    if current_stage:
        base_query = base_query.filter(Application.current_stage == current_stage)
    if region:
        base_query = base_query.join(Institution, Application.institution_id == Institution.id).filter(Institution.region == region)

    total_apps = base_query.count()
    open_apps = base_query.filter(Application.status.in_(["IN_PROGRESS", "DEFICIENT"])).count()
    approved_apps = base_query.filter(Application.status == "APPROVED").count()
    rejected_apps = base_query.filter(Application.status == "REJECTED").count()
    high_risk_apps = base_query.filter(Application.delay_risk_predicted >= 0.65).count()

    # Stage-wise pendency
    stage_counts_query = (
        db.query(Application.current_stage, func.count(Application.id))
    )
    if region:
        stage_counts_query = stage_counts_query.join(Institution, Application.institution_id == Institution.id).filter(Institution.region == region)
    stage_counts = stage_counts_query.group_by(Application.current_stage).all()
    stage_distribution = [{"stage": s, "count": c} for s, c in stage_counts]

    # Regional breakdown
    regional_counts = (
        db.query(Institution.region, func.count(Application.id))
        .join(Application, Application.institution_id == Institution.id)
        .group_by(Institution.region)
        .all()
    )
    regional_distribution = [{"region": r, "count": c} for r, c in regional_counts]

    # Officer workload
    officers = db.query(Officer).all()
    officer_workload = [
        {
            "name": off.user.full_name if off.user else "Officer",
            "region": off.regional_office,
            "workload": off.workload_count,
        }
        for off in officers
    ]

    # Active Deficiencies
    active_deficiencies = db.query(Deficiency).filter(Deficiency.status.in_(["OPEN", "RESUBMITTED", "UNRESOLVED"])).count()

    # Active Amendments
    active_amendments = db.query(Amendment).filter(Amendment.status.in_(["PROPOSED", "DRAFT"])).count()

    return {
        "total_applications": total_apps,
        "open_applications": open_apps,
        "approved_applications": approved_apps,
        "rejected_applications": rejected_apps,
        "high_delay_risk_count": high_risk_apps,
        "high_delay_risk_label": "Applications with Delay Risk Score >= 65/100",
        "active_deficiencies": active_deficiencies,
        "active_amendments": active_amendments,
        "stage_distribution": stage_distribution,
        "regional_distribution": regional_distribution,
        "officer_workload": officer_workload,
        "applied_filters": {
            "region": region,
            "application_type": application_type,
            "current_stage": current_stage,
        },
        "disclaimer": "DEMO ENVIRONMENT — Synthetic data. No live AICTE databases or APIs are connected.",
    }



@router.get("/prediction/{app_id}")
def get_application_delay_prediction(
    app_id: str,
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        return {"error": "Application not found"}

    def_count = len([d for d in app.deficiencies if d.status in ("OPEN", "RESUBMITTED", "UNRESOLVED")])
    region = app.institution.region if app.institution else "Western"

    pred = PredictionEngine.predict_application_risk(
        application_type=app.application_type,
        current_stage=app.current_stage,
        deficiencies_count=def_count,
        days_in_current_stage=14,
        officer_workload=18,
        region=region,
    )
    pred["application_id"] = app.id
    pred["application_number"] = app.application_number
    return pred
