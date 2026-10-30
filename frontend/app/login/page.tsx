"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAppStore, ROLE_PRESETS } from "@/lib/store";
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  KeyRound,
  ExternalLink,
  Sparkles,
  Building2,
  FileCheck,
  Scale,
  Users,
  Compass,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentRole } = useAppStore();

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "demo">("demo");
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      {/* Permanent Notice */}
      <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <AlertTriangle size={15} className="shrink-0" />
        <span>DEMO ENVIRONMENT — Synthetic data. No live AICTE databases or APIs are connected.</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Hero Panel */}
          <div className="md:col-span-5 bg-navy-950 bg-[#0a192f] p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xl shadow">
                  FS
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white">FLOWSTATE</h1>
                  <p className="text-[10px] text-blue-200 tracking-wider uppercase font-semibold">
                    AICTE Administrative Intelligence
                  </p>
                </div>
              </div>

              <div className="space-y-4 my-8">
                <div className="flex items-start gap-3">
                  <Scale className="text-amber-400 mt-1 shrink-0" size={18} />
                  <div>
                    <h2 className="text-xs font-bold text-slate-100 uppercase">APH 2024–27 Alignment</h2>
                    <p className="text-[11px] text-slate-300">
                      Deterministic Clause 1.8(g) re-scrutiny locks, statutory appeal clocks (1.11 & 2.24), and Table 2.3 routes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileCheck className="text-blue-400 mt-1 shrink-0" size={18} />
                  <div>
                    <h2 className="text-xs font-bold text-slate-100 uppercase">Traceable Evidence</h2>
                    <p className="text-[11px] text-slate-300">
                      Links every finding to substantive requirements, procedural rules, and exact document pages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="text-emerald-400 mt-1 shrink-0" size={18} />
                  <div>
                    <h2 className="text-xs font-bold text-slate-100 uppercase">Verifiable Audit Ledger</h2>
                    <p className="text-[11px] text-slate-300">
                      Append-only SHA-256 hash chaining records every institutional action and officer determination.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-800">
              <p className="font-semibold text-slate-300">Statutory AICTE Approval Architecture</p>
              <p>Supports authorized human decision-makers. AI outputs labeled SUGGESTED.</p>
            </div>
          </div>

          {/* Right Interactive Form Area */}
          <div className="md:col-span-7 p-8 flex flex-col justify-between">
            <div>
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => { setMode("demo"); setError(null); setSuccess(null); }}
                  className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                    mode === "demo" ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Sparkles size={14} />
                  <span>1-Click Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                  className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                    mode === "login" ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Lock size={14} />
                  <span>Password Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
                  className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                    mode === "register" ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <User size={14} />
                  <span>Register</span>
                </button>
              </div>

              {/* Feedback Alerts */}
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
                  <CheckCircle size={15} className="shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* MODE: 1-CLICK DEMO */}
              {mode === "demo" && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-slate-900">Choose a Demo Role to Explore</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Instantly launches with authentic synthetic AICTE workflows for that role.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {(demoUsers.length > 0 ? demoUsers : [
                      { role: "EXECUTIVE", title: "Executive Decision Maker", name: "Member Secretary, AICTE", email: "executive@flowstate.aicte.gov.in", description: "National KPIs, pendency heatmaps, statutory approvals" },
                      { role: "REGIONAL_OFFICER", title: "Scrutiny Convener", name: "Western Regional Officer", email: "officer.western@flowstate.aicte.gov.in", description: "Document verification, Evidence Matrix, Targeted Re-Scrutiny" },
                      { role: "INSTITUTION_ADMIN", title: "Institution Compliance Head", name: "Meridian Institute of Technology", email: "director@meridian.edu.in", description: "Application intake, document resubmission, deficiency response" },
                      { role: "REGULATORY_ADMIN", title: "Regulatory Administrator", name: "Regulatory Policy Director", email: "regadmin@flowstate.aicte.gov.in", description: "Clause registry, corrigendum diff, impact approval gate" },
                      { role: "EVC_EXPERT", title: "Visiting Expert Member", name: "Prof. S. R. Sharma (EVC Expert)", email: "expert.civil@flowstate.aicte.gov.in", description: "Visit schedules, infrastructure inspection, report upload" },
                      { role: "AUDITOR", title: "Audit & Compliance Officer", name: "Independent Statutory Auditor", email: "auditor@flowstate.aicte.gov.in", description: "Cryptographic SHA-256 hash ledger, immutable event provenance" },
                      { role: "SYSTEM_ADMIN", title: "System Administrator", name: "AICTE Administrative Director", email: "superadmin@flowstate.aicte.gov.in", description: "User management, role assignment, system health, demo reset" },
                    ]).map((user) => (
                      <button
                        key={user.role}
                        type="button"
                        onClick={() => handleDemoLogin(user.role)}
                        disabled={loading}
                        className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                              {user.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                              {user.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{user.description}</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE: PASSWORD LOGIN */}
              {mode === "login" && (
                <form onSubmit={handleStandardLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="officer.western@flowstate.aicte.gov.in"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setError(null); }}
                        className="text-[11px] text-blue-700 hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0a192f] hover:bg-slate-800 text-white font-bold py-2 rounded-md text-xs flex items-center justify-center gap-2 transition"
                  >
                    {loading ? "Authenticating..." : "Sign In to FLOWSTATE"}
                    <ArrowRight size={14} />
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-2">
                      Or use Single Sign-On
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleOAuth}
                    disabled={loading}
                    className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2 rounded-md text-xs flex items-center justify-center gap-2 transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google Workspace</span>
                  </button>
                </form>
              )}

              {/* MODE: REGISTER */}
              {mode === "register" && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Anand Deshmukh"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="director@institute.edu.in"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Role / Affiliation</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      <option value="INSTITUTION_ADMIN">Institution Administrator (Applicant)</option>
                      <option value="REGIONAL_OFFICER">Regional Scrutiny Officer</option>
                      <option value="EVC_EXPERT">EVC Committee Expert</option>
                      <option value="AUDITOR">Compliance Auditor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0a192f] hover:bg-slate-800 text-white font-bold py-2 rounded-md text-xs flex items-center justify-center gap-2 transition"
                  >
                    {loading ? "Registering..." : "Create Account"}
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {/* MODE: FORGOT PASSWORD */}
              {mode === "forgot" && (
                <div className="space-y-4">
                  {stepReset === 1 ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <p className="text-xs text-slate-600">
                        Enter your registered official email. A secure password reset token will be generated.
                      </p>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="officer.western@flowstate.aicte.gov.in"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0a192f] hover:bg-slate-800 text-white font-bold py-2 rounded-md text-xs flex items-center justify-center gap-2 transition"
                      >
                        {loading ? "Processing..." : "Generate Reset Token"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Reset Token</label>
                        <input
                          type="text"
                          required
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new secure password"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0a192f] hover:bg-slate-800 text-white font-bold py-2 rounded-md text-xs transition"
                      >
                        {loading ? "Updating..." : "Update Password & Log In"}
                      </button>
                    </form>
                  )}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(null); }}
                    className="text-xs text-slate-500 hover:text-slate-800 block text-center w-full"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Help */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>National Technical Education Oversight</span>
              <a
                href="/demo"
                className="text-blue-700 hover:underline font-bold flex items-center gap-1"
              >
                <span>Launch Interactive Walkthrough</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 bg-white border-t border-slate-200 text-slate-500 text-xs">
        <p>FLOWSTATE — Government-Grade Administrative Case Intelligence Platform • Standard AICTE APH 2024–2027</p>
      </footer>
    </div>
  );
}
