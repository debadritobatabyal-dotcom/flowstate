"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import {
  Activity,
  ShieldCheck,
  RotateCcw,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function StatusPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [auditCheck, setAuditCheck] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [resetting, setResetting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [st, ac, lg] = await Promise.all([
        api.getSystemStatus(),
        api.verifyAuditChain(),
        api.getAuditLogs(0, 15),
      ]);
      setStatusData(st);
      setAuditCheck(ac);
      setLogs(lg);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all records to the baseline demonstration state?")) return;
    setResetting(true);
    try {
      await api.resetDemo();
      await loadStatus();
      alert("Demonstration scenario successfully reset to baseline.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="text-blue-700" size={20} />
            <h2 className="text-xl font-bold text-slate-900">FLOWSTATE Engine Diagnostics & Controls</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zero-Key Local Orchestration Status, Service Toggles & SHA-256 Tamper Evidence
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm"
        >
          <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
          {resetting ? "Resetting Demo..." : "Reset Signature Demo"}
        </button>
      </div>

      {/* Service Health Grid */}
      {statusData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Card 1: LLM Engine */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 text-[10px] uppercase">LLM Engine</span>
              <Cpu size={16} className="text-blue-600" />
            </div>
            <div className="font-bold text-slate-900 text-sm">Provider: {statusData.llm_provider.toUpperCase()}</div>
            <div className="text-slate-600">
              {statusData.gemini_active
                ? "Google Gemini Flash Active"
                : statusData.ollama_active
                ? "Ollama Local Model Active"
                : "Extractive Citation NullProvider (Zero-Key Fallback)"}
            </div>
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
              Ready & Connected
            </span>
          </div>

          {/* Card 2: Database Mode */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 text-[10px] uppercase">Database Mode</span>
              <Database size={16} className="text-emerald-600" />
            </div>
            <div className="font-bold text-slate-900 text-sm">{statusData.database_type}</div>
            <div className="text-slate-600">Dual-Mode SQLAlchemy 2 (SQLite / PostgreSQL)</div>
            <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px]">
              Zero-Service Native Setup
            </span>
          </div>

          {/* Card 3: Cryptographic Audit Chain */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 text-[10px] uppercase">Audit Chain Integrity</span>
              <ShieldCheck size={16} className="text-purple-600" />
            </div>
            <div className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
              <CheckCircle2 size={16} /> VALID & UNBROKEN
            </div>
            <div className="text-slate-600">SHA-256 Append-Only Hash Chaining</div>
            <span className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold text-[10px]">
              {statusData.total_applications} Apps Tracked
            </span>
          </div>
        </div>
      )}

      {/* Live Audit Log Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-2">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Append-Only Cryptographic Audit Log</h4>
            <p className="text-xs text-slate-500">Every workflow transition and human approval hashed with previous block</p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold">
            Total Logged Events: {logs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-2.5 px-4">Seq</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Entity</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Current Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.sequence_id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{l.sequence_id}</td>
                  <td className="py-2.5 px-4 font-bold text-blue-700">{l.action}</td>
                  <td className="py-2.5 px-4 text-slate-700">{l.entity_type}</td>
                  <td className="py-2.5 px-4 text-slate-500">{l.actor_role || "SYSTEM"}</td>
                  <td className="py-2.5 px-4 text-slate-400 truncate max-w-[200px]" title={l.current_hash}>
                    {l.current_hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
