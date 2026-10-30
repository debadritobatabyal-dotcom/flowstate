from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.identity import User
from app.models.impact import Amendment, ClauseDiff, ImpactReport, ImpactItem
from app.schemas.impact import (
    ImpactReportResponse,
    ClauseDiffResponse,
    ImpactItemResponse,
    ApproveImpactItemRequest,
)
from app.engines.impact_engine import ImpactEngine
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/amendments")
def list_amendments(db: Session = Depends(get_db)):
    amendments = db.query(Amendment).order_by(Amendment.issue_date.desc()).all()
    results = []
    for amd in amendments:
        results.append({
            "id": amd.id,
            "amendment_number": amd.amendment_number,
            "title": amd.title,
            "gazette_notification_no": amd.gazette_notification_no,
            "issue_date": amd.issue_date.isoformat(),
            "effective_date": amd.effective_date.isoformat(),
            "status": amd.status,
            "summary": amd.summary,
            "is_synthetic_demonstration": amd.is_synthetic_demonstration,
            "diffs_count": len(amd.diffs),
        })
    return results


@router.get("/reports/{amendment_id}", response_model=ImpactReportResponse)
def get_impact_report(
    amendment_id: str,
    db: Session = Depends(get_db),
):
    amendment = db.query(Amendment).filter(Amendment.id == amendment_id).first()
    if not amendment:
        raise HTTPException(status_code=404, detail="Amendment not found.")

    report = (
        db.query(ImpactReport)
        .filter(ImpactReport.amendment_id == amendment_id)
        .order_by(ImpactReport.generated_at.desc())
        .first()
    )
    if not report:
        # Generate analysis on demand
        report = ImpactEngine.generate_impact_analysis(db, amendment)

    diffs_res = [
        ClauseDiffResponse(
            id=d.id,
            clause_number=d.clause_number,
            diff_type=d.diff_type,
            old_text=d.old_text,
            new_text=d.new_text,
            impact_summary=d.impact_summary,
        )
        for d in amendment.diffs
    ]

    items_res = [
        ImpactItemResponse(
            id=it.id,
            impact_report_id=it.impact_report_id,
            entity_type=it.entity_type,
            entity_id=it.entity_id,
            entity_label=it.entity_label,
            clause_number=it.clause_number,
            impact_type=it.impact_type,
            applicability=it.applicability,
            recommended_action=it.recommended_action,
            explanation_chain=it.explanation_chain or [],
            approval_status=it.approval_status,
            officer_notes=it.officer_notes,
        )
        for it in report.items
    ]

    return ImpactReportResponse(
        id=report.id,
        amendment_id=amendment.id,
        amendment_number=amendment.amendment_number,
        title=report.title,
        status=report.status,
        summary_metrics=report.summary_metrics or {},
        generated_at=report.generated_at,
        approved_at=report.approved_at,
        approved_by_id=report.approved_by_id,
        diffs=diffs_res,
        items=items_res,
    )


@router.post("/approve-item")
def approve_or_reject_impact_item(
    req: ApproveImpactItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mandatory Human Approval Gate:
    Requires authorized human approval before modifying active workflows or application rules.
    """
    if current_user.role not in ("REG_ADMIN", "ADMIN_EXEC", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Regulatory Administrator permissions required.")

    item = ImpactEngine.approve_impact_item(
        db=db,
        item_id=req.item_id,
        approval_status=req.approval_status,
        officer_notes=req.notes,
        actor_id=current_user.id,
    )
    return {
        "success": True,
        "item_id": item.id,
        "approval_status": item.approval_status,
        "message": f"Action {item.approval_status} by {current_user.full_name}. Invariant: Human approval gate satisfied.",
    }
