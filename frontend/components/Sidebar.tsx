"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  BookOpenCheck,
  PlayCircle,
  Activity,
  History,
  GitBranch,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Interactive Demo", href: "/demo", icon: PlayCircle, badge: "Signature" },
    { label: "Executive Command", href: "/executive", icon: LayoutDashboard },
    { label: "Officer Workspace", href: "/officer", icon: Briefcase },
    { label: "Institution Portal", href: "/institution", icon: Building2 },
    { label: "Regulatory Intelligence", href: "/regulatory", icon: BookOpenCheck },
    { label: "Audit & Engine Status", href: "/status", icon: Activity },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-6rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
            Platform Workspaces
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={18} className={active ? "text-blue-400" : "text-slate-500"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-900 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Regulatory Baseline Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
            <BookOpenCheck size={14} className="text-blue-700" />
            <span>AICTE APH 2024–27</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Statutory baseline for Scrutiny, EVC, SAC appeals (Clause 1.11, 2.24), and Table 2.3 processing routes.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-600">FLOWSTATE Platform v1.0</p>
        <p>AI-Assisted Administrative Support</p>
      </div>
    </aside>
  );
};
