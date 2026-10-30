"use client";
import React, { useState } from "react";
import { api } from "@/lib/api";
import { Lock, ShieldCheck, AlertCircle, PlusCircle, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface ReScrutinyItem {
  id: string;
  deficiency_id: string;
  deficiency_number: string;
  original_finding_summary: string;
  aph_clause_number: string;
  resubmitted_document_id?: string;
  resubmitted_document_name?: string;
  resubmitted_page_number?: number;
  resubmission_notes?: string;
  verification_status: string;
  officer_comment?: string;
  verified_at?: string;
}

interface OutOfScopeFinding {
  id: string;
  observation: string;
  clause_number?: string;
  page_number?: number;
  status: string;
  officer_notes?: string;
  created_at: string;
}

interface Props {
  applicationId: string;
  checklistData: {
    checklist: any;
    items: ReScrutinyItem[];
    out_of_scope_findings: OutOfScopeFinding[];
  } | null;
  onRefresh: () => void;
  canVerify?: boolean;
}

export const ReScrutinyPanel: React.FC<Props> = ({
  applicationId,
  checklistData,
  onRefresh,
  canVerify = true,
}) => {
  const [generating, setGenerating] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showOutModal, setShowOutModal] = useState(false);
  const [outObservation, setOutObservation] = useState("");
  const [outClause, setOutClause] = useState("Clause 1.9");

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.generateRescrutinyChecklist(applicationId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to generate checklist");
    } finally {
      setGenerating(false);
    }
  };

  const handleVerifyItem = async (status: "RESOLVED" | "UNRESOLVED") => {
    if (!verifyingId) return;
    try {
      await api.verifyRescrutinyItem({
        item_id: verifyingId,
        verification_status: status,
        officer_comment: commentText || (status === "RESOLVED" ? "Resubmitted evidence verified and compliant." : "Deficiency persists."),
      });
      setVerifyingId(null);
      setCommentText("");
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to verify item");
    }
  };

  const handleAddOutOfScope = async () => {
    if (!outObservation) return;
    try {
      await api.addOutOfScopeFinding(applicationId, {
        observation: outObservation,
        clause_number: outClause,
      });
      setShowOutModal(false);
      setOutObservation("");
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to record finding");
    }
  };

  if (!checklistData || !checklistData.checklist) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <Lock className="mx-auto text-blue-600" size={32} />
        <h4 className="font-bold text-slate-900 text-base">Locked Targeted Re-Scrutiny (APH Clause 1.8(g))</h4>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Re-scrutiny is strictly limited to deficiencies previously identified by the Scrutiny Committee.
          Generate the locked checklist to begin evaluation of resubmitted evidence.
        </p>
        {canVerify && (
          <button
            disabled={generating}
            onClick={handleGenerate}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition shadow-sm"
          >
            {generating ? "Locking Scope..." : "Generate Locked Re-Scrutiny Checklist"}
          </button>
        )}
      </div>
    );
  }

  const { checklist, items, out_of_scope_findings } = checklistData;

  return (
    <div className="space-y-6">
      {/* Header Banner: Regulatory Invariant */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <Lock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">Targeted Re-Scrutiny Checklist (Round {checklist.round_number})</h4>
              <span className="font-mono text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded uppercase font-semibold">
                LOCKED SCOPE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforcing AICTE APH Clause 1.8(g): Re-scrutiny verifies <strong>ONLY</strong> previously identified deficiencies.
            </p>
          </div>
        </div>

        {canVerify && (
          <button
            onClick={() => setShowOutModal(true)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition flex items-center gap-1.5"
          >
            <PlusCircle size={14} className="text-amber-400" />
            Report Out-of-Scope Issue
          </button>
        )}
      </div>

      {/* Main Targeted Items (Original Deficiencies ONLY) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Mandatory Verification Scope ({items.length} items)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {items.filter((i) => i.verification_status === "RESOLVED").length} of {items.length} Resolved
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item, idx) => (
            <div key={item.id} className="p-5 space-y-3 hover:bg-slate-50/50 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {item.deficiency_number}
                    </span>
                    <span className="font-mono text-xs text-blue-700 font-semibold">{item.aph_clause_number}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    <strong>Original Deficiency:</strong> {item.original_finding_summary}
                  </p>
                </div>

                <div>
                  {item.verification_status === "RESOLVED" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs">
                      <CheckCircle size={14} /> Resolved
                    </span>
                  ) : item.verification_status === "UNRESOLVED" ? (
                    <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-xs">
                      <XCircle size={14} /> Unresolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs">
                      Pending Review
                    </span>
                  )}
                </div>
              </div>

              {/* Evidence Comparison: Original vs Resubmitted */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-slate-500 text-[10px] uppercase">Original Finding</span>
                  <p className="text-slate-700 italic">{item.original_finding_summary}</p>
                </div>
                <div className="space-y-1 border-t md:border-t-0 md:border-l md:pl-3 border-slate-200">
                  <span className="font-bold text-emerald-800 text-[10px] uppercase">Resubmitted Compliance Evidence</span>
                  {item.resubmission_notes ? (
                    <div>
                      <p className="text-slate-800 font-medium">{item.resubmission_notes}</p>
                      {item.resubmitted_document_name && (
                        <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                          <span>File: <strong>{item.resubmitted_document_name}</strong></span>
                          <span>(Page {item.resubmitted_page_number || 1})</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-amber-700 italic">No resubmission uploaded yet by institution.</p>
                  )}
                </div>
              </div>

              {/* Officer Decision Bar */}
              {canVerify && item.verification_status === "PENDING" && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setVerifyingId(item.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition"
                  >
                    Enter Re-Scrutiny Verdict
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Out-of-Scope Review Panel (Strictly Isolated under APH 1.8(g)) */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-amber-200 bg-amber-100/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-800" />
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Out-of-Scope Review Panel (Isolated Findings)
            </span>
          </div>
          <span className="text-[11px] text-amber-800 font-medium">
            Protected under Clause 1.8(g) — Kept outside re-scrutiny checklist
          </span>
        </div>

        <div className="p-4 space-y-3">
          {out_of_scope_findings.length === 0 ? (
            <p className="text-xs text-amber-800/80 italic text-center py-2">
              No out-of-scope issues flagged. Re-scrutiny integrity fully preserved.
            </p>
          ) : (
            out_of_scope_findings.map((f) => (
              <div key={f.id} className="bg-white border border-amber-200 p-3 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{f.observation}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    {f.status}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] flex items-center justify-between">
                  <span>Clause Reference: {f.clause_number}</span>
                  <span>Recorded: {new Date(f.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {verifyingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base">Re-Scrutiny Verification Verdict</h4>
            <p className="text-xs text-slate-500">
              Confirm whether the resubmitted evidence fully complies with the original statutory deficiency.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Committee Remarks</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter re-scrutiny committee notes..."
                className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button onClick={() => setVerifyingId(null)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">
                Cancel
              </button>
              <button
                onClick={() => handleVerifyItem("UNRESOLVED")}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition shadow-sm"
              >
                Mark Unresolved
              </button>
              <button
                onClick={() => handleVerifyItem("RESOLVED")}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
              >
                Mark Resolved & Complied
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Out of Scope Modal */}
      {showOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Report Out-of-Scope Observation</h4>
              <p className="text-xs text-amber-700 font-medium mt-0.5">
                Notice: Under APH Clause 1.8(g), this will NOT expand the re-scrutiny checklist. It will be recorded separately for Executive Committee consideration.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Clause Reference</label>
              <input
                type="text"
                value={outClause}
                onChange={(e) => setOutClause(e.target.value)}
                className="w-full text-xs p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Observation</label>
              <textarea
                value={outObservation}
                onChange={(e) => setOutObservation(e.target.value)}
                placeholder="Describe new observation noticed during session..."
                className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button onClick={() => setShowOutModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">
                Cancel
              </button>
              <button
                onClick={handleAddOutOfScope}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded transition"
              >
                Isolate in Out-of-Scope Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
