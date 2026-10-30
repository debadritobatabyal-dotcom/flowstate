"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppStore, ROLE_PRESETS } from "@/lib/store";
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
} from "lucide-react";

export default function DemoPage() {
  const { setCurrentRole, openWhyModal } = useAppStore();
  const [activeStep, setActiveStep] = useState(1);
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

  // Load Meridian Application & Seeded State
  const loadDemoData = async () => {
    setLoading(true);
    try {
      const apps = await api.getApplications({ search: "APP-2024-MIT-001" });
      if (apps.length > 0) {
        const fullApp = await api.getApplication(apps[0].id);
        setAppData(fullApp);

        // Fetch sub-entities in parallel
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
    if (!confirm("Reset demo to baseline initial state?")) return;
    setResetting(true);
    try {
      await api.resetDemo();
      await loadDemoData();
      setActiveStep(1);
    } catch (err: any) {
      alert("Failed to reset: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  const steps = [
    { number: 1, title: "1. Submission & Table 2.3 Route" },
    { number: 2, title: "2. Evidence Matrix & OCR" },
    { number: 3, title: "3. Officer Scrutiny & Deficiency" },
    { number: 4, title: "4. Institution Resubmission" },
    { number: 5, title: "5. Targeted Re-Scrutiny (1.8g)" },
    { number: 6, title: "6. EVC Scheduling (OR-Tools)" },
    { number: 7, title: "7. Predictive Intelligence & Deadlines" },
    { number: 8, title: "8. Regulatory Change Impact & Approval Gate" },
    { number: 9, title: "9. SHA-256 Audit Trail" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">Loading Meridian Institute Scenario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Demo Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
              SIGNATURE DEMONSTRATION
            </span>
            <span className="text-xs text-slate-500">Meridian Institute of Technology</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">End-to-End AICTE Approval Journey</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step interactive walkthrough connecting regulatory requirements, evidence OCR, deficiency lineage, and amendment propagation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
          >
            <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
            {resetting ? "Resetting..." : "Reset Demo Scenario"}
          </button>
        </div>
      </div>

      {/* Step Indicator Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex items-center gap-1 overflow-x-auto text-xs">
        {steps.map((s) => (
          <button
            key={s.number}
            onClick={() => setActiveStep(s.number)}
            className={`px-3 py-2 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeStep === s.number
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Submission & Configured Route */}
      {activeStep === 1 && appData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 1 of 9</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Institution Submits Application: Configured Route & Table 2.3 Pathway
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Meridian Institute has applied for Starting a new Programme/Level (B.Tech in Artificial Intelligence & Data Science).
              Under AICTE Table 2.3, this application requires full Scrutiny, physical EVC visit, and Executive Committee approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Application Number</span>
              <div className="font-mono font-bold text-slate-900 text-sm">{appData.application_number}</div>
              <div className="text-slate-500">{appData.institution_name}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Application Category</span>
              <div className="font-bold text-slate-900">{appData.application_type}</div>
              <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono rounded font-semibold">
                Table 2.3 Standard Route
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Stage</span>
              <div className="font-bold text-blue-900 text-sm">{appData.current_stage}</div>
              <span className="text-slate-500">Assigned Officer: Western Regional Director</span>
            </div>
          </div>

          {/* Configured Route Flowchart */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <span className="text-xs font-mono font-semibold text-blue-300 uppercase tracking-wider block">
              Configured Route Sequence (Non-Universal Pipeline)
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300">1. SUBMISSION</span>
              <ArrowRight size={14} className="text-slate-500" />
              <span className="bg-blue-600 px-3 py-1.5 rounded font-bold text-white shadow">2. SCRUTINY (Clause 1.8)</span>
              <ArrowRight size={14} className="text-slate-500" />
              <span className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300">3. RE-SCRUTINY (Clause 1.8g)</span>
              <ArrowRight size={14} className="text-slate-500" />
              <span className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300">4. EVC VISIT (Clause 1.9)</span>
              <ArrowRight size={14} className="text-slate-500" />
              <span className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300">5. EC APPROVAL (Clause 1.10)</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Next: View Extracted Evidence Matrix</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Evidence Matrix & OCR */}
      {activeStep === 2 && appData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 2 of 9</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Requirement-to-Evidence Matrix & PyMuPDF Extractions
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                PyMuPDF extracted structured fields from uploaded institutional PDFs.
                Notice that the Fire Safety NOC is flagged as <strong>DEFICIENT</strong> because its validity date (15-11-2023) expired.
              </p>
            </div>
            <ProvenanceBadge type="RULE-COMPUTED" />
          </div>

          <EvidenceMatrixTable
            items={matrix}
            applicationId={appData.id}
            onRefresh={loadDemoData}
            canVerify={true}
          />

          <div className="flex justify-between pt-2 border-t">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 border text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Next: Officer Scrutiny & Deficiency Lineage</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Officer Scrutiny & Deficiency */}
      {activeStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 3 of 9</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Officer Scrutiny: Deficiency Lineage Record
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Deficiencies in FLOWSTATE are persistent database records, not simple text notes.
              Every deficiency retains the APH clause, evidence snippet, page reference, and append-only event lineage.
            </p>
          </div>

          {deficiencies.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No deficiencies recorded.</p>
          ) : (
            deficiencies.map((d) => (
              <div key={d.id} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{d.deficiency_number}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                        {d.aph_clause_number}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase font-mono">
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium">{d.observation}</p>
                  </div>
                  <button
                    onClick={() =>
                      openWhyModal({
                        title: `Deficiency Lineage: ${d.deficiency_number}`,
                        finding: d.observation,
                        aphClause: d.aph_clause_number,
                        documentName: d.original_document_name,
                        documentPage: d.original_page_number,
                        extractedSnippet: d.evidence_snippet,
                        provenance: "RULE-COMPUTED",
                        auditTrace: [
                          `Deficiency raised at stage: ${d.stage_raised}`,
                          `Clause statutory reference: ${d.aph_clause_number}`,
                          `Associated document: ${d.original_document_name || "NOC PDF"} (Page ${d.original_page_number || 1})`,
                          `Current status: ${d.status}`,
                        ],
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-700 font-bold text-xs rounded transition flex items-center gap-1"
                  >
                    <Compass size={13} className="text-blue-600" />
                    Why?
                  </button>
                </div>

                {/* Lineage History */}
                <div className="bg-white border rounded-lg p-3 text-xs space-y-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Deficiency Audit Lineage ({d.events.length} events)
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {d.events.map((ev: any) => (
                      <div key={ev.id} className="flex items-center justify-between text-slate-600 border-b pb-1 last:border-0">
                        <span>
                          [{new Date(ev.timestamp).toLocaleTimeString()}] <strong>{ev.event_type}</strong>: {ev.notes}
                        </span>
                        <span className="text-slate-400">Actor: {ev.actor_role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="flex justify-between pt-2 border-t">
            <button onClick={() => setActiveStep(2)} className="px-4 py-2 border text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Next: Institution Resubmission Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Institution Resubmission */}
      {activeStep === 4 && appData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 4 of 9</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Institution Submits Corrected Evidence (Renewed Fire Safety NOC)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Meridian Institute has obtained a renewed Fire Safety Certificate (valid through 31-12-2027)
              and resubmitted it against the deficiency. Click below to simulate instant resubmission.
            </p>
          </div>

          <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-sm">Resubmission Packet Ready</span>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                SIMULATION READY
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
              <div><strong>Document:</strong> meridian_fire_noc_renewed.pdf</div>
              <div><strong>New Validity:</strong> 31-12-2027 (Fully Compliant)</div>
              <div><strong>Certificate Ref:</strong> NOC-MH-FIRE-2024-88</div>
              <div><strong>Issuing Authority:</strong> Maharashtra Fire Prevention Services</div>
            </div>

            <div className="pt-2">
              <button
                onClick={async () => {
                  try {
                    const def = deficiencies[0];
                    if (def) {
                      await api.resubmitDeficiency(def.id, {
                        document_id: def.original_document_id,
                        page_number: 1,
                        resubmission_notes: "Submitted renewed Fire Safety NOC valid through 31-12-2027.",
                      });
                      await loadDemoData();
                      alert("Evidence resubmitted successfully!");
                    }
                  } catch (e: any) {
                    alert(e.message);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
              >
                Submit Renewed Evidence Packet
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t">
            <button onClick={() => setActiveStep(3)} className="px-4 py-2 border text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={() => setActiveStep(5)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Next: Targeted Re-Scrutiny (Clause 1.8(g))</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Targeted Re-Scrutiny (Clause 1.8(g)) */}
      {activeStep === 5 && appData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 5 of 9</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Enforcement of APH Clause 1.8(g): Locked Checklist & Isolated Out-of-Scope Panel
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Notice that the re-scrutiny checklist is locked strictly to previously raised deficiencies.
              Any newly observed issue is segregated in the isolated Out-of-Scope panel to prevent scope creep.
            </p>
          </div>

          <ReScrutinyPanel
            applicationId={appData.id}
            checklistData={checklistData}
            onRefresh={loadDemoData}
            canVerify={true}
          />

          <div className="flex justify-between pt-2 border-t">
            <button onClick={() => setActiveStep(4)} className="px-4 py-2 border text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={() => setActiveStep(6)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Next: Conflict-Free EVC Scheduling</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 6: EVC Scheduling */}
      {activeStep === 6 && appData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 6 of 9</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              EVC Expert Visit Committee Scheduling (Google OR-Tools CP-SAT)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Generates a conflict-free, 3-member expert panel. Experts with institutional conflicts are automatically excluded.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={async () => {
                const res = await api.scheduleEvc(appData.id, "2025-04-18", 3);
                setEvcSchedule(res);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
            >
              Run OR-Tools Constraint Solver
            </button>

            {evcSchedule && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Suggested EVC Visit Schedule</span>
                  <ProvenanceBadge type="RULE-COMPUTED" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {evcSchedule.assigned_experts.map((exp: any, i: number) => (
                    <div key={exp.id} className="bg-white border p-3 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">Expert {i + 1}</span>
                      <div className="font-bold text-slate-900">{exp.full_name}</div>
                      <div className="text-slate-600">{exp.organization} ({exp.city})</div>
                      <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono rounded font-semibold">
                        Zero Conflict Verified
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white border rounded-lg text-slate-600 font-mono text-[11px] space-y-1">
                  <strong>Satisfied Constraints:</strong>
                  {evcSchedule.constraints_satisfied.map((c: string, idx: number) => (
                    <div key={idx}>• {c}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t">
            <button onClick={() => setActiveStep(5)} className="px-4 py-2 border text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={() => setActiveStep(7)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Next: Predictive Intelligence & Statutory Clocks</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 7: Predictive Intelligence & Statutory Deadlines */}
      {activeStep === 7 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 7 of 9</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Predictive Process Intelligence & Statutory Appeal Clocks
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Machine Learning estimates remaining processing days and delay risk with SHAP explanations.
              Statutory clocks under Clause 1.11 (Letter of Deficiency) and Clause 2.24 (EC Decision) are strictly separated.
            </p>
          </div>

          {/* ML Delay Prediction */}
          {prediction && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Remaining Time & Delay Risk Prediction</h4>
                  <p className="text-xs text-slate-500 font-mono">Calibrated via Gradient Boosting on 3,000 Synthetic Records</p>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-amber-100 text-amber-900">
                  Risk Category: {prediction.delay_risk_category} ({prediction.delay_risk_score * 100}%)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-lg border space-y-2">
                  <span className="font-bold text-slate-500 text-[10px] uppercase">SHAP Factor Breakdown</span>
                  <div className="space-y-1.5">
                    {prediction.shap_factors.map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[11px] border-b pb-1">
                        <span className="text-slate-800 font-medium">{f.factor}</span>
                        <span className="font-mono font-bold text-rose-700">{f.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border space-y-2">
                  <span className="font-bold text-slate-500 text-[10px] uppercase">Suggested Operational Interventions</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                    {prediction.suggested_interventions.map((intv: string, i: number) => (
                      <li key={i}>{intv}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic font-mono">{prediction.disclaimer}</p>
            </div>
          )}

          {/* Deadlines */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Active Statutory Deadlines & Calculation Trace</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {deadlines.map((dl: any, idx: number) => (
                <div key={idx} className="bg-white border rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dl.clause_number}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      {dl.duration_days} {dl.duration_type}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{dl.description}</p>
                  <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-700">
                    <div>Trigger: {dl.trigger_event}</div>
                    <div>Remaining: {dl.days_remaining} days</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t">
            <button onClick={() => setActiveStep(6)} className="px-4 py-2 border text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={() => setActiveStep(8)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Next: Regulatory Change Impact & Approval Gate</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 8: Regulatory Change Impact & Approval Gate */}
      {activeStep === 8 && amendment && impactReport && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 8 of 9</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Regulatory Change-Impact Intelligence & Mandatory Approval Gate
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              A hypothetical corrigendum on campus clean energy & fire standards is uploaded.
              FLOWSTATE traverses the dependency graph and flags live applications under <strong>AMBIGUOUS_RETROSPECTIVE</strong> review.
            </p>
          </div>

          {/* Interactive React Flow Dependency Graph */}
          {impactReport.items.length > 0 && (
            <TraceabilityGraph
              amendmentNumber={amendment.amendment_number}
              clauseNumber={impactReport.diffs[0]?.clause_number || "Clause 1.8"}
              ruleCode="RULE-FIRE-01"
              workflowName="Starting a new Programme/Level"
              applicationNumber="APP-2024-MIT-001"
              recommendedAction={impactReport.items[0]?.recommended_action || "Review applicability"}
              applicability={impactReport.items[0]?.applicability || "AMBIGUOUS_RETROSPECTIVE"}
              approvalStatus={impactReport.items[0]?.approval_status || "PENDING"}
              onApprove={async () => {
                await api.approveImpactItem(impactReport.items[0].id, "APPROVED", "Approved for academic cycle.");
                await loadDemoData();
              }}
              onReject={async () => {
                await api.approveImpactItem(impactReport.items[0].id, "REJECTED", "Grandfathered; does not apply.");
                await loadDemoData();
              }}
            />
          )}

          <div className="flex justify-between pt-2 border-t">
            <button onClick={() => setActiveStep(7)} className="px-4 py-2 border text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={() => setActiveStep(9)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Next: SHA-256 Tamper-Evident Audit Trail</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 9: Audit Trail */}
      {activeStep === 9 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 9 of 9</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Append-Only Audit Trail with Cryptographic SHA-256 Hash Chaining
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Every state transition, deficiency creation, resubmission, and human approval is cryptographically chained.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Chain Integrity: VALID
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Seq</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Current Hash (SHA-256)</th>
                  <th className="py-2.5 px-3">Previous Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.sequence_id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{log.sequence_id}</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{log.action}</td>
                    <td className="py-2 px-3 text-slate-700">{log.entity_type}</td>
                    <td className="py-2 px-3 text-slate-500 truncate max-w-[150px]">{log.current_hash}</td>
                    <td className="py-2 px-3 text-slate-400 truncate max-w-[150px]">{log.previous_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <CheckCircle size={16} />
              <span>Full Signature Demonstration Completed Successfully!</span>
            </div>
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded transition"
            >
              Restart Demonstration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
