import datetime
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.application import Application, ApplicationEvent
from app.models.regulation import DeadlineRule

# Baseline Deterministic AICTE Statutory Deadlines
STATUTORY_DEADLINE_RULES = [
    {
        "rule_code": "DL-APH-1.11-APPEAL-DEFICIENCY",
        "clause_number": "Clause 1.11",
        "trigger_event": "DEFICIENCY_ISSUED",
        "duration_days": 7,
        "duration_type": "CALENDAR_DAYS",
        "responsible_party": "INSTITUTION",
        "description": "Statutory appeal to SAC against Letter of Deficiency must be submitted within seven (7) days.",
        "legal_interpretation": "Clause 1.11: Institution aggrieved by Scrutiny Deficiency may appeal within 7 calendar days of notification.",
        "academic_cutoff_applicable": True,
    },
    {
        "rule_code": "DL-APH-2.24-APPEAL-EC-DECISION",
        "clause_number": "Clause 2.24",
        "trigger_event": "EC_DECISION_UPLOADED",
        "duration_days": 7,
        "duration_type": "CALENDAR_DAYS",
        "responsible_party": "INSTITUTION",
        "description": "Statutory appeal to SAC against Executive Committee decision must be submitted within seven (7) days of portal upload.",
        "legal_interpretation": "Clause 2.24: Distinct statutory appeal triggered strictly by uploading of Executive Committee decision.",
        "academic_cutoff_applicable": True,
    },
    {
        "rule_code": "DL-APH-2.25-SECURITY-DEPOSIT",
        "clause_number": "Clause 2.25",
        "trigger_event": "APPROVAL_LETTER_ISSUED",
        "duration_days": 15,
        "duration_type": "CALENDAR_DAYS",
        "responsible_party": "INSTITUTION",
        "description": "Submission of applicable security deposit and compliance obligations under speaking order.",
        "legal_interpretation": "Clause 2.25: Post-approval security deposit requirements prior to academic commencement.",
        "academic_cutoff_applicable": False,
    },
    {
        "rule_code": "DL-APH-1.8G-RESCRUTINY-WINDOW",
        "clause_number": "Clause 1.8(g)",
        "trigger_event": "RESUBMISSION_RECEIVED",
        "duration_days": 5,
        "duration_type": "WORKING_DAYS",
        "responsible_party": "OFFICER",
        "description": "Scrutiny committee re-scrutiny session must convene within 5 working days of resubmitted evidence.",
        "legal_interpretation": "Clause 1.8(g): Targeted re-scrutiny timeline constraint.",
        "academic_cutoff_applicable": False,
    },
]


class DeadlineEngine:
    @staticmethod
    def calculate_deadline(
        trigger_date: datetime.datetime,
        duration_days: int,
        duration_type: str = "CALENDAR_DAYS",
    ) -> Tuple[datetime.datetime, List[str]]:
        calculation_trace = [
            f"Trigger timestamp: {trigger_date.isoformat()}",
            f"Rule duration: {duration_days} {duration_type}",
        ]

        if duration_type == "CALENDAR_DAYS":
            deadline_date = trigger_date + datetime.timedelta(days=duration_days)
            calculation_trace.append(f"Calculation: trigger_date + {duration_days} calendar days")
        else:
            # Working days calculation (skipping Saturday and Sunday)
            current = trigger_date
            added_days = 0
            while added_days < duration_days:
                current += datetime.timedelta(days=1)
                # 0 = Monday, 5 = Saturday, 6 = Sunday
                if current.weekday() < 5:
                    added_days += 1
            deadline_date = current
            calculation_trace.append(f"Calculation: trigger_date + {duration_days} working days (excluding weekends)")

        return deadline_date, calculation_trace

    @staticmethod
    def get_active_deadlines_for_application(
        db: Session,
        application: Application,
    ) -> List[Dict[str, Any]]:
        deadlines = []

        # Find events on this application that trigger statutory clocks
        events = (
            db.query(ApplicationEvent)
            .filter(ApplicationEvent.application_id == application.id)
            .order_by(ApplicationEvent.created_at.desc())
            .all()
        )

        event_type_map = {e.event_type: e for e in events}
        # Also check current_stage as a trigger (e.g. DEFICIENCY_ISSUED)
        if application.current_stage == "DEFICIENCY_ISSUED" and "DEFICIENCY_ISSUED" not in event_type_map:
            # Create synthetic reference event for calculation
            ref_date = application.updated_at or application.created_at
        else:
            ref_date = None

        for rule in STATUTORY_DEADLINE_RULES:
            trigger_event = rule["trigger_event"]
            matched_event = event_type_map.get(trigger_event)

            trigger_timestamp = None
            if matched_event:
                trigger_timestamp = matched_event.created_at
            elif trigger_event == "DEFICIENCY_ISSUED" and application.current_stage == "DEFICIENCY_ISSUED":
                trigger_timestamp = ref_date or application.created_at
            elif trigger_event == "EC_DECISION_UPLOADED" and application.current_stage == "APPEAL_SAC_2_24":
                trigger_timestamp = application.updated_at or application.created_at

            if trigger_timestamp:
                deadline_dt, trace = DeadlineEngine.calculate_deadline(
                    trigger_date=trigger_timestamp,
                    duration_days=rule["duration_days"],
                    duration_type=rule["duration_type"],
                )

                now = datetime.datetime.now(datetime.timezone.utc)
                if trigger_timestamp.tzinfo is None:
                    trigger_timestamp = trigger_timestamp.replace(tzinfo=datetime.timezone.utc)
                if deadline_dt.tzinfo is None:
                    deadline_dt = deadline_dt.replace(tzinfo=datetime.timezone.utc)

                remaining_seconds = (deadline_dt - now).total_seconds()
                is_expired = remaining_seconds < 0
                days_remaining = round(remaining_seconds / 86400, 1)

                deadlines.append({
                    "rule_code": rule["rule_code"],
                    "clause_number": rule["clause_number"],
                    "trigger_event": trigger_event,
                    "trigger_timestamp": trigger_timestamp.isoformat(),
                    "deadline_timestamp": deadline_dt.isoformat(),
                    "duration_days": rule["duration_days"],
                    "duration_type": rule["duration_type"],
                    "responsible_party": rule["responsible_party"],
                    "description": rule["description"],
                    "legal_interpretation": rule["legal_interpretation"],
                    "is_expired": is_expired,
                    "days_remaining": days_remaining,
                    "status": "OVERDUE" if is_expired else ("CRITICAL" if days_remaining <= 2 else "ACTIVE"),
                    "calculation_trace": trace,
                    "provenance": "RULE-COMPUTED",
                })

        return deadlines
