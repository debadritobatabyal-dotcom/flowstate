"use client";
import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ShieldAlert, BookOpen, Layers, FileText, CheckCircle, HelpCircle } from "lucide-react";

interface Props {
  amendmentNumber: string;
  clauseNumber: string;
  ruleCode: string;
  workflowName: string;
  applicationNumber: string;
  recommendedAction: string;
  applicability: string;
  approvalStatus: string;
  onApprove?: () => void;
  onReject?: () => void;
}

// Custom Node for the Traceability Visualizer
const CustomTraceNode = ({ data }: { data: any }) => {
  const Icon = data.icon || FileText;
  return (
    <div
      className={`px-4 py-3 rounded-xl border shadow-md text-xs w-64 ${
        data.highlight
          ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400"
          : "bg-white border-slate-200"
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-400" />
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={data.iconColor || "text-slate-700"} />
        <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">{data.layer}</span>
      </div>
      <div className="font-bold text-slate-900 text-xs leading-snug">{data.title}</div>
      {data.subtitle && <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{data.subtitle}</p>}
      {data.badge && (
        <div className="mt-2">
          <ProvenanceBadge type={data.badge} size="sm" />
        </div>
      )}
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-slate-400" />
    </div>
  );
};

const nodeTypes = {
  traceNode: CustomTraceNode,
};

export const TraceabilityGraph: React.FC<Props> = ({
  amendmentNumber,
  clauseNumber,
  ruleCode,
  workflowName,
  applicationNumber,
  recommendedAction,
  applicability,
  approvalStatus,
  onApprove,
  onReject,
}) => {
  const isAmbiguous = applicability.includes("AMBIGUOUS");

  const nodes: Node[] = useMemo(
    () => [
      {
        id: "1",
        type: "traceNode",
        position: { x: 50, y: 120 },
        data: {
          layer: "1. Amendment / Corrigendum",
          title: amendmentNumber,
          subtitle: "Statutory Corrigendum Notice (APH 2024–27)",
          icon: ShieldAlert,
          iconColor: "text-indigo-600",
        },
      },
      {
        id: "2",
        type: "traceNode",
        position: { x: 360, y: 120 },
        data: {
          layer: "2. Regulatory Clause",
          title: clauseNumber,
          subtitle: "Modified standard for scrutiny and inspection",
          icon: BookOpen,
          iconColor: "text-blue-600",
          badge: "RULE-COMPUTED",
        },
      },
      {
        id: "3",
        type: "traceNode",
        position: { x: 670, y: 50 },
        data: {
          layer: "3. Dependent Rule",
          title: ruleCode,
          subtitle: "Verification criteria and normative threshold",
          icon: Layers,
          iconColor: "text-emerald-600",
          badge: "RULE-COMPUTED",
        },
      },
      {
        id: "4",
        type: "traceNode",
        position: { x: 670, y: 220 },
        data: {
          layer: "4. Workflow Template",
          title: workflowName,
          subtitle: "Table 2.3 processing stage sequence",
          icon: Layers,
          iconColor: "text-purple-600",
          badge: "RULE-COMPUTED",
        },
      },
      {
        id: "5",
        type: "traceNode",
        position: { x: 980, y: 120 },
        data: {
          layer: "5. Active Application",
          title: applicationNumber,
          subtitle: `Applicability: ${applicability}`,
          icon: FileText,
          iconColor: isAmbiguous ? "text-amber-600" : "text-blue-600",
          highlight: isAmbiguous,
          badge: isAmbiguous ? "UNVERIFIED-SYNTHETIC" : "RULE-COMPUTED",
        },
      },
      {
        id: "6",
        type: "traceNode",
        position: { x: 1290, y: 120 },
        data: {
          layer: "6. Recommended Action & Approval Gate",
          title: `Status: ${approvalStatus}`,
          subtitle: recommendedAction,
          icon: CheckCircle,
          iconColor: approvalStatus === "APPROVED" ? "text-emerald-600" : "text-amber-600",
          highlight: approvalStatus === "PENDING",
        },
      },
    ],
    [amendmentNumber, clauseNumber, ruleCode, workflowName, applicationNumber, recommendedAction, applicability, approvalStatus, isAmbiguous]
  );

  const edges: Edge[] = useMemo(
    () => [
      { id: "e1-2", source: "1", target: "2", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: "e2-3", source: "2", target: "3", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: "e2-4", source: "2", target: "4", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: "e3-5", source: "3", target: "5", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: "e4-5", source: "4", target: "5", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: "e5-6", source: "5", target: "6", animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: isAmbiguous ? "#d97706" : "#64748b", strokeWidth: 2 } },
    ],
    [isAmbiguous]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Regulatory Change-Impact Dependency Graph</h4>
          <p className="text-xs text-slate-500 font-mono">
            Amendment → Clause → Requirement → Workflow → Application → Recommended Action
          </p>
        </div>
        {approvalStatus === "PENDING" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
              Human Approval Gate Active
            </span>
            {onReject && (
              <button
                onClick={onReject}
                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded border border-rose-200"
              >
                Reject Change
              </button>
            )}
            {onApprove && (
              <button
                onClick={onApprove}
                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-sm"
              >
                Approve Action
              </button>
            )}
          </div>
        )}
      </div>

      <div className="h-[420px] w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};
