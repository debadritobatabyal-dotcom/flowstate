from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit import AuditLog
from app.core.audit import verify_audit_chain
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/logs")
def list_audit_logs(
    skip: int = 0,
    limit: int = 50,
    action: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.sequence_id.desc()).offset(skip).limit(limit).all()

    return [
        {
            "sequence_id": l.sequence_id,
            "id": l.id,
            "timestamp": l.timestamp.isoformat(),
            "actor_id": l.actor_id,
            "actor_role": l.actor_role,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "previous_hash": l.previous_hash,
            "current_hash": l.current_hash,
        }
        for l in logs
    ]


@router.get("/verify-chain")
def verify_audit_hash_chain(db: Session = Depends(get_db)):
    """
    Cryptographic SHA-256 tamper-evidence check across the entire audit log.
    """
    result = verify_audit_chain(db)
    return {
        "valid": result["valid"],
        "total_records": result["total_records"],
        "broken_at_sequence": result["broken_at_sequence"],
        "algorithm": "SHA-256 Append-Only Chaining",
        "provenance": "RULE-COMPUTED",
    }
