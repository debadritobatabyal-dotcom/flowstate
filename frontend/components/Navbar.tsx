"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore, ROLE_PRESETS } from "@/lib/store";
import { api } from "@/lib/api";
import { Shield, UserCheck, AlertTriangle, PlayCircle, Activity } from "lucide-react";

export const Navbar: React.FC = () => {
  const { currentRole, setCurrentRole } = useAppStore();
  const [systemOk, setSystemOk] = useState(true);

  // Switch role and log in automatically to obtain token
  const handleRoleChange = async (presetRole: string) => {
    const selected = ROLE_PRESETS.find((r) => r.role === presetRole) || ROLE_PRESETS[1];
    setCurrentRole(selected);
    try {
      const res = await api.login(selected.email, "Password123!");
      api.setToken(res.access_token);
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    // Initial login for default role
    handleRoleChange(currentRole.role);
    api.getSystemStatus()
      .then(() => setSystemOk(true))
      .catch(() => setSystemOk(false));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Banner: Mandatory Prototype Disclaimer */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1 text-xs font-semibold flex items-center justify-between tracking-wide">
        <div className="flex items-center gap-2 mx-auto">
          <AlertTriangle size={14} className="shrink-0" />
          <span>Prototype — synthetic data. No live AICTE databases or APIs are connected.</span>
        </div>
        <Link
          href="/demo"
          className="hidden md:inline-flex items-center gap-1 bg-slate-900 text-white px-2.5 py-0.5 rounded text-[11px] font-bold hover:bg-slate-800 transition"
        >
          <PlayCircle size={13} />
          Interactive Demo
        </Link>
      </div>

      {/* Main Navbar */}
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-lg shadow-sm">
              FS
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 tracking-tight block leading-none">FLOWSTATE</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mt-0.5">
                AICTE Administrative Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Role Selector & Quick Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
              <UserCheck size={14} />
              <span>Role:</span>
            </span>
            <select
              value={currentRole.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 rounded px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {ROLE_PRESETS.map((p) => (
                <option key={p.role} value={p.role}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Status Indicator */}
          <Link
            href="/status"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded-md hover:bg-slate-50 transition"
          >
            <span
              className={`h-2 w-2 rounded-full ${systemOk ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
            />
            <span className="hidden sm:inline">Engine Status</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
