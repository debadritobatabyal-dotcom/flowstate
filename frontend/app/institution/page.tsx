"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="text-blue-700" size={20} />
            <h2 className="text-xl font-bold text-slate-900">Institution Compliance Portal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional Dashboard for {selectedApp?.institution_name || "Technical Institution"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold">
            AICTE ID: 1-1094827101
          </span>
          <ProvenanceBadge type="HUMAN-VERIFIED" />
        </div>
      </div>

      {selectedApp && (
        <div className="space-y-6">
          {/* Active Application Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Active Application</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedApp.application_number}</h3>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 bg-blue-600 rounded text-white">
                {selectedApp.current_stage}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Category</span>
                <span className="text-blue-200 font-bold">{selectedApp.application_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span className="text-emerald-400 font-bold">{selectedApp.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Regulation</span>
                <span className="text-slate-300">{selectedApp.regulation_version}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Completion</span>
                <span className="text-amber-300">Within Standard Cycle</span>
              </div>
            </div>
          </div>

          {/* Outstanding Deficiencies Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Deficiencies Requiring Institutional Response</h4>
                <p className="text-xs text-slate-500">
                  Resubmit authenticated evidence prior to the convening of the Targeted Re-Scrutiny Committee.
                </p>
              </div>
              <span className="font-mono text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded font-bold">
                {deficiencies.filter((d) => d.status !== "RESOLVED").length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {deficiencies.map((d) => (
                <div key={d.id} className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{d.deficiency_number}</span>
                        <span className="font-mono text-[11px] text-blue-700 font-semibold">{d.aph_clause_number}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-rose-100 text-rose-800">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium mt-1">{d.observation}</p>
                    </div>

                    {d.status !== "RESOLVED" && (
                      <button
                        onClick={() => setResubmittingDefId(d.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs transition"
                      >
                        Respond & Resubmit
                      </button>
                    )}
                  </div>

                  {d.resubmission_notes && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
                      <strong>Resubmitted Notes:</strong> {d.resubmission_notes}
                    </div>
                  )}

                  {/* Resubmission Form Modal */}
                  {resubmittingDefId === d.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border">
                        <h4 className="font-bold text-slate-900 text-base">Submit Corrected Evidence</h4>
                        <p className="text-xs text-slate-500">
                          Respond to deficiency: <strong className="text-slate-800">{d.deficiency_number}</strong>
                        </p>

                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Resubmission Explanation & Certificate Reference
                          </label>
                          <textarea
                            value={resubNotes}
                            onChange={(e) => setResubNotes(e.target.value)}
                            placeholder="Detail renewed registration number, validity date, or institutional compliance..."
                            className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                            rows={3}
                          />
                        </div>

                        <div className="p-3 bg-slate-50 rounded border text-xs text-slate-600 space-y-1">
                          <span className="font-bold text-slate-800 block">Supporting File:</span>
                          <span>Auto-linking latest renewed file packet from institutional storage.</span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                          <button
                            onClick={() => setResubmittingDefId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResubmit(d.id)}
                            className="px-4 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded transition shadow-sm"
                          >
                            Upload & Transmit to AICTE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Deadlines Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Compliance Deadlines & Statutory Appeal Windows</h4>
                <p className="text-xs text-slate-500">
                  Strict calendar adherence under AICTE Approval Process Handbook (Clauses 1.11, 2.24 & 2.25).
                </p>
              </div>
              <ProvenanceBadge type="RULE-COMPUTED" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deadlines.map((dl: any, idx: number) => (
                <div key={idx} className="border p-4 rounded-xl space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dl.clause_number}</span>
                    <span className="font-mono text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                      {dl.days_remaining} days left
                    </span>
                  </div>
                  <p className="text-slate-700">{dl.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
