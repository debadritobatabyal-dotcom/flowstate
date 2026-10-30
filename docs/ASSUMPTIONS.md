# FLOWSTATE — Assumptions and Regulatory Baseline Notes

## 1. Prototype Scope and Non-Affiliation
- **Synthetic Prototype**: This system is an AI-powered administrative intelligence prototype built for pair demonstration. No live AICTE databases, portals or official APIs are connected.
- **Regulatory Corpus**: Baseline rules are derived strictly from the AICTE Approval Process Handbook (APH) 2024–2027 provisions specifically cited in the master specification (Clauses 1.8, 1.8(g), 1.9, 1.10, 1.11, 2.3.4, 2.3.5, 2.23, 2.24, 2.25, and Table 2.3).
- **Unverified Provisions**: Any procedural rules not explicitly published in the baseline text are marked with the tag `UNVERIFIED_SYNTHETIC` in the rule registry.

## 2. Statutory Appeal Clocks
- **Clause 1.11**: Appeal within 7 calendar days of the **Letter of Deficiency** issued post-Scrutiny. Triggering event: `LETTER_OF_DEFICIENCY_UPLOADED`.
- **Clause 2.24**: Appeal within 7 calendar days of uploading the **Executive Committee decision**, considered by SAC. Triggering event: `EC_DECISION_UPLOADED`.
- These are strictly separated in the deadline calculation engine as two independent statutory clocks with distinct triggering events.

## 3. Targeted Re-Scrutiny Invariant (Clause 1.8(g))
- APH Clause 1.8(g) establishes that re-scrutiny verifies *only* deficiencies previously identified by the Scrutiny Committee.
- Any newly observed anomalies during re-scrutiny that were not in the original deficiency checklist must be isolated in an `OUT_OF_SCOPE_NEW_FINDINGS` review panel requiring special committee referral; they can never be silently merged into the active re-scrutiny checklist.

## 4. Database Portability
- While production deployment targets PostgreSQL 16 + pgvector (configured in `docker-compose.yml`), the application includes native dual-mode SQLAlchemy 2 support so developers can run with zero external services using SQLite (`flowstate.db`) with Python-based cosine similarity vector retrieval and JSON columns.

## 5. Provenance Labelling
Every fact and record presented in the UI carries one of four explicit provenance badges:
- `[RULE-COMPUTED]`: Derived deterministically by python rule engine.
- `[HUMAN-VERIFIED]`: Confirmed and digitally signed by an authorized officer.
- `[AI-SUGGESTED]`: Proposed by LLM or ML heuristic, requiring human review.
- `[SIMULATED]`: Emulated third-party verification or external data feed.
