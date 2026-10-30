from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    application_type: str
    workflow_template_version: Optional[str] = "v1.0"


class ApplicationTransitionRequest(BaseModel):
    to_stage: str
    notes: Optional[str] = None


class ApplicationSummaryResponse(BaseModel):
    id: str
    application_number: str
    institution_id: str
    institution_name: Optional[str] = None
    application_type: str
    current_stage: str
    status: str
    workflow_template_version: str
    regulation_version: str
    submission_date: datetime
    overall_risk_score: float
    delay_risk_predicted: float
    remaining_days_predicted: float
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationDetailResponse(ApplicationSummaryResponse):
    assigned_officer_id: Optional[str] = None
    assigned_officer_name: Optional[str] = None
    target_completion_date: Optional[datetime] = None
    shap_explanation: Optional[Dict[str, Any]] = None
    events: List[Dict[str, Any]] = []
    documents: List[Dict[str, Any]] = []
    deficiencies_count: int = 0
    active_deficiencies_count: int = 0
