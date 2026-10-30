import argparse
import datetime
import os
import random
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.core.audit import record_audit_event, GENESIS_HASH
from app.models.identity import User, Institution, Officer, Expert
from app.models.regulation import (
    RegulationDocument,
    Clause,
    ClauseLink,
    Rule,
    WorkflowTemplate,
    WorkflowTemplateRuleDep,
    DeadlineRule,
)
from app.models.application import (
    Application,
    ApplicationEvent,
    Document,
    DocumentPage,
    Extraction,
    RequirementEvidenceLink,
    IntegrityFlag,
)
from app.models.deficiency import Deficiency, DeficiencyEvent, RescrutinyChecklist, RescrutinyItem, NewFinding
from app.models.impact import Amendment, ClauseDiff, ImpactReport, ImpactItem
from app.models.committee import Committee, CommitteeMember, ExpertAvailability, EvcVisit
from app.engines.workflow_engine import WORKFLOW_DEFINITIONS
from app.engines.deadline_engine import STATUTORY_DEADLINE_RULES
from app.engines.evidence_engine import EvidenceEngine
from app.engines.impact_engine import ImpactEngine
from app.seed.pdf_generator import generate_all_sample_pdfs, SAMPLE_PDF_DIR

DEFAULT_DEV_PASSWORD = "Password123!"


def seed_database(reset: bool = True):
    print("=" * 60)
    print("FLOWSTATE — DETERMINISTIC DATABASE SEEDING (SEED_RANDOM=42)")
    print("=" * 60)

    random.seed(settings.SEED_RANDOM)
    db: Session = SessionLocal()

    if reset:
        print("Resetting database schema...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    # 1. Regulation Document: AICTE Approval Process Handbook (2024-2027)
    print("1. Ingesting baseline APH 2024-2027 regulatory provisions...")
    aph_doc = RegulationDocument(
        title="AICTE Approval Process Handbook (2024-2027)",
        version="APH-2024-27-v1.0",
        academic_years="2024-2027",
        effective_date=datetime.datetime(2024, 1, 1, tzinfo=datetime.timezone.utc),
        publication_date=datetime.datetime(2023, 12, 15, tzinfo=datetime.timezone.utc),
        is_active=True,
        total_clauses=11,
    )
    db.add(aph_doc)
    db.flush()

    clauses_data = [
        {
            "clause_number": "Clause 1.8",
            "title": "Scrutiny and Re-Scrutiny Committee Procedures",
            "section": "Chapter I",
            "content": "Applications submitted for establishing new Technical Institutions or starting new Programmes shall be evaluated by a Scrutiny Committee constituted by the Regional Officer. The Committee shall verify original documents and eligibility criteria. In cases where deficiencies are pointed out, the applicant shall be given an opportunity for Re-Scrutiny.",
            "summary": "Governs standard scrutiny procedures and defines institution deficiency response opportunities.",
        },
        {
            "clause_number": "Clause 1.8(g)",
            "title": "Limitation of Re-Scrutiny Scope to Previously Identified Deficiencies",
            "section": "Chapter I",
            "content": "Re-scrutiny Committee shall verify ONLY the deficiencies previously identified and communicated by the Scrutiny Committee. The Re-Scrutiny Committee is strictly barred from raising new deficiencies outside the original communication unless special authorization is granted by the Executive Committee.",
            "summary": "Mandatory statutory protection: Re-scrutiny scope is strictly locked to original deficiencies.",
        },
        {
            "clause_number": "Clause 1.9",
            "title": "Expert Visit Committee (EVC) Physical & Online Verification",
            "section": "Chapter I",
            "content": "Expert Visit Committee (EVC) shall conduct on-site physical or online verification of institutional infrastructure, laboratory equipment, barrier-free built-up area, qualified faculty cadre, and fire and safety amenities. EVC reports must be submitted digitally with geo-tagged photographic evidence.",
            "summary": "Specifies infrastructure, faculty roster, and safety verification protocols for EVC panels.",
        },
        {
            "clause_number": "Clause 1.10",
            "title": "Executive Committee Consideration and Grant of Approval",
            "section": "Chapter I",
            "content": "The recommendations of the Scrutiny Committee, Re-Scrutiny Committee, and EVC shall be placed before the Executive Committee (EC) of AICTE. The EC shall consider the reports and take a final decision regarding Grant of Approval (LoA) or Letter of Rejection.",
            "summary": "Final statutory decision-making authority for institutional approval grant.",
        },
        {
            "clause_number": "Clause 1.11",
            "title": "Statutory Appeal to Standing Appeal Committee (SAC) against Letter of Deficiency",
            "section": "Chapter I",
            "content": "An Institution aggrieved by the Letter of Deficiency issued post-Scrutiny or Re-Scrutiny may submit an Appeal to the Standing Appeal Committee (SAC) within seven (7) calendar days of notification on the portal.",
            "summary": "Statutory 7-day appeal clock triggered strictly by Letter of Deficiency notification.",
        },
        {
            "clause_number": "Clause 2.3.4",
            "title": "Digitally Signed Submission and Online Processing",
            "section": "Chapter II",
            "content": "All applications, affidavits, certificates, and compliance reports must be submitted digitally with cryptographic signature or e-sign. Hardcopy submissions are not entertained.",
            "summary": "Mandates digital provenance and cryptographic document submission.",
        },
        {
            "clause_number": "Clause 2.3.5",
            "title": "Randomized EVC Inspection for Self-Disclosure Approvals",
            "section": "Chapter II",
            "content": "Council reserves the right to conduct surprise random Expert Visit Committee inspections on institutions granted Extension of Approval (EoA) based on self-disclosure, to verify integrity of uploaded records.",
            "summary": "Establishes random post-approval audit mechanism distinct from scheduled EVC.",
        },
        {
            "clause_number": "Clause 2.23",
            "title": "Tiered Processing through Scrutiny, EVC, and Standing Hearing Committee (SHC)",
            "section": "Chapter II",
            "content": "Institutions requesting expansion, closure, or change of site shall be routed through structured Scrutiny, physical EVC inspection, and where disputes persist, referral to the Standing Hearing Committee (SHC).",
            "summary": "Establishes tiered committee referral pathways.",
        },
        {
            "clause_number": "Clause 2.24",
            "title": "Statutory Appeal to SAC against Executive Committee Decision",
            "section": "Chapter II",
            "content": "An Institution aggrieved by the final decision of the Executive Committee (EC) may prefer an Appeal before the Standing Appeal Committee (SAC) within seven (7) calendar days from the date of uploading the decision on the portal.",
            "summary": "Statutory 7-day appeal clock triggered strictly by uploading of Executive Committee decision.",
        },
        {
            "clause_number": "Clause 2.25",
            "title": "Grant of Approval, Speaking Orders, and Security Deposit Obligations",
            "section": "Chapter II",
            "content": "Approval shall be issued as a speaking order. In cases of new technical institutions or additional programmes, the applicant shall deposit the requisite Security Deposit in the joint name of AICTE and the applicant society within 15 calendar days.",
            "summary": "Establishes speaking order issuance and 15-day joint security deposit requirement.",
        },
        {
            "clause_number": "Table 2.3",
            "title": "Differential Processing Pathways by Application Type",
            "section": "Chapter II",
            "content": "Establishes distinct procedural routes for different application types: EoA on Self-Disclosure (Self-Disclosure: Yes, Scrutiny: No, EVC: No); Starting a new Programme/Level (Self-Disclosure: No, Scrutiny: Yes, EVC: Yes); Diploma-to-Degree conversion (Scrutiny: Yes, EVC: Yes); Change of Name/Type (Scrutiny: Yes, EVC: No).",
            "summary": "Core workflow matrix specifying route differences across application categories.",
        },
    ]

    clause_objs = {}
    for c_data in clauses_data:
        c = Clause(
            document_id=aph_doc.id,
            clause_number=c_data["clause_number"],
            title=c_data["title"],
            section=c_data["section"],
            content=c_data["content"],
            summary=c_data["summary"],
            is_active=True,
        )
        db.add(c)
        db.flush()
        clause_objs[c_data["clause_number"]] = c

    # 2. Structured Rules
    print("2. Registering verified regulatory rules and evaluation logic...")
    rules_data = [
        {
            "clause_number": "Clause 1.8",
            "rule_code": "RULE-LAND-01",
            "name": "Normative Institutional Land Requirement",
            "description": "Institution must possess clear unencumbered title to minimum normative land area (2.5 acres Metro/Urban or 7.5 acres Rural).",
            "verification_status": "VERIFIED",
            "required_fields": ["land_area_acres", "survey_plot_number"],
        },
        {
            "clause_number": "Clause 1.8",
            "rule_code": "RULE-FIRE-01",
            "name": "Valid Fire Safety NOC & Occupancy Compliance",
            "description": "Institution must hold a valid, unexpired Fire Safety NOC issued by the State Fire Services Authority.",
            "verification_status": "VERIFIED",
            "required_fields": ["fire_safety_expiry_date", "fire_noc_number"],
        },
        {
            "clause_number": "Clause 1.9",
            "rule_code": "RULE-FACULTY-01",
            "name": "Faculty Cadre Ratio & Postgraduate Qualification Roster",
            "description": "Adequate faculty cadre ratio (1:15/1:20) with mandatory Ph.D qualification for Professorial and Associate Cadres.",
            "verification_status": "VERIFIED",
            "required_fields": ["phd_faculty_count", "postgraduate_faculty_count"],
        },
        {
            "clause_number": "Clause 2.25",
            "rule_code": "RULE-FINANCIAL-01",
            "name": "AICTE Joint Endowment Reserve Fund",
            "description": "Establishment of Joint Fixed Deposit / Endowment Reserve Fund in favor of AICTE and the Institution.",
            "verification_status": "VERIFIED",
            "required_fields": ["corpus_reserve_fund"],
        },
        {
            "clause_number": "Table 2.3",
            "rule_code": "RULE-SYNTH-ENERGY-01",
            "name": "Institutional Green Energy Audit [UNVERIFIED_SYNTHETIC]",
            "description": "Recommended campus rooftop solar capacity and carbon footprint self-audit report.",
            "verification_status": "UNVERIFIED_SYNTHETIC",
            "required_fields": ["solar_kw_capacity"],
        },
    ]

    rule_objs = {}
    for r_data in rules_data:
        clause = clause_objs.get(r_data["clause_number"])
        r = Rule(
            clause_id=clause.id if clause else clause_objs["Clause 1.8"].id,
            rule_code=r_data["rule_code"],
            name=r_data["name"],
            description=r_data["description"],
            verification_status=r_data["verification_status"],
            required_fields=r_data["required_fields"],
        )
        db.add(r)
        db.flush()
        rule_objs[r_data["rule_code"]] = r

    # 3. Workflow Templates
    print("3. Seeding application workflow templates (Table 2.3)...")
    for app_type, wf_meta in WORKFLOW_DEFINITIONS.items():
        tmpl = WorkflowTemplate(
            application_type=app_type,
            version=wf_meta["version"],
            name=f"Approval Workflow for {app_type}",
            description=wf_meta["description"],
            status_label=wf_meta["status_label"],
            stages_json=wf_meta["stages"],
            is_active=True,
        )
        db.add(tmpl)
        db.flush()

    # 4. Statutory Deadline Rules
    print("4. Registering statutory deadline clocks (Clause 1.11 & Clause 2.24)...")
    for dl_meta in STATUTORY_DEADLINE_RULES:
        clause = clause_objs.get(dl_meta["clause_number"])
        dl_rule = DeadlineRule(
            rule_code=dl_meta["rule_code"],
            clause_id=clause.id if clause else None,
            trigger_event=dl_meta["trigger_event"],
            duration_days=dl_meta["duration_days"],
            duration_type=dl_meta["duration_type"],
            responsible_party=dl_meta["responsible_party"],
            description=dl_meta["description"],
            legal_interpretation=dl_meta["legal_interpretation"],
            academic_cutoff_applicable=dl_meta["academic_cutoff_applicable"],
        )
        db.add(dl_rule)

    # 5. Fictional Institutions
    print("5. Seeding 12 fictional institutions across 5 AICTE regions...")
    institutions_data = [
        {"name": "Meridian Institute of Technology", "aicte_id": "1-1094827101", "region": "Western", "state": "Maharashtra", "district": "Pune", "type": "Private-Self Financed"},
        {"name": "Zenith Institute of Engineering", "aicte_id": "1-1094827102", "region": "South-Western", "state": "Karnataka", "district": "Bangalore Urban", "type": "Private-Self Financed"},
        {"name": "Apex College of Technology", "aicte_id": "1-1094827103", "region": "Southern", "state": "Tamil Nadu", "district": "Chennai", "type": "Govt-Aided"},
        {"name": "Pinnacle Institute of Science & Tech", "aicte_id": "1-1094827104", "region": "Eastern", "state": "West Bengal", "district": "Kolkata", "type": "Private-Self Financed"},
        {"name": "Northern Valley Institute of Engineering", "aicte_id": "1-1094827105", "region": "Northern", "state": "Punjab", "district": "Mohali", "type": "Govt"},
        {"name": "Deccan College of Technical Studies", "aicte_id": "1-1094827106", "region": "South-Western", "state": "Karnataka", "district": "Mysore", "type": "Private-Self Financed"},
        {"name": "Vanguard Institute of Applied Sciences", "aicte_id": "1-1094827107", "region": "Western", "state": "Gujarat", "district": "Ahmedabad", "type": "Private-Self Financed"},
        {"name": "Konkan Engineering Academy", "aicte_id": "1-1094827108", "region": "Western", "state": "Maharashtra", "district": "Ratnagiri", "type": "Private-Self Financed"},
        {"name": "Ganges Technical University College", "aicte_id": "1-1094827109", "region": "Northern", "state": "Uttar Pradesh", "district": "Varanasi", "type": "Govt"},
        {"name": "Malabar Institute of Polytechnic & Engg", "aicte_id": "1-1094827110", "region": "Southern", "state": "Kerala", "district": "Kozhikode", "type": "Private-Self Financed"},
        {"name": "Brahmaputra Engineering Institute", "aicte_id": "1-1094827111", "region": "Eastern", "state": "Assam", "district": "Guwahati", "type": "Govt-Aided"},
        {"name": "Vidarbha College of Technology", "aicte_id": "1-1094827112", "region": "Western", "state": "Maharashtra", "district": "Nagpur", "type": "Private-Self Financed"},
    ]

    inst_objs = {}
    for inst_data in institutions_data:
        inst = Institution(
            aicte_id=inst_data["aicte_id"],
            name=inst_data["name"],
            region=inst_data["region"],
            state=inst_data["state"],
            district=inst_data["district"],
            type=inst_data["type"],
            address=f"Knowledge City Campus, {inst_data['district']}, {inst_data['state']}",
            pin_code="411001",
        )
        db.add(inst)
        db.flush()
        inst_objs[inst_data["name"]] = inst

    hashed_pw = hash_password(DEFAULT_DEV_PASSWORD)

    # 6. Users: Executive, Admins, Officers, Institutions
    print("6. Creating role-based user accounts...")
    # Super Admin
    super_admin = User(email="superadmin@flowstate.aicte.gov.in", hashed_password=hashed_pw, role="SUPER_ADMIN", full_name="AICTE Chief Administrative Director")
    # Executive
    exec_user = User(email="executive@flowstate.aicte.gov.in", hashed_password=hashed_pw, role="ADMIN_EXEC", full_name="Member Secretary, AICTE")
    # Reg Admin
    reg_admin = User(email="regadmin@flowstate.aicte.gov.in", hashed_password=hashed_pw, role="REG_ADMIN", full_name="Regulatory Policy Director")
    db.add_all([super_admin, exec_user, reg_admin])
    db.flush()

    # Regional Officers
    officer_roles = [
        ("officer.western@flowstate.aicte.gov.in", "Western Regional Officer", "Western"),
        ("officer.northern@flowstate.aicte.gov.in", "Northern Regional Officer", "Northern"),
        ("officer.southern@flowstate.aicte.gov.in", "Southern Regional Officer", "Southern"),
        ("officer.eastern@flowstate.aicte.gov.in", "Eastern Regional Officer", "Eastern"),
        ("officer.southwest@flowstate.aicte.gov.in", "South-Western Regional Officer", "South-Western"),
    ]
    officer_objs = []
    for email, name, region in officer_roles:
        u = User(email=email, hashed_password=hashed_pw, role="OFFICER", full_name=name)
        db.add(u)
        db.flush()
        off = Officer(user_id=u.id, regional_office=region, designation="Regional Director & Scrutiny Convener", workload_count=random.randint(10, 22))
        db.add(off)
        officer_objs.append(u)

    # Institution Accounts
    meridian_inst = inst_objs["Meridian Institute of Technology"]
    meridian_user = User(
        email="director@meridian.edu.in",
        hashed_password=hashed_pw,
        role="INSTITUTION",
        full_name="Prof. Anand G. Joshi (Principal, Meridian)",
        institution_id=meridian_inst.id,
    )
    db.add(meridian_user)

    for inst_name, inst in inst_objs.items():
        if inst_name == "Meridian Institute of Technology":
            continue
        domain = inst_name.lower().replace(" ", "").replace("&", "")[:12] + ".edu.in"
        u = User(
            email=f"admin@{domain}",
            hashed_password=hashed_pw,
            role="INSTITUTION",
            full_name=f"Registrar, {inst_name}",
            institution_id=inst.id,
        )
        db.add(u)

    # 7. 20 Fictional Experts
    print("7. Seeding 20 academic and professional experts for EVC...")
    expert_names = [
        ("Dr. Rameshwar Rao", "IIT Bombay", "Professor (Computer Science)", "Mumbai"),
        ("Dr. Shalini Swaminathan", "IISc Bangalore", "Professor (Electrical & Electronics)", "Bangalore"),
        ("Prof. Bhupendra Singh", "IIT Delhi", "Professor (Mechanical Engineering)", "New Delhi"),
        ("Dr. Ananya Mukherjee", "IIT Kharagpur", "Professor (Civil Engineering)", "Kolkata"),
        ("Dr. Vinod K. Nair", "NIT Trichy", "Professor (Chemical Engineering)", "Trichy"),
        ("Prof. S. R. Deshmukh", "COEP Tech University", "Professor (Instrumentation)", "Pune"),
        ("Dr. Preeti Chhabra", "IIT Roorkee", "Professor (Architecture & Planning)", "Roorkee"),
        ("Prof. M. K. Alamelu", "Anna University", "Professor (Information Technology)", "Chennai"),
        ("Dr. K. G. Radhakrishnan", "NIT Calicut", "Professor (Electronics & Comm)", "Kozhikode"),
        ("Prof. Gurpreet S. Gill", "PEC Chandigarh", "Professor (Computer Science)", "Chandigarh"),
        ("Dr. Hemant Trivedi", "IIT Gandhinagar", "Professor (Artificial Intelligence)", "Gandhinagar"),
        ("Dr. B. N. Goswami", "IIT Guwahati", "Professor (Structural Engineering)", "Guwahati"),
        ("Prof. Vandana Kulkarni", "VJTI Mumbai", "Professor (Civil & Environment)", "Mumbai"),
        ("Dr. Sanat Kumar Jena", "IIT Bhubaneswar", "Professor (Metallurgical Engg)", "Bhubaneswar"),
        ("Prof. Tariq Ahmad", "Aligarh Muslim Univ", "Professor (Mechanical Engg)", "Aligarh"),
        ("Dr. N. Sundararajan", "PSG Tech Coimbatore", "Professor (Robotics & Automation)", "Coimbatore"),
        ("Dr. Kavita Narayanan", "NIT Surathkal", "Professor (Computer Engg)", "Surathkal"),
        ("Prof. D. K. Mahapatra", "NIT Rourkela", "Professor (Electrical Engg)", "Rourkela"),
        ("Dr. Ashok Sengupta", "Jadavpur University", "Professor (Electronics)", "Kolkata"),
        ("Dr. Madhavan Pillai", "CUSAT Kochi", "Professor (Computer Applications)", "Kochi"),
    ]

    expert_objs = []
    for name, org, desig, city in expert_names:
        exp = Expert(
            full_name=name,
            organization=org,
            designation=desig,
            city=city,
            expertise_areas=["Engineering & Technology", "Computer Science", "Artificial Intelligence", "Civil Infrastructure"],
            conflict_institutions=[],  # None conflicted by default
            phone="+91 98200 " + str(random.randint(10000, 99999)),
            is_active=True,
        )
        db.add(exp)
        expert_objs.append(exp)

    db.flush()

    # 8. Generate ReportLab Sample PDFs
    print("8. Generating realistic ReportLab sample PDFs for testing...")
    sample_files = generate_all_sample_pdfs()

    # 9. Primary Signature Demo Application: Meridian Institute of Technology
    print("9. Configuring signature demonstration application (Meridian Institute)...")
    meridian_app = Application(
        application_number="APP-2024-MIT-001",
        institution_id=meridian_inst.id,
        application_type="Starting a new Programme/Level",
        current_stage="SCRUTINY",
        status="IN_PROGRESS",
        workflow_template_version="v1.0",
        regulation_version="APH-2024-27-v1.0",
        assigned_officer_id=officer_objs[0].id,
        submission_date=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=14),
        overall_risk_score=0.68,
        delay_risk_predicted=0.72,
        remaining_days_predicted=32.5,
    )
    db.add(meridian_app)
    db.flush()

    # Add Application Events
    db.add(ApplicationEvent(
        application_id=meridian_app.id,
        event_type="SUBMITTED",
        from_stage=None,
        to_stage="SUBMITTED",
        triggered_by_id=meridian_user.id,
        actor_role="INSTITUTION",
        metadata_json={"programme": "B.Tech in Artificial Intelligence & Data Science", "intake": 60},
        created_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=14),
    ))
    db.add(ApplicationEvent(
        application_id=meridian_app.id,
        event_type="STAGE_TRANSITION",
        from_stage="SUBMITTED",
        to_stage="SCRUTINY",
        triggered_by_id=officer_objs[0].id,
        actor_role="OFFICER",
        metadata_json={"notes": "Assigned to Western Regional Scrutiny Panel."},
        created_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=10),
    ))

    # Process PDFs into Documents, Pages, and Extractions for Meridian
    print("   Ingesting Meridian sample PDFs into Evidence Engine...")
    doc_land = EvidenceEngine.process_pdf_document(
        db=db,
        application_id=meridian_app.id,
        document_type="LAND_DOCUMENT",
        file_path=sample_files["land_document"],
        original_filename="meridian_land_record.pdf",
    )
    doc_fire_expired = EvidenceEngine.process_pdf_document(
        db=db,
        application_id=meridian_app.id,
        document_type="FIRE_CERTIFICATE",
        file_path=sample_files["fire_expired"],
        original_filename="meridian_fire_noc_expired.pdf",
    )
    doc_faculty = EvidenceEngine.process_pdf_document(
        db=db,
        application_id=meridian_app.id,
        document_type="FACULTY_LIST",
        file_path=sample_files["faculty_list"],
        original_filename="meridian_faculty_roster.pdf",
    )
    doc_financial = EvidenceEngine.process_pdf_document(
        db=db,
        application_id=meridian_app.id,
        document_type="FINANCIAL_STATEMENT",
        file_path=sample_files["financial_statement"],
        original_filename="meridian_financial_audit.pdf",
    )

    # Create Initial Deficiency on Meridian for the expired fire certificate
    print("   Raising realistic initial deficiency on expired fire safety certificate...")
    initial_def = Deficiency(
        deficiency_number=f"DEF-{meridian_app.application_number}-01",
        application_id=meridian_app.id,
        institution_id=meridian_inst.id,
        aph_clause_number="Clause 1.8",
        rule_code="RULE-FIRE-01",
        observation="Fire Safety NOC submitted (NOC-MH-FIRE-2021-94) expired on 15-11-2023. Valid unexpired NOC from Maharashtra Fire Services Authority is mandatory under Clause 1.8 & NBC 2016 Part 4.",
        original_document_id=doc_fire_expired.id,
        original_page_number=1,
        evidence_snippet="Valid Until: 15-11-2023 [EXPIRED (Requires Re-inspection)]",
        stage_raised="SCRUTINY",
        date_raised=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=4),
        responsible_party="INSTITUTION",
        status="OPEN",
        severity="CRITICAL",
    )
    db.add(initial_def)
    db.flush()

    db.add(DeficiencyEvent(
        deficiency_id=initial_def.id,
        event_type="RAISED",
        actor_id=officer_objs[0].id,
        actor_role="OFFICER",
        notes="Deficiency issued during Scrutiny Session: Expired Fire NOC detected.",
        document_id=doc_fire_expired.id,
        page_number=1,
        status_after="OPEN",
        timestamp=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=4),
    ))

    # Add Letter of Deficiency application event to activate Clause 1.11 statutory appeal clock
    db.add(ApplicationEvent(
        application_id=meridian_app.id,
        event_type="DEFICIENCY_ISSUED",
        from_stage="SCRUTINY",
        to_stage="DEFICIENCY_ISSUED",
        triggered_by_id=officer_objs[0].id,
        actor_role="OFFICER",
        metadata_json={"deficiency_id": initial_def.id, "letter_reference": "AICTE/WRO/SCRUTINY/2024/0914"},
        created_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=3),
    ))

    # 10. Seed 60 Live Synthetic Applications for realistic dashboards
    print("10. Seeding 60 live synthetic applications across all regions and stages...")
    stages_pool = ["SUBMITTED", "SCRUTINY", "DEFICIENCY_ISSUED", "RE_SCRUTINY", "EVC_SCHEDULED", "EC_CONSIDERATION", "APPROVED", "REJECTED"]
    app_types_pool = ["Starting a new Programme/Level", "EoA based on Self-Disclosure"]

    for i in range(1, 61):
        inst_target = list(inst_objs.values())[i % len(inst_objs)]
        stg = random.choice(stages_pool)
        atype = random.choice(app_types_pool)
        stat = "APPROVED" if stg == "APPROVED" else ("REJECTED" if stg == "REJECTED" else ("DEFICIENT" if stg == "DEFICIENCY_ISSUED" else "IN_PROGRESS"))
        days_ago = random.randint(2, 50)
        officer = officer_objs[i % len(officer_objs)]

        app_syn = Application(
            application_number=f"APP-2024-{inst_target.region[:3].upper()}-{1000 + i}",
            institution_id=inst_target.id,
            application_type=atype,
            current_stage=stg,
            status=stat,
            workflow_template_version="v1.0",
            regulation_version="APH-2024-27-v1.0",
            assigned_officer_id=officer.id,
            submission_date=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days_ago),
            overall_risk_score=round(random.uniform(0.1, 0.85), 2),
            delay_risk_predicted=round(random.uniform(0.1, 0.9), 2),
            remaining_days_predicted=round(random.uniform(3, 45), 1),
        )
        db.add(app_syn)
        db.flush()

        db.add(ApplicationEvent(
            application_id=app_syn.id,
            event_type="STAGE_TRANSITION",
            from_stage="SUBMITTED",
            to_stage=stg,
            triggered_by_id=officer.id,
            actor_role="OFFICER",
            metadata_json={"notes": "Synthetic event progression."},
            created_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days_ago // 2),
        ))

    # 11. Seed Hypothetical Regulatory Amendment (Signature Scenario Capability A)
    print("11. Seeding hypothetical regulatory amendment (Solar Rooftop & Fire Standards)...")
    amendment = Amendment(
        amendment_number="APH-AMD-2024-01",
        title="Corrigendum: Mandatory Campus Solar Auditing & Fire Alarm Retrofitting",
        gazette_notification_no="CG-DL-E-2024-0941",
        issue_date=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2),
        effective_date=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),
        status="PROPOSED",
        summary="Amends Clause 1.8 and Clause 1.9 to mandate verified rooftop solar capacity certification and advanced addressable fire alarm panels for all new technical programme approvals.",
        is_synthetic_demonstration=True,
    )
    db.add(amendment)
    db.flush()

    diff1 = ClauseDiff(
        amendment_id=amendment.id,
        clause_number="Clause 1.8",
        diff_type="MODIFIED",
        old_text="The Committee shall verify original documents and eligibility criteria. In cases where deficiencies are pointed out, the applicant shall be given an opportunity for Re-Scrutiny.",
        new_text="The Committee shall verify original documents, eligibility criteria, and mandatory institutional clean energy audit compliance (min. 25kW solar rooftop installation). In cases where deficiencies are pointed out, the applicant shall be given an opportunity for Re-Scrutiny.",
        impact_summary="Introduces mandatory green energy compliance verification at Scrutiny stage.",
    )
    diff2 = ClauseDiff(
        amendment_id=amendment.id,
        clause_number="Clause 1.9",
        diff_type="MODIFIED",
        old_text="Expert Visit Committee (EVC) shall conduct on-site physical or online verification of institutional infrastructure, laboratory equipment, barrier-free built-up area, qualified faculty cadre, and fire and safety amenities.",
        new_text="Expert Visit Committee (EVC) shall conduct physical on-site verification of institutional infrastructure, laboratory equipment, barrier-free built-up area, qualified faculty cadre, addressable automatic fire detection system, and rooftop renewable energy meters.",
        impact_summary="Expands EVC verification checklist to mandate addressable fire sensors and rooftop meters.",
    )
    db.add_all([diff1, diff2])
    db.flush()

    # Generate initial change-impact analysis for the amendment
    print("   Computing cycle-safe regulatory change-impact propagation...")
    ImpactEngine.generate_impact_analysis(db=db, amendment=amendment, actor_id=reg_admin.id)

    # 12. Record Genesis Audit Log
    record_audit_event(
        db=db,
        action="DATABASE_INITIALIZED_AND_SEEDED",
        entity_type="SYSTEM",
        entity_id="AICTE_FLOWSTATE_CORE",
        actor_id=super_admin.id,
        actor_role="SUPER_ADMIN",
        details={
            "institutions_seeded": len(institutions_data),
            "applications_seeded": 61,
            "experts_seeded": len(expert_names),
            "clauses_seeded": len(clauses_data),
            "signature_institution": "Meridian Institute of Technology",
            "statutory_rules": ["Clause 1.8(g)", "Clause 1.11", "Clause 2.24", "Table 2.3"],
        },
    )

    db.commit()
    print("=" * 60)
    print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
    print(f"Signature Demo Application: {meridian_app.application_number} ({meridian_inst.name})")
    print(f"Default Login Password for all seeded users: {DEFAULT_DEV_PASSWORD}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Reset and rebuild database tables before seeding.")
    parser.add_argument("--demo-only", action="store_true", help="Reset only demo institution state.")
    args = parser.parse_args()
    seed_database(reset=args.reset)
