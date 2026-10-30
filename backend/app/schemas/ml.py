from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class PredictionResponse(BaseModel):
    application_id: str
    remaining_days_predicted: float
    delay_risk_score: float  # 0 to 1
    delay_risk_category: str  # LOW, MEDIUM, HIGH, CRITICAL
    shap_factors: List[Dict[str, Any]]
    suggested_interventions: List[str]
    disclaimer: str = "Synthetic data demonstration. Predictive intelligence estimates are advisory and not official AICTE determinations."


class SystemStatusResponse(BaseModel):
    llm_provider: str
    gemini_active: bool
    ollama_active: bool
    tesseract_active: bool
    vector_search_mode: str
    database_type: str
    audit_chain_valid: bool
    total_applications: int
    total_clauses: int
