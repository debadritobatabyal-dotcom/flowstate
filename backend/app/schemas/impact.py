from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class ClauseDiffResponse(BaseModel):
    id: str
    clause_number: str
    diff_type: str  # ADDED, MODIFIED, REMOVED
    old_text: Optional[str] = None
    new_text: str
    impact_summary: Optional[str] = None

    class Config:
        from_attributes = True


class ImpactItemResponse(BaseModel):
    id: str
    impact_report_id: str
    entity_type: str  # RULE, WORKFLOW_TEMPLATE, APPLICATION, DEADLINE, DOCUMENT
    entity_id: str
    entity_label: str
    clause_number: str
    impact_type: str
    applicability: str  # UNAMBIGUOUS_PROSPECTIVE, AMBIGUOUS_RETROSPECTIVE, EXEMPT
    recommended_action: str
    explanation_chain: List[str]
    approval_status: str  # PENDING, APPROVED, REJECTED
    officer_notes: Optional[str] = None

    class Config:
        from_attributes = True


class ImpactReportResponse(BaseModel):
    id: str
    amendment_id: str
    amendment_number: str
    title: str
    status: str
    summary_metrics: Dict[str, Any]
    generated_at: datetime
    approved_at: Optional[datetime] = None
    approved_by_id: Optional[str] = None
    diffs: List[ClauseDiffResponse] = []
    items: List[ImpactItemResponse] = []

    class Config:
        from_attributes = True


class ApproveImpactItemRequest(BaseModel):
    item_id: str
    approval_status: str  # APPROVED, REJECTED
    notes: Optional[str] = None
