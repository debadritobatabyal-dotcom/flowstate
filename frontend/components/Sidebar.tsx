"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  FileText,
  SearchCheck,
  BookOpenCheck,
  History,
  PlayCircle,
  Settings,
  Scale,
  ShieldAlert,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentRole } = useAppStore();

  // 5 Canonical Sections + Admin
  const navItems = [
    { label: "1. Dashboard", href: "/", icon: LayoutDashboard, description: "National KPIs & Pendency" },
    { label: "2. Applications", href: "/applications", icon: FileText, description: "Table 2.3 Routes & Intake" },
    { label: "3. Scrutiny & Compliance", href: "/scrutiny", icon: SearchCheck, description: "Evidence & Re-Scrutiny" },
    { label: "4. Regulatory Intelligence", href: "/regulatory", icon: BookOpenCheck, description: "Clause Registry & Impact" },
    { label: "5. Reports & Audit", href: "/audit", icon: History, description: "SHA-256 Hash Ledger" },
  ];

  const isSystemAdmin = currentRole.role === "SYSTEM_ADMIN" || currentRole.role === "SUPER_ADMIN";

  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-6rem)] p-4 flex flex-col justify-between shrink-0 font-sans">
      <div className="space-y-6">
        {/* Signature Walkthrough CTA */}
        <Link
          href="/demo"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition border ${
            pathname === "/demo"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow"
              : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
          }`}
        >
          <PlayCircle size={17} className="text-amber-700 shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span>Signature Demo</span>
              <span className="text-[9px] uppercase px-1 py-0.2 bg-amber-200 text-amber-950 rounded font-black">
                4 Stages
              </span>
            </div>
            <p className="text-[10px] font-normal text-amber-800">Meridian Institute Case Study</p>
          </div>
        </Link>

        {/* 5 Canonical Navigation Sections */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
            Core Modules
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col px-3 py-2 rounded-lg transition ${
                    active
                      ? "bg-[#0a192f] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold">
                    <Icon size={16} className={active ? "text-blue-400" : "text-slate-500"} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] ml-6 font-normal ${active ? "text-slate-300" : "text-slate-400"}`}>
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Administration Section (Protected) */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
            Administration
          </span>
          <Link
            href="/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              pathname === "/admin"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Settings size={15} className="text-slate-500" />
            <span>Settings & Diagnostics</span>
            {!isSystemAdmin && (
              <span className="ml-auto text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono">
                Admin
              </span>
            )}
          </Link>
        </div>

        {/* Regulatory Governance Capsule */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
            <Scale size={14} className="text-blue-700 shrink-0" />
            <span>AICTE APH 2024–27</span>
          </div>
          <p className="text-slate-500 text-[10px] leading-relaxed">
            Statutory framework governing procedural scrutiny (1.8), targeted re-scrutiny (1.8g), EVC (1.9), and separate appeal clocks (1.11 & 2.24).
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
        <p className="font-bold text-slate-600">FLOWSTATE v2.0 • AICTE</p>
        <p>Government Administrative Intelligence</p>
      </div>
    </aside>
  );
};
