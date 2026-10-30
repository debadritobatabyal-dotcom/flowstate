from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class ClauseResponse(BaseModel):
    id: str
    clause_number: str
    title: str
    section: Optional[str] = None
    content: str
    summary: Optional[str] = None
    hierarchy_level: int
    parent_clause_id: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class RegulationDocumentResponse(BaseModel):
    id: str
    title: str
    version: str
    academic_years: str
    effective_date: datetime
    publication_date: datetime
    is_active: bool
    total_clauses: int

    class Config:
        from_attributes = True


class RuleResponse(BaseModel):
    id: str
    clause_id: str
    clause_number: Optional[str] = None
    rule_code: str
    name: str
    description: str
    verification_status: str  # VERIFIED, UNVERIFIED_SYNTHETIC
    evaluation_logic: Optional[Dict[str, Any]] = None
    required_fields: List[str] = []
    applicability_scope: str

    class Config:
        from_attributes = True


class DeadlineRuleResponse(BaseModel):
    id: str
    rule_code: str
    clause_id: Optional[str] = None
    clause_number: Optional[str] = None
    trigger_event: str
    duration_days: int
    duration_type: str
    responsible_party: str
    description: str
    legal_interpretation: Optional[str] = None
    academic_cutoff_applicable: bool

    class Config:
        from_attributes = True


class WorkflowTemplateResponse(BaseModel):
    id: str
    application_type: str
    version: str
    name: str
    description: Optional[str] = None
    status_label: str
    stages_json: List[Dict[str, Any]]
    is_active: bool

    class Config:
        from_attributes = True


class RegulatoryQaRequest(BaseModel):
    query: str
    application_type: Optional[str] = None


class RegulatoryQaResponse(BaseModel):
    query: str
    answer: str
    citations: List[Dict[str, Any]]
    confidence: float
    abstained: bool
    reason: Optional[str] = None
