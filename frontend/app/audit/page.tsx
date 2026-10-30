"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  History,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  FileCheck,
  Download,
  Hash,
} from "lucide-react";

export default function AuditReportsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [filterAction, setFilterAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(0, 100);
      setLogs(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
    } catch {
      setVerificationResult({ is_valid: false, total_events_checked: 0, error: "Network error" });
    } finally {
      setVerifying(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesAction = !filterAction || l.action.includes(filterAction);
    const matchesSearch =
      !searchQuery ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor_role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.entity_id && l.entity_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>AICTE Statutory Oversight</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">Tamper-Evident Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Statutory Audit & Hash Ledger
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Cryptographically chained SHA-256 event provenance tracking institutional actions, scrutiny determinations, and executive decisions.
          </p>
        </div>

        {/* Cryptographic Verify Button */}
        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="flex items-center gap-2 bg-[#0a192f] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-sm self-start sm:self-auto"
        >
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>{verifying ? "Verifying SHA-256 Chain..." : "Verify Hash Chain Integrity"}</span>
        </button>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            verificationResult.is_valid
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-rose-50 border-rose-300 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationResult.is_valid ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={20} className="text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-bold">
                {verificationResult.is_valid
                  ? "Cryptographic Verification Passed"
                  : "Hash Chain Verification Discrepancy"}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {verificationResult.is_valid
                  ? `All ${verificationResult.total_events_checked} audit entries verified sequentially. SHA-256 forward and previous hash links match without interruption.`
                  : "Hash chain discrepancy detected. Possible data tampering or missing sequence record."}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white border rounded shadow-2xs">
            {verificationResult.total_events_checked} Verified Nodes
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, or entity ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Action Filter:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium text-xs focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">User Logins</option>
            <option value="UPLOAD">Document Uploads</option>
            <option value="DEFICIENCY">Deficiencies Raised</option>
            <option value="VERIFY">Officer Verification</option>
            <option value="RESCRUTINY">Re-Scrutiny Actions</option>
            <option value="AMENDMENT">Policy Amendments</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table with Expandable Hashes */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Sequence</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Actor Role</th>
                <th className="px-4 py-3 text-right">Cryptographic Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">
                        #{log.sequence_number}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {log.entity_type} <span className="font-mono text-[10px] text-slate-400">({log.entity_id?.substring(0, 8)}...)</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {log.actor_role || "SYSTEM"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[10px] text-slate-400">
                        <span className="underline text-blue-600">
                          {isExpanded ? "Hide Hash Chain" : "Inspect SHA-256"}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={6} className="px-6 py-4 space-y-2 border-b border-slate-200 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                            <div className="p-2.5 bg-white rounded border border-slate-200 font-mono">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                                Current SHA-256 Hash:
                              </span>
                              <span className="text-slate-800 break-all select-all font-semibold">
                                {log.current_hash}
                              </span>
                            </div>
                            <div className="p-2.5 bg-white rounded border border-slate-200 font-mono">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                                Previous Chained Hash:
                              </span>
                              <span className="text-slate-600 break-all select-all">
                                {log.previous_hash || "GENESIS_NODE"}
                              </span>
                            </div>
                          </div>
                          {log.details_json && Object.keys(log.details_json).length > 0 && (
                            <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[10px]">
                              <span className="text-slate-400 font-bold block mb-1">Event Payload Details:</span>
                              <pre className="text-slate-700 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(log.details_json, null, 2)}
                              </pre>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
