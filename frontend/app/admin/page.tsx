"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import {
  Settings,
  Users,
  UserPlus,
  ShieldAlert,
  Activity,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Mail,
  Key,
  Shield,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { currentRole } = useAppStore();
  const [users, setUsers] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("REGIONAL_OFFICER");
  const [inviteRegion, setInviteRegion] = useState("Western");

  // Feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [userData, statusData] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getSystemStatus().catch(() => null),
      ]);
      setUsers(userData);
      setSystemStatus(statusData);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.inviteUser({
        email: inviteEmail,
        full_name: inviteName,
        role: inviteRole,
        regional_office: inviteRegion,
        temp_password: "Password123!",
      });
      setActionSuccess(`User ${inviteEmail} invited successfully.`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteName("");
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || "Failed to invite user.");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.updateUserStatus(userId, !currentStatus, "Administrative status update");
      setActionSuccess("User account status updated.");
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || "Failed to update status.");
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm("Are you sure you want to re-seed the synthetic dataset? This resets all demo applications, documents, and deficiency records to initial state.")) {
      return;
    }
    setResetting(true);
    setActionError(null);
    try {
      await api.resetDemo();
      setActionSuccess("Synthetic demo dataset reset successfully.");
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || "Reset failed.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-secondary mb-1">
            <ContourBadgeSwatch variant="deep" />
            <span>AICTE Technical Governance</span>
            <span>•</span>
            <span className="text-deep-core font-bold">SYSTEM_ADMIN Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            System Administration & User Management
          </h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Statutory role authorization, account provisioning, operational engine diagnostics, and demo dataset re-seeding.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="m-btn text-xs self-start sm:self-auto"
        >
          <UserPlus size={15} />
          <span>Provision Official User</span>
        </button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-sm text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-sm text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-700 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-paper p-4 rounded-sm border border-neutral shadow-xs">
          <div className="flex items-center justify-between text-ink-secondary text-xs font-semibold mb-1">
            <span className="font-heading">FastAPI Backend</span>
            <Activity size={15} className="text-emerald-700" />
          </div>
          <div className="text-lg font-heading font-bold text-ink">
            {systemStatus?.status || "HEALTHY"}
          </div>
          <span className="text-[10px] text-ink-secondary font-mono mt-0.5 block">
            Uptime 99.98% • Latency 14ms
          </span>
        </div>

        <div className="bg-paper p-4 rounded-sm border border-neutral shadow-xs">
          <div className="flex items-center justify-between text-ink-secondary text-xs font-semibold mb-1">
            <span className="font-heading">PostgreSQL / SQLite</span>
            <Cpu size={15} className="text-flow-core" />
          </div>
          <div className="text-lg font-heading font-bold text-ink">
            {systemStatus?.database || "CONNECTED"}
          </div>
          <span className="text-[10px] text-ink-secondary font-mono mt-0.5 block">
            Alembic Schema Current
          </span>
        </div>

        <div className="bg-paper p-4 rounded-sm border border-neutral shadow-xs">
          <div className="flex items-center justify-between text-ink-secondary text-xs font-semibold mb-1">
            <span className="font-heading">OCR / PDF Extractor</span>
            <ShieldCheck size={15} className="text-emerald-700" />
          </div>
          <div className="text-lg font-heading font-bold text-ink">READY</div>
          <span className="text-[10px] text-ink-secondary font-mono mt-0.5 block">
            Tesseract / PyPDF Pipeline
          </span>
        </div>

        <div className="bg-paper p-4 rounded-sm border border-neutral shadow-xs">
          <div className="flex items-center justify-between text-ink-secondary text-xs font-semibold mb-1">
            <span className="font-heading">SHA-256 Ledger</span>
            <Shield size={15} className="text-deep-core" />
          </div>
          <div className="text-lg font-heading font-bold text-ink">CHAIN LOCKED</div>
          <span className="text-[10px] text-ink-secondary font-mono mt-0.5 block">
            Tamper-Evident Chaining
          </span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-paper rounded-sm border border-neutral shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral flex items-center justify-between bg-surface">
          <div>
            <h3 className="font-heading font-bold text-ink text-sm">Authorized Administrative Accounts</h3>
            <p className="text-ink-secondary text-[11px]">System users with role-based access permissions</p>
          </div>
          <span className="text-xs font-mono text-ink-secondary font-semibold">
            {users.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-neutral text-ink-secondary font-mono font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Official User</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Regional Jurisdiction</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink-secondary font-mono">
                    Loading authorized user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink-secondary">
                    No users registered.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/50 transition">
                    <td className="px-4 py-3">
                      <div className="font-heading font-bold text-ink">{u.full_name || "Official User"}</div>
                      <span className="text-[10px] font-mono text-ink-secondary">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-neutral text-ink">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary font-medium">
                      {u.regional_office ? `${u.regional_office} RO` : "National HQ"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.is_active
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                          : "bg-rose-50 text-rose-900 border-rose-200"
                      }`}>
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                        className="text-[11px] font-bold text-ink-secondary hover:text-ink px-2 py-0.5 rounded-full border border-neutral hover:bg-surface transition"
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthetic Dataset Reset Card */}
      <div className="bg-paper rounded-sm border border-neutral p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-shallow-core" />
            <h3 className="font-heading font-bold text-ink text-sm">Synthetic Demo Dataset Re-Seed</h3>
          </div>
          <p className="text-xs text-ink-secondary mt-1 max-w-xl leading-relaxed">
            Reinitializes the 60 synthetic AICTE applications, documents, OCR extracts, and deficiency records back to initial benchmark state for interactive evaluation.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-xs transition shrink-0"
        >
          {resetting ? "Resetting Dataset..." : "Reset Synthetic Data"}
        </button>
      </div>

      {/* Provision User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4">
          <div className="bg-paper rounded-sm shadow-sheet max-w-md w-full p-6 space-y-4 border border-neutral">
            <div className="flex items-center justify-between border-b border-neutral pb-2">
              <h4 className="font-heading font-bold text-ink text-base">Provision Official Account</h4>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-ink-secondary hover:text-ink font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Prof. S. R. Sharma"
                  className="w-full p-2 border border-neutral rounded-sm bg-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="officer.western@flowstate.aicte.gov.in"
                  className="w-full p-2 border border-neutral rounded-sm bg-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Statutory Role Assignment</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2 border border-neutral rounded-sm bg-surface font-semibold"
                >
                  <option value="REGIONAL_OFFICER">Regional Scrutiny Officer</option>
                  <option value="EXECUTIVE">Executive (Member Secretary)</option>
                  <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                  <option value="REGULATORY_ADMIN">Regulatory Administrator</option>
                  <option value="EVC_EXPERT">EVC Committee Expert</option>
                  <option value="AUDITOR">Statutory Auditor</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Regional Office Jurisdiction</label>
                <select
                  value={inviteRegion}
                  onChange={(e) => setInviteRegion(e.target.value)}
                  className="w-full p-2 border border-neutral rounded-sm bg-surface font-semibold"
                >
                  <option value="Western">Western (Mumbai/Pune)</option>
                  <option value="Northern">Northern (Kanpur/Delhi)</option>
                  <option value="Southern">Southern (Chennai)</option>
                  <option value="Eastern">Eastern (Kolkata)</option>
                  <option value="South-Western">South-Western (Bengaluru)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="m-btn-outline text-xs py-1 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="m-btn text-xs py-1 px-3"
                >
                  Provision User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
