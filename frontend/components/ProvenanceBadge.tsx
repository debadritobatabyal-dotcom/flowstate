import React from "react";
import { ShieldCheck, Cpu, Sparkles, AlertCircle } from "lucide-react";

interface ProvenanceBadgeProps {
  type: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  size = "md",
  showIcon = true,
}) => {
  const norm = (type || "").toUpperCase();

  let label = "RULE-COMPUTED";
  let bg = "bg-blue-50 text-blue-800 border-blue-200";
  let Icon = Cpu;

  if (norm.includes("VERIFIED")) {
    label = "HUMAN-VERIFIED";
    bg = "bg-emerald-50 text-emerald-800 border-emerald-200";
    Icon = ShieldCheck;
  } else if (norm.includes("SUGGESTED")) {
    label = "AI-SUGGESTED";
    bg = "bg-purple-50 text-purple-800 border-purple-200";
    Icon = Sparkles;
  } else if (norm.includes("SIMULATED")) {
    label = "SIMULATED";
    bg = "bg-amber-50 text-amber-800 border-amber-200";
    Icon = AlertCircle;
  } else if (norm.includes("UNVERIFIED")) {
    label = "UNVERIFIED-SYNTHETIC";
    bg = "bg-rose-50 text-rose-800 border-rose-200";
    Icon = AlertCircle;
  }

  const px = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  const iconSize = size === "sm" ? 11 : 13;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold uppercase tracking-wider rounded border ${bg} ${px}`}
      title={`Data Provenance: ${label}`}
    >
      {showIcon && <Icon size={iconSize} className="shrink-0" />}
      {label}
    </span>
  );
};
