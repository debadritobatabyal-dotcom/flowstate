from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.application import Application, ApplicationEvent
from app.models.regulation import WorkflowTemplate
from app.core.audit import record_audit_event

# Baseline Workflow Definitions based on AICTE Table 2.3
WORKFLOW_DEFINITIONS = {
    "Starting a new Programme/Level": {
        "version": "v1.0",
        "status_label": "VERIFIED",
        "description": "Full processing route: Self-Disclosure (No), Scrutiny (Yes), EVC (Yes), EC Consideration (Yes).",
        "stages": [
            {"id": "SUBMITTED", "label": "Application Submitted", "allowed_next": ["SCRUTINY"]},
            {"id": "SCRUTINY", "label": "Scrutiny Committee Review", "allowed_next": ["DEFICIENCY_ISSUED", "EVC_SCHEDULED", "REJECTED"]},
            {"id": "DEFICIENCY_ISSUED", "label": "Letter of Deficiency Issued", "allowed_next": ["RE_SCRUTINY", "APPEAL_SAC"]},
            {"id": "RE_SCRUTINY", "label": "Targeted Re-Scrutiny (Clause 1.8g)", "allowed_next": ["EVC_SCHEDULED", "REJECTED", "APPEAL_SAC"]},
            {"id": "EVC_SCHEDULED", "label": "Expert Visit Committee (Clause 1.9)", "allowed_next": ["EC_CONSIDERATION", "DEFICIENCY_ISSUED", "REJECTED"]},
            {"id": "EC_CONSIDERATION", "label": "Executive Committee Consideration (Clause 1.10)", "allowed_next": ["APPROVED", "REJECTED", "APPEAL_SAC_2_24"]},
            {"id": "APPEAL_SAC", "label": "Standing Appeal Committee (Clause 1.11)", "allowed_next": ["RE_SCRUTINY", "EVC_SCHEDULED", "REJECTED"]},
            {"id": "APPEAL_SAC_2_24", "label": "SAC Appeal on EC Decision (Clause 2.24)", "allowed_next": ["EC_CONSIDERATION", "REJECTED"]},
            {"id": "APPROVED", "label": "Grant of Approval Issued (Clause 2.25)", "allowed_next": []},
            {"id": "REJECTED", "label": "Application Rejected / Closed", "allowed_next": []},
        ],
    },
    "EoA based on Self-Disclosure": {
        "version": "v1.0",
        "status_label": "UNVERIFIED_SYNTHETIC",
        "description": "Streamlined route: Self-Disclosure (Yes), Scrutiny (No), EVC (No, unless random 2.3.5).",
        "stages": [
            {"id": "SUBMITTED", "label": "Self-Disclosure Submitted", "allowed_next": ["RANDOM_EVC_AUDIT", "EC_CONSIDERATION"]},
            {"id": "RANDOM_EVC_AUDIT", "label": "Random EVC Selection (Clause 2.3.5)", "allowed_next": ["EC_CONSIDERATION", "DEFICIENCY_ISSUED"]},
            {"id": "DEFICIENCY_ISSUED", "label": "Deficiency Notice Issued", "allowed_next": ["RE_SCRUTINY"]},
            {"id": "RE_SCRUTINY", "label": "Re-Scrutiny of Self-Disclosure", "allowed_next": ["EC_CONSIDERATION", "REJECTED"]},
            {"id": "EC_CONSIDERATION", "label": "Automated EC Consideration", "allowed_next": ["APPROVED", "REJECTED"]},
            {"id": "APPROVED", "label": "Extension of Approval Granted", "allowed_next": []},
            {"id": "REJECTED", "label": "EoA Not Granted", "allowed_next": []},
        ],
    },
}


class WorkflowEngine:
    @staticmethod
    def get_template_for_type(app_type: str) -> Dict:
        return WORKFLOW_DEFINITIONS.get(app_type, WORKFLOW_DEFINITIONS["Starting a new Programme/Level"])

    @staticmethod
    def is_transition_allowed(app_type: str, current_stage: str, target_stage: str) -> bool:
        template = WorkflowEngine.get_template_for_type(app_type)
        stages = template.get("stages", [])
        for stage in stages:
            if stage["id"] == current_stage:
                return target_stage in stage["allowed_next"]
        return False

    @staticmethod
    def transition_stage(
        db: Session,
        application: Application,
        to_stage: str,
        actor_id: str,
        actor_role: str,
        notes: Optional[str] = None,
    ) -> Tuple[bool, str]:
        # Validate allowed transition
        allowed = WorkflowEngine.is_transition_allowed(
            application.application_type,
            application.current_stage,
            to_stage
        )
        if not allowed:
            return False, f"Invalid stage transition from {application.current_stage} to {to_stage} for {application.application_type}."

        from_stage = application.current_stage
        application.current_stage = to_stage

        # Update overall status if terminal stage
        if to_stage == "APPROVED":
            application.status = "APPROVED"
        elif to_stage == "REJECTED":
            application.status = "REJECTED"
        elif to_stage == "DEFICIENCY_ISSUED":
            application.status = "DEFICIENT"
        else:
            application.status = "IN_PROGRESS"

        # Record Application Event
        event = ApplicationEvent(
            application_id=application.id,
            event_type="STAGE_TRANSITION",
            from_stage=from_stage,
            to_stage=to_stage,
            triggered_by_id=actor_id,
            actor_role=actor_role,
            metadata_json={"notes": notes or ""},
        )
        db.add(event)

        # Record Tamper-Evident Audit Event
        record_audit_event(
            db=db,
            action="STAGE_TRANSITION",
            entity_type="APPLICATION",
            entity_id=application.id,
            actor_id=actor_id,
            actor_role=actor_role,
            details={
                "application_number": application.application_number,
                "from_stage": from_stage,
                "to_stage": to_stage,
                "notes": notes,
            },
        )

        db.commit()
        db.refresh(application)
        return True, f"Application {application.application_number} transitioned to {to_stage}."
