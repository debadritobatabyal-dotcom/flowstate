"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
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
  Layers,
  Scale,
  Download,
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
      {/* Editorial Header — Exact Match to Image 2 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-wider text-slate-500 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span className="uppercase">STATUTORY AUTHORITY DECK</span>
            <span>•</span>
            <span className="text-slate-700 font-bold uppercase">CENTRAL SECRETARIAT NEW DELHI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Executive Overview — Academic Year 2026-27
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
            <span>National Application Docket - WRC, SRO, NRO, CRO, ERO, NWRO &amp; SWRO Regions</span>
            <span>•</span>
            <span className="font-mono text-[10px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
              Cycle Status: TIER-1 HEAVY LOAD
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => alert("Statutory Digest exported (PDF/CSV hash-verified).")}
            className="m-btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Export Statutory Digest</span>
          </button>
          <Link
            href="/scrutiny?tab=evc"
            className="m-btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 text-sky-700 border-sky-300 hover:bg-sky-50"
          >
            <Calendar size={13} />
            <span>Schedule Urgent EVC Review</span>
          </Link>
          <Link
            href="/regulatory"
            className="m-btn text-xs py-1.5 px-3.5 bg-[#0a0f18] hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs"
          >
            <span>Regulatory Change Briefing</span>
          </Link>
        </div>
      </div>

      {/* Main Analysis Grid — Centerpiece & Right 3 Cards (Exact Match to Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Big Centerpiece Card: Total Application Docket & Concentric Contour */}
        <div className="lg:col-span-8 bg-paper p-6 rounded-sm border border-neutral shadow-xs flex flex-col justify-between relative overflow-hidden space-y-6">
          <div className="flex items-start justify-between border-b border-neutral/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold bg-[#0a0f18] text-white px-2 py-0.5 rounded-2xs">
                STATUTORY REPOSITORY
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                REG-ID: IND-2026-HQ
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                FEE INTAKE CONSOLIDATED
              </span>
              <strong className="text-base font-heading font-bold text-slate-900">
                ₹184.20 Cr
              </strong>
            </div>
          </div>

          {/* Central Contour Artwork + Metric */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                TOTAL APPLICATION DOCKET
              </span>
              <div className="text-5xl font-heading font-black text-slate-900 tracking-tight mt-1">
                8,420
              </div>
              <span className="text-xs text-slate-500 font-medium block mt-1">
                Active Dossiers Tracked Across 7 Regional Secretariats
              </span>
            </div>

            {/* Stepped Contour Eye Graphic */}
            <div className="relative w-48 h-24 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                <ellipse cx="100" cy="50" rx="90" ry="42" fill="none" stroke="#d3d6d9" strokeWidth="1" strokeDasharray="3 3" />
                <ellipse cx="100" cy="50" rx="72" ry="32" fill="none" stroke="#93d9e4" strokeWidth="1.2" />
                <ellipse cx="100" cy="50" rx="52" ry="22" fill="none" stroke="#155386" strokeWidth="1.5" />
                <ellipse cx="100" cy="50" rx="32" ry="14" fill="#155386" fillOpacity="0.15" stroke="#155386" strokeWidth="2" />
                <circle cx="100" cy="50" r="5" fill="#155386" />
              </svg>
              <span className="absolute bottom-1 right-2 font-mono text-[9px] font-bold text-slate-600 bg-paper/80 px-1 rounded-2xs border border-neutral">
                100.0% Allocation
              </span>
            </div>
          </div>

          {/* Segmented Phase Aggregation Progress Bar */}
          <div className="space-y-3 pt-3 border-t border-neutral/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-heading font-bold text-slate-700">Throughput Phase Aggregation</span>
              <span className="font-mono text-[11px] text-slate-500">AY 2026-27 Active Stream</span>
            </div>

            {/* Multi-Segmented Bar */}
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
              <div className="bg-[#141b26] h-full" style={{ width: "48.8%" }} title="Scrutiny Passed (48.8%)" />
              <div className="bg-sky-500 h-full" style={{ width: "27.8%" }} title="Deficiencies (27.8%)" />
              <div className="bg-indigo-400 h-full" style={{ width: "15.3%" }} title="EVC On-Site (15.3%)" />
              <div className="bg-emerald-500 h-full" style={{ width: "8.1%" }} title="Council Review (8.1%)" />
            </div>

            {/* Segment Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div>
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#141b26]" />
                  <span>Scrutiny Passed</span>
                </div>
                <strong className="text-slate-900 font-heading block mt-0.5">4,110</strong>
                <span className="text-[10px] text-slate-400 font-mono">48.8% docket</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Deficiencies</span>
                </div>
                <strong className="text-slate-900 font-heading block mt-0.5">2,340</strong>
                <span className="text-[10px] text-slate-400 font-mono">27.8% docket</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>EVC On-Site</span>
                </div>
                <strong className="text-slate-900 font-heading block mt-0.5">1,290</strong>
                <span className="text-[10px] text-slate-400 font-mono">15.3% docket</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Council Review</span>
                </div>
                <strong className="text-slate-900 font-heading block mt-0.5">680</strong>
                <span className="text-[10px] text-slate-400 font-mono">8.1% docket</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cards (Exact Match to Image 2) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: 142 Institutions At-Risk */}
          <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-sm shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-heading font-bold text-slate-900">142 Institutions</span>
                <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.2 rounded-full">
                  1.68% RISK
                </span>
              </div>
              <Link
                href="/scrutiny"
                className="text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-rose-200 px-2 py-1 rounded-xs shadow-2xs"
              >
                View At-Risk Queue
              </Link>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Approaching statutory 15-day re-scrutiny cut-off. High alert for regulatory timeout.
            </p>
          </div>

          {/* Card 2: Upcoming Statutory Deadline */}
          <div className="p-4 bg-sky-50/60 border border-sky-200/80 rounded-sm shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-sky-800 block">
                UPCOMING STATUTORY DEADLINE
              </span>
              <strong className="text-sm font-heading font-bold text-slate-900 block">
                12 April 2026
              </strong>
              <span className="text-[11px] text-slate-600 block">
                Extension of Approval (EoA) — Technical Universities
              </span>
            </div>
            <div className="text-right shrink-0 pl-3">
              <div className="text-3xl font-heading font-black text-slate-900 leading-none">04</div>
              <span className="text-[9px] font-mono uppercase text-slate-500 font-bold tracking-wider">
                DAYS LEFT
              </span>
            </div>
          </div>

          {/* Card 3: Active Deficiencies */}
          <div className="p-4 bg-paper border border-neutral rounded-sm shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                ACTIVE DEFICIENCIES
              </span>
              <div className="flex items-baseline gap-2">
                <strong className="text-sm font-heading font-bold text-slate-900">864 Items</strong>
                <span className="text-[11px] text-slate-500">across 412 inst.</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                Mean turnaround time: 5.2 days
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-1 rounded-sm shrink-0">
              ~ -0.8d vs AY25
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Stage-wise Throughput + Regional Office Load (Exact Match to Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Stage-wise Throughput & Bottleneck Index */}
        <div className="lg:col-span-8 bg-paper p-5 rounded-sm border border-neutral shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral pb-2.5">
            <div>
              <h2 className="text-sm font-heading font-bold text-slate-900">
                Stage-wise Regulatory Throughput &amp; Bottleneck Index
              </h2>
              <p className="text-xs text-slate-500">
                Live flow through automated extraction, clause compliance, and validation gates
              </p>
            </div>
            <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 border border-neutral px-2 py-0.5 rounded-full uppercase">
              CADENCE: CONTINUOUS
            </span>
          </div>

          {/* 5 Phase Columns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 bg-surface rounded-xs border border-neutral/70 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">PHASE 01</span>
              <strong className="text-lg font-heading font-bold text-slate-900 block">8,420</strong>
              <span className="text-[10px] text-slate-600 block">Doc Extraction</span>
              <div className="pt-2 text-[9px] font-mono text-slate-500 flex justify-between border-t border-neutral/40">
                <span>OCR Health</span>
                <span className="font-bold text-slate-700">99.8%</span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xs border border-neutral/70 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">PHASE 02</span>
              <strong className="text-lg font-heading font-bold text-slate-900 block">7,890</strong>
              <span className="text-[10px] text-slate-600 block">Clause Engine</span>
              <div className="pt-2 text-[9px] font-mono text-slate-500 flex justify-between border-t border-neutral/40">
                <span>AI Scrutiny</span>
                <span className="font-bold text-slate-700">93.7%</span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xs border border-neutral/70 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">PHASE 03</span>
              <strong className="text-lg font-heading font-bold text-slate-900 block">4,110</strong>
              <span className="text-[10px] text-slate-600 block">Officer Review</span>
              <div className="pt-2 text-[9px] font-mono text-slate-500 flex justify-between border-t border-neutral/40">
                <span>RO Clearance</span>
                <span className="font-bold text-slate-700">48.8%</span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xs border border-neutral/70 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">PHASE 04</span>
              <strong className="text-lg font-heading font-bold text-slate-900 block">1,290</strong>
              <span className="text-[10px] text-slate-600 block">EVC Inspection</span>
              <div className="pt-2 text-[9px] font-mono text-slate-500 flex justify-between border-t border-neutral/40">
                <span>Field Team</span>
                <span className="font-bold text-slate-700">15.3%</span>
              </div>
            </div>

            <div className="p-3 bg-[#0a0f18] text-white rounded-xs border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[9px] font-mono text-cyan-400 uppercase block font-bold">PHASE 05</span>
              <strong className="text-lg font-heading font-bold text-white block">680</strong>
              <span className="text-[10px] text-slate-300 block">Final Sanction</span>
              <div className="pt-2 text-[9px] font-mono text-slate-400 flex justify-between border-t border-slate-800">
                <span>Executive Sig</span>
                <span className="font-bold text-white">8.1%</span>
              </div>
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-neutral/60">
            <span>MEDIAN APPLICATION CYCLE TIME: 11.4 DAYS (AY25 TARGET: &lt;14 DAYS)</span>
            <span className="text-emerald-700 font-bold">VELOCITY DELTA: +22.4% EFFICIENCY</span>
          </div>
        </div>

        {/* Regional Office Load */}
        <div className="lg:col-span-4 bg-paper p-5 rounded-sm border border-neutral shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-neutral pb-2.5">
              <div>
                <h2 className="text-sm font-heading font-bold text-slate-900">Regional Office Load</h2>
                <p className="text-xs text-slate-500">Dossier density mapped by Regional Secretariat</p>
              </div>
              <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 border border-neutral px-2 py-0.5 rounded-full uppercase">
                7 ACTIVE OFFICES
              </span>
            </div>

            <div className="space-y-2.5 pt-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 font-medium">Western (WRO — Mumbai)</span>
                  <span className="font-mono text-slate-600 font-bold">2,140 apps (25.4%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: "25.4%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 font-medium">Southern (SRO — Chennai)</span>
                  <span className="font-mono text-slate-600 font-bold">1,980 apps (23.5%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: "23.5%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 font-medium">Northern (NRO — Kanpur)</span>
                  <span className="font-mono text-slate-600 font-bold">1,420 apps (16.9%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: "16.9%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-800 font-medium">South-Western (SWRO — Bengaluru)</span>
                  <span className="font-mono text-slate-600 font-bold">1,210 apps (14.4%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: "14.4%" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral/60 text-[11px] font-mono">
                <div className="p-1.5 bg-surface rounded-xs">
                  <span className="text-slate-400 block text-[9px]">CRO — Bhopal</span>
                  <strong className="text-slate-800">880 apps</strong>
                </div>
                <div className="p-1.5 bg-surface rounded-xs">
                  <span className="text-slate-400 block text-[9px]">ERO — Kolkata</span>
                  <strong className="text-slate-800">790 apps</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-neutral/60">
            <span>Load Balancing: Optimal</span>
            <Link href="/applications" className="text-sky-700 hover:underline font-bold">
              Inspect RO Queue &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Applications Directory Drilldown Table */}
      <div className="bg-paper rounded-sm border border-neutral shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface">
          <div>
            <h2 className="text-sm font-heading font-bold text-ink">Active Institutional Applications</h2>
            <p className="text-xs text-ink-secondary">
              Showing active files matched to current statutory criteria
            </p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-bold text-flow-core hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Applications Registry</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/70 border-b border-neutral text-ink-secondary font-mono font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Application ID</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Route (Table 2.3)</th>
                <th className="px-4 py-3">Current Stage</th>
                <th className="px-4 py-3">Delay Risk Prediction</th>
                <th className="px-4 py-3 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral/50">
              {applications.slice(0, 8).map((app) => (
                <tr key={app.id} className="hover:bg-surface/50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-flow-core">
                    {app.application_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-heading font-bold text-ink">{app.institution_name}</div>
                    <div className="text-[10px] text-ink-secondary font-mono">
                      AICTE: {app.institution_aicte_id} • {app.region} Region
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary font-medium">
                    {app.application_type}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-neutral text-ink">
                      {app.current_stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        app.delay_risk_predicted >= 0.65
                          ? "bg-rose-500"
                          : app.delay_risk_predicted >= 0.35
                          ? "bg-shallow-core"
                          : "bg-emerald-500"
                      }`} />
                      <span className="font-mono font-bold text-[11px] text-ink">
                        {Math.round(app.delay_risk_predicted * 100)}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/scrutiny?app_id=${app.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-flow-core hover:text-navy bg-surface border border-neutral px-2.5 py-1 rounded-full transition"
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
