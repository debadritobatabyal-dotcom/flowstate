# FLOWSTATE — Architecture & Implementation Plan

## 1. System Mission & Core Philosophy
**FLOWSTATE** is an AI-powered, regulation-aware administrative intelligence and workflow orchestration platform for AICTE (All India Council for Technical Education). It acts as an intelligence and decision-support layer alongside the AICTE ecosystem.

**Core Philosophy:** Every regulatory requirement, document, finding, deficiency, workflow action, and deadline must be connected and traceable through one shared data model.

---

## 2. Signature Capabilities (Vertical Slice Priority)

### A. Regulatory Change-Impact Intelligence
- Ingestion of APH versions and corrigenda/amendments.
- Structural clause segmentation and semantic diffing (`ADDED`, `MODIFIED`, `REMOVED`).
- Cycle-safe dependency graph: `Amendment → Clause → Requirement → Workflow Template → Applications → Evidence/Deficiency/Deadlines → Recommended Actions`.
- Dual applicability classification: unambiguous vs. ambiguous/retrospective requiring human approval gate.
- Impact report generation and interactive node-level approval/rejection.

### B. Deficiency Lineage and Targeted Re-Scrutiny (APH Clause 1.8(g))
- Persistent deficiency entity with complete audit lineage (original observation, APH clause reference, document page, responsible party, status, resubmission evidence).
- Strictly enforced regulatory principle: Re-scrutiny verifies ONLY deficiencies previously identified.
- Automated generation of locked, targeted re-scrutiny checklists.
- Clear separation of newly noticed out-of-scope issues into a distinct review panel to prevent scope creep.

### C. Requirement-to-Evidence Traceability
- Complete provenance chain: `APH Clause → Structural Requirement → Document Page → Extracted Field/Value → Validation Result → Officer Verification Status → Deficiency Lineage`.
- One-click "Why?" contextual explainer for any finding, requirement, or decision.

---

## 3. High-Level Modular Monolith Architecture

```
flowstate/
├── docker-compose.yml
├── Makefile
├── .env.example
├── .gitignore
├── README.md
├── docs/
│   ├── PLAN.md
│   └── ASSUMPTIONS.md
├── backend/
│   ├── alembic/
│   ├── alembic.ini
│   ├── app/
│   │   ├── main.py
│   │   ├── core/           # Config, database, security, audit logging (SHA-256)
│   │   ├── models/         # SQLAlchemy 2 models (identity, reg, apps, deficiencies, impact, evc, audit)
│   │   ├── schemas/        # Pydantic v2 schemas
│   │   ├── api/v1/         # REST API routes (auth, reg, apps, docs, deficiencies, deadlines, impact, etc.)
│   │   ├── services/       # Core business logic services
│   │   ├── engines/        # Workflow, Deadline, Evidence, Deficiency, Impact, RAG, EVC
│   │   ├── ml/             # Remaining-time & delay-risk ML pipeline with SHAP explanations
│   │   ├── seed/           # Deterministic synthetic data generator (SEED_RANDOM=42)
│   │   └── tests/          # Pytest suite covering all 17 acceptance criteria
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── app/                # Next.js App Router (Executive, Officer, Institution, RegAdmin, Demo)
│   ├── components/         # Premium design components, EvidenceMatrix, ReScrutiny, TraceabilityGraph
│   └── lib/                # API client, state stores, types
└── storage/
    ├── uploads/
    └── synthetic/
```

---

## 4. Phase-by-Phase Roadmap

1. **Phase 1: Project Scaffold, Database & Security**
   - Config, SQLite/PostgreSQL dual-dialect SQLAlchemy 2 models, Alembic migrations.
   - Argon2 password hashing, JWT auth, Role-Based Access Control (`ADMIN_EXEC`, `OFFICER`, `INSTITUTION`, `REG_ADMIN`, `SUPER_ADMIN`).
   - Append-only audit log with SHA-256 hash chaining.
2. **Phase 2: Regulatory Ingestion & Clause Engine**
   - Clause parser, structural hierarchy (Clause 1.8, 1.8(g), 1.9, 1.10, 1.11, 2.24, Table 2.3).
   - Rule registry with `VERIFIED` and `UNVERIFIED_SYNTHETIC` labels.
3. **Phase 3: Workflow & Deterministic Deadline Engine**
   - Application-specific state machine (New Programme vs. EoA Self-Disclosure).
   - Two independent statutory appeal clocks (Clause 1.11 Letter of Deficiency vs. Clause 2.24 EC Decision).
4. **Phase 4: Document Upload, Extraction & Evidence Matrix**
   - PyMuPDF text extraction, page-level mapping, structured field extraction.
   - Requirement-to-Evidence Matrix with provenance badges (`RULE-COMPUTED`, `SUGGESTED`, `VERIFIED`).
5. **Phase 5: Deficiency Lineage & Targeted Re-Scrutiny**
   - Persistent deficiency records, institution response, resubmission tracking.
   - APH 1.8(g) locked checklist generator and separate out-of-scope panel.
6. **Phase 6: Regulatory Change-Impact Engine**
   - Semantic diffing, cycle-safe dependency traversal, impact reports, human approval gate.
7. **Phase 7: Grounded Regulatory Q&A**
   - Hybrid search, citation grounding, honest abstention.
8. **Phase 8: Synthetic Data & Predictive Process Intelligence**
   - Deterministic 3,000 synthetic historical applications, Gradient Boosting delay risk model, SHAP explanations.
9. **Phase 9: Committee Management & EVC Scheduling**
   - OR-Tools CP-SAT conflict-free expert visit scheduling.
10. **Phase 10: Traceability Explorer, Guided Demo & Polish**
    - Interactive React Flow graph, signature demonstration workflow, end-to-end verification.
