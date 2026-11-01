"use client";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Layers,
  FileCheck,
  Scale,
  X,
  ChevronRight,
  Eye,
} from "lucide-react";

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const { currentRole } = useAppStore();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedStage, setSelectedStage] = useState("");

  // Modal for new application route consultation
  const [showNewModal, setShowNewModal] = useState(false);
  const [consultType, setConsultType] = useState("Starting a new Programme/Level");

  // Quick Dossier Preview Drawer
  const [previewApp, setPreviewApp] = useState<any | null>(null);

  useEffect(() => {
    fetchApps();
  }, [selectedType, selectedRegion, selectedStage]);

  // Keyboard accessibility: Escape key closes modals and drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNewModal(false);
        setPreviewApp(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (selectedType) filters.application_type = selectedType;
      if (selectedRegion) filters.region = selectedRegion;
      if (selectedStage) filters.current_stage = selectedStage;
      const data = await api.getApplications(filters);
      setApplications(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      app.application_number.toLowerCase().includes(q) ||
      app.institution_name.toLowerCase().includes(q) ||
      app.institution_aicte_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-secondary mb-1">
            <ContourBadgeSwatch variant="shallow" />
            <span>AICTE Approval Portal</span>
            <span>•</span>
            <span className="text-flow-core font-bold">Table 2.3 Regulatory Routing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Institutional Applications Registry
          </h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Statutory registry orchestrating institutional intake across Table 2.3 procedural routes, procedural deficiency locks, and regional scrutiny desks.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="m-btn text-xs self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          <span>Table 2.3 Route Advisor</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-paper p-3.5 rounded-sm border border-neutral flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-2.5 text-ink-secondary" />
            <input
              type="text"
              placeholder="Search by Institution, AICTE ID, or Application Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-neutral rounded-full text-xs bg-surface focus:bg-paper focus:border-flow-core focus:ring-1 focus:ring-flow-rim focus:outline-none transition"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-ink-secondary font-medium">Category:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-surface border border-neutral rounded-full px-2.5 py-1 text-ink font-semibold text-xs focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Starting a new Programme/Level">Starting New Programme/Level</option>
              <option value="EoA based on Self-Disclosure">EoA Self-Disclosure</option>
              <option value="Change of Institution Name/Site">Change of Name/Site</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-ink-secondary font-medium">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-surface border border-neutral rounded-full px-2.5 py-1 text-ink font-semibold text-xs focus:outline-none"
            >
              <option value="">All Regions</option>
              <option value="Western">Western</option>
              <option value="Northern">Northern</option>
              <option value="Southern">Southern</option>
              <option value="Eastern">Eastern</option>
              <option value="South-Western">South-Western</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-ink-secondary font-medium">Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-surface border border-neutral rounded-full px-2.5 py-1 text-ink font-semibold text-xs focus:outline-none"
            >
              <option value="">All Stages</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="SCRUTINY">Under Scrutiny</option>
              <option value="DEFICIENCY_ISSUED">Deficiency Issued</option>
              <option value="RE_SCRUTINY">Targeted Re-Scrutiny</option>
              <option value="EVC_SCHEDULED">EVC Scheduled</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>

          {(searchQuery || selectedType || selectedRegion || selectedStage) && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedType(""); setSelectedRegion(""); setSelectedStage(""); }}
              className="text-flow-core hover:underline font-bold text-xs ml-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-paper rounded-sm border border-neutral shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-neutral text-ink-secondary font-mono font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Application ID</th>
                <th className="px-4 py-3">Institution Profile</th>
                <th className="px-4 py-3">Configured Route (Table 2.3)</th>
                <th className="px-4 py-3">Stage & Status</th>
                <th className="px-4 py-3">Delay Risk Prediction</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-ink-secondary font-mono">
                    Loading AICTE application registry...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-ink-secondary">
                    No applications matched the specified filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-surface/50 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-flow-core">
                      <div>{app.application_number}</div>
                      <span className="text-[10px] text-ink-secondary font-normal">AY {app.academic_year}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-heading font-bold text-ink">{app.institution_name}</div>
                      <div className="text-[10px] text-ink-secondary font-mono">
                        AICTE: {app.institution_aicte_id} • {app.region} Region
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink">{app.application_type}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {app.application_type.includes("Self-Disclosure") ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded-full font-mono font-bold">
                            Self-Disclosure Only
                          </span>
                        ) : (
                          <span className="text-[10px] bg-flow-core/10 text-flow-core border border-flow-core/20 px-2 py-0.2 rounded-full font-mono font-bold">
                            Scrutiny + EVC Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        app.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                          : app.status === "DEFICIENT"
                          ? "bg-rose-50 text-rose-900 border-rose-200"
                          : "bg-surface text-ink border-neutral"
                      }`}>
                        {app.current_stage}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${
                          app.delay_risk_predicted >= 0.65 ? "bg-rose-500" : app.delay_risk_predicted >= 0.35 ? "bg-shallow-core" : "bg-emerald-500"
                        }`} />
                        <span className="font-mono font-bold text-ink">
                          {Math.round(app.delay_risk_predicted * 100)}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {/* Quick Drawer Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewApp(app)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-secondary hover:text-ink bg-surface border border-neutral px-2.5 py-1 rounded-full hover:bg-paper transition"
                        title="Quick View Dossier"
                      >
                        <Eye size={12} />
                        <span className="hidden sm:inline">Inspect</span>
                      </button>

                      {/* Scrutiny Workspace Link */}
                      <Link
                        href={`/scrutiny?app_id=${app.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-paper bg-navy hover:bg-flow-core px-3 py-1 rounded-full transition shadow-2xs"
                      >
                        <span>Dossier</span>
                        <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Application Route Advisor (Table 2.3) */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowNewModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-paper rounded-sm max-w-xl w-full p-6 border border-neutral shadow-sheet space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral pb-3">
              <div className="flex items-center gap-2">
                <ContourBadgeSwatch variant="shallow" />
                <h3 className="font-heading font-bold text-ink text-sm">Table 2.3 Regulatory Route Advisor</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-full text-ink-secondary hover:text-ink hover:bg-neutral/40 transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Select Proposed Application Type:</label>
                <select
                  value={consultType}
                  onChange={(e) => setConsultType(e.target.value)}
                  className="w-full p-2 border border-neutral rounded-sm bg-surface font-semibold text-ink focus:outline-none focus:border-flow-core"
                >
                  <option value="Starting a new Programme/Level">Starting a new Programme/Level</option>
                  <option value="EoA based on Self-Disclosure">EoA based on Self-Disclosure</option>
                  <option value="Introduction/Continuation of NRI seats">Introduction/Continuation of NRI seats</option>
                  <option value="Diploma-to-Degree conversion">Diploma-to-Degree conversion</option>
                  <option value="Change of institution name/type">Change of institution name/type</option>
                </select>
              </div>

              {/* Route Determination Display */}
              <div className="p-4 bg-surface rounded-sm border border-neutral space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink font-heading">Determined Regulatory Route:</span>
                  <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-navy text-paper">
                    {consultType.includes("Self-Disclosure") ? "Processing Route 1" : "Processing Route 2"}
                  </span>
                </div>
                <p className="text-ink-secondary leading-relaxed">
                  {consultType.includes("Self-Disclosure")
                    ? "Institutions in this category bypass procedural scrutiny and physical EVC inspection, relying strictly on certified self-disclosure."
                    : "Requires comprehensive procedural scrutiny by Regional Scrutiny Committee, mandatory document-to-evidence extraction, and physical Expert Visit Committee (EVC)."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral text-xs">
              <span className="text-[11px] font-mono text-ink-secondary">Press Esc to dismiss</span>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="m-btn-outline text-xs py-1.5 px-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Dossier Drawer */}
      {previewApp && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity" onClick={() => setPreviewApp(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-paper border-l border-neutral shadow-sheet flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-neutral flex items-center justify-between bg-surface">
                  <div className="flex items-center gap-2">
                    <ContourBadgeSwatch variant="flow" />
                    <div>
                      <h2 className="font-heading font-bold text-ink text-sm">Quick Application Dossier</h2>
                      <span className="text-[10px] font-mono text-ink-secondary">{previewApp.application_number}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewApp(null)}
                    className="p-1.5 rounded-full text-ink-secondary hover:text-ink hover:bg-neutral/40 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-5 text-xs text-ink">
                  <div>
                    <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider block font-mono">
                      Institution Name
                    </span>
                    <h3 className="text-base font-heading font-bold text-ink mt-0.5">
                      {previewApp.institution_name}
                    </h3>
                    <p className="text-ink-secondary font-mono mt-0.5">AICTE Permanent ID: {previewApp.institution_aicte_id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-surface border border-neutral rounded-sm">
                    <div>
                      <span className="text-[10px] text-ink-secondary block font-mono">Region</span>
                      <strong className="text-ink">{previewApp.region} Region</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-secondary block font-mono">Academic Year</span>
                      <strong className="text-ink">AY {previewApp.academic_year}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-secondary block font-mono">Approval Stage</span>
                      <strong className="text-flow-core font-mono">{previewApp.current_stage}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-secondary block font-mono">Predicted Delay Risk</span>
                      <strong className="text-ink font-mono">{Math.round(previewApp.delay_risk_predicted * 100)}/100</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider block font-mono mb-1">
                      Statutory Route Classification
                    </span>
                    <p className="text-ink-secondary leading-relaxed p-3 bg-surface border border-neutral rounded-sm">
                      {previewApp.application_type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral bg-surface flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewApp(null)}
                  className="m-btn-outline text-xs py-1.5 px-3"
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/scrutiny?app_id=${previewApp.id}&tab=evc`}
                    className="m-btn-outline text-xs py-1.5 px-3 text-flow-core border-flow-core/50 hover:bg-flow-rim/20"
                  >
                    <span>EVC Allocation</span>
                  </Link>
                  <Link
                    href={`/scrutiny?app_id=${previewApp.id}`}
                    className="m-btn text-xs py-1.5 px-3"
                  >
                    <span>Open Scrutiny Dossier</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-ink-secondary">Loading Applications Registry...</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
