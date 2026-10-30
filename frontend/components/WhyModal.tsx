"use client";
import React from "react";
import { useAppStore } from "@/lib/store";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { X, BookOpen, FileText, Compass, CheckCircle2, ArrowRight } from "lucide-react";

export const WhyModal: React.FC = () => {
  const { whyModal, closeWhyModal } = useAppStore();

  if (!whyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="text-blue-400" size={20} />
            <div>
              <h3 className="font-semibold text-base leading-tight">Regulatory Traceability & Explainer</h3>
              <p className="text-xs text-slate-400 font-mono">FLOWSTATE Intelligence Provenance Chain</p>
            </div>
          </div>
          <button
            onClick={closeWhyModal}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Finding Title & Provenance */}
          <div className="flex items-start justify-between gap-4 border-b pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Context / Finding</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{whyModal.title}</h4>
              <p className="text-slate-600 mt-1">{whyModal.finding}</p>
            </div>
            <ProvenanceBadge type={whyModal.provenance} />
          </div>

          {/* Traceability Flow Step */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Connected Verification Chain</span>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-semibold">{whyModal.aphClause}</span>
              <ArrowRight size={14} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[140px] text-slate-800">{whyModal.documentName || "Required Document"}</span>
              <ArrowRight size={14} className="text-slate-400 shrink-0" />
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">Page {whyModal.documentPage || 1}</span>
              <ArrowRight size={14} className="text-slate-400 shrink-0" />
              <span className="text-slate-600">Decision Rule</span>
            </div>
          </div>

          {/* Regulatory Clause Reference */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-900 font-semibold mb-1">
              <BookOpen size={16} className="text-blue-700" />
              <span>Governing Regulation: {whyModal.aphClause}</span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed italic">
              {whyModal.aphText ||
                "AICTE Approval Process Handbook (2024–2027) statutory provision governing institutional compliance criteria and committee scrutiny standards."}
            </p>
          </div>

          {/* Evidence and Document Citation */}
          {whyModal.extractedSnippet && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
                <FileText size={16} className="text-slate-700" />
                <span>Supporting Document & Extracted Snippet</span>
              </div>
              <p className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded border border-slate-200 overflow-x-auto">
                {whyModal.extractedSnippet}
              </p>
              {whyModal.documentName && (
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>Source Document: <strong className="text-slate-700">{whyModal.documentName}</strong></span>
                  <span>Page Number: <strong className="text-slate-700">{whyModal.documentPage || 1}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Calculation / Decision Trace */}
          {whyModal.auditTrace && whyModal.auditTrace.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Deterministic Calculation Trace</span>
              <ul className="space-y-1 bg-slate-900 text-slate-200 font-mono text-xs p-3 rounded-lg border border-slate-800">
                {whyModal.auditTrace.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold select-none">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Non-delegable decision layer: Decision remains strictly with authorized AICTE officials.</span>
          <button
            onClick={closeWhyModal}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md transition"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
