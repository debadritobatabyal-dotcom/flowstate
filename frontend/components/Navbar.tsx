"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore, ROLE_PRESETS } from "@/lib/store";
import { api } from "@/lib/api";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  Shield,
  UserCheck,
  AlertTriangle,
  PlayCircle,
  Activity,
  LogOut,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { currentRole, setCurrentRole } = useAppStore();
  const [systemOk, setSystemOk] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const handleRoleChange = async (presetRole: string) => {
    const selected = ROLE_PRESETS.find((r) => r.role === presetRole) || ROLE_PRESETS[1];
    setCurrentRole(selected);
    try {
      const res = await api.demoLogin(selected.role);
      api.setToken(res.access_token);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/applications?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper border-b border-neutral shadow-xs">
        {/* National Tri-Color Statutory Accent Strip */}
        <div className="h-0.5 w-full bg-gradient-to-r from-shallow-core via-paper to-flow-core opacity-90" />

        {/* Mandatory Prototype Disclaimer Banner */}
        <div className="bg-navy-deep text-paper/90 px-4 py-1 text-[11px] font-medium flex items-center justify-between tracking-wide border-b border-navy-light/40">
          <div className="flex items-center gap-2 mx-auto">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-shallow-rim animate-pulse" />
            <span className="font-semibold text-paper">DEMO ENVIRONMENT</span>
            <span className="text-neutral/80 hidden sm:inline">— Synthetic AICTE approval data. Statutory APH 2024–2027 logic active.</span>
          </div>
          <Link
            href="/demo"
            className="hidden lg:inline-flex items-center gap-1.5 bg-flow-core/40 hover:bg-flow-core text-paper px-2.5 py-0.5 rounded-full text-[10px] font-bold transition"
          >
            <ContourBadgeSwatch variant="shallow" />
            <span>Meridian Walkthrough (4 Stages)</span>
          </Link>
        </div>

        {/* Main Administrative Header Bar */}
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between bg-paper text-ink gap-3">
          {/* Left: Statutory Breadcrumb & Context */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded text-ink-secondary hover:text-ink hover:bg-surface transition"
              aria-label="Toggle Navigation Drawer"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Breadcrumb matching Image 2 */}
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface border border-neutral text-ink font-semibold text-[11px]">
                <span>🏛</span>
                <span>AICTE Administrative Intelligence</span>
              </span>
              <span className="text-neutral-400 hidden sm:inline">›</span>
              <span className="text-ink-secondary hidden sm:inline text-[11px] font-medium">AICTE Central</span>
              <span className="text-neutral-400 hidden md:inline">›</span>
              <span className="text-ink font-semibold hidden md:inline text-[11px]">Approval Workflow AY 2026-27</span>
            </div>
          </div>

          {/* Center: Global Search with ⌘K */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-sm mx-2">
            <div className="relative w-full">
              <Search size={13} className="absolute left-3 top-2.5 text-ink-secondary pointer-events-none" />
              <input
                type="text"
                placeholder="Search application, institute..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-8 pr-9 py-1 text-xs bg-surface border border-neutral rounded-md focus:bg-paper focus:border-flow-core focus:ring-1 focus:ring-flow-rim focus:outline-none transition"
              />
              <kbd className="absolute right-2.5 top-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral/40 border border-neutral/70 text-ink-secondary">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* AY 2026-27 Cycle Indicator */}
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              AY 2026–27
            </span>

            {/* Quick Role Toggle Buttons matching Image 2 */}
            <div className="hidden md:flex items-center gap-1 bg-surface p-0.5 rounded-lg border border-neutral text-[11px]">
              {[
                { role: "EXECUTIVE_DIRECTOR", label: "Executive Official" },
                { role: "SCRUTINY_OFFICER", label: "Regional Scrutiny" },
                { role: "SYSTEM_ADMIN", label: "Regulatory Admin" },
              ].map((r) => {
                const isActive = currentRole.role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleChange(r.role)}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      isActive
                        ? "bg-paper text-ink shadow-xs font-semibold border border-neutral/80"
                        : "text-ink-secondary hover:text-ink hover:bg-paper/50"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Notification Drawer Trigger */}
            <button
              type="button"
              onClick={() => setNotificationOpen(true)}
              className="relative p-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface border border-neutral/60 transition"
              title="Alert Center"
              aria-label="Notifications"
            >
              <Bell size={15} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                7
              </span>
            </button>

            {/* User Profile Avatar */}
            <div
              className="w-7 h-7 rounded-full bg-navy text-paper flex items-center justify-center text-[10px] font-bold font-heading cursor-pointer shadow-xs border border-neutral"
              title={`Logged in as ${currentRole.label}`}
            >
              {currentRole.label.charAt(0)}
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="text-ink-secondary hover:text-ink p-1.5 rounded-lg hover:bg-surface transition"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral bg-paper p-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-ink-secondary" />
                <input
                  type="text"
                  placeholder="Search application or clause..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface border border-neutral rounded-full"
                />
              </div>
            </form>

            <nav className="space-y-1 text-xs font-semibold">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm text-ink hover:bg-surface"
              >
                1. Executive Dashboard
              </Link>
              <Link
                href="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm text-ink hover:bg-surface"
              >
                2. Applications Registry (Table 2.3)
              </Link>
              <Link
                href="/scrutiny"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm text-ink hover:bg-surface"
              >
                3. Scrutiny & Evidence Matrix
              </Link>
              <Link
                href="/regulatory"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm text-ink hover:bg-surface"
              >
                4. Regulatory Intelligence
              </Link>
              <Link
                href="/audit"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm text-ink hover:bg-surface"
              >
                5. Reports & SHA-256 Ledger
              </Link>
              <Link
                href="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-sm text-shallow-core font-bold hover:bg-surface"
              >
                ★ Signature Demo Walkthrough
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Slide-out Notification Drawer */}
      <NotificationCenter
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </>
  );
};
