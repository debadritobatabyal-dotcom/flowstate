"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAppStore, ROLE_PRESETS } from "@/lib/store";
import { ContourHeroArtwork, ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  Sparkles,
  Building2,
  FileCheck,
  Scale,
  Users,
  Compass,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentRole } = useAppStore();

  const [mode, setMode] = useState<"demo" | "login" | "register" | "forgot">("demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState("INSTITUTION_ADMIN");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stepReset, setStepReset] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  useEffect(() => {
    api.getDemoUsers()
      .then((data) => setDemoUsers(data))
      .catch(() => {});
  }, []);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      api.setToken(res.access_token);
      const matched = ROLE_PRESETS.find((r) => r.role === res.role) || ROLE_PRESETS[1];
      setCurrentRole(matched);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        email,
        password,
        full_name: fullName,
        role: selectedRole,
      });
      api.setToken(res.access_token);
      const matched = ROLE_PRESETS.find((r) => r.role === res.role) || ROLE_PRESETS[2];
      setCurrentRole(matched);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(email);
      setSuccess(`Password reset instructions generated. Temporary token: ${res.demo_reset_token}`);
      setResetToken(res.demo_reset_token);
      setStepReset(2);
    } catch (err: any) {
      setError(err.message || "Failed to process reset request.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.resetPassword(email, resetToken, newPassword);
      setSuccess("Password updated successfully! Please log in.");
      setMode("login");
      setPassword(newPassword);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const simulatedToken = "google-oauth-token-" + Math.random().toString(36).substring(7);
      const res = await api.googleAuth(simulatedToken, "officer.western@flowstate.aicte.gov.in", "Western Regional Officer");
      api.setToken(res.access_token);
      const matched = ROLE_PRESETS.find((r) => r.role === res.role) || ROLE_PRESETS[1];
      setCurrentRole(matched);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Google OAuth sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.demoLogin(roleKey);
      api.setToken(res.access_token);
      const matched = ROLE_PRESETS.find((r) => r.role === res.role) || ROLE_PRESETS[0];
      setCurrentRole(matched);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between font-sans selection:bg-flow-rim selection:text-ink">
      {/* Top Permanent Prototype Notice */}
      <div className="bg-navy-deep text-paper/90 text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 border-b border-navy-light/40">
        <span className="w-2 h-2 rounded-full bg-shallow-rim animate-pulse" />
        <span>DEMO ENVIRONMENT — Synthetic data. No live AICTE databases or APIs are connected.</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="max-w-6xl w-full bg-paper rounded-md border border-neutral/80 shadow-sheet overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          {/* Left Editorial Hero Section — Exact Match to Image 1 */}
          <div className="lg:col-span-7 bg-[#0a0f18] text-paper p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-navy-light/60">
            {/* Subtle Topographical Elevation Contours */}
            <div className="absolute inset-0 pointer-events-none opacity-25">
              <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50 150 C 200 120, 400 240, 850 180" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 3" />
                <path d="M-50 250 C 250 180, 500 340, 850 290" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
                <path d="M-50 360 C 300 280, 550 440, 850 400" stroke="#818cf8" strokeWidth="1.2" opacity="0.5" />
                <path d="M-50 480 C 350 400, 600 520, 850 510" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 4" />
                <text x="360" y="195" fill="#38bdf8" fontSize="9" fontFamily="monospace" opacity="0.7">EL+420.5m</text>
                <text x="400" y="470" fill="#818cf8" fontSize="9" fontFamily="monospace" opacity="0.5">ZONE.APH</text>
              </svg>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header: Brand + SIH26262 PROTOCOL */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-sm bg-paper text-[#0a0f18] flex items-center justify-center font-heading font-black text-base shadow-xs">
                    <div className="flex gap-0.5 items-end h-4">
                      <div className="w-1 bg-[#0a0f18] h-2 rounded-2xs" />
                      <div className="w-1 bg-[#0a0f18] h-3.5 rounded-2xs" />
                      <div className="w-1 bg-[#0a0f18] h-4 rounded-2xs" />
                      <div className="w-1 bg-[#0a0f18] h-2.5 rounded-2xs" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-sm font-heading font-bold tracking-tight text-white uppercase">FLOWSTATE</h1>
                    <p className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold uppercase">
                      REGULATORY OPERATIONS SYSTEM
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-400 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>SIH26262 PROTOCOL</span>
                </div>
              </div>

              {/* Evaluation Sandbox Banner */}
              <div className="p-3 bg-[#131d2e] border border-blue-900/50 rounded-sm text-xs flex items-start gap-2.5">
                <div className="p-1 rounded-xs bg-blue-950 border border-blue-800/40 text-sky-400 shrink-0 mt-0.5">
                  <Layers size={13} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-white text-[11px] tracking-wide uppercase">
                      EVALUATION SANDBOX ACTIVE
                    </span>
                    <span className="font-mono text-[9px] bg-slate-800/80 text-slate-300 px-1.5 py-0.2 rounded-2xs border border-slate-700">
                      ENV: APH-STAGING
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Simulated AICTE regulatory dataset loaded for institutional scrutiny and compliance audit.
                  </p>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-3 pt-2">
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight leading-[1.12]">
                  Clarity across every approval.
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                  Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System. Seamless traceability between statutory clauses, submitted institutional evidence, and authorized administrative decisions.
                </p>
              </div>

              {/* 3 Tier Cards (Horizontal Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-3 rounded-sm bg-[#111927] border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-cyan-400">
                    <span>01 TIER</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <h3 className="text-xs font-heading font-bold text-white leading-snug">
                    Regulatory Change-Impact
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Dynamic diff engine matching evolving norms against dossiers.
                  </p>
                </div>

                <div className="p-3 rounded-sm bg-[#111927] border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-400">
                    <span>02 TIER</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  </div>
                  <h3 className="text-xs font-heading font-bold text-white leading-snug">
                    Deficiency Lineage
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Targeted re-scrutiny cycles preventing full submission restarts.
                  </p>
                </div>

                <div className="p-3 rounded-sm bg-[#111927] border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-indigo-400">
                    <span>03 TIER</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>
                  <h3 className="text-xs font-heading font-bold text-white leading-snug">
                    Cryptographic Audit
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Immutable hashing linking clause references to evidence artifacts.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Caution */}
            <div className="relative z-10 pt-4 mt-6 border-t border-slate-800/80 flex items-start gap-2 text-[10px] text-slate-400 leading-snug">
              <Scale size={13} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Statutory Precaution:</strong> FLOWSTATE assists authorized decision-makers. Official approval decisions and final clearances remain strictly under authorized human review as per Council directives.
              </div>
            </div>
          </div>

          {/* Right Interactive Form Area — Exact Match to Image 1 */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-paper">
            <div className="space-y-4">
              {/* Header: ACCESS CONTROL GATEWAY + SEC-ID */}
              <div className="flex items-start justify-between border-b border-neutral pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    ACCESS CONTROL GATEWAY
                  </span>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                    Sign in to console
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-sm font-semibold">
                  SEC-ID: 2026-11-01 // 16:46:46
                </span>
              </div>

              {/* Alerts */}
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* FAST EVALUATION PROFILE SELECTOR (2x2 Grid) */}
              <div className="p-3 bg-slate-50/80 rounded-sm border border-neutral space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500">
                  <span>FAST EVALUATION PROFILE SELECTOR</span>
                  <span className="text-sky-600 font-semibold">Live Role</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("exec.hq.monitoring@aicte-india.gov.in");
                      setPassword("admin123");
                      handleDemoLogin("EXECUTIVE");
                    }}
                    className="p-2 rounded-xs border border-neutral hover:border-slate-800 bg-paper text-left transition group"
                  >
                    <strong className="block text-xs font-heading font-bold text-slate-900 group-hover:text-sky-700">
                      Executive Official
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate">HQ Committee / Delhi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail("officer.western@flowstate.aicte.gov.in");
                      setPassword("officer123");
                      handleDemoLogin("REGIONAL_OFFICER");
                    }}
                    className="p-2 rounded-xs border border-neutral hover:border-slate-800 bg-paper text-left transition group"
                  >
                    <strong className="block text-xs font-heading font-bold text-slate-900 group-hover:text-sky-700">
                      Regional Scrutiny
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate">WRO Mumbai Chamber</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail("regadmin@flowstate.aicte.gov.in");
                      setPassword("admin123");
                      handleDemoLogin("REGULATORY_ADMIN");
                    }}
                    className="p-2 rounded-xs border border-neutral hover:border-slate-800 bg-paper text-left transition group"
                  >
                    <strong className="block text-xs font-heading font-bold text-slate-900 group-hover:text-sky-700">
                      Regulatory Admin
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate">System Norm Architect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail("director@meridian.edu.in");
                      setPassword("institute123");
                      handleDemoLogin("INSTITUTION_ADMIN");
                    }}
                    className="p-2 rounded-xs border border-neutral hover:border-slate-800 bg-paper text-left transition group"
                  >
                    <strong className="block text-xs font-heading font-bold text-slate-900 group-hover:text-sky-700">
                      Institution Head
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate">Applicant Dossier Desk</span>
                  </button>
                </div>
              </div>

              {/* National Single Sign-On Button */}
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={loading}
                className="w-full py-2 px-3 border border-neutral/80 bg-slate-50 hover:bg-slate-100 text-slate-800 font-heading font-semibold text-xs rounded-xs flex items-center justify-center gap-2 transition"
              >
                <Building2 size={15} className="text-slate-600" />
                <span>National Single Sign-On (Jan Parichay / Google)</span>
              </button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-mono font-bold text-slate-400 bg-paper px-2">
                  OR INSTITUTIONAL CREDENTIAL
                </div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleStandardLogin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Work Email or Official Council Identifier
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email || "exec.hq.monitoring@aicte-india.gov.in"}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exec.hq.monitoring@aicte-india.gov.in"
                      className="w-full pr-8 pl-3 py-2 border border-neutral rounded-xs text-xs font-mono bg-surface focus:bg-paper focus:border-slate-900 focus:outline-none"
                    />
                    <Mail size={13} className="absolute right-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Secured Console Passkey
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword("password123")}
                      className="text-[10px] text-sky-700 hover:underline font-semibold"
                    >
                      Forgot Access Token?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password || "••••••••••••••••"}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full pr-8 pl-3 py-2 border border-neutral rounded-xs text-xs font-mono bg-surface focus:bg-paper focus:border-slate-900 focus:outline-none"
                    />
                    <KeyRound size={13} className="absolute right-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded-2xs text-slate-900" />
                    <span>Keep active on this regulatory device for 8 hrs</span>
                  </label>
                  <span className="font-mono text-[10px] text-slate-400">TLS 1.3 Certified</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#0a0f18] hover:bg-slate-800 text-white font-heading font-bold text-xs rounded-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <span>{loading ? "Authenticating Session..." : "Authenticate Session"}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>

            {/* Bottom Status Box */}
            <div className="pt-4 border-t border-neutral space-y-2 mt-4">
              <div className="p-2.5 bg-slate-50 border border-neutral/70 rounded-xs flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-slate-700 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 text-[10px] font-heading font-bold">
                      FIPS 140-3 & SHA-256 Tamper-Evident
                    </strong>
                    <span className="text-[10px] font-mono text-slate-500">
                      Audit Trail Ledger Node: IN-DEL-AICTE-01
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ● ENCRYPTED
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Approval Process Handbook (APH 2026-27)</span>
                <span>•</span>
                <span>Security Guidelines</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">Infrastructure Status: Optimal</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 bg-paper border-t border-neutral text-ink-secondary text-xs">
        <p>FLOWSTATE — Administrative Case Intelligence Platform • AICTE Approval Process Handbook (2024–2027)</p>
      </footer>
    </div>
  );
}
