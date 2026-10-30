import os
import shutil
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.audit import record_audit_event
from app.models.identity import User
from app.models.application import Application, Document, RequirementEvidenceLink
from app.schemas.document import DocumentResponse, EvidenceMatrixItem, VerifyEvidenceRequest
from app.engines.evidence_engine import EvidenceEngine
from app.engines.deficiency_engine import DeficiencyEngine
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/{app_id}/upload", response_model=DocumentResponse)
async def upload_application_document(
    app_id: str,
    document_type: str = Form(...),
    is_resubmission: bool = Form(False),
    replaces_document_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if current_user.role == "INSTITUTION" and app.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Validate file extension and MIME
    filename = file.filename or "uploaded.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail="Only PDF and official image formats are permitted.")

    # Storage path
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_name = f"{app_id}_{uuid.uuid4().hex[:8]}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    # Save to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Size check
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if file_size_mb > settings.MAX_UPLOAD_MB:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_MB} MB.")

    # Process through PyMuPDF Evidence Engine
    doc_record = EvidenceEngine.process_pdf_document(
        db=db,
        application_id=app.id,
        document_type=document_type,
        file_path=file_path,
        original_filename=filename,
        is_resubmission=is_resubmission,
        replaces_document_id=replaces_document_id,
    )

    record_audit_event(
        db=db,
        action="DOCUMENT_UPLOADED",
        entity_type="DOCUMENT",
        entity_id=doc_record.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        details={
            "application_id": app_id,
            "document_type": document_type,
            "original_filename": filename,
            "file_hash_sha256": doc_record.file_hash_sha256,
        },
    )

    return DocumentResponse(
        id=doc_record.id,
        application_id=doc_record.application_id,
        document_type=doc_record.document_type,
        original_filename=doc_record.original_filename,
        file_size_bytes=doc_record.file_size_bytes,
        page_count=doc_record.page_count,
        status=doc_record.status,
        is_resubmission=doc_record.is_resubmission,
        replaces_document_id=doc_record.replaces_document_id,
        uploaded_at=doc_record.uploaded_at,
        extractions=[],
    )


@router.get("/{app_id}/evidence-matrix", response_model=List[EvidenceMatrixItem])
def get_evidence_matrix(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if current_user.role == "INSTITUTION" and app.institution_id != current_user.institution_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Ensure matrix is synced
    EvidenceEngine.sync_evidence_matrix_for_application(db, app_id)

    links = (
        db.query(RequirementEvidenceLink)
        .filter(RequirementEvidenceLink.application_id == app_id)
        .all()
    )

    matrix = []
    for link in links:
        doc = link.document
        rule = link.rule
        matrix.append(EvidenceMatrixItem(
            id=link.id,
            application_id=link.application_id,
            rule_id=link.rule_id,
            rule_code=link.rule_code,
            rule_name=rule.name if rule else link.rule_code,
            aph_clause_number=link.aph_clause_number,
            required_document_type="DOCUMENT",
            document_id=link.document_id,
            document_filename=doc.original_filename if doc else None,
            page_number=link.page_number,
            extraction_id=link.extraction_id,
            extracted_value=None,
            evidence_snippet=link.evidence_snippet,
            validation_result=link.validation_result,
            provenance=link.provenance,
            officer_verification_status=link.officer_verification_status,
            officer_notes=link.officer_notes,
            deficiency_id=None,
        ))
    return matrix


@router.post("/{app_id}/verify-evidence/{link_id}")
def verify_evidence_link(
    app_id: str,
    link_id: str,
    req: VerifyEvidenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("OFFICER", "ADMIN_EXEC", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Only officers can verify evidence findings.")

    link = db.query(RequirementEvidenceLink).filter(RequirementEvidenceLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Requirement evidence link not found.")

    link.officer_verification_status = req.status
    link.officer_notes = req.notes
    link.verified_by_id = current_user.id
    link.verified_at = datetime.datetime.now(datetime.timezone.utc)
    link.provenance = "VERIFIED"

    deficiency_record = None
    if req.raise_deficiency and req.deficiency_observation:
        deficiency_record = DeficiencyEngine.create_deficiency(
            db=db,
            application_id=app_id,
            aph_clause_number=link.aph_clause_number,
            rule_code=link.rule_code,
            observation=req.deficiency_observation,
            original_document_id=link.document_id,
            original_page_number=link.page_number,
            evidence_snippet=link.evidence_snippet,
            severity=req.severity or "CRITICAL",
            actor_id=current_user.id,
            actor_role=current_user.role,
        )

    db.commit()
    return {
        "success": True,
        "verification_status": link.officer_verification_status,
        "deficiency_id": deficiency_record.id if deficiency_record else None,
    }


@router.get("/file/{doc_id}")
def get_document_file(
    doc_id: str,
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc or not os.path.exists(doc.storage_path):
        raise HTTPException(status_code=404, detail="Document file not found.")

    return FileResponse(
        path=doc.storage_path,
        filename=doc.original_filename,
        media_type="application/pdf",
    )
