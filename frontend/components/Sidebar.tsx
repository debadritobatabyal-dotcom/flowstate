"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  LayoutGrid,
  Building2,
  CheckSquare,
  Compass,
  AlertTriangle,
  ShieldCheck,
  Landmark,
  Sliders,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentRole } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  // Exact 8 Navigation Sections from User Mockup (Image 2)
  const navItems = [
    { label: "Executive Overview", href: "/", icon: LayoutGrid, count: null },
    { label: "Application Registry", href: "/applications", icon: Building2, count: null },
    { label: "Scrutiny & Compliance", href: "/scrutiny", icon: CheckSquare, count: null },
    { label: "Regulatory Intelligence", href: "/regulatory", icon: Compass, count: null },
    { label: "Alert Center", href: "/status", icon: AlertTriangle, count: "7 REQ" },
    { label: "Reports & Audit Trail", href: "/audit", icon: ShieldCheck, count: null },
    { label: "Institution Portal", href: "/institution", icon: Landmark, count: null },
    { label: "System Administration", href: "/admin", icon: Sliders, count: null },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between shrink-0 bg-paper border-r border-neutral transition-all duration-300 min-h-[calc(100vh-5rem)] ${
        collapsed ? "w-20 p-3" : "w-64 p-3.5"
      }`}
    >
      <div className="space-y-4">
        {/* Telemetry Grid Header Badge */}
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-ink-secondary">
                <Terminal size={12} className="text-flow-core" />
                <span>TELEMETRY GRID</span>
              </div>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-surface border border-neutral text-ink-secondary">
                NODE: IND-HQ
              </span>
            </div>
            <div className="h-px bg-neutral/60 w-full" />
          </div>
        ) : (
          <div className="flex justify-center pb-2 border-b border-neutral/60">
            <span className="text-[9px] font-mono font-bold text-flow-core">HQ</span>
          </div>
        )}

        {/* Meridian Interactive Walkthrough Button */}
        <Link
          href="/demo"
          className={`group flex items-center gap-2.5 rounded-lg transition border ${
            pathname === "/demo"
              ? "bg-[#10141a] text-white border-black shadow-sm"
              : "bg-surface text-ink border-neutral/70 hover:border-shallow-core"
          } ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}`}
          title="Meridian Case Study (4 Stages)"
        >
          <PlayCircle
            size={16}
            className={`shrink-0 ${pathname === "/demo" ? "text-shallow-rim" : "text-shallow-core group-hover:scale-105 transition"}`}
          />
          {!collapsed && (
            <div className="overflow-hidden flex-1 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold font-heading block leading-tight">Interactive Tour</span>
                <span className="text-[10px] text-ink-secondary truncate block">Meridian 4 Stages</span>
              </div>
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-shallow-rim/30 text-shallow-core rounded-full font-bold">
                Tour
              </span>
            </div>
          )}
        </Link>

        {/* Primary Navigation Items matching Image 2 */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex items-center rounded-lg text-xs font-medium transition ${
                  active
                    ? "bg-[#10141a] text-white shadow-xs font-semibold"
                    : "text-ink-secondary hover:text-ink hover:bg-surface"
                } ${collapsed ? "justify-center p-2.5" : "px-3 py-2 gap-3"}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={17}
                  className={`shrink-0 transition ${
                    active ? "text-white" : "text-ink-secondary group-hover:text-ink"
                  }`}
                />

                {!collapsed && (
                  <div className="overflow-hidden flex-1 flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.count && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse Button & Footer */}
      <div className="pt-3 border-t border-neutral/60 space-y-2">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface text-xs transition ${
            collapsed ? "justify-center" : "justify-between"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!collapsed && <span className="text-[11px] font-medium">Collapse View</span>}
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {!collapsed && (
          <div className="px-1 text-[10px] text-ink-secondary font-mono flex items-center justify-between">
            <span>SEC-ID: IND-APH-26</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
