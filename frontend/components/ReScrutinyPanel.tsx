"use client";
import React, { useState } from "react";
import { api } from "@/lib/api";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileCheck,
  Info,
} from "lucide-react";

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
      <div className="bg-paper border border-neutral rounded-sm p-8 text-center space-y-3 font-sans shadow-xs">
        <div className="w-12 h-12 rounded-full bg-surface border border-neutral text-flow-core flex items-center justify-center mx-auto">
          <Lock size={24} />
        </div>
        <h4 className="font-heading font-bold text-ink text-base">Locked Targeted Re-Scrutiny (Clause 1.8(g))</h4>
        <p className="text-xs text-ink-secondary max-w-lg mx-auto leading-relaxed">
          Statutory re-scrutiny is strictly limited to deficiencies previously identified by the Scrutiny Committee.
          Generate the locked checklist to commence formal evaluation of resubmitted evidence.
        </p>
        {canVerify && (
          <button
            disabled={generating}
            onClick={handleGenerate}
            className="m-btn text-xs"
          >
            {generating ? "Locking Statutory Scope..." : "Generate Locked Re-Scrutiny Checklist"}
          </button>
        )}
      </div>
    );
  }

  const { checklist, items, out_of_scope_findings } = checklistData;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner: Regulatory Invariant */}
      <div className="bg-navy text-paper rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-navy-light">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-navy-light text-flow-rim rounded-sm border border-neutral/20 shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-bold text-sm">Targeted Re-Scrutiny Checklist (Round {checklist.round_number})</h4>
              <span className="font-mono text-[9px] bg-flow-core text-paper px-2 py-0.2 rounded-full uppercase font-bold tracking-wider">
                LOCKED SCOPE 1.8(g)
              </span>
            </div>
            <p className="text-xs text-neutral/70 mt-0.5">
              Strict statutory enforcement: Re-scrutiny verifies <strong>ONLY</strong> previously recorded deficiencies.
            </p>
          </div>
        </div>

        {canVerify && (
          <button
            onClick={() => setShowOutModal(true)}
            className="text-xs font-semibold px-3 py-1.5 bg-navy-light hover:bg-neutral/20 text-paper rounded-full border border-neutral/30 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle size={13} className="text-shallow-rim" />
            <span>Report Out-of-Scope Issue</span>
          </button>
        )}
      </div>

      {/* Main Targeted Items (Original Deficiencies ONLY) */}
      <div className="bg-paper border border-neutral rounded-sm overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-neutral bg-surface flex items-center justify-between">
          <span className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
            Mandatory Locked Verification Scope ({items.length} items)
          </span>
          <span className="text-xs text-ink-secondary font-mono font-semibold">
            {items.filter((i) => i.verification_status === "RESOLVED").length} of {items.length} Resolved
          </span>
        </div>

        <div className="divide-y divide-neutral/50">
          {items.map((item) => (
            <div key={item.id} className="p-5 space-y-3 hover:bg-surface/40 transition">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink bg-surface border border-neutral px-2 py-0.5 rounded-full">
                      {item.deficiency_number}
                    </span>
                    <span className="font-mono text-xs text-flow-core font-bold">{item.aph_clause_number}</span>
                  </div>
                  <p className="text-xs text-ink leading-relaxed">
                    <strong>Original Deficiency:</strong> {item.original_finding_summary}
                  </p>
                </div>

                <div>
                  {item.verification_status === "RESOLVED" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-900 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
                      <CheckCircle size={13} /> Resolved
                    </span>
                  ) : item.verification_status === "UNRESOLVED" ? (
                    <span className="inline-flex items-center gap-1 text-rose-900 font-bold bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
                      <XCircle size={13} /> Unresolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-shallow-core font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
                      Pending Review
                    </span>
                  )}
                </div>
              </div>

              {/* Evidence Comparison: Original vs Resubmitted */}
              <div className="bg-surface border border-neutral rounded-sm p-3.5 text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="font-mono font-bold text-ink-secondary text-[10px] uppercase">Original Scrutiny Observation</span>
                  <p className="text-ink italic leading-relaxed">{item.original_finding_summary}</p>
                </div>
                <div className="space-y-1 border-t md:border-t-0 md:border-l md:pl-3 border-neutral">
                  <span className="font-mono font-bold text-emerald-800 text-[10px] uppercase">Resubmitted Compliance Evidence</span>
                  {item.resubmission_notes ? (
                    <div>
                      <p className="text-ink font-medium leading-relaxed">{item.resubmission_notes}</p>
                      {item.resubmitted_document_name && (
                        <div className="mt-1 text-[11px] text-ink-secondary flex items-center gap-1">
                          <span>File: <strong className="text-ink">{item.resubmitted_document_name}</strong></span>
                          <span>(Page {item.resubmitted_page_number || 1})</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-shallow-core italic">No resubmission uploaded yet by institution.</p>
                  )}
                </div>
              </div>

              {/* Officer Decision Bar */}
              {canVerify && item.verification_status === "PENDING" && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setVerifyingId(item.id)}
                    className="m-btn text-xs py-1 px-3"
                  >
                    Enter Re-Scrutiny Determination
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Out-of-Scope Review Panel (Strictly Isolated under APH 1.8(g)) */}
      <div className="bg-paper border border-shallow-core/30 rounded-sm overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-shallow-core/20 bg-shallow-rim/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-shallow-core" />
            <span className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
              Out-of-Scope Review Panel (Isolated Observations)
            </span>
          </div>
          <span className="text-[11px] text-shallow-core font-mono font-semibold">
            Protected under Clause 1.8(g) — Kept outside re-scrutiny checklist
          </span>
        </div>

        <div className="p-4 space-y-2">
          {(!out_of_scope_findings || out_of_scope_findings.length === 0) ? (
            <p className="text-xs text-ink-secondary italic text-center py-4 font-mono">
              No out-of-scope issues logged. Re-scrutiny remains 100% focused on original checklist.
            </p>
          ) : (
            out_of_scope_findings.map((oof) => (
              <div key={oof.id} className="p-3 bg-surface border border-neutral rounded-sm text-xs flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    <span className="font-mono text-flow-core">{oof.clause_number || "Clause 1.9"}</span>
                    <span>•</span>
                    <span>{oof.observation}</span>
                  </div>
                  <span className="text-[10px] text-ink-secondary font-mono mt-0.5 block">
                    Recorded on {new Date(oof.created_at).toLocaleDateString()} — Transferred to Post-Approval/EVC file
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-paper border border-neutral px-2 py-0.5 rounded-full font-bold text-ink-secondary">
                  ISOLATED
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {verifyingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4">
          <div className="bg-paper rounded-sm shadow-sheet max-w-md w-full p-6 space-y-4 border border-neutral">
            <div>
              <h4 className="font-heading font-bold text-ink text-base">Re-Scrutiny Verification Verdict</h4>
              <p className="text-xs text-ink-secondary mt-0.5">Determine compliance under Clause 1.8(g)</p>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Officer Re-Scrutiny Remarks</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter statutory remarks regarding resubmitted evidence..."
                className="w-full text-xs p-2.5 border border-neutral rounded-sm bg-surface focus:bg-paper focus:outline-none focus:ring-1 focus:ring-flow-core"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral">
              <button
                onClick={() => setVerifyingId(null)}
                className="m-btn-outline text-xs py-1 px-3"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyItem("UNRESOLVED")}
                className="px-3 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-paper rounded-full transition"
              >
                Deficiency Persists (Unresolved)
              </button>
              <button
                onClick={() => handleVerifyItem("RESOLVED")}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-paper rounded-full transition"
              >
                Mark Resolved & Compliant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Out-of-Scope Report Modal */}
      {showOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4">
          <div className="bg-paper rounded-sm shadow-sheet max-w-md w-full p-6 space-y-4 border border-neutral">
            <div>
              <h4 className="font-heading font-bold text-ink text-base">Report Out-of-Scope Statutory Issue</h4>
              <p className="text-xs text-ink-secondary mt-0.5">
                Will be isolated from current re-scrutiny checklist to prevent procedural violation of Clause 1.8(g).
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Associated APH Clause</label>
              <input
                type="text"
                value={outClause}
                onChange={(e) => setOutClause(e.target.value)}
                className="w-full text-xs p-2 border border-neutral rounded-sm bg-surface font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">New Observation</label>
              <textarea
                value={outObservation}
                onChange={(e) => setOutObservation(e.target.value)}
                placeholder="Describe new finding observed outside original checklist..."
                className="w-full text-xs p-2.5 border border-neutral rounded-sm bg-surface"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral">
              <button
                onClick={() => setShowOutModal(false)}
                className="m-btn-outline text-xs py-1 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOutOfScope}
                className="m-btn text-xs py-1 px-3"
              >
                Log Out-of-Scope Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
