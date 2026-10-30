from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class ExtractionResponse(BaseModel):
    id: str
    document_id: str
    page_id: str
    page_number: int
    field_name: str
    extracted_value: str
    confidence: float
    provenance: str  # RULE-COMPUTED, SUGGESTED, VERIFIED, SIMULATED
    verification_status: str
    verified_by_id: Optional[str] = None
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: str
    application_id: str
    document_type: str
    original_filename: str
    file_size_bytes: int
    page_count: int
    status: str
    is_resubmission: bool
    replaces_document_id: Optional[str] = None
    uploaded_at: datetime
    extractions: List[ExtractionResponse] = []

    class Config:
        from_attributes = True


class EvidenceMatrixItem(BaseModel):
    id: str
    application_id: str
    rule_id: str
    rule_code: str
    rule_name: str
    aph_clause_number: str
    substantive_clause: Optional[str] = None
    procedural_clause: Optional[str] = None
    required_document_type: str
    document_id: Optional[str] = None
    document_filename: Optional[str] = None
    page_number: Optional[int] = None
    extraction_id: Optional[str] = None
    extracted_value: Optional[str] = None
    evidence_snippet: Optional[str] = None
    confidence: Optional[float] = 1.0
    validation_result: str  # COMPLIANT, DEFICIENT, INCOMPLETE, INCONCLUSIVE, NEEDS_HUMAN_REVIEW
    provenance: str  # RULE-COMPUTED, SUGGESTED, VERIFIED, SIMULATED
    officer_verification_status: str  # PENDING, VERIFIED, DEFICIENCY_RAISED
    officer_notes: Optional[str] = None
    deficiency_id: Optional[str] = None



class VerifyEvidenceRequest(BaseModel):
    status: str  # VERIFIED, DEFICIENCY_RAISED
    notes: Optional[str] = None
    raise_deficiency: bool = False
    deficiency_observation: Optional[str] = None
    severity: Optional[str] = "CRITICAL"
