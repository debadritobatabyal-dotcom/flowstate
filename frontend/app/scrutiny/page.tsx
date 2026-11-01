"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { EvidenceMatrixTable } from "@/components/EvidenceMatrixTable";
import { ReScrutinyPanel } from "@/components/ReScrutinyPanel";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  FileText,
  Clock,
  Layers,
  ShieldCheck,
  AlertOctagon,
  Calendar,
  Lock,
  Compass,
  ArrowRight,
  BookOpen,
  Scale,
  Search,
  CheckCircle2,
  FileCheck,
  Cpu,
  Users,
  MapPin,
  Sparkles,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function ScrutinyContent() {
  const searchParams = useSearchParams();
  const appIdParam = searchParams.get("appId") || searchParams.get("app_id");
  const tabParam = searchParams.get("tab");
  const { openWhyModal } = useAppStore();

  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>(tabParam || "matrix");
  const [matrix, setMatrix] = useState<any[]>([]);
  const [deficiencies, setDeficiencies] = useState<any[]>([]);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [clauses, setClauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // EVC Committee Scheduling State
  const [evcSchedule, setEvcSchedule] = useState<any>(null);
  const [schedulingEvc, setSchedulingEvc] = useState(false);
  const [preferredDate, setPreferredDate] = useState("2026-11-20");
  const [panelSize, setPanelSize] = useState(3);
  const [visitMode, setVisitMode] = useState("PHYSICAL");
  const [expertsList, setExpertsList] = useState<any[]>([]);
  const [showRoster, setShowRoster] = useState(false);

  useEffect(() => {
    api.getApplications()
      .then((apps) => {
        setApplications(apps);
        const targetId = appIdParam || (apps.length > 0 ? apps[0].id : null);
        if (targetId) loadAppDetail(targetId);
      })
      .finally(() => setLoading(false));

    api.getClauses().then(setClauses).catch(() => []);
    api.getExperts().then(setExpertsList).catch(() => []);
  }, [appIdParam]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadAppDetail = async (id: string) => {
    try {
      const app = await api.getApplication(id);
      setSelectedApp(app);
      setEvcSchedule(null); // Reset when changing application
      const [mat, defs, chk, dls] = await Promise.all([
        api.getEvidenceMatrix(id).catch(() => []),
        api.getDeficiencies(id).catch(() => []),
        api.getRescrutinyChecklist(id).catch(() => null),
        api.getDeadlines(id).catch(() => ({ deadlines: [] })),
      ]);
      setMatrix(mat);
      setDeficiencies(defs);
      setChecklistData(chk);
      setDeadlines(dls?.deadlines || []);
    } catch {
      // Handle error gracefully
    }
  };

  const handleScheduleEvc = async () => {
    if (!selectedApp) return;
    setSchedulingEvc(true);
    try {
      const res = await api.scheduleEvc(selectedApp.id, preferredDate, panelSize, visitMode);
      setEvcSchedule(res);
    } catch (err: any) {
      alert("EVC Committee scheduling failed: " + err.message);
    } finally {
      setSchedulingEvc(false);
    }
  };

  const tabs = [
    { id: "matrix", label: "Evidence Matrix & Verification", badge: matrix.length, variant: "flow" as const },
    { id: "timeline", label: "Route & Workflow Timeline", variant: "shallow" as const },
    { id: "deficiencies", label: "Deficiencies & Lineage", badge: deficiencies.length, variant: "shallow" as const },
    { id: "rescrutiny", label: "Clause 1.8(g) Targeted Re-Scrutiny", badge: checklistData?.items?.length || 0, variant: "flow" as const },
    { id: "evc", label: "EVC Committee Allocation (CP-SAT)", badge: evcSchedule ? "Allocated" : undefined, variant: "flow" as const },
    { id: "deadlines", label: "Statutory Deadlines", badge: deadlines.length, variant: "deep" as const },
    { id: "clauses", label: "APH 2024–27 Corpus", variant: "deep" as const },
  ];

  if (loading && !selectedApp) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono font-semibold text-ink-secondary">
        Loading Scrutiny & Compliance Dossier...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header with Application Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-secondary mb-1">
            <ContourBadgeSwatch variant="flow" />
            <span>AICTE Approval Directorate</span>
            <span>•</span>
            <span className="text-flow-core font-bold">Procedural Scrutiny & Re-Scrutiny</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Scrutiny & Compliance Dossier
          </h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Deterministic document-to-evidence extraction, procedural vs substantive compliance verification, and locked Clause 1.8(g) re-scrutiny.
          </p>
        </div>

        {/* Application File Selector */}
        <div className="flex items-center gap-2 bg-paper p-1.5 rounded-full border border-neutral shadow-2xs text-xs">
          <span className="text-ink-secondary font-medium px-2">Active Dossier:</span>
          <select
            value={selectedApp?.id || ""}
            onChange={(e) => loadAppDetail(e.target.value)}
            className="bg-surface border border-neutral rounded-full px-3 py-1 font-mono font-bold text-ink focus:outline-none focus:border-flow-core max-w-[280px] sm:max-w-[360px] truncate"
          >
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.application_number} — {a.institution_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Application Summary Strip */}
      {selectedApp && (
        <div className="bg-navy text-paper p-5 rounded-sm border border-navy-light shadow-sheet grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-neutral/70 font-mono font-bold uppercase tracking-wider block">Application Dossier</span>
            <span className="font-mono font-bold text-sm text-flow-rim">{selectedApp.application_number}</span>
            <span className="text-[10px] text-neutral/80 block mt-0.5">AY {selectedApp.academic_year}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral/70 font-mono font-bold uppercase tracking-wider block">Institution Profile</span>
            <span className="font-heading font-bold text-paper line-clamp-1">{selectedApp.institution_name}</span>
            <span className="text-[10px] text-neutral/80 font-mono">AICTE: {selectedApp.institution_aicte_id}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral/70 font-mono font-bold uppercase tracking-wider block">Table 2.3 Route</span>
            <span className="font-semibold text-neutral line-clamp-1">{selectedApp.application_type}</span>
            <span className="text-[10px] text-flow-rim font-medium">Scrutiny + EVC Mandated</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral/70 font-mono font-bold uppercase tracking-wider block">Current Stage</span>
            <span className="font-mono font-bold text-shallow-rim bg-navy-light border border-neutral/30 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
              {selectedApp.current_stage}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral/70 font-mono font-bold uppercase tracking-wider block">Delay Risk</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`h-2.5 w-2.5 rounded-full ${
                selectedApp.delay_risk_predicted >= 0.65 ? "bg-rose-400" : selectedApp.delay_risk_predicted >= 0.35 ? "bg-shallow-rim" : "bg-emerald-400"
              }`} />
              <span className="font-mono font-bold text-paper">
                Score: {Math.round(selectedApp.delay_risk_predicted * 100)}/100
              </span>
            </div>
            <span className="text-[10px] text-neutral/60 block mt-0.5">Gradient Boosting Engine</span>
          </div>
        </div>
      )}

      {/* Dossier Tabs */}
      <div className="border-b border-neutral flex flex-wrap gap-2 text-xs font-semibold">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-1.5 transition ${
                active
                  ? "border-flow-core text-flow-core font-heading font-bold"
                  : "border-transparent text-ink-secondary hover:text-ink font-heading"
              }`}
            >
              <ContourBadgeSwatch variant={tab.variant} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                  active ? "bg-flow-core text-paper" : "bg-surface border border-neutral text-ink"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {/* 1. Evidence Matrix */}
      {activeTab === "matrix" && selectedApp && (
        <div className="space-y-4">
          <div className="bg-paper p-3.5 rounded-sm border border-neutral text-xs text-ink flex items-start gap-2.5 shadow-2xs">
            <Scale size={16} className="text-flow-core shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-heading font-bold text-ink">Substantive Requirement vs Procedural Evidence Lineage: </span>
              Every statutory requirement links to extracted OCR page snippets and automated validation rules. Authorized officers review each item and enter human verification determinations. Click <strong>Why?</strong> to inspect deterministic rule calculation and audit trace.
            </div>
          </div>
          <EvidenceMatrixTable
            items={matrix}
            applicationId={selectedApp.id}
            onRefresh={() => loadAppDetail(selectedApp.id)}
            canVerify={true}
          />
        </div>
      )}

      {/* 2. Route & Timeline */}
      {activeTab === "timeline" && selectedApp && (
        <div className="bg-paper p-6 rounded-sm border border-neutral shadow-xs space-y-4 text-xs">
          <div className="border-b border-neutral pb-2">
            <h2 className="text-sm font-heading font-bold text-ink">Application Lifecycle & Routing History</h2>
            <p className="text-ink-secondary text-[11px]">Chronological transition log across Table 2.3 approval gates</p>
          </div>
          <div className="space-y-3">
            {(!selectedApp.events || selectedApp.events.length === 0) ? (
              <p className="text-ink-secondary italic py-4 text-center font-mono">No stage transition events recorded yet.</p>
            ) : (
              selectedApp.events.map((ev: any, idx: number) => (
                <div key={ev.id || idx} className="flex items-start gap-3 p-3.5 bg-surface rounded-sm border border-neutral">
                  <Clock size={16} className="text-flow-core mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-ink">{ev.event_type}</span>
                      <span className="text-[10px] font-mono text-ink-secondary">{new Date(ev.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-ink-secondary">Stage moved from <strong className="font-mono text-ink">{ev.from_stage || "START"}</strong> to <strong className="font-mono text-flow-core">{ev.to_stage}</strong>.</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Deficiency Lineage */}
      {activeTab === "deficiencies" && selectedApp && (
        <div className="bg-paper p-6 rounded-sm border border-neutral shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-neutral pb-3">
            <div>
              <h2 className="text-sm font-heading font-bold text-ink">Deficiency Records & Audit Lineage</h2>
              <p className="text-xs text-ink-secondary">Complete 5-stage deficiency lifecycle from initial finding to resolution</p>
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
              {deficiencies.length} Registered
            </span>
          </div>

          <div className="space-y-4">
            {deficiencies.map((d: any) => (
              <div key={d.id} className="p-4 rounded-sm border border-neutral bg-surface space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-700 bg-paper border border-neutral px-2 py-0.5 rounded-full text-xs">
                      {d.deficiency_number}
                    </span>
                    <span className="text-ink font-heading font-bold text-xs">APH Clause {d.aph_clause_number}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    d.status === "RESOLVED"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}>
                    {d.status}
                  </span>
                </div>

                {/* 5-Stage Lineage Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-paper border border-neutral rounded-sm space-y-1">
                    <span className="text-[10px] font-mono font-bold text-ink-secondary uppercase block">
                      1. Original Scrutiny Observation
                    </span>
                    <p className="text-ink leading-relaxed">{d.observation}</p>
                  </div>

                  <div className="p-3 bg-paper border border-neutral rounded-sm space-y-1">
                    <span className="text-[10px] font-mono font-bold text-flow-core uppercase block">
                      2. Institutional Response & Rectification
                    </span>
                    <p className="text-ink leading-relaxed">
                      {d.institution_response || "Awaiting formal response upload from institution."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Locked Clause 1.8(g) Targeted Re-Scrutiny */}
      {activeTab === "rescrutiny" && selectedApp && (
        <div className="space-y-4">
          <div className="bg-paper p-3.5 rounded-sm border border-neutral text-xs text-ink flex items-start gap-2.5 shadow-2xs">
            <Lock size={16} className="text-flow-core shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-heading font-bold text-ink">Strict Statutory Lock under Clause 1.8(g): </span>
              Targeted re-scrutiny verifies <strong>ONLY</strong> deficiencies formally communicated in the initial Letter of Deficiency. Any new observations are segregated into the isolated Out-of-Scope Panel and cannot delay the current approval cycle.
            </div>
          </div>
          <ReScrutinyPanel
            applicationId={selectedApp.id}
            checklistData={checklistData}
            onRefresh={() => loadAppDetail(selectedApp.id)}
            canVerify={true}
          />
        </div>
      )}

      {/* 5. EVC Committee Allocation (CP-SAT Constraint Satisfaction) */}
      {activeTab === "evc" && selectedApp && (
        <div className="space-y-5 text-xs">
          {/* EVC Solver Configuration Card */}
          <div className="bg-paper rounded-sm p-5 border border-neutral shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral pb-3 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ContourBadgeSwatch variant="flow" />
                  <span className="text-[10px] font-mono font-bold uppercase text-flow-core">
                    Constraint Satisfaction Optimization
                  </span>
                </div>
                <h2 className="text-base font-heading font-bold text-ink">
                  Expert Visit Committee (EVC) Allocation Engine
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5 max-w-2xl">
                  Automated peer committee scheduling powered by Google OR-Tools CP-SAT. Strictly eliminates institutional conflicts of interest, ensures civil/structural infrastructure coverage, and enforces travel buffer feasibility.
                </p>
              </div>

              <button
                type="button"
                onClick={handleScheduleEvc}
                disabled={schedulingEvc}
                className="m-btn text-xs self-start md:self-auto shrink-0"
              >
                <Cpu size={14} className={schedulingEvc ? "animate-spin" : ""} />
                <span>{schedulingEvc ? "Running CP-SAT Solver..." : "Run CP-SAT Committee Allocation"}</span>
              </button>
            </div>

            {/* Allocation Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-mono font-bold text-ink-secondary uppercase mb-1">
                  Preferred Inspection Date:
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-2 border border-neutral rounded-sm bg-surface font-mono font-bold text-xs text-ink focus:outline-none focus:border-flow-core"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-ink-secondary uppercase mb-1">
                  Committee Panel Size:
                </label>
                <select
                  value={panelSize}
                  onChange={(e) => setPanelSize(Number(e.target.value))}
                  className="w-full p-2 border border-neutral rounded-sm bg-surface font-semibold text-xs text-ink focus:outline-none focus:border-flow-core"
                >
                  <option value={3}>3 Experts (Standard Regulatory Panel)</option>
                  <option value={4}>4 Experts (Expanded / Multi-Disciplinary)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-ink-secondary uppercase mb-1">
                  Inspection Mode:
                </label>
                <select
                  value={visitMode}
                  onChange={(e) => setVisitMode(e.target.value)}
                  className="w-full p-2 border border-neutral rounded-sm bg-surface font-semibold text-xs text-ink focus:outline-none focus:border-flow-core"
                >
                  <option value="PHYSICAL">Physical On-Site Verification</option>
                  <option value="HYBRID">Hybrid (Video Teleconference + Physical)</option>
                </select>
              </div>
            </div>
          </div>

          {/* EVC Solver Allocation Result */}
          {evcSchedule ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-950 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-heading font-bold text-emerald-900 text-sm">
                        Feasible Committee Allocation Computed ({evcSchedule.solver_status})
                      </span>
                      <span className="block text-[11px] text-emerald-800 font-mono">
                        Target Inspection Date: {evcSchedule.visit_date} • Mode: {visitMode}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full self-start sm:self-auto">
                    Zero Conflicts of Interest
                  </span>
                </div>

                {/* Constraint Proof Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 bg-paper/80 rounded-sm border border-emerald-200">
                    <strong className="text-ink block mb-0.5">1. Conflict Invariance</strong>
                    <p className="text-ink-secondary">
                      Zero experts share current or historical affiliation with <em>{selectedApp.institution_name}</em>.
                    </p>
                  </div>
                  <div className="p-2.5 bg-paper/80 rounded-sm border border-emerald-200">
                    <strong className="text-ink block mb-0.5">2. Infrastructure Expertise</strong>
                    <p className="text-ink-secondary">
                      Civil/Structural Engineering expert included for physical built-up area and safety verification.
                    </p>
                  </div>
                  <div className="p-2.5 bg-paper/80 rounded-sm border border-emerald-200">
                    <strong className="text-ink block mb-0.5">3. Geographic Neutrality</strong>
                    <p className="text-ink-secondary">
                      Cross-regional allocation compliant with APH travel buffer and independence directives.
                    </p>
                  </div>
                </div>
              </div>

              {/* Allocated Experts Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-ink text-sm">
                    Allocated Expert Committee Panel ({evcSchedule.experts?.length || 0} Members)
                  </h3>
                  <span className="text-[10px] font-mono text-ink-secondary">
                    Official AICTE Expert Roster Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {evcSchedule.experts?.map((ex: any, idx: number) => (
                    <div
                      key={ex.id || idx}
                      className="p-4 bg-paper rounded-sm border border-neutral shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-heading font-bold text-ink text-xs">{ex.full_name}</div>
                          <div className="text-ink-secondary text-[11px] font-medium">{ex.designation}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-flow-rim/30 text-flow-core font-bold rounded-full">
                          Panel #{idx + 1}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-ink-secondary border-t border-neutral/50 pt-2">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-ink-secondary shrink-0" />
                          <span className="line-clamp-1">{ex.organization}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-ink-secondary shrink-0" />
                          <span>{ex.city}</span>
                        </div>
                      </div>

                      {ex.expertise_areas && ex.expertise_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {ex.expertise_areas.map((area: string, i: number) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono bg-surface border border-neutral px-1.5 py-0.5 rounded-full text-ink font-semibold"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-paper rounded-sm border border-neutral text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-surface border border-neutral flex items-center justify-center mx-auto text-flow-core">
                <Users size={20} />
              </div>
              <h3 className="font-heading font-bold text-ink text-sm">No Committee Allocated Yet</h3>
              <p className="text-xs text-ink-secondary max-w-md mx-auto">
                Configure preferred dates and parameters above, then click <strong>"Run CP-SAT Committee Allocation"</strong> to solve conflict-of-interest constraints and allocate peer experts.
              </p>
            </div>
          )}

          {/* Collapsible Peer Expert Roster */}
          <div className="bg-paper rounded-sm border border-neutral overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setShowRoster(!showRoster)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-surface/50 transition"
            >
              <div className="flex items-center gap-2">
                <Users size={16} className="text-ink-secondary" />
                <span className="font-heading font-bold text-ink text-xs">
                  Available AICTE Peer Experts Roster ({expertsList.length} Active Members)
                </span>
              </div>
              {showRoster ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showRoster && (
              <div className="p-4 border-t border-neutral bg-surface/30 divide-y divide-neutral/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {expertsList.map((ex) => (
                    <div key={ex.id} className="p-3 bg-paper rounded-sm border border-neutral/70 space-y-1">
                      <div className="font-heading font-bold text-ink text-xs">{ex.full_name}</div>
                      <div className="text-[11px] text-ink-secondary">{ex.designation} • {ex.organization}</div>
                      <div className="text-[10px] font-mono text-ink-secondary">{ex.city}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ex.expertise_areas?.slice(0, 2).map((a: string, i: number) => (
                          <span key={i} className="text-[9px] bg-surface border border-neutral px-1.5 py-0.2 rounded-full font-mono">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Statutory Deadlines */}
      {activeTab === "deadlines" && (
        <div className="bg-paper p-6 rounded-sm border border-neutral shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-neutral pb-2">
            <div>
              <h2 className="text-sm font-heading font-bold text-ink">Statutory Appeal Windows & Deadlines</h2>
              <p className="text-xs text-ink-secondary">Deterministic statutory calendar calculation governed by APH 2024–27</p>
            </div>
            <Calendar size={18} className="text-flow-core" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-sm border border-neutral bg-surface space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-ink">Clause 1.11 Appeal Clock</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-paper border border-neutral text-flow-core font-bold">
                  7 Calendar Days
                </span>
              </div>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                Triggered strictly upon uploading the formal <strong>Letter of Deficiency</strong> by the Scrutiny Committee. Institution may submit rectified documents or appeal within this statutory window.
              </p>
            </div>

            <div className="p-4 rounded-sm border border-neutral bg-surface space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-ink">Clause 2.24 SAC Standing Appellate Clock</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-paper border border-neutral text-deep-core font-bold">
                  7 Calendar Days
                </span>
              </div>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                Triggered strictly upon official publication of the <strong>Executive Committee Decision</strong>. Independent Standing Appellate Committee convenes to hear final appeals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Regulatory Baseline Clauses */}
      {activeTab === "clauses" && (
        <div className="bg-paper p-6 rounded-sm border border-neutral shadow-xs space-y-4 text-xs">
          <div className="border-b border-neutral pb-2">
            <h2 className="text-sm font-heading font-bold text-ink">Authoritative AICTE APH 2024–2027 Provisions</h2>
            <p className="text-xs text-ink-secondary">Statutory corpus baseline for procedural verification</p>
          </div>
          <div className="space-y-3">
            {clauses.map((c) => (
              <div key={c.id} className="p-3.5 bg-surface rounded-sm border border-neutral space-y-1">
                <div className="flex items-center justify-between font-heading font-bold text-ink">
                  <span>Clause {c.clause_number}: {c.title}</span>
                  <span className="text-[10px] font-mono bg-paper border border-neutral text-flow-core px-2 py-0.5 rounded-full font-bold">
                    Statutory Baseline
                  </span>
                </div>
                <p className="text-ink-secondary text-[11px] leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScrutinyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-ink-secondary">Loading Scrutiny & Compliance Dossier...</div>}>
      <ScrutinyContent />
    </Suspense>
  );
}
