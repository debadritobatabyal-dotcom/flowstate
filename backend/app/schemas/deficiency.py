from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class DeficiencyCreate(BaseModel):
    aph_clause_number: str
    rule_code: str
    observation: str
    document_id: Optional[str] = None
    page_number: Optional[int] = None
    evidence_snippet: Optional[str] = None
    severity: str = "CRITICAL"


class DeficiencyResponse(BaseModel):
    id: str
    deficiency_number: str
    application_id: str
    institution_id: str
    aph_clause_number: str
    rule_code: str
    observation: str
    original_document_id: Optional[str] = None
    original_document_name: Optional[str] = None
    original_page_number: Optional[int] = None
    evidence_snippet: Optional[str] = None
    stage_raised: str
    date_raised: datetime
    responsible_party: str
    status: str  # OPEN, RESUBMITTED, RESOLVED, UNRESOLVED
    severity: str
    resubmitted_document_id: Optional[str] = None
    resubmitted_document_name: Optional[str] = None
    resubmitted_page_number: Optional[int] = None
    resubmission_notes: Optional[str] = None
    resubmitted_at: Optional[datetime] = None
    resolution_status: Optional[str] = None
    officer_resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    events: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class ResubmitDeficiencyRequest(BaseModel):
    document_id: str
    page_number: Optional[int] = 1
    resubmission_notes: str


class RescrutinyVerifyRequest(BaseModel):
    item_id: str
    verification_status: str  # RESOLVED, UNRESOLVED
    officer_comment: str


class AddOutOfScopeFindingRequest(BaseModel):
    observation: str
    clause_number: Optional[str] = None
    document_id: Optional[str] = None
    page_number: Optional[int] = None
    officer_notes: Optional[str] = None
