import { create } from "zustand";

export interface UserRolePreset {
  role: string;
  label: string;
  email: string;
  name: string;
  department: string;
}

export const ROLE_PRESETS: UserRolePreset[] = [
  { role: "EXECUTIVE", label: "Executive (Member Secretary)", email: "executive@flowstate.aicte.gov.in", name: "Member Secretary, AICTE", department: "Apex Leadership" },
  { role: "REGIONAL_OFFICER", label: "Regional Officer (Western)", email: "officer.western@flowstate.aicte.gov.in", name: "Western Regional Officer", department: "Regional Scrutiny & EVC" },
  { role: "INSTITUTION_ADMIN", label: "Institution Admin (Meridian)", email: "director@meridian.edu.in", name: "Prof. Anand G. Joshi", department: "Meridian Institute of Technology" },
  { role: "REGULATORY_ADMIN", label: "Regulatory Administrator", email: "regadmin@flowstate.aicte.gov.in", name: "Regulatory Policy Director", department: "Approval Process Policy" },
  { role: "EVC_EXPERT", label: "EVC Expert (Civil/Infra)", email: "expert.civil@flowstate.aicte.gov.in", name: "Prof. S. R. Sharma", department: "Expert Visit Committee" },
  { role: "AUDITOR", label: "Independent Statutory Auditor", email: "auditor@flowstate.aicte.gov.in", name: "Audit Directorate", department: "Vigilance & Audit Ledger" },
  { role: "SYSTEM_ADMIN", label: "System Administrator", email: "superadmin@flowstate.aicte.gov.in", name: "AICTE Administrative Director", department: "System Administration" },
];


interface WhyContext {
  title: string;
  finding: string;
  aphClause: string;
  aphText?: string;
  documentName?: string;
  documentPage?: number;
  extractedSnippet?: string;
  provenance: "RULE-COMPUTED" | "HUMAN-VERIFIED" | "AI-SUGGESTED" | "SIMULATED";
  auditTrace?: string[];
}

interface AppState {
  currentRole: UserRolePreset;
  setCurrentRole: (role: UserRolePreset) => void;
  whyModal: WhyContext | null;
  openWhyModal: (ctx: WhyContext) => void;
  closeWhyModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: ROLE_PRESETS[1], // Default to Officer
  setCurrentRole: (role) => set({ currentRole: role }),
  whyModal: null,
  openWhyModal: (ctx) => set({ whyModal: ctx }),
  closeWhyModal: () => set({ whyModal: null }),
}));
