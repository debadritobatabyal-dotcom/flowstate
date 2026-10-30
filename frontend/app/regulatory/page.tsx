"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TraceabilityGraph } from "@/components/TraceabilityGraph";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-700" size={20} />
            <h2 className="text-xl font-bold text-slate-900">Regulatory Intelligence & Change Impact Desk</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Governing Corpus: AICTE Approval Process Handbook (2024–2027) & Statutory Corrigenda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceBadge type="RULE-COMPUTED" />
          <ProvenanceBadge type="HUMAN-VERIFIED" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab("diff")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "diff" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Clause Diff & Impact Graph
        </button>
        <button
          onClick={() => setActiveTab("qa")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "qa" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Grounded Regulatory Q&A
        </button>
        <button
          onClick={() => setActiveTab("clauses")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "clauses" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Clause Browser ({clauses.length})
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "rules" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Rule Registry ({rules.length})
        </button>
      </div>

      {/* Tab 1: Clause Diff & Impact Graph */}
      {activeTab === "diff" && selectedAmd && impactReport && (
        <div className="space-y-6">
          {/* Amendment Card */}
          <div className="bg-[#0a192f] text-white rounded-xl p-6 shadow-sm space-y-3 border border-slate-800">
            {/* Prominent Warning Banner */}
            <div className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-slate-950" />
              <span>ILLUSTRATIVE SYNTHETIC AMENDMENT — NOT AN OFFICIAL AICTE NOTIFICATION.</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-300 font-bold">Simulated Policy Corrigendum</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedAmd.title}</h3>
                <span className="font-mono text-xs text-slate-400">Identifier: {selectedAmd.amendment_number} • Demonstrates Ambiguous Retrospective Impact</span>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded">
                {selectedAmd.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedAmd.summary}</p>
          </div>


          {/* Clause Diff View */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Clause Comparison (Old Baseline vs Proposed Amendment)</h4>
            <div className="space-y-4">
              {impactReport.diffs.map((diff: any) => (
                <div key={diff.id} className="border rounded-xl p-4 space-y-3 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{diff.clause_number}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-900">
                      {diff.diff_type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-rose-50/70 border border-rose-200 p-3 rounded-lg text-rose-950 space-y-1">
                      <span className="font-bold text-[10px] uppercase text-rose-700 block">Old Baseline Text</span>
                      <p className="line-through text-[11px] leading-relaxed">{diff.old_text}</p>
                    </div>
                    <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg text-emerald-950 space-y-1">
                      <span className="font-bold text-[10px] uppercase text-emerald-700 block">Amended Provision Text</span>
                      <p className="text-[11px] leading-relaxed font-semibold">{diff.new_text}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 italic">Impact: {diff.impact_summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* React Flow Dependency Visualizer */}
          {impactReport.items.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Grounded Regulatory Q&A Engine</h3>
            <p className="text-xs text-slate-500">
              Grounded in the AICTE Approval Process Handbook (2024–2027). The system honestly abstains when reliable evidence is unavailable.
            </p>
          </div>

          <form onSubmit={handleAskQa} className="flex gap-2">
            <input
              type="text"
              value={qaQuery}
              onChange={(e) => setQaQuery(e.target.value)}
              placeholder="Ask a question (e.g. 'What does Clause 1.8(g) say about re-scrutiny?')"
              className="flex-1 text-xs px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={askingQa}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              {askingQa ? "Searching..." : "Ask Handbook"}
            </button>
          </form>

          {/* Quick Questions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Try:</span>
            <button
              type="button"
              onClick={() => setQaQuery("What does clause 1.8(g) say about re-scrutiny scope?")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
            >
              Clause 1.8(g) Re-Scrutiny Scope
            </button>
            <button
              type="button"
              onClick={() => setQaQuery("What are the appeal deadlines under Clause 1.11 and 2.24?")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
            >
              Clause 1.11 vs 2.24 Appeal Deadlines
            </button>
            <button
              type="button"
              onClick={() => setQaQuery("What are the quantum physics laws governing semiconductors?")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-rose-700"
            >
              Test Honest Abstention
            </button>
          </div>

          {/* Q&A Response Card */}
          {qaResponse && (
            <div
              className={`p-6 rounded-2xl border space-y-4 text-xs ${
                qaResponse.abstained ? "bg-amber-50/70 border-amber-200" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-bold text-slate-900 text-sm">
                  {qaResponse.abstained ? "Regulatory Abstention Notice" : "Official Synthesized Answer"}
                </span>
                <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded bg-white border">
                  Confidence: {(qaResponse.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="text-slate-800 whitespace-pre-line leading-relaxed text-xs">
                {qaResponse.answer}
              </div>

              {qaResponse.citations.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Grounded Statutory Citations
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qaResponse.citations.map((c: any, i: number) => (
                      <div key={i} className="bg-white p-3 rounded-lg border text-xs space-y-1">
                        <div className="font-bold text-blue-900">{c.clause_number}: {c.title}</div>
                        <p className="text-slate-600 italic text-[11px]">{c.excerpt}</p>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">AICTE Approval Process Handbook Clause Browser</h4>
            <input
              type="text"
              value={clauseSearch}
              onChange={(e) => setClauseSearch(e.target.value)}
              placeholder="Search clauses..."
              className="p-2 border rounded-lg text-xs w-64"
            />
          </div>

          <div className="space-y-3">
            {filteredClauses.map((c) => (
              <div key={c.id} className="border p-4 rounded-xl space-y-1.5 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900">{c.clause_number}</span>
                    <span className="font-bold text-slate-900">{c.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{c.section}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Rule Registry */}
      {activeTab === "rules" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">Structured Rule Registry & Verification Status</h4>
          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.id} className="border p-4 rounded-xl space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{r.rule_code}</span>
                    <span className="font-bold text-slate-800">{r.name}</span>
                  </div>
                  <ProvenanceBadge type={r.verification_status} size="sm" />
                </div>
                <p className="text-slate-600">{r.description}</p>
                <div className="text-[11px] font-mono text-slate-500">
                  Required Fields: {r.required_fields.join(", ") || "None"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
