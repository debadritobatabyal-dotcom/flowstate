"use client";
import React, { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { CheckCircle2, AlertOctagon, HelpCircle, FileText, ExternalLink, ShieldCheck } from "lucide-react";

interface EvidenceMatrixItem {
  id: string;
  application_id: string;
  rule_id: string;
  rule_code: string;
  rule_name: string;
  aph_clause_number: string;
  required_document_type: string;
  document_id?: string;
  document_filename?: string;
  page_number?: number;
  evidence_snippet?: string;
  validation_result: string;
  provenance: string;
  officer_verification_status: string;
  officer_notes?: string;
}

interface Props {
  items: EvidenceMatrixItem[];
  applicationId: string;
  onRefresh?: () => void;
  canVerify?: boolean;
}

export const EvidenceMatrixTable: React.FC<Props> = ({
  items,
  applicationId,
  onRefresh,
  canVerify = true,
}) => {
  const { openWhyModal } = useAppStore();
  const [selectedItem, setSelectedItem] = useState<EvidenceMatrixItem | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [raiseDeficiency, setRaiseDeficiency] = useState(false);
  const [deficiencyText, setDeficiencyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async (status: "VERIFIED" | "DEFICIENCY_RAISED") => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      await api.verifyEvidence(applicationId, selectedItem.id, {
        status,
        notes: actionNotes,
        raise_deficiency: status === "DEFICIENCY_RAISED",
        deficiency_observation: status === "DEFICIENCY_RAISED" ? (deficiencyText || selectedItem.evidence_snippet) : undefined,
      });
      setSelectedItem(null);
      setActionNotes("");
      setRaiseDeficiency(false);
      setDeficiencyText("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Requirement-to-Evidence Matrix</h3>
          <p className="text-xs text-slate-500">Every statutory requirement linked to extracted document pages and validation results.</p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing {items.length} mapped requirements
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Statutory Clause & Rule</th>
                <th className="py-3 px-4">Supporting Document</th>
                <th className="py-3 px-4">Extracted Evidence</th>
                <th className="py-3 px-4">Validation</th>
                <th className="py-3 px-4">Provenance</th>
                <th className="py-3 px-4">Officer Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No requirement mappings found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* Clause & Rule */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.rule_name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] font-semibold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                          {item.aph_clause_number}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">({item.rule_code})</span>
                      </div>
                    </td>

                    {/* Document & Page */}
                    <td className="py-3.5 px-4">
                      {item.document_filename ? (
                        <div>
                          <div className="font-medium text-slate-800 flex items-center gap-1 truncate max-w-[160px]">
                            <FileText size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{item.document_filename}</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            Page {item.page_number || 1}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Uploaded</span>
                      )}
                    </td>

                    {/* Extracted Evidence */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {item.evidence_snippet ? (
                        <p className="font-mono text-[11px] text-slate-700 truncate" title={item.evidence_snippet}>
                          {item.evidence_snippet}
                        </p>
                      ) : (
                        <span className="text-slate-400 italic">No extractable text</span>
                      )}
                    </td>

                    {/* Validation */}
                    <td className="py-3.5 px-4">
                      {item.validation_result === "COMPLIANT" && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                          <CheckCircle2 size={12} /> Compliant
                        </span>
                      )}
                      {item.validation_result === "DEFICIENT" && (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                          <AlertOctagon size={12} /> Deficient
                        </span>
                      )}
                      {item.validation_result === "INCOMPLETE" && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                          Incomplete
                        </span>
                      )}
                      {item.validation_result === "PENDING_REVIEW" && (
                        <span className="inline-flex items-center gap-1 text-slate-600 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                          Review Pending
                        </span>
                      )}
                    </td>

                    {/* Provenance */}
                    <td className="py-3.5 px-4">
                      <ProvenanceBadge type={item.provenance} size="sm" />
                    </td>

                    {/* Officer Status */}
                    <td className="py-3.5 px-4">
                      {item.officer_verification_status === "VERIFIED" ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <ShieldCheck size={13} /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">{item.officer_verification_status}</span>
                      )}
                    </td>

                    {/* Actions: Contextual "Why?" + Verify */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Contextual "Why?" Button */}
                      <button
                        onClick={() =>
                          openWhyModal({
                            title: item.rule_name,
                            finding: item.evidence_snippet || "Mandatory requirement validation under APH.",
                            aphClause: item.aph_clause_number,
                            documentName: item.document_filename,
                            documentPage: item.page_number,
                            extractedSnippet: item.evidence_snippet,
                            provenance: item.provenance as any,
                            auditTrace: [
                              `APH Provision identified: ${item.aph_clause_number}`,
                              `Rule evaluated: ${item.rule_code} (${item.rule_name})`,
                              `Document page extracted: ${item.document_filename || "N/A"} (Page ${item.page_number || 1})`,
                              `Validation verdict computed: ${item.validation_result}`,
                              `Current human verification state: ${item.officer_verification_status}`,
                            ],
                          })
                        }
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px] transition inline-flex items-center gap-1"
                        title="Click to view regulatory traceability explainer"
                      >
                        <HelpCircle size={12} className="text-blue-600" />
                        Why?
                      </button>

                      {/* Verify Action for Officers */}
                      {canVerify && (
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-[11px] transition"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Deficiency Decision Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Officer Verification & Scrutiny Finding</h4>
              <p className="text-xs text-slate-500 font-mono">{selectedItem.rule_name} ({selectedItem.aph_clause_number})</p>
            </div>

            <div className="bg-slate-50 p-3 rounded border text-xs text-slate-700 space-y-1">
              <div><strong>Document:</strong> {selectedItem.document_filename || "None"} (Page {selectedItem.page_number || 1})</div>
              <div><strong>Extracted Snippet:</strong> {selectedItem.evidence_snippet || "N/A"}</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Officer Scrutiny Notes</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter formal scrutiny observation or remarks..."
                className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={2}
              />
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-rose-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={raiseDeficiency}
                  onChange={(e) => setRaiseDeficiency(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Raise as Formal Deficiency</span>
              </label>
            </div>

            {raiseDeficiency && (
              <div>
                <label className="text-xs font-semibold text-rose-800 block mb-1">Deficiency Description (to be communicated to Institution)</label>
                <textarea
                  value={deficiencyText}
                  onChange={(e) => setDeficiencyText(e.target.value)}
                  placeholder="Specify exact deficiency under APH clause..."
                  className="w-full text-xs p-2.5 border border-rose-300 rounded-lg focus:ring-1 focus:ring-rose-600 text-slate-900"
                  rows={2}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              {raiseDeficiency ? (
                <button
                  disabled={submitting}
                  onClick={() => handleVerify("DEFICIENCY_RAISED")}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition shadow-sm"
                >
                  Confirm & Raise Deficiency
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={() => handleVerify("VERIFIED")}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
                >
                  Mark Verified & Compliant
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
