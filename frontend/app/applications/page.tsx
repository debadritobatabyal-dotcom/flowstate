"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
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
} from "lucide-react";

export default function ApplicationsPage() {
  const { currentRole } = useAppStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  // Modal for new application route consultation
  const [showNewModal, setShowNewModal] = useState(false);
  const [consultType, setConsultType] = useState("Starting a new Programme/Level");

  useEffect(() => {
    fetchApps();
  }, [selectedType, selectedRegion]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (selectedType) filters.application_type = selectedType;
      if (selectedRegion) filters.region = selectedRegion;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>AICTE Approval Portal</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">Table 2.3 Regulatory Routing</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Applications Registry
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Configured regulatory processing routes per application type under AICTE Approval Process Handbook.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-[#0a192f] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          <span>New Application / Route Advisor</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Institution, AICTE ID, or Application Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium text-xs focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              <option value="Starting a new Programme/Level">Starting New Programme/Level</option>
              <option value="EoA based on Self-Disclosure">EoA Self-Disclosure</option>
              <option value="Change of Institution Name/Site">Change of Name/Site</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium text-xs focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Regions</option>
              <option value="Western">Western</option>
              <option value="Northern">Northern</option>
              <option value="Southern">Southern</option>
              <option value="Eastern">Eastern</option>
              <option value="South-Western">South-Western</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Application ID</th>
                <th className="px-4 py-3">Institution Profile</th>
                <th className="px-4 py-3">Configured Route (Table 2.3)</th>
                <th className="px-4 py-3">Stage & Status</th>
                <th className="px-4 py-3">Delay Risk Prediction</th>
                <th className="px-4 py-3 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-900">
                    <div>{app.application_number}</div>
                    <span className="text-[10px] text-slate-400 font-normal">AY {app.academic_year}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-800">{app.institution_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      AICTE: {app.institution_aicte_id} • {app.region} Region
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800">{app.application_type}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {app.application_type.includes("Self-Disclosure") ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                          Self-Disclosure Only
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">
                          Scrutiny + EVC Required
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      app.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-900"
                        : app.status === "DEFICIENT"
                        ? "bg-rose-100 text-rose-900"
                        : "bg-blue-100 text-blue-900"
                    }`}>
                      {app.current_stage}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        app.delay_risk_predicted >= 0.65 ? "bg-rose-500" : app.delay_risk_predicted >= 0.35 ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <span className="font-mono font-bold text-slate-700">
                        Demo: {Math.round(app.delay_risk_predicted * 100)}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/scrutiny?app_id=${app.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-950 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                    >
                      <span>Scrutiny & Evidence</span>
                      <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Application Route Advisor (Table 2.3) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-slate-300 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="text-blue-700" size={18} />
                <h3 className="text-sm font-bold text-slate-900">Table 2.3 Regulatory Route Advisor</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Proposed Application Type:</label>
                <select
                  value={consultType}
                  onChange={(e) => setConsultType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 font-medium"
                >
                  <option value="Starting a new Programme/Level">Starting a new Programme/Level</option>
                  <option value="EoA based on Self-Disclosure">EoA based on Self-Disclosure</option>
                  <option value="Introduction/Continuation of NRI seats">Introduction/Continuation of NRI seats</option>
                  <option value="Diploma-to-Degree conversion">Diploma-to-Degree conversion</option>
                  <option value="Change of institution name/type">Change of institution name/type</option>
                </select>
              </div>

              {/* Route Determination Display */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-slate-900 font-bold">Mandated Processing Route:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className={`p-2 rounded border ${
                    consultType.includes("Self-Disclosure") || consultType.includes("NRI")
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    Self-Disclosure
                  </div>
                  <div className={`p-2 rounded border ${
                    !consultType.includes("Self-Disclosure") && !consultType.includes("NRI")
                      ? "bg-blue-50 border-blue-300 text-blue-900 font-bold"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    Clause 1.8 Scrutiny
                  </div>
                  <div className={`p-2 rounded border ${
                    consultType.includes("Starting") || consultType.includes("Diploma-to-Degree")
                      ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    Clause 1.9 EVC Visit
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Deterministic routing enforced by AICTE APH 2024–27 Chapter II provisions. Retains historical template binding upon submission.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
              >
                Close
              </button>
              <Link
                href="/demo"
                className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white rounded text-xs font-bold"
              >
                Experience Meridian Intake in Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
