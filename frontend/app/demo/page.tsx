"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { EvidenceMatrixTable } from "@/components/EvidenceMatrixTable";
import { ReScrutinyPanel } from "@/components/ReScrutinyPanel";
import { TraceabilityGraph } from "@/components/TraceabilityGraph";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Compass,
  Layers,
  Sparkles,
  Lock,
  Scale,
  Calendar,
  Building2,
  Cpu,
} from "lucide-react";

export default function DemoPage() {
  const { openWhyModal } = useAppStore();
  const [activeStage, setActiveStage] = useState(1);
  const [appData, setAppData] = useState<any>(null);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [deficiencies, setDeficiencies] = useState<any[]>([]);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [evcSchedule, setEvcSchedule] = useState<any>(null);
  const [amendment, setAmendment] = useState<any>(null);
  const [impactReport, setImpactReport] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [schedulingEvc, setSchedulingEvc] = useState(false);

  // Load Meridian Application State
  const loadDemoData = async () => {
    setLoading(true);
    try {
      if (!api.getToken()) {
        try {
          const authRes = await api.demoLogin("REGIONAL_OFFICER");
          api.setToken(authRes.access_token);
        } catch {
          // Continue with standard request
        }
      }

      let apps = await api.getApplications({ search: "APP-2024-MIT-001" }).catch(() => []);
      if (!apps || apps.length === 0) {
        apps = await api.getApplications().catch(() => []);
      }

      const targetAppSummary = apps.find((a: any) => a.application_number === "APP-2024-MIT-001") || (apps.length > 0 ? apps[0] : null);

      if (targetAppSummary) {
        const fullApp = await api.getApplication(targetAppSummary.id);
        setAppData(fullApp);

        const [mat, defs, chk, dls, pred, amds, logs] = await Promise.all([
          api.getEvidenceMatrix(fullApp.id).catch(() => []),
          api.getDeficiencies(fullApp.id).catch(() => []),
          api.getRescrutinyChecklist(fullApp.id).catch(() => null),
          api.getDeadlines(fullApp.id).catch(() => ({ deadlines: [] })),
          api.getDelayPrediction(fullApp.id).catch(() => null),
          api.getAmendments().catch(() => []),
          api.getAuditLogs(0, 8).catch(() => []),
        ]);

        setMatrix(mat);
        setDeficiencies(defs);
        setChecklistData(chk);
        setDeadlines(dls.deadlines || []);
        setPrediction(pred);
        setAuditLogs(logs);

        if (amds.length > 0) {
          setAmendment(amds[0]);
          const rep = await api.getImpactReport(amds[0].id).catch(() => null);
          setImpactReport(rep);
        }
      }
    } catch (err: any) {
      console.error("Failed to load demo data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemoData();
  }, []);

  const handleReset = async () => {
    if (!confirm("Reset demo environment to baseline initial state?")) return;
    setResetting(true);
    try {
      await api.resetDemo();
      await loadDemoData();
      setActiveStage(1);
    } catch (err: any) {
      alert("Failed to reset demo: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleRunEvcSchedule = async () => {
    if (!appData) return;
    setSchedulingEvc(true);
    try {
      const res = await api.scheduleEvc(appData.id, "2026-11-20", 3);
      setEvcSchedule(res);
      await loadDemoData();
    } catch (err: any) {
      alert("EVC schedule failed: " + err.message);
    } finally {
      setSchedulingEvc(false);
    }
  };

  const handleApproveAction = async (itemId: string, status: string) => {
    try {
      await api.approveImpactItem(itemId, status, `Authorized administrative determination: ${status}`);
      if (amendment) {
        const rep = await api.getImpactReport(amendment.id);
        setImpactReport(rep);
      }
    } catch (err: any) {
      alert("Approval action failed: " + err.message);
    }
  };

  const stages = [
    { number: 1, title: "Intake & Table 2.3 Route", desc: "Application Submission" },
    { number: 2, title: "Document OCR & Evidence", desc: "PyMuPDF Extraction" },
    { number: 3, title: "Locked Clause 1.8(g) Re-Scrutiny", desc: "Targeted Scope Lock" },
    { number: 4, title: "EVC Solver & Corrigendum Impact", desc: "CP-SAT & Human Gate" },
  ];

  if (loading || !appData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-xs font-mono font-bold text-ink-secondary gap-3">
        <Clock className="animate-spin text-flow-core" size={24} />
        <span>Loading Meridian Institute Signature Demonstration Case...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Permanent Notice */}
      <div className="bg-navy-deep text-paper/90 text-xs font-semibold py-1.5 px-4 rounded-sm flex items-center justify-between shadow-2xs border border-navy-light/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-shallow-rim animate-pulse" />
          <span>DEMO ENVIRONMENT — Synthetic data. No live AICTE databases or APIs are connected.</span>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-1.5 bg-navy-light hover:bg-neutral/20 text-paper px-2.5 py-0.5 rounded-full text-[11px] font-bold transition border border-neutral/30"
        >
          <RotateCcw size={11} />
          <span>{resetting ? "Resetting..." : "Reset Scenario"}</span>
        </button>
      </div>

      {/* Case Header */}
      <div className="bg-navy text-paper p-6 rounded-sm border border-navy-light shadow-sheet flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-flow-rim mb-1">
            <ContourBadgeSwatch variant="shallow" />
            <span>Fictional Signature Scenario</span>
            <span>•</span>
            <span className="text-shallow-rim font-bold">Meridian Institute of Technology</span>
          </div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-paper tracking-tight">
            Complete End-to-End Regulatory Journey
          </h1>
          <p className="text-xs text-neutral/80 mt-1 max-w-3xl leading-relaxed">
            Follows Meridian Institute of Technology (Pune, Western Region, AICTE ID: 1-1094827101) from new programme intake through PyMuPDF document extraction, deficiency identification, locked Clause 1.8(g) re-scrutiny, EVC allocation, and corrigendum change-impact evaluation.
          </p>
        </div>

        <div className="text-left md:text-right shrink-0">
          <span className="text-[10px] text-neutral/70 font-mono font-bold uppercase tracking-wider block">Target File</span>
          <span className="font-mono font-bold text-base text-flow-rim">{appData?.application_number}</span>
          <span className="text-[10px] text-neutral/80 block font-mono">Stage: {appData?.current_stage}</span>
        </div>
      </div>

      {/* 4-Stage Stepper Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {stages.map((st) => {
          const isActive = activeStage === st.number;
          const isDone = activeStage > st.number;
          return (
            <button
              key={st.number}
              type="button"
              onClick={() => setActiveStage(st.number)}
              className={`p-3.5 rounded-sm border text-left transition flex items-center justify-between ${
                isActive
                  ? "bg-navy text-paper border-navy shadow-xs"
                  : isDone
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100/50"
                  : "bg-paper border-neutral text-ink hover:bg-surface"
              }`}
            >
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                  isActive ? "text-flow-rim" : isDone ? "text-emerald-700" : "text-ink-secondary"
                }`}>
                  {isDone ? "Completed" : isActive ? "Active Stage" : "Upcoming"}
                </span>
                <span className="text-xs font-heading font-bold line-clamp-1 mt-0.5">{st.title}</span>
                <span className={`text-[10px] block truncate ${isActive ? "text-neutral/70" : "text-ink-secondary"}`}>
                  {st.desc}
                </span>
              </div>
              {isDone ? (
                <CheckCircle size={16} className="text-emerald-700 shrink-0 ml-2" />
              ) : (
                <span className={`text-xs font-mono font-bold shrink-0 ml-2 ${isActive ? "text-shallow-rim" : "text-ink-secondary"}`}>
                  0{st.number}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* STAGE 1: Intake & Table 2.3 Route */}
      {activeStage === 1 && (
        <div className="bg-paper rounded-sm p-6 border border-neutral shadow-xs space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral pb-3 gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-flow-core">Stage 1 of 4</span>
              <h2 className="text-base font-heading font-bold text-ink">Application Intake & Configured Route (Table 2.3)</h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Meridian Institute submits application for <em>Starting a new Programme/Level</em> in Artificial Intelligence & Data Science.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-flow-core/10 text-flow-core border border-flow-core/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
              Route: SCRUTINY + EVC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-surface rounded-sm border border-neutral space-y-2">
              <span className="font-heading font-bold text-ink text-xs block">Institution Profile & Authority</span>
              <div className="space-y-1 text-ink-secondary text-xs">
                <div><strong className="text-ink">Institution:</strong> Meridian Institute of Technology</div>
                <div><strong className="text-ink">AICTE Permanent ID:</strong> 1-1094827101</div>
                <div><strong className="text-ink">Region & State:</strong> Western Region • Maharashtra (Pune)</div>
                <div><strong className="text-ink">Category:</strong> Private-Self Financed Engineering College</div>
                <div><strong className="text-ink">Authorised User:</strong> Prof. Anand G. Joshi (Director)</div>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-sm border border-neutral space-y-2">
              <span className="font-heading font-bold text-ink text-xs block">Table 2.3 Statutory Processing Route</span>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                Under APH Table 2.3, <strong>Starting a new Programme/Level</strong> mandates two independent procedural steps:
              </p>
              <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold mt-2">
                <div className="p-2.5 bg-paper text-flow-core rounded-sm border border-neutral font-mono">
                  Step 1: Clause 1.8 Scrutiny Committee
                </div>
                <div className="p-2.5 bg-paper text-shallow-core rounded-sm border border-neutral font-mono">
                  Step 2: Clause 1.9 EVC Inspection
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-neutral">
            <button
              onClick={() => setActiveStage(2)}
              className="m-btn text-xs py-2 px-4"
            >
              <span>Proceed to Stage 2: Document Verification</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: Document Verification & Evidence Matrix */}
      {activeStage === 2 && (
        <div className="space-y-4">
          <div className="bg-paper rounded-sm p-5 border border-neutral shadow-xs text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-flow-core">Stage 2 of 4</span>
                <h2 className="text-base font-heading font-bold text-ink">Document Verification & Requirement-to-Evidence Matrix</h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  PyMuPDF extracted fields across uploaded PDFs. Notice that the Fire Safety NOC is flagged <strong>DEFICIENT</strong> due to expiration.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
                1 Deficiency Detected
              </span>
            </div>
          </div>

          <EvidenceMatrixTable
            items={matrix}
            applicationId={appData?.id || ""}
            onRefresh={loadDemoData}
            canVerify={true}
          />

          <div className="flex justify-between items-center bg-paper p-4 rounded-sm border border-neutral">
            <button
              onClick={() => setActiveStage(1)}
              className="m-btn-outline text-xs py-1.5 px-4"
            >
              ← Back to Stage 1
            </button>
            <button
              onClick={() => setActiveStage(3)}
              className="m-btn text-xs py-1.5 px-4"
            >
              <span>Proceed to Stage 3: Deficiency Response & Clause 1.8(g)</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Deficiency Response & Targeted Re-Scrutiny (1.8g) */}
      {activeStage === 3 && (
        <div className="space-y-4">
          <div className="bg-paper p-4 rounded-sm border border-neutral text-xs text-ink space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-heading font-bold text-ink text-sm">
              <Lock size={16} className="text-flow-core" />
              <span>APH Clause 1.8(g) Strict Scope Lock</span>
            </div>
            <p className="text-[11px] text-ink-secondary leading-relaxed">
              Re-scrutiny verifies <strong>ONLY</strong> deficiencies previously identified by the Scrutiny Committee. The checklist below contains exactly the Fire NOC deficiency. Newly noticed findings during re-scrutiny cannot expand this list and are sequestered in the separate Out-of-Scope panel.
            </p>
          </div>

          <ReScrutinyPanel
            applicationId={appData?.id || ""}
            checklistData={checklistData}
            onRefresh={loadDemoData}
            canVerify={true}
          />

          <div className="flex justify-between items-center bg-paper p-4 rounded-sm border border-neutral">
            <button
              onClick={() => setActiveStage(2)}
              className="m-btn-outline text-xs py-1.5 px-4"
            >
              ← Back to Stage 2
            </button>
            <button
              onClick={() => setActiveStage(4)}
              className="m-btn text-xs py-1.5 px-4"
            >
              <span>Proceed to Stage 4: Decision & Corrigendum Impact</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: Decision, EVC Scheduling & Corrigendum Impact Gate */}
      {activeStage === 4 && (
        <div className="space-y-5 text-xs">
          {/* EVC Solver Panel */}
          <div className="bg-paper rounded-sm p-5 border border-neutral shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-flow-core">Capability: EVC Intelligence</span>
                <h2 className="text-sm font-heading font-bold text-ink">Google OR-Tools CP-SAT Committee Allocation</h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Enforces institutional conflict-of-interest filters, civil/structural expertise coverage, and travel buffers.
                </p>
              </div>
              <button
                onClick={handleRunEvcSchedule}
                disabled={schedulingEvc}
                className="m-btn text-xs self-start sm:self-auto"
              >
                <Cpu size={14} />
                <span>{schedulingEvc ? "Running CP-SAT Solver..." : "Generate Feasible EVC Schedule"}</span>
              </button>
            </div>

            {evcSchedule && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-950 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Visit Scheduled: {evcSchedule.visit_date} (Status: {evcSchedule.solver_status})</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full">
                    Zero Conflicts
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-ink">Allocated Committee Experts:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    {evcSchedule.experts?.map((ex: any) => (
                      <div key={ex.id} className="p-2.5 bg-paper rounded-sm border border-neutral text-[11px]">
                        <div className="font-heading font-bold text-ink">{ex.full_name}</div>
                        <div className="text-ink-secondary text-[10px]">{ex.designation} • {ex.organization}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Predictive ML Panel */}
          {prediction && (
            <div className="bg-paper rounded-sm p-5 border border-neutral shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-deep-core">Capability: Predictive Intelligence</span>
                  <h2 className="text-sm font-heading font-bold text-ink">Gradient Boosting Delay Risk & SHAP Factors</h2>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Synthetic model trained on 3,000 historical application cycles.
                  </p>
                </div>
                <div className="font-mono font-bold text-deep-core bg-paper border border-neutral px-3 py-1 rounded-full">
                  {prediction.demo_risk_score_display || `Demo risk score: ${Math.round(prediction.delay_risk_score * 100)}/100`}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-heading font-bold text-ink block text-xs">SHAP Contributing Factors (Model Explanations):</span>
                <div className="space-y-1.5">
                  {prediction.shap_factors?.map((f: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-sm bg-surface border border-neutral text-[11px]">
                      <div>
                        <span className="font-bold text-ink">{f.factor}: </span>
                        <span className="text-ink-secondary">{f.description}</span>
                      </div>
                      <span className="font-mono font-bold text-shallow-core">{f.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-ink-secondary italic font-mono">
                Disclaimer: {prediction.disclaimer}
              </p>
            </div>
          )}

          {/* Regulatory Corrigendum Impact Visualizer & Approval Gate */}
          {amendment && impactReport && (
            <div className="bg-paper rounded-sm p-5 border border-neutral shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral pb-3 gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-shallow-core">Signature Capability A</span>
                  <h2 className="text-sm font-heading font-bold text-ink">Regulatory Change Impact Intelligence & Human Approval Gate</h2>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Traverses Amendment &rarr; Clause &rarr; Requirement &rarr; Workflow &rarr; Application &rarr; Recommended Action.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-shallow-rim/30 text-shallow-core font-bold border border-shallow-core/30 self-start sm:self-auto">
                  ILLUSTRATIVE SYNTHETIC AMENDMENT
                </span>
              </div>

              {/* React Flow Graph */}
              <TraceabilityGraph
                amendmentNumber={amendment.amendment_number}
                clauseNumber={impactReport.diffs[0]?.clause_number || "Clause 1.8"}
                ruleCode="RULE-FIRE-01"
                workflowName="Starting a new Programme/Level"
                applicationNumber="APP-2024-MIT-001"
                recommendedAction={impactReport.items[0]?.recommended_action || "Flag for Human Review"}
                applicability={impactReport.items[0]?.applicability || "AMBIGUOUS_RETROSPECTIVE"}
                approvalStatus={impactReport.items[0]?.approval_status || "PENDING"}
                onApprove={() => handleApproveAction(impactReport.items[0].id, "APPROVED")}
                onReject={() => handleApproveAction(impactReport.items[0].id, "REJECTED")}
              />
            </div>
          )}

          <div className="flex justify-between items-center bg-paper p-4 rounded-sm border border-neutral">
            <button
              onClick={() => setActiveStage(3)}
              className="m-btn-outline text-xs py-1.5 px-4"
            >
              ← Back to Stage 3
            </button>
            <Link
              href="/audit"
              className="m-btn text-xs py-1.5 px-4"
            >
              <span>View Immutable SHA-256 Audit Trail</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
