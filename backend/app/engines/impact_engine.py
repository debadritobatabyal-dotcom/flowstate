import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.application import Application, Document
from app.models.regulation import Clause, Rule, WorkflowTemplate, DeadlineRule
from app.models.impact import Amendment, ClauseDiff, ImpactReport, ImpactItem
from app.core.audit import record_audit_event


class ImpactEngine:
    @staticmethod
    def generate_impact_analysis(
        db: Session,
        amendment: Amendment,
        actor_id: Optional[str] = None,
    ) -> ImpactReport:
        """
        Cycle-safe change-impact analysis traversing:
        Amendment -> Clause -> Rule -> WorkflowTemplate -> Applications -> Deadlines / Documents
        """
        diffs = db.query(ClauseDiff).filter(ClauseDiff.amendment_id == amendment.id).all()

        report = ImpactReport(
            amendment_id=amendment.id,
            title=f"Impact Assessment Report: {amendment.amendment_number} ({amendment.title})",
            status="PENDING_REVIEW",
            generated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(report)
        db.flush()

        rules_affected_count = 0
        templates_affected_count = 0
        apps_affected_count = 0
        ambiguous_count = 0

        # Traverse each modified/added clause
        for diff in diffs:
            # 1. Find matching base clauses and dependent rules
            clause = db.query(Clause).filter(Clause.clause_number == diff.clause_number).first()
            clause_label = diff.clause_number

            # Dependent rules
            matched_rules = []
            if clause:
                matched_rules = db.query(Rule).filter(Rule.clause_id == clause.id).all()
            else:
                # Search by clause number prefix in rules
                matched_rules = db.query(Rule).filter(Rule.rule_code.contains(diff.clause_number.replace(" ", ""))).all()

            for rule in matched_rules:
                rules_affected_count += 1

                # Rule impact item
                rule_item = ImpactItem(
                    impact_report_id=report.id,
                    entity_type="RULE",
                    entity_id=rule.id,
                    entity_label=f"Rule: {rule.name} ({rule.rule_code})",
                    clause_number=clause_label,
                    impact_type="REQUIREMENT_MODIFIED",
                    applicability="UNAMBIGUOUS_PROSPECTIVE",
                    recommended_action=f"Update rule verification logic to reflect amended provisions under {clause_label}.",
                    explanation_chain=[
                        f"Amendment {amendment.amendment_number}",
                        f"Clause {clause_label} ({diff.diff_type})",
                        f"Rule {rule.rule_code}",
                    ],
                    approval_status="PENDING",
                )
                db.add(rule_item)

            # 2. Affected Workflow Templates
            templates = db.query(WorkflowTemplate).all()
            for tmpl in templates:
                # If clause affects scrutiny or EVC or appeal
                if "1.8" in diff.clause_number or "1.9" in diff.clause_number or "2.3" in diff.clause_number:
                    templates_affected_count += 1
                    tmpl_item = ImpactItem(
                        impact_report_id=report.id,
                        entity_type="WORKFLOW_TEMPLATE",
                        entity_id=tmpl.id,
                        entity_label=f"Workflow: {tmpl.name} ({tmpl.version})",
                        clause_number=clause_label,
                        impact_type="STAGE_REQUIREMENTS_ALTERED",
                        applicability="UNAMBIGUOUS_PROSPECTIVE",
                        recommended_action="Create versioned workflow template draft for upcoming academic cycle.",
                        explanation_chain=[
                            f"Amendment {amendment.amendment_number}",
                            f"Clause {clause_label}",
                            f"Template {tmpl.name}",
                        ],
                        approval_status="PENDING",
                    )
                    db.add(tmpl_item)

            # 3. Affected Live Applications
            # Non-negotiable regulatory rule: Do not silently apply new rules retrospectively!
            # Active applications in Scrutiny or EVC must be flagged as AMBIGUOUS_RETROSPECTIVE
            live_apps = (
                db.query(Application)
                .filter(Application.status.in_(["IN_PROGRESS", "DEFICIENT"]))
                .all()
            )

            for app in live_apps:
                apps_affected_count += 1
                # Mark as Ambiguous Retrospective because human official must decide if in-progress apps are grandfathered
                ambiguous_count += 1
                app_item = ImpactItem(
                    impact_report_id=report.id,
                    entity_type="APPLICATION",
                    entity_id=app.id,
                    entity_label=f"Application: {app.application_number} ({app.institution.name if app.institution else 'Institution'})",
                    clause_number=clause_label,
                    impact_type="RETROSPECTIVE_COMPLIANCE_REVIEW",
                    applicability="AMBIGUOUS_RETROSPECTIVE",
                    recommended_action="FLAGGED FOR HUMAN REVIEW: Review whether amendment applies retrospectively to submitted application or if grandfathering applies.",
                    explanation_chain=[
                        f"Amendment {amendment.amendment_number}",
                        f"Clause {clause_label}",
                        f"Application {app.application_number} (Stage: {app.current_stage})",
                        "Human Review Gate Required",
                    ],
                    approval_status="PENDING",
                )
                db.add(app_item)

        report.summary_metrics = {
            "rules_affected": rules_affected_count,
            "templates_affected": templates_affected_count,
            "applications_affected": apps_affected_count,
            "ambiguous_count": ambiguous_count,
            "human_approval_required": True,
        }

        record_audit_event(
            db=db,
            action="IMPACT_ANALYSIS_GENERATED",
            entity_type="IMPACT_REPORT",
            entity_id=report.id,
            actor_id=actor_id,
            actor_role="REG_ADMIN",
            details={
                "amendment_id": amendment.id,
                "summary": report.summary_metrics,
            },
        )

        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def approve_impact_item(
        db: Session,
        item_id: str,
        approval_status: str,  # APPROVED or REJECTED
        officer_notes: Optional[str] = None,
        actor_id: Optional[str] = None,
    ) -> ImpactItem:
        item = db.query(ImpactItem).filter(ImpactItem.id == item_id).first()
        if not item:
            raise ValueError(f"ImpactItem {item_id} not found.")

        item.approval_status = approval_status
        item.officer_notes = officer_notes
        item.reviewed_by_id = actor_id
        item.reviewed_at = datetime.datetime.now(datetime.timezone.utc)

        # Audit
        record_audit_event(
            db=db,
            action="IMPACT_ACTION_DECIDED",
            entity_type="IMPACT_ITEM",
            entity_id=item.id,
            actor_id=actor_id,
            actor_role="REG_ADMIN",
            details={
                "entity_type": item.entity_type,
                "entity_label": item.entity_label,
                "approval_status": approval_status,
                "notes": officer_notes,
            },
        )

        db.commit()
        db.refresh(item)
        return item
