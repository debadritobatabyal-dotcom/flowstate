import datetime
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.application import Application, Document
from app.models.deficiency import (
    Deficiency,
    DeficiencyEvent,
    RescrutinyChecklist,
    RescrutinyItem,
    NewFinding,
)
from app.core.audit import record_audit_event


class DeficiencyEngine:
    @staticmethod
    def create_deficiency(
        db: Session,
        application_id: str,
        aph_clause_number: str,
        rule_code: str,
        observation: str,
        original_document_id: Optional[str] = None,
        original_page_number: Optional[int] = None,
        evidence_snippet: Optional[str] = None,
        severity: str = "CRITICAL",
        actor_id: Optional[str] = None,
        actor_role: Optional[str] = "OFFICER",
    ) -> Deficiency:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError(f"Application {application_id} not found.")

        # Generate sequential deficiency number
        count = db.query(Deficiency).filter(Deficiency.application_id == application_id).count()
        deficiency_number = f"DEF-{app.application_number}-{count + 1:02d}"

        deficiency = Deficiency(
            deficiency_number=deficiency_number,
            application_id=application_id,
            institution_id=app.institution_id,
            aph_clause_number=aph_clause_number,
            rule_code=rule_code,
            observation=observation,
            original_document_id=original_document_id,
            original_page_number=original_page_number,
            evidence_snippet=evidence_snippet,
            stage_raised=app.current_stage,
            date_raised=datetime.datetime.now(datetime.timezone.utc),
            responsible_party="INSTITUTION",
            status="OPEN",
            severity=severity,
        )
        db.add(deficiency)
        db.flush()

        # Record Initial Event in Deficiency Lineage
        event = DeficiencyEvent(
            deficiency_id=deficiency.id,
            event_type="RAISED",
            actor_id=actor_id,
            actor_role=actor_role,
            notes=f"Deficiency raised under {aph_clause_number}: {observation}",
            document_id=original_document_id,
            page_number=original_page_number,
            status_before=None,
            status_after="OPEN",
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(event)

        # Record Audit Event
        record_audit_event(
            db=db,
            action="DEFICIENCY_RAISED",
            entity_type="DEFICIENCY",
            entity_id=deficiency.id,
            actor_id=actor_id,
            actor_role=actor_role,
            details={
                "deficiency_number": deficiency_number,
                "application_id": application_id,
                "aph_clause_number": aph_clause_number,
                "observation": observation,
            },
        )

        db.commit()
        db.refresh(deficiency)
        return deficiency

    @staticmethod
    def submit_correction(
        db: Session,
        deficiency_id: str,
        resubmitted_document_id: str,
        resubmitted_page_number: int,
        resubmission_notes: str,
        actor_id: Optional[str] = None,
        actor_role: Optional[str] = "INSTITUTION",
    ) -> Deficiency:
        deficiency = db.query(Deficiency).filter(Deficiency.id == deficiency_id).first()
        if not deficiency:
            raise ValueError(f"Deficiency {deficiency_id} not found.")

        old_status = deficiency.status
        deficiency.status = "RESUBMITTED"
        deficiency.resubmitted_document_id = resubmitted_document_id
        deficiency.resubmitted_page_number = resubmitted_page_number
        deficiency.resubmission_notes = resubmission_notes
        deficiency.resubmitted_at = datetime.datetime.now(datetime.timezone.utc)

        event = DeficiencyEvent(
            deficiency_id=deficiency.id,
            event_type="EVIDENCE_RESUBMITTED",
            actor_id=actor_id,
            actor_role=actor_role,
            notes=resubmission_notes,
            document_id=resubmitted_document_id,
            page_number=resubmitted_page_number,
            status_before=old_status,
            status_after="RESUBMITTED",
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(event)

        record_audit_event(
            db=db,
            action="DEFICIENCY_RESUBMITTED",
            entity_type="DEFICIENCY",
            entity_id=deficiency.id,
            actor_id=actor_id,
            actor_role=actor_role,
            details={
                "deficiency_number": deficiency.deficiency_number,
                "resubmitted_document_id": resubmitted_document_id,
                "notes": resubmission_notes,
            },
        )

        db.commit()
        db.refresh(deficiency)
        return deficiency

    @staticmethod
    def generate_locked_rescrutiny_checklist(
        db: Session,
        application_id: str,
        actor_id: Optional[str] = None,
    ) -> RescrutinyChecklist:
        """
        Critical Regulatory Principle: APH Clause 1.8(g)
        Re-scrutiny verifies ONLY deficiencies previously identified by the Scrutiny Committee.
        This function generates an immutable, locked checklist strictly bound to original deficiencies.
        """
        # Count existing checklists for round number
        prev_rounds = (
            db.query(RescrutinyChecklist)
            .filter(RescrutinyChecklist.application_id == application_id)
            .count()
        )
        round_number = prev_rounds + 1

        # Fetch all open or resubmitted deficiencies for this application
        applicable_deficiencies = (
            db.query(Deficiency)
            .filter(
                Deficiency.application_id == application_id,
                Deficiency.status.in_(["OPEN", "RESUBMITTED", "UNRESOLVED"]),
            )
            .all()
        )

        checklist = RescrutinyChecklist(
            application_id=application_id,
            round_number=round_number,
            status="ACTIVE",
            is_locked=True,  # Invariant: locked scope
            generated_at=datetime.datetime.now(datetime.timezone.utc),
            locked_at=datetime.datetime.now(datetime.timezone.utc),
            verified_by_id=actor_id,
        )
        db.add(checklist)
        db.flush()

        for def_item in applicable_deficiencies:
            item = RescrutinyItem(
                checklist_id=checklist.id,
                deficiency_id=def_item.id,
                original_finding_summary=def_item.observation,
                aph_clause_number=def_item.aph_clause_number,
                resubmitted_document_id=def_item.resubmitted_document_id,
                resubmitted_page_number=def_item.resubmitted_page_number,
                verification_status="PENDING",
            )
            db.add(item)

        record_audit_event(
            db=db,
            action="RESCRUTINY_CHECKLIST_LOCKED",
            entity_type="RESCRUTINY_CHECKLIST",
            entity_id=checklist.id,
            actor_id=actor_id,
            actor_role="OFFICER",
            details={
                "application_id": application_id,
                "round_number": round_number,
                "items_count": len(applicable_deficiencies),
                "statutory_rule": "APH Clause 1.8(g)",
            },
        )

        db.commit()
        db.refresh(checklist)
        return checklist

    @staticmethod
    def verify_rescrutiny_item(
        db: Session,
        item_id: str,
        verification_status: str,  # RESOLVED or UNRESOLVED
        officer_comment: str,
        actor_id: str,
    ) -> RescrutinyItem:
        item = db.query(RescrutinyItem).filter(RescrutinyItem.id == item_id).first()
        if not item:
            raise ValueError(f"RescrutinyItem {item_id} not found.")

        item.verification_status = verification_status
        item.officer_comment = officer_comment
        item.verified_at = datetime.datetime.now(datetime.timezone.utc)

        # Update underlying deficiency status
        deficiency = item.deficiency
        deficiency.status = verification_status
        deficiency.resolution_status = "COMPLIED" if verification_status == "RESOLVED" else "DEFICIENT_REMAINS"
        deficiency.officer_resolution_notes = officer_comment
        deficiency.resolved_by_id = actor_id
        deficiency.resolved_at = datetime.datetime.now(datetime.timezone.utc)

        # Append to Deficiency Lineage Event History
        event = DeficiencyEvent(
            deficiency_id=deficiency.id,
            event_type="RE_SCRUTINISED",
            actor_id=actor_id,
            actor_role="OFFICER",
            notes=f"Targeted Re-Scrutiny verdict: {verification_status}. Comment: {officer_comment}",
            document_id=item.resubmitted_document_id,
            page_number=item.resubmitted_page_number,
            status_before="RESUBMITTED",
            status_after=verification_status,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(event)

        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def record_out_of_scope_finding(
        db: Session,
        checklist_id: str,
        observation: str,
        clause_number: Optional[str] = None,
        document_id: Optional[str] = None,
        page_number: Optional[int] = None,
        officer_notes: Optional[str] = None,
        actor_id: Optional[str] = None,
    ) -> NewFinding:
        """
        APH Clause 1.8(g) Enforcement:
        Any finding observed outside the locked checklist is isolated here,
        preventing silent scope expansion of the re-scrutiny session.
        """
        checklist = db.query(RescrutinyChecklist).filter(RescrutinyChecklist.id == checklist_id).first()
        if not checklist:
            raise ValueError(f"Checklist {checklist_id} not found.")

        finding = NewFinding(
            application_id=checklist.application_id,
            checklist_id=checklist.id,
            observation=observation,
            clause_number=clause_number or "General Review",
            document_id=document_id,
            page_number=page_number,
            status="OUT_OF_SCOPE_FLAGGED",
            officer_notes=officer_notes,
            officer_id=actor_id,
            created_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(finding)
        db.flush()

        record_audit_event(
            db=db,
            action="OUT_OF_SCOPE_FINDING_ISOLATED",
            entity_type="NEW_FINDING",
            entity_id=finding.id,
            actor_id=actor_id,
            actor_role="OFFICER",
            details={
                "checklist_id": checklist_id,
                "observation": observation,
                "reason": "APH Clause 1.8(g) prevents dynamic expansion of re-scrutiny scope.",
            },
        )

        db.commit()
        db.refresh(finding)
        return finding
