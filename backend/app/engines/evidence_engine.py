import hashlib
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import fitz  # PyMuPDF
from sqlalchemy.orm import Session

from app.models.application import (
    Application,
    Document,
    DocumentPage,
    Extraction,
    RequirementEvidenceLink,
    IntegrityFlag,
)
from app.models.regulation import Rule
from app.core.config import settings


class EvidenceEngine:
    @staticmethod
    def compute_sha256(file_path: str) -> str:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(65536), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    @staticmethod
    def process_pdf_document(
        db: Session,
        application_id: str,
        document_type: str,
        file_path: str,
        original_filename: str,
        is_resubmission: bool = False,
        replaces_document_id: Optional[str] = None,
    ) -> Document:
        file_hash = EvidenceEngine.compute_sha256(file_path)
        file_size = os.path.getsize(file_path)

        # PyMuPDF document extraction
        doc_fitz = fitz.open(file_path)
        page_count = len(doc_fitz)

        # Check for duplicate document hash across the application
        duplicate = (
            db.query(Document)
            .filter(
                Document.application_id == application_id,
                Document.file_hash_sha256 == file_hash,
            )
            .first()
        )

        doc_record = Document(
            application_id=application_id,
            document_type=document_type,
            original_filename=original_filename,
            storage_path=file_path,
            file_hash_sha256=file_hash,
            file_size_bytes=file_size,
            page_count=page_count,
            status="PROCESSED",
            is_resubmission=is_resubmission,
            replaces_document_id=replaces_document_id,
            uploaded_at=datetime.now(timezone.utc),
        )
        db.add(doc_record)
        db.flush()

        if duplicate:
            flag = IntegrityFlag(
                application_id=application_id,
                document_id=doc_record.id,
                flag_type="POSSIBLE_DUPLICATE",
                severity="WARNING",
                description=f"Possible inconsistency — document hash matches previously uploaded '{duplicate.original_filename}'. Requires review.",
                status="ACTIVE",
            )
            db.add(flag)

        # Extract text and structured fields page by page
        for page_idx in range(page_count):
            page = doc_fitz[page_idx]
            text = page.get_text("text")

            page_record = DocumentPage(
                document_id=doc_record.id,
                page_number=page_idx + 1,
                raw_text=text,
                ocr_applied=False,
            )
            db.add(page_record)
            db.flush()

            # Structured field extraction based on document type
            extractions = EvidenceEngine.extract_structured_fields(
                text=text,
                document_type=document_type,
                page_id=page_record.id,
                page_number=page_idx + 1,
                document_id=doc_record.id,
            )
            for ext in extractions:
                db.add(ext)

            # Check integrity / consistency flags
            flags = EvidenceEngine.check_integrity_flags(
                extractions=extractions,
                application_id=application_id,
                document_id=doc_record.id,
            )
            for f in flags:
                db.add(f)

        doc_fitz.close()
        db.commit()
        db.refresh(doc_record)

        # Refresh requirement-to-evidence matrix
        EvidenceEngine.sync_evidence_matrix_for_application(db, application_id)

        return doc_record

    @staticmethod
    def extract_structured_fields(
        text: str,
        document_type: str,
        page_id: str,
        page_number: int,
        document_id: str,
    ) -> List[Extraction]:
        extractions: List[Extraction] = []

        # 1. Land Document heuristics
        if document_type in ["LAND_DOCUMENT", "INSTITUTIONAL_LAND_RECORD"]:
            # Acres match
            land_match = re.search(r"(\d+(\.\d+)?)\s*(acres|acre|hectares|sqm|sq\.m)", text, re.IGNORECASE)
            if land_match:
                extractions.append(Extraction(
                    document_id=document_id,
                    page_id=page_id,
                    page_number=page_number,
                    field_name="land_area_acres",
                    extracted_value=land_match.group(0),
                    confidence=0.95,
                    provenance="RULE-COMPUTED",
                ))
            # Survey / Khasra number
            survey_match = re.search(r"(survey|khasra|plot)\s*no\.?\s*:?\s*([A-Za-z0-9\/\-]+)", text, re.IGNORECASE)
            if survey_match:
                extractions.append(Extraction(
                    document_id=document_id,
                    page_id=page_id,
                    page_number=page_number,
                    field_name="survey_plot_number",
                    extracted_value=survey_match.group(2).strip(),
                    confidence=0.90,
                    provenance="RULE-COMPUTED",
                ))

        # 2. Fire Safety Certificate
        elif document_type in ["FIRE_CERTIFICATE", "FIRE_SAFETY_NOC"]:
            expiry_match = re.search(r"(valid\s*upto|valid\s*until|expiry\s*date|validity)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})", text, re.IGNORECASE)
            if expiry_match:
                extractions.append(Extraction(
                    document_id=document_id,
                    page_id=page_id,
                    page_number=page_number,
                    field_name="fire_safety_expiry_date",
                    extracted_value=expiry_match.group(2).strip(),
                    confidence=0.95,
                    provenance="RULE-COMPUTED",
                ))
            noc_match = re.search(r"(noc\s*no|ref\s*no|certificate\s*no)\.?\s*:?\s*([A-Za-z0-9\/\-]+)", text, re.IGNORECASE)
            if noc_match:
                extractions.append(Extraction(
                    document_id=document_id,
                    page_id=page_id,
                    page_number=page_number,
                    field_name="fire_noc_number",
                    extracted_value=noc_match.group(2).strip(),
                    confidence=0.90,
                    provenance="RULE-COMPUTED",
                ))

        # 3. Faculty Qualification List
        elif document_type in ["FACULTY_LIST", "FACULTY_QUALIFICATIONS"]:
            # Find faculty entries and qualification (Ph.D, M.Tech, etc.)
            phd_count = len(re.findall(r"Ph\.?D\.?", text, re.IGNORECASE))
            mtech_count = len(re.findall(r"M\.?(Tech|E|Sc|Phil)\.?", text, re.IGNORECASE))
            extractions.append(Extraction(
                document_id=document_id,
                page_id=page_id,
                page_number=page_number,
                field_name="phd_faculty_count",
                extracted_value=str(phd_count),
                confidence=0.88,
                provenance="RULE-COMPUTED",
            ))
            extractions.append(Extraction(
                document_id=document_id,
                page_id=page_id,
                page_number=page_number,
                field_name="postgraduate_faculty_count",
                extracted_value=str(mtech_count),
                confidence=0.88,
                provenance="RULE-COMPUTED",
            ))

        # 4. Financial Statement / Audit Report
        elif document_type in ["FINANCIAL_STATEMENT", "AUDIT_REPORT"]:
            reserve_match = re.search(r"(corpus|endowment|reserve\s*fund)\s*:?\s*(INR|Rs\.?)\s*([\d,]+(\.\d+)?)", text, re.IGNORECASE)
            if reserve_match:
                extractions.append(Extraction(
                    document_id=document_id,
                    page_id=page_id,
                    page_number=page_number,
                    field_name="corpus_reserve_fund",
                    extracted_value=f"{reserve_match.group(2)} {reserve_match.group(3)}",
                    confidence=0.92,
                    provenance="RULE-COMPUTED",
                ))

        return extractions

    @staticmethod
    def check_integrity_flags(
        extractions: List[Extraction],
        application_id: str,
        document_id: str,
    ) -> List[IntegrityFlag]:
        flags: List[IntegrityFlag] = []

        for ext in extractions:
            if ext.field_name == "fire_safety_expiry_date":
                # Parse date and check if expired
                try:
                    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y", "%Y-%m-%d"):
                        try:
                            exp_dt = datetime.strptime(ext.extracted_value, fmt)
                            if exp_dt < datetime.now():
                                flags.append(IntegrityFlag(
                                    application_id=application_id,
                                    document_id=document_id,
                                    flag_type="EXPIRED_CERTIFICATE",
                                    severity="CRITICAL",
                                    description=f"Possible inconsistency — Fire Safety NOC expiry date ({ext.extracted_value}) is prior to evaluation date. Requires review.",
                                    status="ACTIVE",
                                ))
                            break
                        except ValueError:
                            continue
                except Exception:
                    pass

            if ext.field_name == "land_area_acres":
                # AICTE requires minimum 7.5 acres in rural or 2.5 in urban (simplified check)
                try:
                    val = float(re.sub(r"[^\d\.]", "", ext.extracted_value))
                    if val < 2.5:
                        flags.append(IntegrityFlag(
                            application_id=application_id,
                            document_id=document_id,
                            flag_type="BELOW_NORMATIVE_AREA",
                            severity="CRITICAL",
                            description=f"Possible inconsistency — Extracted land area ({val} acres) is below standard minimum normative requirement (2.5 acres). Requires review.",
                            status="ACTIVE",
                        ))
                except Exception:
                    pass

        return flags

    @staticmethod
    def sync_evidence_matrix_for_application(db: Session, application_id: str) -> None:
        """
        Synchronizes all applicable rules with uploaded documents and extractions
        to build the single shared Requirement-to-Evidence Matrix.
        """
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            return

        # Fetch all verified rules
        rules = db.query(Rule).all()
        # Fetch all documents for this application
        documents = (
            db.query(Document)
            .filter(Document.application_id == application_id)
            .order_by(Document.uploaded_at.desc())
            .all()
        )

        doc_by_type = {doc.document_type: doc for doc in documents}

        SUBSTANTIVE_CLAUSE_MAP = {
            "RULE-LAND-01": "APH 2024-27 Chapter I, Table 1.1 (Normative Land Area Requirement)",
            "RULE-FIRE-01": "State/UT Fire Prevention & Life Safety Measures Act / APH Annexure 2",
            "RULE-FACULTY-01": "APH 2024-27 Appendix 7 & 8 (Faculty Cadre Ratio & Cadre Pay Scale)",
            "RULE-FIN-01": "Clause 2.25 & Appendix 1 (Joint Endowment Reserve Fund & Operating Balance)",
            "RULE-SOLAR-01": "UNVERIFIED_SYNTHETIC — Illustrative Institutional Sustainability Recommendation",
        }

        PROCEDURAL_CLAUSE_MAP = {
            "RULE-LAND-01": "Clause 1.8 (Scrutiny Committee Document Verification)",
            "RULE-FIRE-01": "Clause 1.8 (Scrutiny Committee Public Safety Verification)",
            "RULE-FACULTY-01": "Clause 1.9 (Expert Visit Committee Physical/Online Verification)",
            "RULE-FIN-01": "Clause 1.8 / Clause 2.23 (Financial Audit & Security Scrutiny)",
            "RULE-SOLAR-01": "Clause 1.8 (Proposed Corrigendum Scrutiny Check)",
        }

        for rule in rules:
            # Map rule to document type
            req_type = "LAND_DOCUMENT"
            if "FIRE" in rule.rule_code:
                req_type = "FIRE_CERTIFICATE"
            elif "FACULTY" in rule.rule_code:
                req_type = "FACULTY_LIST"
            elif "FINANCIAL" in rule.rule_code:
                req_type = "FINANCIAL_STATEMENT"

            doc = doc_by_type.get(req_type)

            # Find existing link
            existing_link = (
                db.query(RequirementEvidenceLink)
                .filter(
                    RequirementEvidenceLink.application_id == application_id,
                    RequirementEvidenceLink.rule_id == rule.id,
                )
                .first()
            )

            # Look up extraction
            extraction = None
            evidence_snippet = None
            validation_result = "INCOMPLETE"
            page_num = 1

            if doc:
                extraction = (
                    db.query(Extraction)
                    .filter(Extraction.document_id == doc.id)
                    .first()
                )
                if extraction:
                    page_num = extraction.page_number
                    evidence_snippet = f"Extracted {extraction.field_name}: '{extraction.extracted_value}' (Page {page_num})"
                    validation_result = "COMPLIANT"
                else:
                    evidence_snippet = f"Document '{doc.original_filename}' uploaded; pending field extraction."
                    validation_result = "PENDING_REVIEW"
            else:
                evidence_snippet = f"Mandatory document for {rule.name} not yet uploaded."
                validation_result = "INCOMPLETE"

            # Check if there is an active integrity flag on this document
            if doc:
                flag = (
                    db.query(IntegrityFlag)
                    .filter(
                        IntegrityFlag.application_id == application_id,
                        IntegrityFlag.document_id == doc.id,
                        IntegrityFlag.status == "ACTIVE",
                    )
                    .first()
                )
                if flag:
                    validation_result = "DEFICIENT"

            substantive = SUBSTANTIVE_CLAUSE_MAP.get(rule.rule_code, f"APH Clause {rule.clause.clause_number if rule.clause else '1.8'}")
            procedural = PROCEDURAL_CLAUSE_MAP.get(rule.rule_code, "Clause 1.8 (Scrutiny Procedure)")

            if existing_link:
                existing_link.document_id = doc.id if doc else None
                existing_link.page_number = page_num if doc else None
                existing_link.extraction_id = extraction.id if extraction else None
                existing_link.evidence_snippet = evidence_snippet
                existing_link.validation_result = validation_result
                existing_link.substantive_clause = substantive
                existing_link.procedural_clause = procedural
            else:
                new_link = RequirementEvidenceLink(
                    application_id=application_id,
                    rule_id=rule.id,
                    rule_code=rule.rule_code,
                    aph_clause_number=rule.clause.clause_number if rule.clause else "Clause 1.8",
                    substantive_clause=substantive,
                    procedural_clause=procedural,
                    document_id=doc.id if doc else None,
                    page_number=page_num if doc else None,
                    extraction_id=extraction.id if extraction else None,
                    evidence_snippet=evidence_snippet,
                    validation_result=validation_result,
                    provenance="RULE-COMPUTED",
                    officer_verification_status="PENDING",
                )
                db.add(new_link)

        db.commit()

