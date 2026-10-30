from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.identity import Expert
from app.schemas.committee import ExpertResponse, EvcScheduleRequest, EvcScheduleResponse
from app.engines.evc_engine import EvcSchedulerEngine
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/experts", response_model=List[ExpertResponse])
def list_experts(db: Session = Depends(get_db)):
    experts = db.query(Expert).filter(Expert.is_active == True).all()
    results = []
    for exp in experts:
        results.append(ExpertResponse(
            id=exp.id,
            full_name=exp.full_name,
            organization=exp.organization,
            designation=exp.designation,
            expertise_areas=exp.expertise_areas or [],
            city=exp.city,
            phone=exp.phone,
            is_active=exp.is_active,
        ))
    return results


@router.post("/schedule", response_model=EvcScheduleResponse)
def schedule_evc_visit(
    req: EvcScheduleRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    schedule_result = EvcSchedulerEngine.generate_suggested_schedule(
        db=db,
        application_id=req.application_id,
        preferred_date=req.preferred_date,
        panel_size=req.panel_size,
        visit_mode=req.visit_mode,
    )
    return EvcScheduleResponse(**schedule_result)
