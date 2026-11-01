"use client";
import React, { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Scale,
  Sparkles,
} from "lucide-react";

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
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
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
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-heading font-bold text-ink flex items-center gap-2">
            <ContourBadgeSwatch variant="flow" />
            <span>Requirement-to-Evidence Matrix</span>
          </h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Every statutory requirement linked to extracted document pages, OCR citations, and officer determinations.
          </p>
        </div>
        <div className="text-xs text-ink-secondary font-mono bg-paper border border-neutral px-2.5 py-1 rounded-full self-start sm:self-auto font-semibold">
          {items.length} mapped requirements
        </div>
      </div>

      <div className="bg-paper border border-neutral rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-neutral text-ink-secondary font-mono font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Statutory Clause & Rule</th>
                <th className="py-3 px-4">Supporting Document</th>
                <th className="py-3 px-4">Validation State</th>
                <th className="py-3 px-4">Provenance</th>
                <th className="py-3 px-4">Officer Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral/50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-ink-secondary font-mono">
                    No requirement mappings found for this application.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isExpanded = expandedItemId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-surface/50 transition">
                        {/* Clause & Rule */}
                        <td className="py-3 px-4">
                          <div className="font-heading font-bold text-ink">{item.rule_name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] font-bold bg-flow-core/10 text-flow-core px-1.5 py-0.2 rounded-full border border-flow-core/20">
                              Clause {item.aph_clause_number}
                            </span>
                            <span className="text-[10px] text-ink-secondary font-mono">({item.rule_code})</span>
                          </div>
                        </td>

                        {/* Document & Page */}
                        <td className="py-3 px-4">
                          {item.document_filename ? (
                            <div>
                              <div className="font-medium text-ink flex items-center gap-1 truncate max-w-[170px]">
                                <FileText size={13} className="text-flow-core shrink-0" />
                                <span className="truncate">{item.document_filename}</span>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full inline-block mt-0.5 font-bold">
                                Page {item.page_number || 1}
                              </span>
                            </div>
                          ) : (
                            <span className="text-ink-secondary italic">Not Uploaded</span>
                          )}
                        </td>

                        {/* Validation Result */}
                        <td className="py-3 px-4">
                          {item.validation_result === "COMPLIANT" && (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-mono">
                              <CheckCircle2 size={11} /> Compliant
                            </span>
                          )}
                          {item.validation_result === "DEFICIENT" && (
                            <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-mono">
                              <AlertOctagon size={11} /> Deficient
                            </span>
                          )}
                          {item.validation_result === "INCOMPLETE" && (
                            <span className="inline-flex items-center gap-1 text-shallow-core font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-mono">
                              Incomplete
                            </span>
                          )}
                          {item.validation_result === "PENDING_REVIEW" && (
                            <span className="inline-flex items-center gap-1 text-ink-secondary font-bold bg-surface border border-neutral px-2 py-0.5 rounded-full text-[10px] font-mono">
                              Review Pending
                            </span>
                          )}
                        </td>

                        {/* Provenance */}
                        <td className="py-3 px-4">
                          <ProvenanceBadge type={item.provenance} size="sm" />
                        </td>

                        {/* Officer Status */}
                        <td className="py-3 px-4">
                          {item.officer_verification_status === "VERIFIED" ? (
                            <span className="text-emerald-800 font-bold flex items-center gap-1 text-xs">
                              <ShieldCheck size={13} className="text-emerald-600" /> Verified
                            </span>
                          ) : (
                            <span className="text-ink-secondary font-medium font-mono text-[11px]">{item.officer_verification_status}</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Snippet Expand Toggle */}
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="p-1 rounded-sm text-ink-secondary hover:text-ink hover:bg-surface border border-neutral/60 transition inline-flex items-center"
                            title={isExpanded ? "Collapse evidence snippet" : "Expand evidence snippet"}
                          >
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>

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
                            className="px-2 py-0.5 bg-surface hover:bg-neutral/40 text-ink rounded-full font-bold text-[11px] transition inline-flex items-center gap-1 border border-neutral"
                            title="Click to view regulatory traceability explainer"
                          >
                            <HelpCircle size={11} className="text-flow-core" />
                            Why?
                          </button>

                          {/* Verify Action for Officers */}
                          {canVerify && (
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="px-2.5 py-0.5 bg-navy hover:bg-flow-core text-paper rounded-full font-semibold text-[11px] transition"
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Evidence Detail Panel */}
                      {isExpanded && (
                        <tr className="bg-surface/60 border-b border-neutral/40">
                          <td colSpan={6} className="px-6 py-3.5 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-heading font-bold text-ink">Extracted Document Evidence Snippet:</span>
                              <span className="text-ink-secondary font-mono">Document: {item.document_filename || "N/A"} • Page {item.page_number || 1}</span>
                            </div>
                            <div className="p-3 bg-paper border border-neutral rounded-sm text-xs font-mono text-ink leading-relaxed">
                              {item.evidence_snippet ? (
                                <p>{item.evidence_snippet}</p>
                              ) : (
                                <p className="text-ink-secondary italic">No extracted snippet available for this item.</p>
                              )}
                            </div>
                            {item.officer_notes && (
                              <div className="text-[11px] text-ink-secondary">
                                <strong className="text-ink">Officer Remarks:</strong> {item.officer_notes}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Deficiency Decision Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4">
          <div className="bg-paper rounded-sm shadow-sheet max-w-lg w-full p-6 space-y-4 border border-neutral">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-flow-core font-mono font-bold mb-1">
                <ContourBadgeSwatch variant="flow" />
                <span>Clause {selectedItem.aph_clause_number}</span>
              </div>
              <h4 className="font-heading font-bold text-ink text-base">Officer Verification & Finding</h4>
              <p className="text-xs text-ink-secondary">{selectedItem.rule_name} ({selectedItem.rule_code})</p>
            </div>

            <div className="bg-surface p-3 rounded-sm border border-neutral text-xs text-ink space-y-1">
              <div><strong>Document:</strong> {selectedItem.document_filename || "None"} (Page {selectedItem.page_number || 1})</div>
              <div><strong>Extracted Snippet:</strong> {selectedItem.evidence_snippet || "N/A"}</div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Officer Scrutiny Remarks</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter formal scrutiny observation or remarks..."
                className="w-full text-xs p-2.5 border border-neutral rounded-sm bg-surface focus:bg-paper focus:outline-none focus:ring-1 focus:ring-flow-core"
                rows={2}
              />
            </div>

            <div className="pt-2 border-t border-neutral flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-rose-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={raiseDeficiency}
                  onChange={(e) => setRaiseDeficiency(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Raise as Formal Deficiency under Clause 1.8(g)</span>
              </label>
            </div>

            {raiseDeficiency && (
              <div>
                <label className="text-xs font-bold text-rose-800 block mb-1">Deficiency Description (communicated to applicant)</label>
                <textarea
                  value={deficiencyText}
                  onChange={(e) => setDeficiencyText(e.target.value)}
                  placeholder="Specify exact statutory deficiency..."
                  className="w-full text-xs p-2.5 border border-rose-300 rounded-sm focus:ring-1 focus:ring-rose-600 text-ink bg-rose-50/30"
                  rows={2}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral">
              <button
                onClick={() => setSelectedItem(null)}
                className="m-btn-outline text-xs py-1 px-3"
              >
                Cancel
              </button>
              {raiseDeficiency ? (
                <button
                  disabled={submitting}
                  onClick={() => handleVerify("DEFICIENCY_RAISED")}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-paper rounded-full transition shadow-xs"
                >
                  Confirm & Raise Deficiency
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={() => handleVerify("VERIFIED")}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-paper rounded-full transition shadow-xs"
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
