"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { EvidenceMatrixTable } from "@/components/EvidenceMatrixTable";
import { ReScrutinyPanel } from "@/components/ReScrutinyPanel";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
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
} from "lucide-react";

function ScrutinyContent() {
  const searchParams = useSearchParams();
  const appIdParam = searchParams.get("appId") || searchParams.get("app_id");
  const { openWhyModal } = useAppStore();

  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("matrix");
  const [matrix, setMatrix] = useState<any[]>([]);
  const [deficiencies, setDeficiencies] = useState<any[]>([]);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [clauses, setClauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplications()
      .then((apps) => {
        setApplications(apps);
        const targetId = appIdParam || (apps.length > 0 ? apps[0].id : null);
        if (targetId) loadAppDetail(targetId);
      })
      .finally(() => setLoading(false));

    api.getClauses().then(setClauses).catch(() => []);
  }, [appIdParam]);

  const loadAppDetail = async (id: string) => {
    try {
      const app = await api.getApplication(id);
      setSelectedApp(app);
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

  const tabs = [
    { id: "matrix", label: "Evidence Matrix & Verification", badge: matrix.length },
    { id: "timeline", label: "Application Route & Timeline" },
    { id: "deficiencies", label: "Deficiencies & Lineage", badge: deficiencies.length },
    { id: "rescrutiny", label: "Clause 1.8(g) Targeted Re-Scrutiny", badge: checklistData?.items?.length || 0 },
    { id: "deadlines", label: "Statutory Deadlines", badge: deadlines.length },
    { id: "clauses", label: "Regulatory Baseline" },
  ];

  if (loading && !selectedApp) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs font-semibold text-slate-500">
        Loading Scrutiny & Compliance Dossier...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header with Application Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>AICTE Approval Process</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">Scrutiny & Re-Scrutiny Directorate</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Scrutiny & Compliance Dossier
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Document verification, substantive vs procedural requirement linking, and locked re-scrutiny under Clause 1.8(g).
          </p>
        </div>

        {/* Application File Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-300 shadow-xs text-xs">
          <span className="text-slate-500 font-medium px-2">Active File:</span>
          <select
            value={selectedApp?.id || ""}
            onChange={(e) => loadAppDetail(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-3 py-1 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
        <div className="bg-[#0a192f] text-white p-4 rounded-xl border border-slate-800 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Application</span>
            <span className="font-mono font-bold text-sm text-blue-300">{selectedApp.application_number}</span>
            <span className="text-[10px] text-slate-300 block">AY {selectedApp.academic_year}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Institution</span>
            <span className="font-bold text-slate-100 line-clamp-1">{selectedApp.institution_name}</span>
            <span className="text-[10px] text-slate-300 font-mono">AICTE: {selectedApp.institution_aicte_id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Table 2.3 Route</span>
            <span className="font-semibold text-slate-200 line-clamp-1">{selectedApp.application_type}</span>
            <span className="text-[10px] text-emerald-400 font-medium">Scrutiny + EVC Mandated</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Workflow Stage</span>
            <span className="font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded inline-block mt-0.5">
              {selectedApp.current_stage}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Delay Risk</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`h-2.5 w-2.5 rounded-full ${
                selectedApp.delay_risk_predicted >= 0.65 ? "bg-rose-400" : selectedApp.delay_risk_predicted >= 0.35 ? "bg-amber-400" : "bg-emerald-400"
              }`} />
              <span className="font-mono font-bold text-slate-100">
                Score: {Math.round(selectedApp.delay_risk_predicted * 100)}/100
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">Gradient Boosting</span>
          </div>
        </div>
      )}

      {/* Dossier Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                active
                  ? "border-blue-700 text-blue-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  active ? "bg-blue-100 text-blue-900" : "bg-slate-200 text-slate-700"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "matrix" && selectedApp && (
        <div className="space-y-4">
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
            <Scale size={16} className="text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Substantive vs Procedural Traceability: </span>
              Every row shows the institution requirement (what must be satisfied) alongside the procedural APH clause (how it is verified). Click <strong>Why?</strong> to inspect full document page extractions and cryptographic audit proofs.
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

      {activeTab === "timeline" && selectedApp && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Application Route History & Event Log</h2>
          <div className="space-y-3">
            {selectedApp.events?.map((ev: any, idx: number) => (
              <div key={ev.id || idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <Clock size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ev.event_type}</span>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(ev.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 mt-1">Stage moved from {ev.from_stage || "START"} to {ev.to_stage}.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "deficiencies" && selectedApp && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Deficiency Records & Audit Lineage</h2>
              <p className="text-xs text-slate-500">Persistent historical observations across all scrutiny cycles</p>
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold">
              {deficiencies.length} Registered
            </span>
          </div>

          <div className="space-y-3">
            {deficiencies.map((d: any) => (
              <div key={d.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-700">{d.deficiency_number}</span>
                    <span className="text-slate-600 font-semibold">• APH Clause {d.aph_clause_number}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    d.status === "RESOLVED" ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                  }`}>
                    {d.status}
                  </span>
                </div>
                <p className="text-slate-800 font-medium">{d.observation}</p>
                {d.institution_response && (
                  <div className="p-2.5 bg-blue-50/60 rounded border border-blue-200 text-blue-950 mt-2">
                    <span className="font-bold">Institution Response: </span>
                    {d.institution_response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "rescrutiny" && selectedApp && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Lock size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Strict Enforcement of APH Clause 1.8(g): </span>
              Re-scrutiny verifies <strong>ONLY</strong> deficiencies previously communicated in the Letter of Deficiency. Newly observed issues during re-scrutiny are placed in a separate, isolated Out-of-Scope panel and cannot expand the checklist.
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

      {activeTab === "deadlines" && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Statutory Appeal Windows & Compliance Deadlines</h2>
              <p className="text-xs text-slate-500">Deterministic statutory date arithmetic (no LLM calculations)</p>
            </div>
            <Calendar size={18} className="text-blue-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900">Clause 1.11 Appeal Clock</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-bold">
                  7 Calendar Days
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Triggered strictly upon uploading the formal <strong>Letter of Deficiency</strong> by the Scrutiny Committee.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900">Clause 2.24 SAC Appeal Clock</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 font-bold">
                  7 Calendar Days
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Triggered strictly upon uploading the <strong>Executive Committee Decision</strong> to the official web portal.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "clauses" && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Authoritative AICTE APH 2024–2027 Provisions</h2>
          <div className="space-y-3">
            {clauses.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Clause {c.clause_number}: {c.title}</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Verified Baseline
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{c.content}</p>
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
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading Scrutiny & Compliance...</div>}>
      <ScrutinyContent />
    </Suspense>
  );
}
