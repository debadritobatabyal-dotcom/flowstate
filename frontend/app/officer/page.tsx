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
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono font-semibold text-ink-secondary">
        Loading Regional Scrutiny Desk...
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Officer Header with Application Selector */}
      <div className="bg-paper border border-neutral rounded-sm p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-flow-core block">
            Regional Scrutiny Directorate
          </span>
          <h2 className="text-xl font-heading font-bold text-ink mt-0.5">Scrutiny & Evidence Verification Desk</h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Regional Officer Verification Queue • Western Regional Office (Mumbai)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-ink-secondary">Active Dossier:</label>
          <select
            value={selectedApp?.id || ""}
            onChange={(e) => loadAppDetail(e.target.value)}
            className="p-2 border border-neutral rounded-full text-xs font-mono font-bold bg-surface text-ink focus:outline-none"
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
        <div className="space-y-6">
          {/* Key Context Card */}
          <div className="bg-navy text-paper rounded-sm p-6 space-y-4 shadow-sheet border border-navy-light">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-light pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-flow-rim font-bold">Verified Dossier</span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-paper mt-0.5">{selectedApp.institution_name}</h3>
                <span className="font-mono text-xs text-neutral/70">
                  Application Number: {selectedApp.application_number} • AICTE ID: {selectedApp.institution_aicte_id}
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 bg-flow-core rounded-full text-paper self-start sm:self-auto">
                {selectedApp.current_stage}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-neutral/70 block text-[10px]">Processing Route</span>
                <span className="text-flow-rim font-bold">{selectedApp.application_type}</span>
              </div>
              <div>
                <span className="text-neutral/70 block text-[10px]">Status</span>
                <span className="text-emerald-400 font-bold">{selectedApp.status}</span>
              </div>
              <div>
                <span className="text-neutral/70 block text-[10px]">Regulation Version</span>
                <span className="text-paper">{selectedApp.regulation_version}</span>
              </div>
              <div>
                <span className="text-neutral/70 block text-[10px]">Region / State</span>
                <span className="text-shallow-rim font-bold">{selectedApp.region} Region</span>
              </div>
            </div>
          </div>

          {/* Dossier Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral text-xs font-semibold overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3.5 border-b-2 font-heading transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-flow-core text-flow-core font-bold"
                    : "border-transparent text-ink-secondary hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Evidence Matrix */}
          {activeTab === "matrix" && (
            <div className="space-y-4">
              <div className="p-3 bg-surface border border-neutral rounded-sm text-xs text-ink">
                <strong>Officer Operational Instruction:</strong> Review each substantive requirement against the extracted evidence snippet. Click &ldquo;Why?&rdquo; to view statutory provenance, or &ldquo;Review&rdquo; to confirm compliance or raise a formal Clause 1.8(g) deficiency.
              </div>
              <EvidenceMatrixTable
                items={matrix}
                applicationId={selectedApp.id}
                onRefresh={() => loadAppDetail(selectedApp.id)}
                canVerify={true}
              />
            </div>
          )}

          {/* Tab 2: Timeline */}
          {activeTab === "timeline" && (
            <div className="bg-paper border border-neutral rounded-sm p-6 space-y-4 shadow-xs text-xs">
              <h4 className="font-heading font-bold text-ink text-sm">Application History</h4>
              <div className="space-y-3">
                {selectedApp.events?.map((ev: any, idx: number) => (
                  <div key={idx} className="p-3 bg-surface rounded-sm border border-neutral flex items-center justify-between">
                    <div>
                      <span className="font-heading font-bold text-ink block">{ev.event_type}</span>
                      <span className="text-ink-secondary text-[11px]">Moved to {ev.to_stage}</span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-secondary">{new Date(ev.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Documents */}
          {activeTab === "documents" && (
            <div className="bg-paper border border-neutral rounded-sm p-6 space-y-4 shadow-xs text-xs">
              <h4 className="font-heading font-bold text-ink text-sm">Uploaded Institutional Documents</h4>
              <div className="divide-y divide-neutral/50">
                {selectedApp.documents?.map((doc: any) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-heading font-bold text-ink">{doc.filename}</div>
                      <span className="text-[10px] font-mono text-ink-secondary">{doc.document_type} • {doc.page_count} pages</span>
                    </div>
                    <span className="font-mono text-[10px] bg-surface border border-neutral text-ink px-2 py-0.5 rounded-full font-bold">
                      {doc.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Deficiencies */}
          {activeTab === "deficiencies" && (
            <div className="bg-paper border border-neutral rounded-sm p-6 space-y-4 shadow-xs text-xs">
              <h4 className="font-heading font-bold text-ink text-sm">Identified Deficiencies & Audit Lineage</h4>
              <div className="space-y-3">
                {deficiencies.map((d: any) => (
                  <div key={d.id} className="p-4 border border-neutral rounded-sm bg-surface space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-800">{d.deficiency_number}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-paper border border-neutral font-bold">{d.status}</span>
                    </div>
                    <p className="text-ink font-medium leading-relaxed">{d.observation}</p>
                    {d.institution_response && (
                      <div className="p-2.5 bg-paper rounded-sm border border-neutral text-[11px] text-flow-core">
                        <strong>Response:</strong> {d.institution_response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Re-Scrutiny Panel */}
          {activeTab === "rescrutiny" && (
            <ReScrutinyPanel
              applicationId={selectedApp.id}
              checklistData={checklistData}
              onRefresh={() => loadAppDetail(selectedApp.id)}
              canVerify={true}
            />
          )}

          {/* Tab 6: Deadlines */}
          {activeTab === "deadlines" && (
            <div className="bg-paper border border-neutral rounded-sm p-6 space-y-4 shadow-xs text-xs">
              <h4 className="font-heading font-bold text-ink text-sm">Statutory Appeal Windows</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface rounded-sm border border-neutral space-y-1">
                  <span className="font-heading font-bold text-ink">Clause 1.11 Appeal Clock</span>
                  <p className="text-ink-secondary text-[11px]">7 Calendar Days from Deficiency Letter generation.</p>
                </div>
                <div className="p-4 bg-surface rounded-sm border border-neutral space-y-1">
                  <span className="font-heading font-bold text-ink">Clause 2.24 SAC Appeal Clock</span>
                  <p className="text-ink-secondary text-[11px]">7 Calendar Days from Executive Committee Decision publication.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: Applicable Clauses */}
          {activeTab === "clauses" && (
            <div className="bg-paper border border-neutral rounded-sm p-6 space-y-4 shadow-xs text-xs">
              <h4 className="font-heading font-bold text-ink text-sm">Governing APH Clauses</h4>
              <div className="space-y-3">
                {clauses.map((c) => (
                  <div key={c.id} className="p-3 bg-surface rounded-sm border border-neutral space-y-1">
                    <span className="font-mono font-bold text-flow-core">Clause {c.clause_number}: {c.title}</span>
                    <p className="text-ink-secondary text-[11px] leading-relaxed">{c.content}</p>
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
    <Suspense fallback={<div className="p-8 text-xs font-mono text-ink-secondary">Loading Regional Officer Workspace...</div>}>
      <OfficerWorkspaceContent />
    </Suspense>
  );
}
