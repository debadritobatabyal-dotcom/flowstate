"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { EvidenceMatrixTable } from "@/components/EvidenceMatrixTable";
import { ReScrutinyPanel } from "@/components/ReScrutinyPanel";
import { TraceabilityGraph } from "@/components/TraceabilityGraph";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
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
    { number: 1, title: "Stage 1: Application Submission & Table 2.3 Route" },
    { number: 2, title: "Stage 2: Document Verification & Scrutiny" },
    { number: 3, title: "Stage 3: Deficiency Response & Targeted Re-Scrutiny (1.8g)" },
    { number: 4, title: "Stage 4: Decision, EVC Scheduling & Regulatory Impact" },
  ];

  if (loading || !appData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-xs font-bold text-slate-500 gap-3">
        <div className="h-7 w-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Meridian Institute Signature Demonstration Case...</span>
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Permanent Notice */}
      <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 rounded-lg flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>DEMO ENVIRONMENT — Synthetic data. No live AICTE databases or APIs are connected.</span>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded text-[11px] font-bold transition"
        >
          <RotateCcw size={12} />
          <span>{resetting ? "Resetting..." : "Reset Scenario"}</span>
        </button>
      </div>

      {/* Case Header */}
      <div className="bg-[#0a192f] text-white p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-1">
            <span>Fictional Signature Scenario</span>
            <span>•</span>
            <span className="font-mono text-amber-400">Meridian Institute of Technology</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Complete End-to-End Regulatory Journey
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Follows Meridian Institute of Technology (Pune, Western Region, AICTE ID: 1-1094827101) from new programme intake through PyMuPDF document extraction, deficiency identification, locked Clause 1.8(g) re-scrutiny, EVC allocation, and corrigendum change-impact evaluation.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target File</span>
          <span className="font-mono font-bold text-base text-blue-300">{appData?.application_number}</span>
          <span className="text-[10px] text-slate-400 block font-mono">Stage: {appData?.current_stage}</span>
        </div>
      </div>

      {/* 4-Stage Stepper Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {stages.map((st) => {
          const isActive = activeStage === st.number;
          const isDone = activeStage > st.number;
          return (
            <button
              key={st.number}
              type="button"
              onClick={() => setActiveStage(st.number)}
              className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                isActive
                  ? "bg-[#0a192f] text-white border-blue-600 shadow"
                  : isDone
                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100/60"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold block ${isActive ? "text-blue-300" : isDone ? "text-emerald-700" : "text-slate-400"}`}>
                  {isDone ? "Completed" : isActive ? "Active Stage" : "Upcoming"}
                </span>
                <span className="text-xs font-bold line-clamp-1">{st.title}</span>
              </div>
              {isDone ? (
                <CheckCircle size={16} className="text-emerald-600 shrink-0 ml-2" />
              ) : (
                <span className={`text-xs font-mono font-black shrink-0 ml-2 ${isActive ? "text-amber-400" : "text-slate-400"}`}>
                  0{st.number}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* STAGE 1: Intake & Table 2.3 Route */}
      {activeStage === 1 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-700">Stage 1 of 4</span>
              <h2 className="text-base font-bold text-slate-900">Application Intake & Configured Route (Table 2.3)</h2>
              <p className="text-xs text-slate-500">
                Meridian Institute submits application for <em>Starting a new Programme/Level</em> in Artificial Intelligence & Data Science.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded">
              Route: SCRUTINY + EVC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Institution Profile & Authority</span>
              <div className="space-y-1 text-slate-700">
                <div><strong>Institution:</strong> Meridian Institute of Technology</div>
                <div><strong>AICTE Permanent ID:</strong> 1-1094827101</div>
                <div><strong>Region & State:</strong> Western Region • Maharashtra (Pune)</div>
                <div><strong>Category:</strong> Private-Self Financed Engineering College</div>
                <div><strong>Authorised User:</strong> Prof. Anand G. Joshi (Director)</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Table 2.3 Statutory Processing Route</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Under APH Table 2.3, <strong>Starting a new Programme/Level</strong> mandates two independent procedural steps:
              </p>
              <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold mt-2">
                <div className="p-2 bg-blue-100 text-blue-900 rounded border border-blue-200">
                  Step 1: Clause 1.8 Scrutiny Committee
                </div>
                <div className="p-2 bg-amber-100 text-amber-900 rounded border border-amber-200">
                  Step 2: Clause 1.9 EVC Physical/Online Visit
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveStage(2)}
              className="flex items-center gap-1.5 bg-[#0a192f] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
            >
              <span>Proceed to Stage 2: Document Verification</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: Document Verification & Evidence Matrix */}
      {activeStage === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700">Stage 2 of 4</span>
                <h2 className="text-base font-bold text-slate-900">Document Verification & Requirement-to-Evidence Matrix</h2>
                <p className="text-xs text-slate-500">
                  PyMuPDF extracted fields across uploaded PDFs. Notice that the Fire Safety NOC is flagged <strong>DEFICIENT</strong> due to expiration.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded">
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



          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveStage(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to Stage 1
            </button>
            <button
              onClick={() => setActiveStage(3)}
              className="flex items-center gap-1.5 bg-[#0a192f] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
            >
              <span>Proceed to Stage 3: Deficiency Response & Clause 1.8(g)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Deficiency Response & Targeted Re-Scrutiny (1.8g) */}
      {activeStage === 3 && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <Lock size={16} className="text-amber-700" />
              <span>APH Clause 1.8(g) Strict Scope Lock</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Re-scrutiny verifies <strong>ONLY</strong> deficiencies previously identified by the Scrutiny Committee. The checklist below contains exactly the Fire NOC deficiency. Newly noticed findings during re-scrutiny cannot expand this list and are sequestered in the separate Out-of-Scope panel.
            </p>
          </div>

          <ReScrutinyPanel
            applicationId={appData?.id || ""}
            checklistData={checklistData}
            onRefresh={loadDemoData}
            canVerify={true}
          />



          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveStage(2)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to Stage 2
            </button>
            <button
              onClick={() => setActiveStage(4)}
              className="flex items-center gap-1.5 bg-[#0a192f] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
            >
              <span>Proceed to Stage 4: Decision & Corrigendum Impact</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: Decision, EVC Scheduling & Corrigendum Impact Gate */}
      {activeStage === 4 && (
        <div className="space-y-5 text-xs">
          {/* EVC Solver Panel */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700">Capability: EVC Intelligence</span>
                <h2 className="text-sm font-bold text-slate-900">Google OR-Tools CP-SAT Committee Allocation</h2>
                <p className="text-xs text-slate-500">
                  Enforces institutional conflict-of-interest filters, civil/structural expertise coverage, and travel buffers.
                </p>
              </div>
              <button
                onClick={handleRunEvcSchedule}
                disabled={schedulingEvc}
                className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded text-xs transition shadow-xs"
              >
                <Cpu size={14} />
                <span>{schedulingEvc ? "Running CP-SAT Solver..." : "Generate Feasible EVC Schedule"}</span>
              </button>
            </div>

            {evcSchedule && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-lg text-emerald-950 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Visit Scheduled: {evcSchedule.visit_date} (Status: {evcSchedule.solver_status})</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                    Zero Institutional Conflicts
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700">Allocated Committee Experts:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    {evcSchedule.experts?.map((ex: any) => (
                      <div key={ex.id} className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                        <div className="font-bold text-slate-800">{ex.full_name}</div>
                        <div className="text-slate-500 text-[10px]">{ex.designation} • {ex.organization}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Predictive ML Panel */}
          {prediction && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-700">Capability: Predictive Intelligence</span>
                  <h2 className="text-sm font-bold text-slate-900">Gradient Boosting Delay Risk & SHAP Factors</h2>
                  <p className="text-xs text-slate-500">
                    Synthetic model trained on 3,000 historical application cycles.
                  </p>
                </div>
                <div className="font-mono font-bold text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1 rounded">
                  {prediction.demo_risk_score_display || `Demo risk score: ${Math.round(prediction.delay_risk_score * 100)}/100`}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">SHAP Contributing Factors (Model Explanations):</span>
                <div className="space-y-1.5">
                  {prediction.shap_factors?.map((f: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800">{f.factor}: </span>
                        <span className="text-slate-600">{f.description}</span>
                      </div>
                      <span className="font-mono font-bold text-rose-700">{f.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Disclaimer: {prediction.disclaimer}
              </p>
            </div>
          )}

          {/* Regulatory Corrigendum Impact Visualizer & Approval Gate */}
          {amendment && impactReport && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-700">Signature Capability A</span>
                  <h2 className="text-sm font-bold text-slate-900">Regulatory Change Impact Intelligence & Human Approval Gate</h2>
                  <p className="text-xs text-slate-500">
                    Traverses Amendment &rarr; Clause &rarr; Requirement &rarr; Workflow &rarr; Application &rarr; Recommended Action.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
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

          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveStage(3)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to Stage 3
            </button>
            <Link
              href="/audit"
              className="flex items-center gap-1.5 bg-[#0a192f] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
            >
              <span>View Immutable SHA-256 Audit Trail</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
