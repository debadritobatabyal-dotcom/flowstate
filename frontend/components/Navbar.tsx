"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore, ROLE_PRESETS } from "@/lib/store";
import { api } from "@/lib/api";
import {
  Shield,
  UserCheck,
  AlertTriangle,
  PlayCircle,
  Activity,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { currentRole, setCurrentRole } = useAppStore();
  const [systemOk, setSystemOk] = useState(true);

  const handleRoleChange = async (presetRole: string) => {
    const selected = ROLE_PRESETS.find((r) => r.role === presetRole) || ROLE_PRESETS[1];
    setCurrentRole(selected);
    try {
      const res = await api.demoLogin(selected.role);
      api.setToken(res.access_token);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    api.getSystemStatus()
      .then(() => setSystemOk(true))
      .catch(() => setSystemOk(false));
  }, []);

  const handleLogout = () => {
    api.setToken(null);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Tri-color Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      {/* Mandatory Prototype Disclaimer Banner */}
      <div className="bg-amber-600 text-white px-4 py-1 text-xs font-semibold flex items-center justify-between tracking-wide shadow-sm">
        <div className="flex items-center gap-2 mx-auto">
          <AlertTriangle size={14} className="shrink-0 text-amber-200" />
          <span>DEMO ENVIRONMENT — Synthetic data. No live AICTE databases or APIs are connected.</span>
        </div>
        <Link
          href="/demo"
          className="hidden md:inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-0.5 rounded text-[11px] font-bold hover:bg-slate-800 transition shadow"
        >
          <PlayCircle size={13} className="text-amber-400" />
          <span>Interactive Demo (4 Stages)</span>
        </Link>
      </div>

      {/* Main Government Header */}
      <div className="px-6 h-16 flex items-center justify-between bg-[#0a192f] text-white">
        {/* Brand & Emblem Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-blue-600 border border-blue-400 text-white flex items-center justify-center font-bold font-mono text-lg shadow">
              FS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-blue-300 transition">
                  FLOWSTATE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/50">
                  AICTE Case Intelligence
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium tracking-wide block">
                All India Council for Technical Education • Statutory Process Oversight
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
            <UserCheck size={14} className="text-blue-400" />
            <span className="text-slate-300 font-medium hidden sm:inline">Role:</span>
            <select
              value={currentRole.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-0.5 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {ROLE_PRESETS.map((p) => (
                <option key={p.role} value={p.role}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Engine Status Diagnostic Pill */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
            title="System Diagnostics & User Management"
          >
            <span
              className={`h-2 w-2 rounded-full ${systemOk ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}
            />
            <span className="hidden md:inline">Admin</span>
          </Link>

          {/* Sign Out / Switch User */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1.5 rounded-lg transition"
            title="Log out or switch account"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
