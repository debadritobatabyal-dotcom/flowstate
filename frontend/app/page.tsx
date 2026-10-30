"use client";
import React from "react";
import Link from "next/link";
import { useAppStore, ROLE_PRESETS } from "@/lib/store";
import {
  PlayCircle,
  LayoutDashboard,
  Briefcase,
  Building2,
  BookOpenCheck,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const { setCurrentRole } = useAppStore();

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-mono font-bold border border-blue-400/30">
            <Cpu size={14} /> AICTE Regulation-Aware Administrative Intelligence
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            FLOWSTATE
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            A regulation-aware administrative intelligence and workflow orchestration platform for AICTE.
            Every statutory requirement, document, finding, deficiency, workflow transition, and statutory deadline
            connected through <strong>one shared data model</strong>.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/demo"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center gap-2"
            >
              <PlayCircle size={18} />
              Launch Guided Signature Demo
            </Link>
            <Link
              href="/executive"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition border border-slate-600 flex items-center gap-2"
            >
              <LayoutDashboard size={18} />
              Executive Command Centre
            </Link>
          </div>
        </div>
      </div>

      {/* The Three Signature Capabilities */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Core Architectural Pillars</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">The Three Signature Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition space-y-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold font-mono">
              A
            </div>
            <h3 className="font-bold text-slate-900 text-base">Regulatory Change-Impact Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload amendments or corrigenda to compute cycle-safe impact chains across dependent rules,
              workflow templates, and active applications. Requires human approval before modification.
            </p>
            <div className="text-[11px] font-mono text-blue-700 font-semibold pt-1">
              Amendment → Clause → Rule → App → Action
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold font-mono">
              B
            </div>
            <h3 className="font-bold text-slate-900 text-base">Deficiency Lineage & Targeted Re-Scrutiny</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforces <strong>APH Clause 1.8(g)</strong>: Re-scrutiny verifies ONLY deficiencies previously identified.
              Generates locked targeted checklists and isolates newly noticed issues into a separate panel.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 font-semibold pt-1">
              Original Deficiencies strictly locked; No scope creep
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition space-y-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold font-mono">
              C
            </div>
            <h3 className="font-bold text-slate-900 text-base">Requirement-to-Evidence Traceability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full provenance linking APH clauses to uploaded PDF documents, exact pages, extracted snippets,
              and validation results. Includes one-click contextual <strong>"Why?"</strong> explainer on every record.
            </p>
            <div className="text-[11px] font-mono text-purple-700 font-semibold pt-1">
              Every finding backed by verifiable evidence
            </div>
          </div>
        </div>
      </div>

      {/* Role Workspaces Launchpad */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role-Based Access</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Explore by Workspace Persona</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLE_PRESETS.map((p) => (
            <div
              key={p.role}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {p.role}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{p.label}</h4>
                <p className="text-xs text-slate-500 mt-1">{p.department}</p>
              </div>

              <Link
                href={
                  p.role === "ADMIN_EXEC"
                    ? "/executive"
                    : p.role === "OFFICER"
                    ? "/officer"
                    : p.role === "INSTITUTION"
                    ? "/institution"
                    : "/regulatory"
                }
                onClick={() => setCurrentRole(p)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
              >
                <span>Enter Workspace</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
