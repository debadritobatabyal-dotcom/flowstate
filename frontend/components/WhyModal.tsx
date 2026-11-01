"use client";
import React from "react";
import { useAppStore } from "@/lib/store";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import { X, BookOpen, FileText, Compass, CheckCircle2, ArrowRight } from "lucide-react";

export const WhyModal: React.FC = () => {
  const { whyModal, closeWhyModal } = useAppStore();

  if (!whyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-paper border border-neutral rounded-sm shadow-sheet max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-navy text-paper flex items-center justify-between border-b border-navy-light">
          <div className="flex items-center gap-2.5">
            <ContourBadgeSwatch variant="flow" />
            <div>
              <h3 className="font-heading font-semibold text-base leading-tight">Regulatory Traceability & Explainer</h3>
              <p className="text-xs text-neutral/70 font-mono">FLOWSTATE Administrative Provenance Chain</p>
            </div>
          </div>
          <button
            onClick={closeWhyModal}
            className="p-1 rounded-sm text-neutral hover:text-paper hover:bg-navy-light transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-ink">
          {/* Finding Title & Provenance */}
          <div className="flex items-start justify-between gap-4 border-b border-neutral pb-4">
            <div>
              <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider block font-mono">
                Context / Finding
              </span>
              <h4 className="text-base font-heading font-bold text-ink mt-0.5">{whyModal.title}</h4>
              <p className="text-ink-secondary mt-1 leading-relaxed">{whyModal.finding}</p>
            </div>
            <ProvenanceBadge type={whyModal.provenance} />
          </div>

          {/* Traceability Flow Step */}
          <div>
            <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider block mb-2 font-mono">
              Verification Lineage
            </span>
            <div className="flex items-center gap-2 text-xs font-medium text-ink bg-surface p-3 rounded-sm border border-neutral">
              <span className="bg-flow-core/10 text-flow-core border border-flow-core/20 px-2 py-0.5 rounded font-mono font-bold">
                Clause {whyModal.aphClause}
              </span>
              <ArrowRight size={13} className="text-ink-secondary shrink-0" />
              <span className="truncate max-w-[150px] font-semibold text-ink">
                {whyModal.documentName || "Required Evidence Document"}
              </span>
              <ArrowRight size={13} className="text-ink-secondary shrink-0" />
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                Page {whyModal.documentPage || 1}
              </span>
              <ArrowRight size={13} className="text-ink-secondary shrink-0" />
              <span className="text-ink-secondary font-mono">Deterministic Decision Rule</span>
            </div>
          </div>

          {/* Regulatory Clause Reference */}
          <div className="bg-surface border border-neutral rounded-sm p-4">
            <div className="flex items-center gap-2 text-ink font-heading font-bold mb-1">
              <BookOpen size={15} className="text-flow-core" />
              <span>Governing Regulation: Clause {whyModal.aphClause}</span>
            </div>
            <p className="text-ink-secondary leading-relaxed italic">
              {whyModal.aphText ||
                "AICTE Approval Process Handbook (2024–2027) statutory provision governing institutional compliance criteria and committee scrutiny standards."}
            </p>
          </div>

          {/* Evidence and Document Citation */}
          {whyModal.extractedSnippet && (
            <div className="bg-surface border border-neutral rounded-sm p-4">
              <div className="flex items-center gap-2 text-ink font-heading font-bold mb-1">
                <FileText size={15} className="text-flow-core" />
                <span>Supporting Document & Extracted Evidence Snippet</span>
              </div>
              <p className="text-xs font-mono text-ink bg-paper p-3 rounded-sm border border-neutral overflow-x-auto leading-relaxed">
                {whyModal.extractedSnippet}
              </p>
              {whyModal.documentName && (
                <div className="mt-2 text-[11px] text-ink-secondary flex items-center justify-between">
                  <span>Source Document: <strong className="text-ink">{whyModal.documentName}</strong></span>
                  <span>Page: <strong className="text-ink">{whyModal.documentPage || 1}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Calculation / Decision Trace */}
          {whyModal.auditTrace && whyModal.auditTrace.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider block mb-1.5 font-mono">
                Deterministic Calculation & Audit Trace
              </span>
              <ul className="space-y-1 bg-navy text-neutral font-mono text-xs p-3 rounded-sm border border-navy-light">
                {whyModal.auditTrace.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-flow-rim font-bold select-none">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-surface border-t border-neutral flex items-center justify-between text-[11px] text-ink-secondary">
          <span>Official Decision Support • Non-delegable human decision layer</span>
          <button
            onClick={closeWhyModal}
            className="m-btn text-xs py-1.5 px-4 min-h-[2rem]"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
