"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  Building2,
  FileText,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function InstitutionWorkspace() {
  const { currentRole } = useAppStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [deficiencies, setDeficiencies] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [resubmittingDefId, setResubmittingDefId] = useState<string | null>(null);
  const [resubNotes, setResubNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const apps = await api.getApplications();
      setApplications(apps);
      if (apps.length > 0) {
        const full = await api.getApplication(apps[0].id);
        setSelectedApp(full);
        const [defs, dls] = await Promise.all([
          api.getDeficiencies(full.id).catch(() => []),
          api.getDeadlines(full.id).catch(() => ({ deadlines: [] })),
        ]);
        setDeficiencies(defs);
        setDeadlines(dls.deadlines || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRole]);

  const handleResubmit = async (defId: string) => {
    if (!resubNotes) return;
    try {
      const def = deficiencies.find((d) => d.id === defId);
      await api.resubmitDeficiency(defId, {
        document_id: def?.original_document_id || "placeholder",
        page_number: 1,
        resubmission_notes: resubNotes,
      });
      setResubmittingDefId(null);
      setResubNotes("");
      loadData();
      alert("Evidence resubmitted successfully to AICTE Scrutiny Committee.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono font-semibold text-ink-secondary">
        Loading Institution Compliance Portal...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-secondary mb-1">
            <ContourBadgeSwatch variant="shallow" />
            <span>AICTE Applicant Portal</span>
            <span>•</span>
            <span className="text-shallow-core font-bold">Institutional Scrutiny Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Institution Compliance Portal
          </h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Statutory application tracking for {selectedApp?.institution_name || "Technical Institution"}. Review procedural observations, upload rectified evidence, and track Table 2.3 milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-surface text-ink font-bold border border-neutral">
            AICTE ID: {selectedApp?.institution_aicte_id || "1-1094827101"}
          </span>
          <ProvenanceBadge type="HUMAN-VERIFIED" />
        </div>
      </div>

      {selectedApp && (
        <div className="space-y-6">
          {/* Active Application Card */}
          <div className="bg-navy text-paper rounded-sm p-6 space-y-4 shadow-sheet border border-navy-light">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-light pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-flow-rim font-bold">Active Application Dossier</span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-paper mt-0.5">{selectedApp.application_number}</h3>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 bg-flow-core rounded-full text-paper self-start sm:self-auto">
                {selectedApp.current_stage}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-neutral/70 block text-[10px]">Category</span>
                <span className="text-flow-rim font-bold">{selectedApp.application_type}</span>
              </div>
              <div>
                <span className="text-neutral/70 block text-[10px]">Status</span>
                <span className="text-emerald-400 font-bold">{selectedApp.status}</span>
              </div>
              <div>
                <span className="text-neutral/70 block text-[10px]">Regulation</span>
                <span className="text-paper">{selectedApp.regulation_version}</span>
              </div>
              <div>
                <span className="text-neutral/70 block text-[10px]">Target Completion</span>
                <span className="text-shallow-rim font-bold">Within Standard Cycle</span>
              </div>
            </div>
          </div>

          {/* Outstanding Deficiencies Section */}
          <div className="bg-paper border border-neutral rounded-sm p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral pb-3">
              <div>
                <h4 className="font-heading font-bold text-ink text-base">Deficiencies Requiring Institutional Response</h4>
                <p className="text-xs text-ink-secondary">
                  Respond strictly to deficiencies issued under APH Clause 1.8(g) to prepare for Targeted Re-Scrutiny.
                </p>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface border border-neutral text-ink font-bold">
                {deficiencies.length} Deficiencies
              </span>
            </div>

            <div className="space-y-4">
              {deficiencies.length === 0 ? (
                <div className="text-center py-8 text-ink-secondary text-xs">
                  <CheckCircle className="mx-auto mb-2 text-emerald-700" size={24} />
                  <p className="font-heading font-bold text-ink">No Outstanding Deficiencies</p>
                  <p className="text-[11px] text-ink-secondary">All submitted documents satisfy substantive and procedural requirements.</p>
                </div>
              ) : (
                deficiencies.map((d) => (
                  <div key={d.id} className="border border-neutral rounded-sm p-4 space-y-3 bg-surface text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-800 bg-paper border border-neutral px-2 py-0.5 rounded-full">
                          {d.deficiency_number}
                        </span>
                        <span className="font-heading font-bold text-ink">Clause {d.aph_clause_number}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-paper border border-neutral text-ink">
                        {d.status}
                      </span>
                    </div>

                    <div className="p-3 bg-paper rounded-sm border border-neutral text-ink leading-relaxed">
                      <strong>Scrutiny Finding: </strong> {d.observation}
                    </div>

                    {d.institution_response && (
                      <div className="p-3 bg-emerald-50 rounded-sm border border-emerald-200 text-emerald-950">
                        <strong className="block text-[10px] font-mono uppercase text-emerald-800">Submitted Response:</strong>
                        <p className="mt-0.5 leading-relaxed">{d.institution_response}</p>
                      </div>
                    )}

                    {d.status !== "RESOLVED" && (
                      <div>
                        {resubmittingDefId === d.id ? (
                          <div className="space-y-2 mt-2 pt-2 border-t border-neutral">
                            <label className="text-xs font-heading font-bold text-ink block">Rectification Explanation</label>
                            <textarea
                              value={resubNotes}
                              onChange={(e) => setResubNotes(e.target.value)}
                              placeholder="Detail the corrected documentation and compliance details..."
                              className="w-full text-xs p-2.5 border border-neutral rounded-sm bg-paper focus:outline-none focus:ring-1 focus:ring-flow-core"
                              rows={3}
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setResubmittingDefId(null)}
                                className="m-btn-outline text-xs py-1 px-3"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleResubmit(d.id)}
                                className="m-btn text-xs py-1 px-3"
                              >
                                Submit Rectification
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end pt-2 border-t border-neutral">
                            <button
                              onClick={() => setResubmittingDefId(d.id)}
                              className="m-btn text-xs py-1 px-3"
                            >
                              <span>Respond to Deficiency</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
