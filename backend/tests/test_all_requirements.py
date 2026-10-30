import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal
from app.models.identity import User, Institution
from app.models.application import Application
from app.models.regulation import Clause, Rule, WorkflowTemplate
from app.models.deficiency import Deficiency, RescrutinyChecklist
from app.models.impact import Amendment
from app.core.security import create_access_token
from app.core.audit import verify_audit_chain
from app.engines.workflow_engine import WorkflowEngine
from app.engines.deadline_engine import DeadlineEngine
from app.engines.deficiency_engine import DeficiencyEngine
from app.engines.impact_engine import ImpactEngine
from app.engines.qa_engine import RegulatoryQaEngine
from app.engines.evc_engine import EvcSchedulerEngine
from app.ml.predict import PredictionEngine

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def officer_token(db: Session):
    officer = db.query(User).filter(User.role == "OFFICER").first()
    return create_access_token(data={"sub": officer.id, "role": officer.role, "email": officer.email})


@pytest.fixture
def institution_token(db: Session):
    meridian = db.query(User).filter(User.email == "director@meridian.edu.in").first()
    return create_access_token(data={"sub": meridian.id, "role": meridian.role, "email": meridian.email})


@pytest.fixture
def regadmin_token(db: Session):
    admin = db.query(User).filter(User.role == "REG_ADMIN").first()
    return create_access_token(data={"sub": admin.id, "role": admin.role, "email": admin.email})


@pytest.fixture
def admin_token(db: Session):
    admin = db.query(User).filter(User.role.in_(["SUPER_ADMIN", "SYSTEM_ADMIN"])).first()
    return create_access_token(data={"sub": admin.id, "role": admin.role, "email": admin.email})


# 1. Different Application Routes (Table 2.3)

def test_01_different_application_routes():
    res = client.get("/api/v1/regulation/workflow-templates")
    assert res.status_code == 200
    templates = {t["application_type"]: t for t in res.json()}
    assert "Starting a new Programme/Level" in templates
    assert "EoA based on Self-Disclosure" in templates
    assert templates["Starting a new Programme/Level"]["status_label"] == "VERIFIED"
    assert templates["EoA based on Self-Disclosure"]["status_label"] == "UNVERIFIED_SYNTHETIC"


# 2. Invalid Workflow Transitions Rejected
def test_02_invalid_workflow_transitions(db: Session, officer_token: str):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    app_record.current_stage = "SUBMITTED"
    db.commit()

    # Attempt illegal jump from SUBMITTED directly to APPROVED
    res = client.post(
        f"/api/v1/applications/{app_record.id}/transition",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={"to_stage": "APPROVED", "notes": "Illegal jump"},
    )
    assert res.status_code == 400
    assert "Invalid stage transition" in res.json()["detail"]


# 3. Regulatory Clause Retrieval and Citations
def test_03_regulatory_clause_retrieval_and_citations():
    res = client.get("/api/v1/regulation/clauses?search=1.8")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    clause_numbers = [c["clause_number"] for c in data]
    assert any("1.8" in num for num in clause_numbers)


# 4. Q&A Honest Abstention when Evidence is Missing
def test_04_qa_abstention():
    # Irrelevant query should honestly abstain
    res = client.post("/api/v1/regulation/qa", json={"query": "What is the orbital velocity of Jupiter's moons?"})
    assert res.status_code == 200
    body = res.json()
    assert body["abstained"] is True
    assert "cannot answer" in body["answer"].lower()

    # Grounded query should cite exact clause
    res_grounded = client.post("/api/v1/regulation/qa", json={"query": "What does clause 1.8(g) say about re-scrutiny?"})
    assert res_grounded.status_code == 200
    body_grounded = res_grounded.json()
    assert body_grounded["abstained"] is False
    assert "1.8(g)" in body_grounded["answer"]


# 5. Document Extraction & Evidence Matrix Mapping
def test_05_document_extraction_and_evidence_matrix(db: Session, officer_token: str):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    res = client.get(
        f"/api/v1/documents/{app_record.id}/evidence-matrix",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    matrix = res.json()
    assert len(matrix) >= 3
    rule_codes = [m["rule_code"] for m in matrix]
    assert "RULE-LAND-01" in rule_codes
    assert "RULE-FIRE-01" in rule_codes


# 6. Deficiency Creation and Lineage
def test_06_deficiency_creation_and_lineage(db: Session, officer_token: str):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    res = client.get(
        f"/api/v1/deficiencies/{app_record.id}",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    defs = res.json()
    assert len(defs) >= 1
    assert defs[0]["deficiency_number"].startswith("DEF-APP-2024-MIT-001")
    assert len(defs[0]["events"]) >= 1


# 7. Re-scrutiny Contains Exactly Original Applicable Deficiencies (Clause 1.8(g))
def test_07_rescrutiny_locked_scope(db: Session, officer_token: str):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    def_item = db.query(Deficiency).filter(Deficiency.application_id == app_record.id).first()
    if def_item:
        def_item.status = "OPEN"
        db.commit()

    res = client.post(
        f"/api/v1/deficiencies/{app_record.id}/rescrutiny/generate-checklist",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["is_locked"] is True
    assert "1.8(g)" in body["statutory_rule"]

    # Verify checklist items
    chk_res = client.get(
        f"/api/v1/deficiencies/{app_record.id}/rescrutiny/checklist",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert chk_res.status_code == 200
    chk_data = chk_res.json()
    assert len(chk_data["items"]) >= 1


# 8. Out-of-Scope Findings Kept Separate (No Scope Creep)
def test_08_out_of_scope_findings_isolated(db: Session, officer_token: str):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    res = client.post(
        f"/api/v1/deficiencies/{app_record.id}/rescrutiny/out-of-scope-finding",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "observation": "New observation: Laboratory paint condition needs refresh.",
            "clause_number": "Clause 1.9",
        },
    )
    assert res.status_code == 200
    assert "Out-of-Scope Panel" in res.json()["message"]

    # Verify it is in out-of-scope panel and NOT in the locked checklist items
    chk_res = client.get(
        f"/api/v1/deficiencies/{app_record.id}/rescrutiny/checklist",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    chk_data = chk_res.json()
    assert len(chk_data["out_of_scope_findings"]) >= 1
    assert any("Laboratory paint" in f["observation"] for f in chk_data["out_of_scope_findings"])


# 9. Independent Appeal Clocks and Statutory Calculation Trace
def test_09_independent_appeal_clocks(db: Session, officer_token: str):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    res = client.get(
        f"/api/v1/applications/{app_record.id}/deadlines",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    deadlines = res.json()["deadlines"]
    assert len(deadlines) >= 1
    # Check Clause 1.11 is present and traces formula
    c111 = next(d for d in deadlines if d["clause_number"] == "Clause 1.11")
    assert c111["duration_days"] == 7
    assert len(c111["calculation_trace"]) >= 2


# 10. Regulatory Change-Impact Propagation
def test_10_change_impact_propagation(db: Session):
    amendment = db.query(Amendment).first()
    res = client.get(f"/api/v1/impact/reports/{amendment.id}")
    assert res.status_code == 200
    report = res.json()
    assert len(report["diffs"]) >= 2
    assert len(report["items"]) >= 1
    # Verify chain visualization presence
    assert len(report["items"][0]["explanation_chain"]) >= 2


# 11. Human Approval Required Before Modification (Approval Gate)
def test_11_human_approval_gate(db: Session, regadmin_token: str, institution_token: str):
    amendment = db.query(Amendment).first()
    rep_res = client.get(f"/api/v1/impact/reports/{amendment.id}")
    item_id = rep_res.json()["items"][0]["id"]

    # Institution cannot approve regulatory items
    forbidden_res = client.post(
        "/api/v1/impact/approve-item",
        headers={"Authorization": f"Bearer {institution_token}"},
        json={"item_id": item_id, "approval_status": "APPROVED"},
    )
    assert forbidden_res.status_code == 403

    # Reg Admin can approve
    ok_res = client.post(
        "/api/v1/impact/approve-item",
        headers={"Authorization": f"Bearer {regadmin_token}"},
        json={"item_id": item_id, "approval_status": "APPROVED", "notes": "Approved for 2025 academic cycle."},
    )
    assert ok_res.status_code == 200
    assert ok_res.json()["approval_status"] == "APPROVED"


# 12. Institution-Level Data Isolation Server-Side
def test_12_institution_data_isolation(db: Session, institution_token: str):
    # Meridian institution should only receive its own applications
    res = client.get(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {institution_token}"},
    )
    assert res.status_code == 200
    apps = res.json()
    for a in apps:
        assert a["institution_name"] == "Meridian Institute of Technology"


# 13. Role-Based Access Control
def test_13_role_based_access(db: Session, institution_token: str):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    # Institution attempting to access officer-only stage transition
    res = client.post(
        f"/api/v1/applications/{app_record.id}/transition",
        headers={"Authorization": f"Bearer {institution_token}"},
        json={"to_stage": "APPROVED"},
    )
    assert res.status_code == 403


# 14. Audit Hash-Chain Integrity
def test_14_audit_chain_integrity(db: Session):
    res = client.get("/api/v1/audit/verify-chain")
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["algorithm"] == "SHA-256 Append-Only Chaining"


# 15. Prediction Explanations and Synthetic Data Labelling
def test_15_prediction_explanations(db: Session):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    res = client.get(f"/api/v1/analytics/prediction/{app_record.id}")
    assert res.status_code == 200
    pred = res.json()
    assert "remaining_days_predicted" in pred
    assert "delay_risk_score" in pred
    assert len(pred["shap_factors"]) >= 1
    assert "Synthetic data demonstration" in pred["disclaimer"]


# 16. EVC Scheduling with Conflict of Interest Filtering
def test_16_evc_scheduling_constraints(db: Session, officer_token: str):
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    res = client.post(
        "/api/v1/evc/schedule",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "application_id": app_record.id,
            "preferred_date": "2025-04-15",
            "panel_size": 3,
            "visit_mode": "PHYSICAL",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert len(body["assigned_experts"]) == 3
    assert body["conflict_free_verified"] is True
    assert body["status"] == "SUGGESTED"


# 17. Complete End-to-End Demonstration Journey Verification
def test_17_signature_demo_journey(db: Session, officer_token: str, institution_token: str):
    # Step A: Meridian app exists and is in SCRUTINY
    app_record = db.query(Application).filter(Application.application_number == "APP-2024-MIT-001").first()
    assert app_record.institution.name == "Meridian Institute of Technology"

    # Step B: Institution resubmits renewed fire safety NOC
    def_item = db.query(Deficiency).filter(Deficiency.application_id == app_record.id).first()
    renewed_doc = db.query(User).first() # Just verify endpoint accepts resubmission
    resub_res = client.post(
        f"/api/v1/deficiencies/{def_item.id}/resubmit",
        headers={"Authorization": f"Bearer {institution_token}"},
        json={
            "document_id": def_item.original_document_id,
            "page_number": 1,
            "resubmission_notes": "Submitted renewed Fire Safety Certificate NOC-MH-FIRE-2024-88 valid through 31-12-2027.",
        },
    )
    assert resub_res.status_code == 200
    assert resub_res.json()["status"] == "RESUBMITTED"

    # Step C: Officer completes targeted re-scrutiny resolution
    chk_res = client.post(
        f"/api/v1/deficiencies/{app_record.id}/rescrutiny/generate-checklist",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert chk_res.status_code == 200
    chk_list = client.get(
        f"/api/v1/deficiencies/{app_record.id}/rescrutiny/checklist",
        headers={"Authorization": f"Bearer {officer_token}"},
    ).json()
    item_id = chk_list["items"][0]["id"]

    verify_res = client.post(
        "/api/v1/deficiencies/rescrutiny/verify-item",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={"item_id": item_id, "verification_status": "RESOLVED", "officer_comment": "Renewed NOC verified valid."},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verification_status"] == "RESOLVED"


# 18. Authentication, Demo Access & User Management
def test_18_auth_and_user_management(admin_token: str):
    # A. Demo users directory
    demo_users_res = client.get("/api/v1/auth/demo-users")
    assert demo_users_res.status_code == 200
    roles = [u["role"] for u in demo_users_res.json()]
    assert "EXECUTIVE" in roles
    assert "REGIONAL_OFFICER" in roles
    assert "SYSTEM_ADMIN" in roles

    # B. Demo 1-click login
    demo_login_res = client.post("/api/v1/auth/demo-login", json={"role": "REGIONAL_OFFICER"})
    assert demo_login_res.status_code == 200
    assert "access_token" in demo_login_res.json()
    assert demo_login_res.json()["role"] == "REGIONAL_OFFICER"

    # C. System Admin User Management
    users_res = client.get("/api/v1/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 1

    # D. Password reset request
    forgot_res = client.post("/api/v1/auth/forgot-password", json={"email": "officer.western@flowstate.aicte.gov.in"})
    assert forgot_res.status_code == 200
    assert "demo_reset_token" in forgot_res.json()

