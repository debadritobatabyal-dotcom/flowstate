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
} from "lucide-react";

function OfficerWorkspaceContent() {
  const searchParams = useSearchParams();
  const appIdParam = searchParams.get("appId");
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

  // Load applications list
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
      setDeadlines(dls.deadlines || []);
    } catch (err: any) {
      console.error("Failed to load application detail", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "matrix", label: "Evidence Matrix" },
    { id: "timeline", label: "Overview & Timeline" },
    { id: "documents", label: "Documents" },
    { id: "deficiencies", label: "Deficiencies & Lineage" },
    { id: "rescrutiny", label: "Targeted Re-Scrutiny (1.8g)" },
    { id: "deadlines", label: "Statutory Deadlines" },
    { id: "clauses", label: "Applicable Clauses" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Officer Header with Application Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Regional Officer Dossier
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Scrutiny & Evidence Verification Desk</h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Active File:</label>
          <select
            value={selectedApp?.id || ""}
            onChange={(e) => loadAppDetail(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.application_number} — {app.institution_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedApp && (
        <div className="space-y-5">
          {/* File Meta Summary */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Institution</span>
              <div className="font-bold text-sm text-white mt-0.5">{selectedApp.institution_name}</div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
              <div className="font-bold text-blue-300 mt-0.5 truncate">{selectedApp.application_type}</div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Stage</span>
              <div className="font-bold text-emerald-400 mt-0.5">{selectedApp.current_stage}</div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Delay Risk</span>
              <div className="font-bold text-amber-400 mt-0.5">{(selectedApp.delay_risk_predicted * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Evidence Matrix */}
          {activeTab === "matrix" && (
            <EvidenceMatrixTable
              items={matrix}
              applicationId={selectedApp.id}
              onRefresh={() => loadAppDetail(selectedApp.id)}
              canVerify={true}
            />
          )}

          {/* Tab 2: Overview & Timeline */}
          {activeTab === "timeline" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Application Milestone Progression</h4>
              <div className="space-y-3 font-mono text-xs">
                {selectedApp.events.map((ev: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 border-l-2 border-slate-200 pl-4 py-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 -ml-[21px]" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {ev.event_type} {ev.from_stage && `(${ev.from_stage} → ${ev.to_stage})`}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Actor: {ev.actor_role} | {new Date(ev.created_at).toLocaleString()}
                      </div>
                      {ev.metadata?.notes && (
                        <p className="text-slate-700 font-sans text-xs">{ev.metadata.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Documents */}
          {activeTab === "documents" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Uploaded Institutional Records</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedApp.documents.map((doc: any) => (
                  <div key={doc.id} className="border p-4 rounded-xl space-y-2 text-xs bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[200px]">{doc.original_filename}</span>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        {doc.document_type}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center justify-between font-mono">
                      <span>Pages: {doc.page_count}</span>
                      <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Deficiencies & Lineage */}
          {activeTab === "deficiencies" && (
            <div className="space-y-4">
              {deficiencies.map((d) => (
                <div key={d.id} className="bg-white border rounded-xl p-5 space-y-3 shadow-sm text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-slate-900">{d.deficiency_number}</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      {d.status}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">{d.observation}</p>
                  <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-600">
                    Clause: {d.aph_clause_number} | Stage: {d.stage_raised} | Responsible: {d.responsible_party}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Targeted Re-Scrutiny */}
          {activeTab === "rescrutiny" && (
            <ReScrutinyPanel
              applicationId={selectedApp.id}
              checklistData={checklistData}
              onRefresh={() => loadAppDetail(selectedApp.id)}
              canVerify={true}
            />
          )}

          {/* Tab 6: Statutory Deadlines */}
          {activeTab === "deadlines" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Deterministic AICTE Statutory Clocks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deadlines.map((dl: any, idx: number) => (
                  <div key={idx} className="border p-4 rounded-xl space-y-2 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{dl.clause_number}</span>
                      <span className="font-mono text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                        {dl.duration_days} {dl.duration_type}
                      </span>
                    </div>
                    <p className="text-slate-700">{dl.description}</p>
                    <div className="bg-white p-2.5 rounded border font-mono text-[11px] text-slate-600 space-y-0.5">
                      <div>Trigger: <strong>{dl.trigger_event}</strong></div>
                      <div>Calculation: {dl.calculation_trace?.join(" → ")}</div>
                      <div>Days Remaining: <strong className="text-slate-900">{dl.days_remaining} days</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 7: Applicable Clauses */}
          {activeTab === "clauses" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Governing APH 2024–27 Provisions</h4>
              <div className="space-y-3">
                {clauses.map((c) => (
                  <div key={c.id} className="border p-4 rounded-xl space-y-1.5 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-800">{c.clause_number}</span>
                      <span className="font-bold text-slate-900">{c.title}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OfficerWorkspace() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-mono">Loading Officer Dossier...</div>}>
      <OfficerWorkspaceContent />
    </Suspense>
  );
}
