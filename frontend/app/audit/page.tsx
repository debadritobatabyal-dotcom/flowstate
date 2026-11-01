"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
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
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-secondary mb-1">
            <ContourBadgeSwatch variant="deep" />
            <span>AICTE Statutory Oversight</span>
            <span>•</span>
            <span className="text-deep-core font-bold">Tamper-Evident Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Statutory Audit & Hash Ledger
          </h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Cryptographically chained SHA-256 event provenance tracking institutional applications, document extractions, officer scrutiny findings, and executive decisions.
          </p>
        </div>

        {/* Cryptographic Verify Button */}
        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="m-btn text-xs self-start sm:self-auto"
        >
          <ShieldCheck size={16} className="text-flow-rim" />
          <span>{verifying ? "Verifying SHA-256 Ledger..." : "Verify Cryptographic Hash Chain"}</span>
        </button>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-sm border flex items-center justify-between text-xs shadow-xs ${
            verificationResult.is_valid
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-rose-50 border-rose-200 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationResult.is_valid ? (
              <CheckCircle2 size={20} className="text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle size={20} className="text-rose-700 shrink-0" />
            )}
            <div>
              <div className="font-heading font-bold text-sm">
                {verificationResult.is_valid
                  ? "Cryptographic SHA-256 Verification Succeeded"
                  : "Hash Chain Sequence Discrepancy Detected"}
              </div>
              <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                {verificationResult.is_valid
                  ? `All ${verificationResult.total_events_checked} sequential audit entries verified without break. Previous-hash pointers match current payload hashes.`
                  : "Hash discrepancy detected. Possible database manipulation or out-of-order sequence."}
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-paper border border-neutral">
            {verificationResult.total_events_checked} Events Checked
          </span>
        </div>
      )}

      {/* Ledger Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-paper p-4 rounded-sm border border-neutral shadow-xs">
          <div className="flex items-center justify-between text-ink-secondary text-xs font-semibold mb-1">
            <span className="font-heading">Total Recorded Events</span>
            <History size={16} className="text-flow-core" />
          </div>
          <div className="text-2xl font-heading font-bold text-ink">{logs.length}</div>
          <span className="text-[10px] text-ink-secondary font-mono mt-0.5 block">
            Immutable Audit Trail
          </span>
        </div>

        <div className="bg-paper p-4 rounded-sm border border-neutral shadow-xs">
          <div className="flex items-center justify-between text-ink-secondary text-xs font-semibold mb-1">
            <span className="font-heading">Cryptographic Standard</span>
            <Hash size={16} className="text-deep-core" />
          </div>
          <div className="text-lg font-heading font-bold text-ink font-mono">SHA-256</div>
          <span className="text-[10px] text-ink-secondary font-mono mt-0.5 block">
            Forward & Backward Chaining
          </span>
        </div>

        <div className="bg-paper p-4 rounded-sm border border-neutral shadow-xs">
          <div className="flex items-center justify-between text-ink-secondary text-xs font-semibold mb-1">
            <span className="font-heading">Ledger Tamper Status</span>
            <Lock size={16} className="text-emerald-700" />
          </div>
          <div className="text-lg font-heading font-bold text-emerald-800">
            {verificationResult?.is_valid ? "Verified Pristine" : "Unverified / Ready"}
          </div>
          <span className="text-[10px] text-ink-secondary font-mono mt-0.5 block">
            Non-repudiable Proof
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-paper p-3.5 rounded-sm border border-neutral flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-2.5 text-ink-secondary" />
            <input
              type="text"
              placeholder="Search by action, role, entity, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-neutral rounded-full text-xs bg-surface focus:bg-paper focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-ink-secondary font-medium">Event Type:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-surface border border-neutral rounded-full px-2.5 py-1 text-ink font-semibold text-xs focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="APPLICATION">Application</option>
            <option value="SCRUTINY">Scrutiny</option>
            <option value="DEFICIENCY">Deficiency</option>
            <option value="AMENDMENT">Amendment</option>
            <option value="LOGIN">Auth/Login</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-paper rounded-sm border border-neutral shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral flex items-center justify-between bg-surface">
          <div>
            <h3 className="font-heading font-bold text-ink text-sm">Chronological Audit Events</h3>
            <p className="text-ink-secondary text-[11px]">Human-readable action details presented first; technical hashes expandable</p>
          </div>
          <span className="text-xs font-mono text-ink-secondary font-semibold">
            Showing {filteredLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-neutral text-ink-secondary font-mono font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Recorded</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Entity Affected</th>
                <th className="px-4 py-3 text-right">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink-secondary font-mono">
                    Loading statutory audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink-secondary">
                    No audit records match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-surface/50 transition">
                        <td className="px-4 py-3 font-mono text-ink-secondary whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-heading font-bold text-ink">
                            {log.action.replace(/_/g, " ")}
                          </div>
                          {log.notes && (
                            <p className="text-[11px] text-ink-secondary line-clamp-1">{log.notes}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-neutral text-ink">
                            {log.actor_role || "SYSTEM"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-ink text-[11px]">
                          <div>{log.entity_type}</div>
                          {log.entity_id && (
                            <span className="text-[10px] text-ink-secondary font-normal truncate block max-w-[140px]">
                              {log.entity_id}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-flow-core hover:text-navy bg-surface border border-neutral px-2.5 py-0.5 rounded-full transition font-semibold"
                          >
                            <Hash size={11} />
                            <span>{isExpanded ? "Hide Hash" : "Inspect SHA-256"}</span>
                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Technical Cryptographic Detail */}
                      {isExpanded && (
                        <tr className="bg-surface/80 border-b border-neutral/60">
                          <td colSpan={5} className="px-6 py-4 space-y-2 text-xs">
                            <div className="font-heading font-bold text-ink text-xs mb-1">
                              Cryptographic Chaining Details
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                              <div className="p-2.5 bg-paper rounded-sm border border-neutral space-y-1">
                                <span className="text-[10px] font-bold text-ink-secondary uppercase block">
                                  Event Payload Hash (SHA-256):
                                </span>
                                <div className="text-flow-core break-all font-bold select-all">
                                  {log.event_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                                </div>
                              </div>
                              <div className="p-2.5 bg-paper rounded-sm border border-neutral space-y-1">
                                <span className="text-[10px] font-bold text-ink-secondary uppercase block">
                                  Previous Chained Event Hash:
                                </span>
                                <div className="text-ink-secondary break-all select-all">
                                  {log.prev_hash || "0000000000000000000000000000000000000000000000000000000000000000 (GENESIS)"}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
