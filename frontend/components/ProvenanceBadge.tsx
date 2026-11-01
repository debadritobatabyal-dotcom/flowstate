import React from "react";
import { ShieldCheck, Cpu, Sparkles, AlertCircle } from "lucide-react";
import { ContourBadgeSwatch } from "@/components/ContourGraphic";

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
  let variant: "flow" | "shallow" | "deep" = "flow";
  let badgeStyle = "bg-paper text-ink border-neutral";
  let Icon = Cpu;

  if (norm.includes("VERIFIED")) {
    label = "HUMAN-VERIFIED";
    variant = "flow";
    badgeStyle = "bg-emerald-50 text-emerald-900 border-emerald-200";
    Icon = ShieldCheck;
  } else if (norm.includes("SUGGESTED")) {
    label = "AI-SUGGESTED";
    variant = "deep";
    badgeStyle = "bg-purple-50 text-purple-900 border-purple-200";
    Icon = Sparkles;
  } else if (norm.includes("SIMULATED")) {
    label = "SIMULATED";
    variant = "shallow";
    badgeStyle = "bg-amber-50 text-amber-900 border-amber-200";
    Icon = AlertCircle;
  } else if (norm.includes("UNVERIFIED")) {
    label = "UNVERIFIED-SYNTHETIC";
    variant = "shallow";
    badgeStyle = "bg-rose-50 text-rose-900 border-rose-200";
    Icon = AlertCircle;
  }

  const px = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  const iconSize = size === "sm" ? 11 : 13;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider rounded-full border shadow-2xs ${badgeStyle} ${px}`}
      title={`Data Provenance: ${label}`}
    >
      <ContourBadgeSwatch variant={variant} />
      {showIcon && <Icon size={iconSize} className="shrink-0 opacity-80" />}
      <span>{label}</span>
    </span>
  );
};
