"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  TrendingUp,
  Filter,
  PlayCircle,
  ArrowRight,
  ShieldAlert,
  Info,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { currentRole } = useAppStore();
  const [kpis, setKpis] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, [selectedRegion, selectedType, selectedStage]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (selectedRegion) filters.region = selectedRegion;
      if (selectedType) filters.application_type = selectedType;
      if (selectedStage) filters.current_stage = selectedStage;

      const [kpiData, appsData] = await Promise.all([
        api.getDashboardKpis(filters),
        api.getApplications(filters),
      ]);
      setKpis(kpiData);
      setApplications(appsData);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>AICTE Approval Process 2024–2027</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">Executive & Operational Command</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Administrative Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time status reconciliation across Table 2.3 application pipelines, procedural scrutiny, and statutory deadlines.
          </p>
        </div>

        {/* Quick Launch & Demo CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-sm"
          >
            <PlayCircle size={15} />
            <span>Signature Demo (4 Stages)</span>
          </Link>
          <Link
            href="/scrutiny"
            className="flex items-center gap-1.5 bg-[#0a192f] hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shadow-sm"
          >
            <span>Scrutiny Dossier</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Filter size={14} className="text-blue-600" />
          <span>Filter Records:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Region Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Regions</option>
              <option value="Western">Western (Mumbai/Pune)</option>
              <option value="Northern">Northern (Kanpur/Delhi)</option>
              <option value="Southern">Southern (Chennai)</option>
              <option value="Eastern">Eastern (Kolkata)</option>
              <option value="South-Western">South-Western (Bengaluru)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Category:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              <option value="Starting a new Programme/Level">Starting New Programme/Level</option>
              <option value="EoA based on Self-Disclosure">EoA Self-Disclosure</option>
              <option value="Change of Institution Name/Site">Change of Name/Site</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Stages</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="SCRUTINY">Under Scrutiny</option>
              <option value="DEFICIENCY_ISSUED">Deficiency Issued</option>
              <option value="RE_SCRUTINY">Targeted Re-Scrutiny</option>
              <option value="EVC_SCHEDULED">EVC Scheduled</option>
              <option value="EC_CONSIDERATION">EC Consideration</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>

          {(selectedRegion || selectedType || selectedStage) && (
            <button
              onClick={() => { setSelectedRegion(""); setSelectedType(""); setSelectedStage(""); }}
              className="text-blue-700 hover:underline font-bold text-xs ml-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Applications</span>
            <FileText size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis?.total_applications ?? 60}</div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Reconciled in database</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>In Processing</span>
            <Clock size={15} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{kpis?.open_applications ?? 42}</div>
          <span className="text-[10px] text-amber-600/80 font-medium mt-0.5 block">Active workflow state</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Active Deficiencies</span>
            <AlertTriangle size={15} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{kpis?.active_deficiencies ?? 8}</div>
          <span className="text-[10px] text-rose-600/80 font-medium mt-0.5 block">Awaiting resubmission</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>High Risk Files</span>
            <ShieldAlert size={15} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{kpis?.high_delay_risk_count ?? 14}</div>
          <span className="text-[10px] text-purple-600/80 font-medium mt-0.5 block">Score &ge; 65/100 (Synthetic)</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Approved / Final</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{kpis?.approved_applications ?? 18}</div>
          <span className="text-[10px] text-emerald-600/80 font-medium mt-0.5 block">EC speaking orders</span>
        </div>
      </div>

      {/* Main Analysis Grid: Stage-wise Pendency + Regional Caseload */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Stage-wise Pendency Breakdown */}
        <div className="md:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Stage-Wise Application Pendency</h2>
              <p className="text-xs text-slate-500">Distribution across statutory approval stages</p>
            </div>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              Table 2.3 Compliance
            </span>
          </div>

          <div className="space-y-3">
            {(kpis?.stage_distribution || [
              { stage: "SUBMITTED", count: 8 },
              { stage: "SCRUTINY", count: 18 },
              { stage: "DEFICIENCY_ISSUED", count: 7 },
              { stage: "RE_SCRUTINY", count: 5 },
              { stage: "EVC_SCHEDULED", count: 4 },
              { stage: "APPROVED", count: 18 },
            ]).map((s: any) => {
              const max = kpis?.total_applications || 60;
              const pct = Math.round((s.count / (max || 1)) * 100);
              return (
                <div key={s.stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold">{s.stage.replace(/_/g, " ")}</span>
                    <span className="font-mono text-slate-900 font-bold">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.stage === "APPROVED"
                          ? "bg-emerald-500"
                          : s.stage.includes("DEFICIENCY")
                          ? "bg-rose-500"
                          : s.stage === "RE_SCRUTINY"
                          ? "bg-amber-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Workload Distribution */}
        <div className="md:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Regional Caseload & Desk Pressure</h2>
              <p className="text-xs text-slate-500">Applications assigned to regional offices</p>
            </div>
            <Building2 size={16} className="text-slate-400" />
          </div>

          <div className="space-y-2.5">
            {(kpis?.regional_distribution || [
              { region: "Western", count: 18 },
              { region: "Northern", count: 14 },
              { region: "Southern", count: 12 },
              { region: "Eastern", count: 8 },
              { region: "South-Western", count: 8 },
            ]).map((r: any) => (
              <div
                key={r.region}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{r.region} Region</span>
                  <span className="text-[10px] text-slate-500 font-mono">RO Desk</span>
                </div>
                <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {r.count} applications
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Directory Drilldown Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Technical Applications</h2>
            <p className="text-xs text-slate-500">
              Showing {applications.length} applications matched to current operational criteria
            </p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Complete Applications Registry</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">App Number</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Category (Table 2.3)</th>
                <th className="px-4 py-3">Current Stage</th>
                <th className="px-4 py-3">Delay Risk</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.slice(0, 8).map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-mono font-bold text-blue-900">
                    {app.application_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{app.institution_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">AICTE ID: {app.institution_aicte_id} • {app.region}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {app.application_type}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {app.current_stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        app.delay_risk_predicted >= 0.65 ? "bg-rose-500" : app.delay_risk_predicted >= 0.35 ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <span className="font-mono font-bold text-[11px] text-slate-700">
                        Demo score: {Math.round(app.delay_risk_predicted * 100)}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/scrutiny?app_id=${app.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-950 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded transition"
                    >
                      <span>Scrutiny Dossier</span>
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
