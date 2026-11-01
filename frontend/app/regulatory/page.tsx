"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TraceabilityGraph } from "@/components/TraceabilityGraph";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  BookOpen,
  GitCompare,
  Layers,
  Search,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Scale,
  Sparkles,
} from "lucide-react";

export default function RegulatoryWorkspace() {
  const [activeTab, setActiveTab] = useState<string>("diff");
  const [clauses, setClauses] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [amendments, setAmendments] = useState<any[]>([]);
  const [selectedAmd, setSelectedAmd] = useState<any>(null);
  const [impactReport, setImpactReport] = useState<any>(null);

  // Q&A State
  const [qaQuery, setQaQuery] = useState("");
  const [qaResponse, setQaResponse] = useState<any>(null);
  const [askingQa, setAskingQa] = useState(false);

  // Filter
  const [clauseSearch, setClauseSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getClauses(),
      api.getRules(),
      api.getWorkflowTemplates(),
      api.getAmendments(),
    ])
      .then(([cls, rls, tmpls, amds]) => {
        setClauses(cls);
        setRules(rls);
        setTemplates(tmpls);
        setAmendments(amds);
        if (amds.length > 0) {
          setSelectedAmd(amds[0]);
          api.getImpactReport(amds[0].id).then(setImpactReport).catch(() => null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAskQa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuery.trim()) return;
    setAskingQa(true);
    try {
      const res = await api.askRegulatoryQuestion(qaQuery);
      setQaResponse(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAskingQa(false);
    }
  };

  const handleApproveAction = async (itemId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.approveImpactItem(itemId, status, "Official Regulatory Decision recorded.");
      if (selectedAmd) {
        const rep = await api.getImpactReport(selectedAmd.id);
        setImpactReport(rep);
      }
      alert(`Action ${status} successfully! Mandatory Human Approval Gate satisfied.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono font-semibold text-ink-secondary">
        Loading Regulatory Intelligence Desk...
      </div>
    );
  }

  const filteredClauses = clauses.filter(
    (c) =>
      c.clause_number.toLowerCase().includes(clauseSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(clauseSearch.toLowerCase()) ||
      c.content.toLowerCase().includes(clauseSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-secondary mb-1">
            <ContourBadgeSwatch variant="deep" />
            <span>AICTE Statutory Intelligence</span>
            <span>•</span>
            <span className="text-deep-core font-bold">Policy Governance Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Regulatory Intelligence & Change Impact
          </h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Statutory corpus management across AICTE Approval Process Handbook (2024–2027) provisions, corrigendum diff analysis, and non-retrospective human approval gates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ProvenanceBadge type="RULE-COMPUTED" />
          <ProvenanceBadge type="HUMAN-VERIFIED" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral text-xs font-semibold">
        <button
          onClick={() => setActiveTab("diff")}
          className={`pb-3 px-3.5 border-b-2 font-heading transition ${
            activeTab === "diff"
              ? "border-flow-core text-flow-core font-bold"
              : "border-transparent text-ink-secondary hover:text-ink"
          }`}
        >
          Corrigendum Diff & Impact Graph
        </button>
        <button
          onClick={() => setActiveTab("qa")}
          className={`pb-3 px-3.5 border-b-2 font-heading transition ${
            activeTab === "qa"
              ? "border-flow-core text-flow-core font-bold"
              : "border-transparent text-ink-secondary hover:text-ink"
          }`}
        >
          Grounded Regulatory Q&A
        </button>
        <button
          onClick={() => setActiveTab("clauses")}
          className={`pb-3 px-3.5 border-b-2 font-heading transition ${
            activeTab === "clauses"
              ? "border-flow-core text-flow-core font-bold"
              : "border-transparent text-ink-secondary hover:text-ink"
          }`}
        >
          Clause Corpus ({clauses.length})
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-3 px-3.5 border-b-2 font-heading transition ${
            activeTab === "rules"
              ? "border-flow-core text-flow-core font-bold"
              : "border-transparent text-ink-secondary hover:text-ink"
          }`}
        >
          Rule Definitions ({rules.length})
        </button>
      </div>

      {/* Tab 1: Clause Diff & Impact Graph */}
      {activeTab === "diff" && selectedAmd && impactReport && (
        <div className="space-y-6">
          {/* Amendment Card */}
          <div className="bg-navy text-paper rounded-sm p-6 shadow-sheet space-y-4 border border-navy-light">
            {/* Warning Banner */}
            <div className="bg-shallow-rim text-ink px-3.5 py-1.5 rounded-full text-xs font-heading font-bold flex items-center gap-2">
              <ShieldAlert size={15} className="shrink-0 text-shallow-core" />
              <span>ILLUSTRATIVE SYNTHETIC AMENDMENT — NOT AN OFFICIAL AICTE NOTIFICATION.</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-light pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-flow-rim font-bold tracking-wider">
                  Simulated Policy Corrigendum
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-paper mt-0.5">
                  {selectedAmd.title}
                </h3>
                <span className="font-mono text-xs text-neutral/80">
                  Notice ID: {selectedAmd.amendment_number} • Demonstrates Ambiguous Retrospective Impact
                </span>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 bg-shallow-core text-paper font-bold rounded-full self-start sm:self-auto">
                {selectedAmd.status}
              </span>
            </div>
            <p className="text-xs text-neutral/80 leading-relaxed max-w-3xl">{selectedAmd.summary}</p>
          </div>

          {/* Clause Diff View */}
          <div className="bg-paper border border-neutral rounded-sm p-6 shadow-xs space-y-4">
            <h4 className="font-heading font-bold text-ink text-sm">
              Clause Comparison (Baseline Corpus vs Proposed Corrigendum)
            </h4>
            <div className="space-y-4">
              {impactReport.diffs.map((diff: any) => (
                <div key={diff.id} className="border border-neutral rounded-sm p-4 space-y-3 bg-surface text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-ink">{diff.clause_number}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-flow-core/10 text-flow-core border border-flow-core/20">
                      {diff.diff_type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-sm text-rose-950 space-y-1">
                      <span className="font-mono font-bold text-[10px] uppercase text-rose-800 block">
                        Old Baseline Text
                      </span>
                      <p className="line-through text-[11px] leading-relaxed">{diff.old_text}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-sm text-emerald-950 space-y-1">
                      <span className="font-mono font-bold text-[10px] uppercase text-emerald-800 block">
                        Amended Corrigendum Text
                      </span>
                      <p className="text-[11px] leading-relaxed font-semibold">{diff.new_text}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-secondary italic">Impact Analysis: {diff.impact_summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* React Flow Signature Visualizer */}
          {impactReport.items.length > 0 && (
            <div className="bg-paper border border-neutral rounded-sm p-6 shadow-xs">
              <div className="mb-4">
                <h4 className="font-heading font-bold text-ink text-sm">
                  Signature Traceability Pipeline
                </h4>
                <p className="text-xs text-ink-secondary">
                  Amendment → Clause → Rule → Workflow Stage → Application Dossier → Recommended Action
                </p>
              </div>

              <TraceabilityGraph
                amendmentNumber={selectedAmd.amendment_number}
                clauseNumber={impactReport.diffs[0]?.clause_number || "Clause 1.8"}
                ruleCode="RULE-FIRE-01"
                workflowName="Starting a new Programme/Level"
                applicationNumber="APP-2024-MIT-001"
                recommendedAction={impactReport.items[0]?.recommended_action || ""}
                applicability={impactReport.items[0]?.applicability || "AMBIGUOUS_RETROSPECTIVE"}
                approvalStatus={impactReport.items[0]?.approval_status || "PENDING"}
                onApprove={() => handleApproveAction(impactReport.items[0].id, "APPROVED")}
                onReject={() => handleApproveAction(impactReport.items[0].id, "REJECTED")}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Grounded Q&A */}
      {activeTab === "qa" && (
        <div className="bg-paper border border-neutral rounded-sm p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-bold text-ink text-base">Grounded Regulatory Q&A Assistant</h3>
            <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
              Strictly grounded in AICTE Approval Process Handbook (2024–2027) corpus. The engine honestly abstains when statutory evidence is absent.
            </p>
          </div>

          <form onSubmit={handleAskQa} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={qaQuery}
              onChange={(e) => setQaQuery(e.target.value)}
              placeholder="Inquire regulatory provisions (e.g. 'What does Clause 1.8(g) say about re-scrutiny?')"
              className="flex-1 text-xs px-4 py-2.5 border border-neutral rounded-full bg-surface focus:bg-paper focus:border-flow-core focus:ring-1 focus:ring-flow-rim focus:outline-none"
            />
            <button
              type="submit"
              disabled={askingQa}
              className="m-btn text-xs"
            >
              <span>{askingQa ? "Consulting..." : "Consult Handbook"}</span>
            </button>
          </form>

          {/* Quick Questions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-secondary font-medium font-mono text-[11px]">Inquire:</span>
            <button
              type="button"
              onClick={() => setQaQuery("What does clause 1.8(g) say about re-scrutiny scope?")}
              className="px-2.5 py-1 bg-surface hover:bg-neutral/40 rounded-full text-ink border border-neutral font-medium"
            >
              Clause 1.8(g) Re-Scrutiny Scope
            </button>
            <button
              type="button"
              onClick={() => setQaQuery("What are the appeal deadlines under Clause 1.11 and 2.24?")}
              className="px-2.5 py-1 bg-surface hover:bg-neutral/40 rounded-full text-ink border border-neutral font-medium"
            >
              Clause 1.11 vs 2.24 Appeal Deadlines
            </button>
            <button
              type="button"
              onClick={() => setQaQuery("What are the quantum physics laws governing semiconductors?")}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 rounded-full text-rose-800 border border-rose-200 font-medium"
            >
              Test Honest Abstention
            </button>
          </div>

          {/* Q&A Response Card */}
          {qaResponse && (
            <div
              className={`p-6 rounded-sm border space-y-4 text-xs ${
                qaResponse.abstained ? "bg-amber-50/70 border-amber-200" : "bg-surface border-neutral"
              }`}
            >
              <div className="flex items-center justify-between border-b border-neutral pb-3">
                <span className="font-heading font-bold text-ink text-sm">
                  {qaResponse.abstained ? "Statutory Abstention Notice" : "Synthesized AICTE Regulatory Finding"}
                </span>
                <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-paper border border-neutral text-ink">
                  Confidence: {(qaResponse.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="text-ink whitespace-pre-line leading-relaxed text-xs">
                {qaResponse.answer}
              </div>

              {qaResponse.citations && qaResponse.citations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral">
                  <span className="font-mono font-bold text-ink-secondary uppercase tracking-wider text-[10px] block">
                    Grounded Statutory Citations
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qaResponse.citations.map((c: any, i: number) => (
                      <div key={i} className="bg-paper p-3.5 rounded-sm border border-neutral text-xs space-y-1">
                        <div className="font-heading font-bold text-flow-core">Clause {c.clause_number}: {c.title}</div>
                        <p className="text-ink-secondary italic text-[11px] leading-relaxed">{c.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Clause Browser */}
      {activeTab === "clauses" && (
        <div className="bg-paper border border-neutral rounded-sm p-6 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral pb-3">
            <div>
              <h4 className="font-heading font-bold text-ink text-sm">AICTE Approval Process Handbook Corpus</h4>
              <p className="text-ink-secondary text-[11px]">Authoritative reference text for institutional scrutiny</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-ink-secondary" />
              <input
                type="text"
                value={clauseSearch}
                onChange={(e) => setClauseSearch(e.target.value)}
                placeholder="Search clauses or titles..."
                className="w-full pl-9 pr-3 py-1.5 border border-neutral rounded-full text-xs bg-surface focus:bg-paper focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredClauses.map((c) => (
              <div key={c.id} className="border border-neutral p-4 rounded-sm space-y-1.5 bg-surface">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-flow-core">Clause {c.clause_number}</span>
                    <span className="font-heading font-bold text-ink">{c.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-ink-secondary bg-paper px-2 py-0.5 rounded-full border border-neutral">
                    {c.section}
                  </span>
                </div>
                <p className="text-ink-secondary leading-relaxed text-[11px]">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Rule Registry */}
      {activeTab === "rules" && (
        <div className="bg-paper border border-neutral rounded-sm p-6 shadow-xs space-y-4 text-xs">
          <div className="border-b border-neutral pb-2">
            <h4 className="font-heading font-bold text-ink text-sm">Structured Rule Definitions & OCR Mapping</h4>
            <p className="text-ink-secondary text-[11px]">System rules governing automated document evaluation</p>
          </div>
          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.id} className="border border-neutral p-4 rounded-sm space-y-2 bg-surface">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ink bg-paper border border-neutral px-2 py-0.5 rounded-full">
                      {r.rule_code}
                    </span>
                    <span className="font-heading font-bold text-ink">{r.name}</span>
                  </div>
                  <ProvenanceBadge type={r.verification_status} size="sm" />
                </div>
                <p className="text-ink-secondary text-[11px] leading-relaxed">{r.description}</p>
                <div className="text-[10px] font-mono text-ink-secondary pt-1 border-t border-neutral/60">
                  Required Document Fields: {r.required_fields?.join(", ") || "None"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
