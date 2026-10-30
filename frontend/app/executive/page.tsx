"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
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
} from "lucide-react";

const COLORS = ["#102a43", "#334e68", "#627d98", "#9fb3c8", "#bcccdc"];

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Executive Command Centre</h2>
          <p className="text-xs text-slate-500 font-mono">
            AICTE National Application Roster & Institutional Processing Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProvenanceBadge type="RULE-COMPUTED" />
          <ProvenanceBadge type="SIMULATED" />
        </div>
      </div>

      {/* KPI Stat Cards (Drilldown enabled) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedFilter("ALL")}
          className={`p-5 rounded-2xl border text-left transition shadow-sm ${
            selectedFilter === "ALL" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-900 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total Docket</span>
            <FileText size={18} />
          </div>
          <div className="text-3xl font-black mt-2">{kpis.total_applications}</div>
          <p className="text-[11px] opacity-70 mt-1">Live applications in system</p>
        </button>

        <button
          onClick={() => setSelectedFilter("OPEN")}
          className={`p-5 rounded-2xl border text-left transition shadow-sm ${
            selectedFilter === "OPEN" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-900 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Open Processing</span>
            <Clock size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-black mt-2 text-blue-500">{kpis.open_applications}</div>
          <p className="text-[11px] opacity-70 mt-1">Under Scrutiny, EVC, or SAC</p>
        </button>

        <button
          onClick={() => setSelectedFilter("DEFICIENT")}
          className={`p-5 rounded-2xl border text-left transition shadow-sm ${
            selectedFilter === "DEFICIENT" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-900 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Active Deficiencies</span>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <div className="text-3xl font-black mt-2 text-rose-500">{kpis.active_deficiencies}</div>
          <p className="text-[11px] opacity-70 mt-1">Awaiting re-scrutiny resolution</p>
        </button>

        <button
          onClick={() => setSelectedFilter("HIGH_RISK")}
          className={`p-5 rounded-2xl border text-left transition shadow-sm ${
            selectedFilter === "HIGH_RISK" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-900 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Predicted Delay Risk</span>
            <TrendingUp size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black mt-2 text-amber-500">{kpis.high_delay_risk_count}</div>
          <p className="text-[11px] opacity-70 mt-1">Probability &gt; 65% of cycle breach</p>
        </button>
      </div>

      {/* Visual Charts: Stage Pendency & Regional Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage Pendency */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Stage-Wise File Pendency</h4>
            <span className="text-[11px] text-slate-500 font-mono">Dwell Volume</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis.stage_distribution}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Regional Caseload Distribution</h4>
            <span className="text-[11px] text-slate-500 font-mono">5 AICTE Regions</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpis.regional_distribution}
                  dataKey="count"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {kpis.regional_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Drill-Down Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-2">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Application Records Drill-Down (Filter: {selectedFilter})
            </h4>
            <p className="text-xs text-slate-500">Showing {filteredApps.length} matched files</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Click file to inspect full lineage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Application No.</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Delay Risk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.slice(0, 15).map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{app.application_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{app.institution_name}</td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">{app.application_type}</td>
                  <td className="py-3 px-4 font-mono text-[11px] font-semibold text-blue-800">{app.current_stage}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-800"
                          : app.status === "DEFICIENT"
                          ? "bg-rose-50 text-rose-800"
                          : "bg-blue-50 text-blue-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`font-bold ${
                        app.delay_risk_predicted >= 0.65
                          ? "text-rose-600"
                          : app.delay_risk_predicted >= 0.4
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {(app.delay_risk_predicted * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/officer?appId=${app.id}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] inline-flex items-center gap-1"
                    >
                      <span>Open Dossier</span>
                      <ArrowUpRight size={12} />
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
