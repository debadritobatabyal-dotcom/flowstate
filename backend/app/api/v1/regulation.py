from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.regulation import RegulationDocument, Clause, Rule, WorkflowTemplate, DeadlineRule
from app.schemas.regulation import (
    RegulationDocumentResponse,
    ClauseResponse,
    RuleResponse,
    WorkflowTemplateResponse,
    DeadlineRuleResponse,
    RegulatoryQaRequest,
    RegulatoryQaResponse,
)
from app.engines.qa_engine import RegulatoryQaEngine
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/documents", response_model=List[RegulationDocumentResponse])
def list_regulatory_documents(db: Session = Depends(get_db)):
    docs = db.query(RegulationDocument).filter(RegulationDocument.is_active == True).all()
    return docs


@router.get("/clauses", response_model=List[ClauseResponse])
def list_clauses(
    search: Optional[str] = None,
    document_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Clause).filter(Clause.is_active == True)
    if document_id:
        query = query.filter(Clause.document_id == document_id)
    if search:
        query = query.filter(
            (Clause.clause_number.ilike(f"%{search}%")) |
            (Clause.title.ilike(f"%{search}%")) |
            (Clause.content.ilike(f"%{search}%"))
        )
    return query.order_by(Clause.clause_number.asc()).all()


@router.get("/clauses/{id}", response_model=ClauseResponse)
def get_clause_detail(id: str, db: Session = Depends(get_db)):
    clause = db.query(Clause).filter(Clause.id == id).first()
    if not clause:
        raise HTTPException(status_code=404, detail="Clause not found.")
    return clause


@router.get("/rules", response_model=List[RuleResponse])
def list_rules(db: Session = Depends(get_db)):
    rules = db.query(Rule).all()
    results = []
    for r in rules:
        results.append(RuleResponse(
            id=r.id,
            clause_id=r.clause_id,
            clause_number=r.clause.clause_number if r.clause else None,
            rule_code=r.rule_code,
            name=r.name,
            description=r.description,
            verification_status=r.verification_status,
            evaluation_logic=r.evaluation_logic,
            required_fields=r.required_fields or [],
            applicability_scope=r.applicability_scope,
        ))
    return results


@router.get("/workflow-templates", response_model=List[WorkflowTemplateResponse])
def list_workflow_templates(db: Session = Depends(get_db)):
    templates = db.query(WorkflowTemplate).filter(WorkflowTemplate.is_active == True).all()
    results = []
    for t in templates:
        results.append(WorkflowTemplateResponse(
            id=t.id,
            application_type=t.application_type,
            version=t.version,
            name=t.name,
            description=t.description,
            status_label=t.status_label,
            stages_json=t.stages_json,
            is_active=t.is_active,
        ))
    return results


@router.get("/deadlines", response_model=List[DeadlineRuleResponse])
def list_deadline_rules(db: Session = Depends(get_db)):
    dls = db.query(DeadlineRule).all()
    results = []
    for dl in dls:
        results.append(DeadlineRuleResponse(
            id=dl.id,
            rule_code=dl.rule_code,
            clause_id=dl.clause_id,
            clause_number=dl.clause.clause_number if dl.clause else None,
            trigger_event=dl.trigger_event,
            duration_days=dl.duration_days,
            duration_type=dl.duration_type,
            responsible_party=dl.responsible_party,
            description=dl.description,
            legal_interpretation=dl.legal_interpretation,
            academic_cutoff_applicable=dl.academic_cutoff_applicable,
        ))
    return results


@router.post("/qa", response_model=RegulatoryQaResponse)
def answer_regulatory_question(
    req: RegulatoryQaRequest,
    db: Session = Depends(get_db),
):
    result = RegulatoryQaEngine.answer_regulatory_question(db=db, query=req.query)
    return RegulatoryQaResponse(**result)
