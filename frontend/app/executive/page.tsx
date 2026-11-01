"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Briefcase,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const COLORS = ["#141b26", "#155386", "#3e7da3", "#65a9c2", "#93d9e4"];

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboardKpis(), api.getApplications()])
      .then(([kpiData, appData]) => {
        setKpis(kpiData);
        setApplications(appData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono font-semibold text-ink-secondary">
        Loading Executive Roster Intelligence...
      </div>
    );
  }

  const filteredApps = applications.filter((app) => {
    if (selectedFilter === "OPEN") return app.status === "IN_PROGRESS" || app.status === "DEFICIENT";
    if (selectedFilter === "DEFICIENT") return app.status === "DEFICIENT";
    if (selectedFilter === "HIGH_RISK") return app.delay_risk_predicted >= 0.65;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-secondary mb-1">
            <ContourBadgeSwatch variant="flow" />
            <span>AICTE Apex Directorate</span>
            <span>•</span>
            <span className="text-flow-core font-bold">Executive Roster Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Executive Command Centre
          </h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            National application roster, processing trends, and stage-wise delay risks under AICTE Approval Process Handbook (2024–2027).
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ProvenanceBadge type="RULE-COMPUTED" />
          <ProvenanceBadge type="SIMULATED" />
        </div>
      </div>

      {/* KPI Stat Cards (Drilldown enabled) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedFilter("ALL")}
          className={`p-5 rounded-sm border text-left transition shadow-xs ${
            selectedFilter === "ALL"
              ? "bg-navy text-paper border-navy shadow-sheet"
              : "bg-paper text-ink border-neutral hover:bg-surface"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold uppercase tracking-wider opacity-80">Total Docket</span>
            <FileText size={18} />
          </div>
          <div className="text-3xl font-heading font-bold mt-2">{kpis.total_applications}</div>
          <p className={`text-[11px] mt-1 ${selectedFilter === "ALL" ? "text-neutral/70" : "text-ink-secondary"}`}>Live applications in system</p>
        </button>

        <button
          onClick={() => setSelectedFilter("OPEN")}
          className={`p-5 rounded-sm border text-left transition shadow-xs ${
            selectedFilter === "OPEN"
              ? "bg-navy text-paper border-navy shadow-sheet"
              : "bg-paper text-ink border-neutral hover:bg-surface"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold uppercase tracking-wider opacity-80">Open Processing</span>
            <Clock size={18} className="text-flow-core" />
          </div>
          <div className="text-3xl font-heading font-bold mt-2 text-flow-core">{kpis.open_applications}</div>
          <p className={`text-[11px] mt-1 ${selectedFilter === "OPEN" ? "text-neutral/70" : "text-ink-secondary"}`}>Under Scrutiny or EVC</p>
        </button>

        <button
          onClick={() => setSelectedFilter("DEFICIENT")}
          className={`p-5 rounded-sm border text-left transition shadow-xs ${
            selectedFilter === "DEFICIENT"
              ? "bg-navy text-paper border-navy shadow-sheet"
              : "bg-paper text-ink border-neutral hover:bg-surface"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold uppercase tracking-wider opacity-80">Active Deficiencies</span>
            <AlertTriangle size={18} className="text-shallow-core" />
          </div>
          <div className="text-3xl font-heading font-bold mt-2 text-shallow-core">{kpis.active_deficiencies}</div>
          <p className={`text-[11px] mt-1 ${selectedFilter === "DEFICIENT" ? "text-neutral/70" : "text-ink-secondary"}`}>Awaiting re-scrutiny resolution</p>
        </button>

        <button
          onClick={() => setSelectedFilter("HIGH_RISK")}
          className={`p-5 rounded-sm border text-left transition shadow-xs ${
            selectedFilter === "HIGH_RISK"
              ? "bg-navy text-paper border-navy shadow-sheet"
              : "bg-paper text-ink border-neutral hover:bg-surface"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold uppercase tracking-wider opacity-80">Predicted Delay Risk</span>
            <TrendingUp size={18} className="text-deep-core" />
          </div>
          <div className="text-3xl font-heading font-bold mt-2 text-deep-core">{kpis.high_delay_risk_count}</div>
          <p className={`text-[11px] mt-1 ${selectedFilter === "HIGH_RISK" ? "text-neutral/70" : "text-ink-secondary"}`}>Probability &gt; 65% of cycle breach</p>
        </button>
      </div>

      {/* Visual Charts: Stage Pendency & Regional Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage Pendency */}
        <div className="bg-paper border border-neutral rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral pb-2">
            <h4 className="font-heading font-bold text-ink text-sm">Stage-Wise File Pendency</h4>
            <span className="text-[10px] font-mono text-ink-secondary bg-surface px-2 py-0.5 rounded-full border border-neutral">
              Statutory Stages
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis.stage_distribution}>
                <XAxis dataKey="stage" stroke="#4a5059" fontSize={10} tickLine={false} />
                <YAxis stroke="#4a5059" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#14171b",
                    borderRadius: "4px",
                    border: "none",
                    color: "#fbfcfc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#155386" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-paper border border-neutral rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral pb-2">
            <h4 className="font-heading font-bold text-ink text-sm">Regional Caseload Distribution</h4>
            <span className="text-[10px] font-mono text-ink-secondary bg-surface px-2 py-0.5 rounded-full border border-neutral">
              Regional Desks
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpis.regional_distribution}
                  dataKey="count"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {kpis.regional_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#14171b",
                    borderRadius: "4px",
                    border: "none",
                    color: "#fbfcfc",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filtered Application Roster Table */}
      <div className="bg-paper border border-neutral rounded-sm overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral flex items-center justify-between bg-surface">
          <div>
            <h4 className="font-heading font-bold text-ink text-sm">
              Filtered Applications: {selectedFilter} ({filteredApps.length})
            </h4>
            <p className="text-xs text-ink-secondary">Click on any file to open the scrutiny dossier</p>
          </div>
          <button
            onClick={() => setSelectedFilter("ALL")}
            className="text-xs text-flow-core hover:underline font-bold"
          >
            Reset Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-neutral text-ink-secondary font-mono font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Delay Risk</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral/50">
              {filteredApps.slice(0, 10).map((app) => (
                <tr key={app.id} className="hover:bg-surface/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-flow-core">{app.application_number}</td>
                  <td className="py-3.5 px-4 font-heading font-bold text-ink">{app.institution_name}</td>
                  <td className="py-3.5 px-4 text-ink-secondary">{app.region}</td>
                  <td className="py-3.5 px-4 text-ink-secondary font-medium">{app.application_type}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-neutral text-ink">
                      {app.current_stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        app.delay_risk_predicted >= 0.65
                          ? "bg-rose-50 text-rose-900 border-rose-200"
                          : "bg-surface text-ink border-neutral"
                      }`}
                    >
                      {(app.delay_risk_predicted * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/scrutiny?app_id=${app.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-flow-core hover:text-navy bg-surface border border-neutral px-2.5 py-1 rounded-full transition"
                    >
                      <span>Review</span>
                      <ArrowRight size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
