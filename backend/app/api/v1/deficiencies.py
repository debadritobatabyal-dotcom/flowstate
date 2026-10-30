from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.identity import User
from app.models.application import Application, Document
from app.models.deficiency import (
    Deficiency,
    RescrutinyChecklist,
    RescrutinyItem,
    NewFinding,
)
from app.schemas.deficiency import (
    DeficiencyCreate,
    DeficiencyResponse,
    ResubmitDeficiencyRequest,
    RescrutinyVerifyRequest,
    AddOutOfScopeFindingRequest,
)
from app.engines.deficiency_engine import DeficiencyEngine
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/{app_id}", response_model=List[DeficiencyResponse])
def list_application_deficiencies(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if current_user.role == "INSTITUTION" and app.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    defs = (
        db.query(Deficiency)
        .filter(Deficiency.application_id == app_id)
        .order_by(Deficiency.date_raised.desc())
        .all()
    )

    results = []
    for d in defs:
        orig_doc = db.query(Document).filter(Document.id == d.original_document_id).first() if d.original_document_id else None
        resub_doc = db.query(Document).filter(Document.id == d.resubmitted_document_id).first() if d.resubmitted_document_id else None

        events_data = [
            {
                "id": ev.id,
                "event_type": ev.event_type,
                "actor_role": ev.actor_role,
                "notes": ev.notes,
                "status_before": ev.status_before,
                "status_after": ev.status_after,
                "timestamp": ev.timestamp.isoformat(),
            }
            for ev in d.events
        ]

        results.append(DeficiencyResponse(
            id=d.id,
            deficiency_number=d.deficiency_number,
            application_id=d.application_id,
            institution_id=d.institution_id,
            aph_clause_number=d.aph_clause_number,
            rule_code=d.rule_code,
            observation=d.observation,
            original_document_id=d.original_document_id,
            original_document_name=orig_doc.original_filename if orig_doc else None,
            original_page_number=d.original_page_number,
            evidence_snippet=d.evidence_snippet,
            stage_raised=d.stage_raised,
            date_raised=d.date_raised,
            responsible_party=d.responsible_party,
            status=d.status,
            severity=d.severity,
            resubmitted_document_id=d.resubmitted_document_id,
            resubmitted_document_name=resub_doc.original_filename if resub_doc else None,
            resubmitted_page_number=d.resubmitted_page_number,
            resubmission_notes=d.resubmission_notes,
            resubmitted_at=d.resubmitted_at,
            resolution_status=d.resolution_status,
            officer_resolution_notes=d.officer_resolution_notes,
            resolved_at=d.resolved_at,
            events=events_data,
        ))
    return results


@router.post("/{app_id}", response_model=DeficiencyResponse)
def create_deficiency(
    app_id: str,
    req: DeficiencyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("OFFICER", "ADMIN_EXEC", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Only officers can raise deficiencies.")

    d = DeficiencyEngine.create_deficiency(
        db=db,
        application_id=app_id,
        aph_clause_number=req.aph_clause_number,
        rule_code=req.rule_code,
        observation=req.observation,
        original_document_id=req.document_id,
        original_page_number=req.page_number,
        evidence_snippet=req.evidence_snippet,
        severity=req.severity,
        actor_id=current_user.id,
        actor_role=current_user.role,
    )

    return DeficiencyResponse(
        id=d.id,
        deficiency_number=d.deficiency_number,
        application_id=d.application_id,
        institution_id=d.institution_id,
        aph_clause_number=d.aph_clause_number,
        rule_code=d.rule_code,
        observation=d.observation,
        original_document_id=d.original_document_id,
        original_page_number=d.original_page_number,
        evidence_snippet=d.evidence_snippet,
        stage_raised=d.stage_raised,
        date_raised=d.date_raised,
        responsible_party=d.responsible_party,
        status=d.status,
        severity=d.severity,
        events=[],
    )


@router.post("/{deficiency_id}/resubmit")
def resubmit_deficiency_evidence(
    deficiency_id: str,
    req: ResubmitDeficiencyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deficiency = db.query(Deficiency).filter(Deficiency.id == deficiency_id).first()
    if not deficiency:
        raise HTTPException(status_code=404, detail="Deficiency record not found.")

    if current_user.role == "INSTITUTION" and deficiency.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    updated_def = DeficiencyEngine.submit_correction(
        db=db,
        deficiency_id=deficiency_id,
        resubmitted_document_id=req.document_id,
        resubmitted_page_number=req.page_number or 1,
        resubmission_notes=req.resubmission_notes,
        actor_id=current_user.id,
        actor_role=current_user.role,
    )
    return {"success": True, "status": updated_def.status, "deficiency_number": updated_def.deficiency_number}


@router.post("/{app_id}/rescrutiny/generate-checklist")
def generate_locked_rescrutiny_checklist(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    APH Clause 1.8(g) Enforcement:
    Locks re-scrutiny checklist strictly to original deficiencies.
    """
    if current_user.role not in ("OFFICER", "ADMIN_EXEC", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Officer permission required.")

    checklist = DeficiencyEngine.generate_locked_rescrutiny_checklist(
        db=db,
        application_id=app_id,
        actor_id=current_user.id,
    )
    return {
        "success": True,
        "checklist_id": checklist.id,
        "round_number": checklist.round_number,
        "statutory_rule": "APH Clause 1.8(g) — Re-scrutiny verifies ONLY previously identified deficiencies.",
        "is_locked": checklist.is_locked,
    }


@router.get("/{app_id}/rescrutiny/checklist")
def get_rescrutiny_checklist(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    checklist = (
        db.query(RescrutinyChecklist)
        .filter(RescrutinyChecklist.application_id == app_id)
        .order_by(RescrutinyChecklist.round_number.desc())
        .first()
    )
    if not checklist:
        return {"checklist": None, "items": [], "out_of_scope_findings": []}

    items_data = []
    for it in checklist.items:
        def_item = it.deficiency
        resub_doc = db.query(Document).filter(Document.id == def_item.resubmitted_document_id).first() if def_item and def_item.resubmitted_document_id else None
        items_data.append({
            "id": it.id,
            "deficiency_id": it.deficiency_id,
            "deficiency_number": def_item.deficiency_number if def_item else "",
            "original_finding_summary": it.original_finding_summary,
            "aph_clause_number": it.aph_clause_number,
            "resubmitted_document_id": def_item.resubmitted_document_id if def_item else None,
            "resubmitted_document_name": resub_doc.original_filename if resub_doc else None,
            "resubmitted_page_number": def_item.resubmitted_page_number if def_item else None,
            "resubmission_notes": def_item.resubmission_notes if def_item else None,
            "verification_status": it.verification_status,
            "officer_comment": it.officer_comment,
            "verified_at": it.verified_at.isoformat() if it.verified_at else None,
        })

    out_of_scope = [
        {
            "id": nf.id,
            "observation": nf.observation,
            "clause_number": nf.clause_number,
            "page_number": nf.page_number,
            "status": nf.status,
            "officer_notes": nf.officer_notes,
            "created_at": nf.created_at.isoformat(),
        }
        for nf in checklist.new_findings
    ]

    return {
        "checklist": {
            "id": checklist.id,
            "round_number": checklist.round_number,
            "status": checklist.status,
            "is_locked": checklist.is_locked,
            "generated_at": checklist.generated_at.isoformat(),
        },
        "items": items_data,
        "out_of_scope_findings": out_of_scope,
        "regulatory_rule_applied": "APH Clause 1.8(g) strictly enforced.",
    }


@router.post("/rescrutiny/verify-item")
def verify_rescrutiny_item(
    req: RescrutinyVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("OFFICER", "ADMIN_EXEC", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Officer authorization required.")

    item = DeficiencyEngine.verify_rescrutiny_item(
        db=db,
        item_id=req.item_id,
        verification_status=req.verification_status,
        officer_comment=req.officer_comment,
        actor_id=current_user.id,
    )
    return {"success": True, "verification_status": item.verification_status}


@router.post("/{app_id}/rescrutiny/out-of-scope-finding")
def add_out_of_scope_finding(
    app_id: str,
    req: AddOutOfScopeFindingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("OFFICER", "ADMIN_EXEC", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Officer authorization required.")

    checklist = (
        db.query(RescrutinyChecklist)
        .filter(RescrutinyChecklist.application_id == app_id)
        .order_by(RescrutinyChecklist.round_number.desc())
        .first()
    )
    if not checklist:
        raise HTTPException(status_code=400, detail="No active re-scrutiny checklist found.")

    finding = DeficiencyEngine.record_out_of_scope_finding(
        db=db,
        checklist_id=checklist.id,
        observation=req.observation,
        clause_number=req.clause_number,
        document_id=req.document_id,
        page_number=req.page_number,
        officer_notes=req.officer_notes,
        actor_id=current_user.id,
    )
    return {
        "success": True,
        "finding_id": finding.id,
        "status": finding.status,
        "message": "Finding recorded in isolated Out-of-Scope Panel. Scope of re-scrutiny remains locked under Clause 1.8(g).",
    }
