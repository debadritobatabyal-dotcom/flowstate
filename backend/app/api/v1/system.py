import shutil
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.audit import verify_audit_chain
from app.models.application import Application
from app.models.regulation import Clause
from app.seed.run import seed_database
from app.schemas.ml import SystemStatusResponse

router = APIRouter()


@router.get("/status", response_model=SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    tesseract_found = bool(shutil.which("tesseract") or (settings.TESSERACT_CMD and os.path.exists(settings.TESSERACT_CMD)))
    audit_check = verify_audit_chain(db)
    total_apps = db.query(Application).count()
    total_clauses = db.query(Clause).count()

    return SystemStatusResponse(
        llm_provider=settings.LLM_PROVIDER,
        gemini_active=bool(settings.GEMINI_API_KEY),
        ollama_active=bool(settings.OLLAMA_BASE_URL),
        tesseract_active=tesseract_found,
        vector_search_mode="Local / In-Memory Cosine Fallback (Zero-Key)",
        database_type="SQLite (Zero-Service Mode)" if settings.DATABASE_URL.startswith("sqlite") else "PostgreSQL + pgvector",
        audit_chain_valid=audit_check["valid"],
        total_applications=total_apps,
        total_clauses=total_clauses,
    )


@router.post("/reset-demo")
def reset_demonstration_scenario():
    """
    Resets the Meridian Institute signature demo scenario to its baseline state.
    """
    seed_database(reset=True)
    return {
        "success": True,
        "message": "FLOWSTATE demonstration scenario has been reset to baseline state.",
        "signature_application": "APP-2024-MIT-001 (Meridian Institute of Technology)",
    }
