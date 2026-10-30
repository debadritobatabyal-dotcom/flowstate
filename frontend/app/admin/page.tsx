"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>AICTE Technical Governance</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">SYSTEM_ADMIN Directorate</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            System Administration & User Management
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Role assignment, account authorization, system diagnostics, and synthetic demo reset controls.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-[#0a192f] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-sm self-start sm:self-auto"
        >
          <UserPlus size={15} />
          <span>Provision Official User</span>
        </button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* System Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>FastAPI Backend</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-900">
            {systemStatus?.backend || "Online (v1.0)"}
          </div>
          <p className="text-[11px] text-slate-500">FastAPI REST core serving /api/v1</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>SQL Database</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-900">
            {systemStatus?.database || "SQLite / PostgreSQL"}
          </div>
          <p className="text-[11px] text-slate-500">Storage at storage/flowstate.db</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>ML Delay Engine</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-900">
            Gradient Boosting
          </div>
          <p className="text-[11px] text-slate-500">Trained on 3,000 synthetic applications</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Authorized System Users</h2>
            <p className="text-xs text-slate-500">Role-based access controls and account status</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 rounded text-slate-700">
            {users.length} Registered Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Full Legal Name</th>
                <th className="px-4 py-3">Official Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Affiliation / Region</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {u.full_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.institution_name || "AICTE National Headquarters"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      u.is_active ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                    }`}>
                      {u.is_active ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.is_active)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded border transition ${
                        u.is_active
                          ? "text-rose-700 border-rose-300 hover:bg-rose-50"
                          : "text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      {u.is_active ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthetic Dataset Management */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Synthetic Dataset Reset</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset all 12 institutions, 60 applications, deficiencies, and seed documents to initial state.
          </p>
        </div>
        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-sm self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          <span>{resetting ? "Resetting Database..." : "Reset Demo Environment"}</span>
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleInviteUser}
            className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-300 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Provision Official User Account</h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Prof. S. R. Sharma"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="officer.new@flowstate.aicte.gov.in"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="REGIONAL_OFFICER">Regional Scrutiny Officer</option>
                  <option value="EXECUTIVE">Executive Decision Maker</option>
                  <option value="REGULATORY_ADMIN">Regulatory Administrator</option>
                  <option value="EVC_EXPERT">EVC Visiting Expert</option>
                  <option value="AUDITOR">Statutory Compliance Auditor</option>
                  <option value="SYSTEM_ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Regional Office</label>
                <select
                  value={inviteRegion}
                  onChange={(e) => setInviteRegion(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Western">Western Region</option>
                  <option value="Northern">Northern Region</option>
                  <option value="Southern">Southern Region</option>
                  <option value="Eastern">Eastern Region</option>
                  <option value="South-Western">South-Western Region</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500">
                Default temporary password <span className="font-mono font-bold">Password123!</span> will be issued.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0a192f] text-white rounded text-xs font-bold"
              >
                Provision User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
