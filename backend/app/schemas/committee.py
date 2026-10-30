from typing import Any, Dict, List, Optional
from datetime import datetime, date
from pydantic import BaseModel


class ExpertResponse(BaseModel):
    id: str
    full_name: str
    organization: str
    designation: str
    expertise_areas: List[str]
    city: str
    phone: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class EvcScheduleRequest(BaseModel):
    application_id: str
    preferred_date: date
    visit_mode: str = "PHYSICAL"
    panel_size: int = 3


class EvcScheduleResponse(BaseModel):
    application_id: str
    institution_id: str
    institution_name: str
    institution_city: str
    scheduled_date: date
    visit_mode: str
    assigned_experts: List[Dict[str, Any]]
    conflict_free_verified: bool
    status: str
    score: float
    constraints_satisfied: List[str]
