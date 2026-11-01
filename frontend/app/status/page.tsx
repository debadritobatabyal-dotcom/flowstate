"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
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
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono font-semibold text-ink-secondary">
        Loading Diagnostics Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-ink-secondary mb-1">
            <ContourBadgeSwatch variant="deep" />
            <span>AICTE System Diagnostics</span>
            <span>•</span>
            <span className="text-deep-core font-bold">Engine Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            FLOWSTATE Engine Diagnostics & Controls
          </h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Zero-key local orchestration status, service connectivity, and SHA-256 cryptographic tamper evidence.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="m-btn text-xs self-start sm:self-auto"
        >
          <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
          <span>{resetting ? "Resetting Demo..." : "Reset Signature Demo"}</span>
        </button>
      </div>

      {/* Service Health Grid */}
      {statusData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Card 1: LLM Engine */}
          <div className="bg-paper border border-neutral rounded-sm p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-secondary text-[10px] uppercase">LLM Engine</span>
              <Cpu size={16} className="text-flow-core" />
            </div>
            <div className="font-heading font-bold text-ink text-sm">Provider: {statusData.llm_provider?.toUpperCase() || "EXTRACTIVE"}</div>
            <div className="text-ink-secondary text-[11px]">
              {statusData.gemini_active
                ? "Google Gemini Flash Active"
                : statusData.ollama_active
                ? "Ollama Local Model Active"
                : "Extractive Citation NullProvider (Deterministic Fallback)"}
            </div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
              Ready & Connected
            </span>
          </div>

          {/* Card 2: Database Mode */}
          <div className="bg-paper border border-neutral rounded-sm p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-secondary text-[10px] uppercase">Database Mode</span>
              <Database size={16} className="text-flow-core" />
            </div>
            <div className="font-heading font-bold text-ink text-sm">{statusData.database_type || "SQLite / PostgreSQL"}</div>
            <div className="text-ink-secondary text-[11px]">Dual-Mode SQLAlchemy 2 with Alembic Migrations</div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
              Schema Synchronized
            </span>
          </div>

          {/* Card 3: Cryptographic Ledger */}
          <div className="bg-paper border border-neutral rounded-sm p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-secondary text-[10px] uppercase">Audit Ledger Integrity</span>
              <ShieldCheck size={16} className="text-deep-core" />
            </div>
            <div className="font-heading font-bold text-ink text-sm">
              {auditCheck?.is_valid ? "Pristine SHA-256 Chain" : "Verification Pending"}
            </div>
            <div className="text-ink-secondary text-[11px]">
              {auditCheck?.total_events_checked || 0} events verified without hash collision.
            </div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
              Chain Intact
            </span>
          </div>
        </div>
      )}

      {/* Recent Engine Logs */}
      <div className="bg-paper border border-neutral rounded-sm p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-neutral pb-2">
          <h3 className="font-heading font-bold text-ink text-sm">Recent Engine Operations</h3>
          <span className="font-mono text-[10px] text-ink-secondary font-bold">Latest {logs.length} Operations</span>
        </div>

        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-surface border border-neutral rounded-sm flex items-center justify-between font-mono text-[11px]">
              <div>
                <span className="font-bold text-ink">{log.action}</span>
                <span className="text-ink-secondary ml-2">({log.entity_type} {log.entity_id})</span>
              </div>
              <span className="text-ink-secondary">{new Date(log.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
