# FLOWSTATE — AICTE Administrative Intelligence Platform

> **Prototype — synthetic data. No live AICTE databases or APIs are connected.**

FLOWSTATE is an AI-powered, regulation-aware administrative intelligence and workflow orchestration platform for the **All India Council for Technical Education (AICTE)**. It acts as an intelligence and decision-support layer alongside the AICTE ecosystem.

---

## The Three Signature Capabilities

### 1. Regulatory Change-Impact Intelligence
When a new Approval Process Handbook (APH) edition, corrigendum, or amendment is published:
- Detects modified, added, and removed provisions.
- Cycle-safe dependency graph: `Amendment → Clause → Requirement → Workflow Template → Live Applications → Recommended Actions`.
- Dual applicability classification: Unambiguous prospective vs. Ambiguous retrospective.
- Mandatory **Human Approval Gate**: Authorized official confirmation is required before active workflows or rules are modified.

### 2. Deficiency Lineage & Targeted Re-Scrutiny (APH Clause 1.8(g))
- Strictly enforces **APH Clause 1.8(g)**: Re-scrutiny verifies **ONLY** deficiencies previously identified by the Scrutiny Committee.
- Generates an immutable, locked targeted re-scrutiny checklist.
- Isolates newly noticed issues outside the checklist into a separate **Out-of-Scope Panel** to prevent scope creep.
- Complete audit lineage across multiple rounds with document page references.

### 3. Requirement-to-Evidence Traceability
- Direct linkage: `APH Clause → Rule Code → Document File → Page Number → Extracted Snippet → Validation Verdict → Human Verification`.
- Contextual **"Why?"** button on every record to explain the regulatory traceability chain.
- Provenance Badges: `[RULE-COMPUTED]`, `[HUMAN-VERIFIED]`, `[AI-SUGGESTED]`, `[SIMULATED]`.

---

## Technical Architecture

```
flowstate/
├── docker-compose.yml          # PostgreSQL 16 + pgvector, Backend, Frontend
├── Makefile                    # Standard targets: up, down, migrate, seed, train, test
├── .env.example                # Zero-key development configuration
├── backend/
│   ├── app/
│   │   ├── api/v1/             # REST endpoints (auth, apps, docs, deficiencies, reg, impact, evc, analytics, audit)
│   │   ├── core/               # Config, Database, Argon2/JWT Security, SHA-256 Audit Log
│   │   ├── models/             # SQLAlchemy 2 models (identity, regulation, applications, deficiencies, impact, evc, audit)
│   │   ├── schemas/            # Pydantic v2 schemas
│   │   ├── engines/            # Workflow, Deadline, Evidence, Deficiency, Impact, QA, EVC Engines
│   │   ├── ml/                 # Delay risk Gradient Boosting model & SHAP explanations
│   │   └── seed/               # Deterministic data seeder & ReportLab PDF generator
│   └── tests/                  # Pytest test suite covering all 17 master acceptance criteria
├── frontend/                   # Next.js 14 App Router, Tailwind CSS, React Flow, Recharts
└── storage/                    # Uploads, synthetic artifacts, and canonical SQLite / Postgres data
```

---

## Quickstart (Zero-Key Setup)

### Option A: Local Native Execution (Fastest)

1. **Activate Virtual Environment & Install Dependencies:**
   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   cd frontend && npm install && cd ..
   ```

2. **Initialize Database & Seed Synthetic Data:**
   ```bash
   cp .env.example .env
   source .venv/bin/activate
   export PYTHONPATH=backend
   python -m app.seed.run --reset
   python -m app.ml.train
   ```

3. **Start Backend Server:**
   ```bash
   source .venv/bin/activate && cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Start Frontend Server:**
   ```bash
   cd frontend && npm run dev
   ```

5. **Access Platform:**
   - Frontend: `http://localhost:3000`
   - Guided Interactive Demo: `http://localhost:3000/demo`
   - Backend API Docs (Swagger): `http://localhost:8000/docs`

---

### Option B: Docker Compose

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed.run --reset
docker compose exec backend python -m app.ml.train
```

---

## Seeded Role Credentials (Development Mode)

| Role | Email | Password | Persona |
|---|---|---|---|
| `ADMIN_EXEC` | `executive@flowstate.aicte.gov.in` | `Password123!` | Member Secretary, AICTE |
| `OFFICER` | `officer.western@flowstate.aicte.gov.in` | `Password123!` | Western Regional Officer & Scrutiny Convener |
| `INSTITUTION` | `director@meridian.edu.in` | `Password123!` | Principal, Meridian Institute of Technology |
| `REG_ADMIN` | `regadmin@flowstate.aicte.gov.in` | `Password123!` | Regulatory Policy Director |
| `SUPER_ADMIN` | `superadmin@flowstate.aicte.gov.in` | `Password123!` | Chief Administrative Director |

---

## Running the Automated Test Suite

All 17 master regulatory acceptance criteria are validated via pytest:

```bash
source .venv/bin/activate && export PYTHONPATH=backend && pytest backend/tests/test_all_requirements.py -v
```

### Verified Acceptance Criteria:
1. `test_01_different_application_routes`: Table 2.3 processing pathways validated.
2. `test_02_invalid_workflow_transitions`: Illegal stage jumps rejected server-side.
3. `test_03_regulatory_clause_retrieval_and_citations`: Clause search with exact statutory citations.
4. `test_04_qa_abstention`: Grounded answers with honest abstention on unsupported queries.
5. `test_05_document_extraction_and_evidence_matrix`: Page-level evidence extraction via PyMuPDF.
6. `test_06_deficiency_creation_and_lineage`: Persistent deficiency records with append-only event logs.
7. `test_07_rescrutiny_locked_scope`: Clause 1.8(g) locked re-scrutiny checklist.
8. `test_08_out_of_scope_findings_isolated`: Out-of-scope issues isolated in separate panel without checklist creep.
9. `test_09_independent_appeal_clocks`: Independent statutory appeal clocks (Clause 1.11 vs 2.24) with arithmetic trace.
10. `test_10_change_impact_propagation`: Cycle-safe amendment dependency graph.
11. `test_11_human_approval_gate`: Mandatory human approval gate before rule activation.
12. `test_12_institution_data_isolation`: Server-side institution tenant isolation.
13. `test_13_role_based_access`: Strict RBAC permissions enforced.
14. `test_14_audit_chain_integrity`: Append-only SHA-256 hash chaining verification.
15. `test_15_prediction_explanations`: Gradient Boosting delay risk model with SHAP explanations.
16. `test_16_evc_scheduling_constraints`: Google OR-Tools CP-SAT conflict-of-interest solver.
17. `test_17_signature_demo_journey`: Complete Meridian Institute end-to-end journey.
