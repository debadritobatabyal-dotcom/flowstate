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
import { ContourBadgeSwatch } from "@/components/ContourGraphic";
import { ShieldAlert, BookOpen, Layers, FileText, CheckCircle, HelpCircle, ArrowRight, Check, X } from "lucide-react";

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
      className={`px-4 py-3 rounded-sm border shadow-sheet text-xs w-68 transition ${
        data.highlight
          ? "bg-shallow-rim/15 border-shallow-core ring-1 ring-shallow-core"
          : "bg-paper border-neutral"
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-neutral" />
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={14} className={data.iconColor || "text-ink"} />
        <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-ink-secondary">{data.layer}</span>
      </div>
      <div className="font-heading font-bold text-ink text-xs leading-snug">{data.title}</div>
      {data.subtitle && <p className="text-[11px] text-ink-secondary mt-0.5 line-clamp-2 leading-relaxed">{data.subtitle}</p>}
      {data.badge && (
        <div className="mt-2">
          <ProvenanceBadge type={data.badge} size="sm" />
        </div>
      )}
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-neutral" />
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
        position: { x: 40, y: 120 },
        data: {
          layer: "1. Amendment / Notice",
          title: amendmentNumber,
          subtitle: "Statutory Corrigendum Notice (APH 2024–27)",
          icon: ShieldAlert,
          iconColor: "text-shallow-core",
        },
      },
      {
        id: "2",
        type: "traceNode",
        position: { x: 340, y: 120 },
        data: {
          layer: "2. Regulatory Clause",
          title: clauseNumber,
          subtitle: "Modified standard for scrutiny and inspection",
          icon: BookOpen,
          iconColor: "text-flow-core",
          badge: "RULE-COMPUTED",
        },
      },
      {
        id: "3",
        type: "traceNode",
        position: { x: 640, y: 120 },
        data: {
          layer: "3. Evaluated Rule",
          title: ruleCode,
          subtitle: "Institutional requirement validation parameter",
          icon: Layers,
          iconColor: "text-flow-core",
        },
      },
      {
        id: "4",
        type: "traceNode",
        position: { x: 940, y: 120 },
        data: {
          layer: "4. Workflow Stage",
          title: workflowName,
          subtitle: "Affected procedural approval milestone",
          icon: Layers,
          iconColor: "text-ink",
        },
      },
      {
        id: "5",
        type: "traceNode",
        position: { x: 1240, y: 120 },
        data: {
          layer: "5. Affected Dossier",
          title: applicationNumber,
          subtitle: "Active institution application in pipeline",
          icon: FileText,
          iconColor: "text-flow-core",
        },
      },
      {
        id: "6",
        type: "traceNode",
        position: { x: 1540, y: 120 },
        data: {
          layer: "6. Recommended Action",
          title: recommendedAction,
          subtitle: isAmbiguous
            ? "Ambiguous applicability requires human administrative determination"
            : "Deterministic action proposal",
          icon: isAmbiguous ? HelpCircle : CheckCircle,
          iconColor: isAmbiguous ? "text-shallow-core" : "text-emerald-700",
          highlight: true,
          badge: isAmbiguous ? "AI-SUGGESTED" : "RULE-COMPUTED",
        },
      },
    ],
    [
      amendmentNumber,
      clauseNumber,
      ruleCode,
      workflowName,
      applicationNumber,
      recommendedAction,
      isAmbiguous,
    ]
  );

  const edges: Edge[] = useMemo(
    () => [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        animated: true,
        style: { stroke: "#155386", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#155386" },
      },
      {
        id: "e2-3",
        source: "2",
        target: "3",
        animated: true,
        style: { stroke: "#155386", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#155386" },
      },
      {
        id: "e3-4",
        source: "3",
        target: "4",
        animated: true,
        style: { stroke: "#155386", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#155386" },
      },
      {
        id: "e4-5",
        source: "4",
        target: "5",
        animated: true,
        style: { stroke: "#155386", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#155386" },
      },
      {
        id: "e5-6",
        source: "5",
        target: "6",
        animated: true,
        style: { stroke: isAmbiguous ? "#e2580e" : "#15803d", strokeWidth: 2.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isAmbiguous ? "#e2580e" : "#15803d",
        },
      },
    ],
    [isAmbiguous]
  );

  return (
    <div className="space-y-4 font-sans">
      <div className="h-[360px] bg-paper rounded-sm border border-neutral relative overflow-hidden shadow-xs">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-right"
        >
          <Background color="#d3d6d9" gap={20} size={1} />
          <Controls className="bg-paper border border-neutral shadow-xs text-ink rounded-sm" />
        </ReactFlow>
      </div>

      {/* Human Approval Gate Action Bar */}
      <div className="bg-surface p-4 rounded-sm border border-neutral flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-ink">Mandatory Human Approval Gate:</span>
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                approvalStatus === "APPROVED"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : approvalStatus === "REJECTED"
                  ? "bg-rose-50 text-rose-900 border-rose-200"
                  : "bg-shallow-rim/30 text-shallow-core border-shallow-core/30"
              }`}
            >
              {approvalStatus}
            </span>
          </div>
          <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
            AI and rule engines propose actions. Final adoption on active application pipeline requires authorized regulatory administrator approval.
          </p>
        </div>

        {approvalStatus === "PENDING" && onApprove && onReject && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReject}
              className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition"
            >
              Reject Action
            </button>
            <button
              onClick={onApprove}
              className="m-btn text-xs py-1.5 px-4"
            >
              Approve & Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
