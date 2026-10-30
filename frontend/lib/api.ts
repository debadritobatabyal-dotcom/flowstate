const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("flowstate_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("flowstate_token", token);
      else localStorage.removeItem("flowstate_token");
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("flowstate_token");
    }
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Auth & Access Management
  async login(email: string, password: string) {
    return this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; full_name: string; role?: string; institution_id?: string }) {
    return this.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async googleAuth(idToken: string, email?: string, name?: string) {
    return this.request<any>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken, email, name }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, reset_token: string, new_password: string) {
    return this.request<any>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, reset_token, new_password }),
    });
  }

  async getDemoUsers() {
    return this.request<any[]>("/auth/demo-users");
  }

  async demoLogin(role: string) {
    return this.request<any>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  }

  async getMe() {
    return this.request<any>("/auth/me");
  }

  // User Management (SYSTEM_ADMIN)
  async getUsers(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any[]>(`/users${qs ? `?${qs}` : ""}`);
  }

  async inviteUser(data: any) {
    return this.request<any>("/users/invite", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUserStatus(userId: string, is_active: boolean, reason?: string) {
    return this.request<any>(`/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active, reason }),
    });
  }

  async updateUserRole(userId: string, role: string, institutionId?: string, regionalOffice?: string) {
    return this.request<any>(`/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role, institution_id: institutionId, regional_office: regionalOffice }),
    });
  }


  // Applications
  async getApplications(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any[]>(`/applications${qs ? `?${qs}` : ""}`);
  }

  async getApplication(id: string) {
    return this.request<any>(`/applications/${id}`);
  }

  async transitionStage(id: string, to_stage: string, notes: string = "") {
    return this.request<any>(`/applications/${id}/transition`, {
      method: "POST",
      body: JSON.stringify({ to_stage, notes }),
    });
  }

  async getDeadlines(id: string) {
    return this.request<any>(`/applications/${id}/deadlines`);
  }

  // Documents & Evidence Matrix
  async getEvidenceMatrix(appId: string) {
    return this.request<any[]>(`/documents/${appId}/evidence-matrix`);
  }

  async verifyEvidence(appId: string, linkId: string, payload: any) {
    return this.request<any>(`/documents/${appId}/verify-evidence/${linkId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async uploadDocument(appId: string, formData: FormData) {
    return this.request<any>(`/documents/${appId}/upload`, {
      method: "POST",
      body: formData,
    });
  }

  // Deficiencies & Re-Scrutiny
  async getDeficiencies(appId: string) {
    return this.request<any[]>(`/deficiencies/${appId}`);
  }

  async createDeficiency(appId: string, payload: any) {
    return this.request<any>(`/deficiencies/${appId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async resubmitDeficiency(deficiencyId: string, payload: any) {
    return this.request<any>(`/deficiencies/${deficiencyId}/resubmit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async generateRescrutinyChecklist(appId: string) {
    return this.request<any>(`/deficiencies/${appId}/rescrutiny/generate-checklist`, {
      method: "POST",
    });
  }

  async getRescrutinyChecklist(appId: string) {
    return this.request<any>(`/deficiencies/${appId}/rescrutiny/checklist`);
  }

  async verifyRescrutinyItem(payload: any) {
    return this.request<any>("/deficiencies/rescrutiny/verify-item", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async addOutOfScopeFinding(appId: string, payload: any) {
    return this.request<any>(`/deficiencies/${appId}/rescrutiny/out-of-scope-finding`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Regulation
  async getClauses(search: string = "") {
    return this.request<any[]>(`/regulation/clauses${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  }

  async getRules() {
    return this.request<any[]>("/regulation/rules");
  }

  async getWorkflowTemplates() {
    return this.request<any[]>("/regulation/workflow-templates");
  }

  async askRegulatoryQuestion(query: string) {
    return this.request<any>("/regulation/qa", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  // Change Impact
  async getAmendments() {
    return this.request<any[]>("/impact/amendments");
  }

  async getImpactReport(amendmentId: string) {
    return this.request<any>(`/impact/reports/${amendmentId}`);
  }

  async approveImpactItem(itemId: string, status: string, notes: string = "") {
    return this.request<any>("/impact/approve-item", {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, approval_status: status, notes }),
    });
  }

  // EVC
  async getExperts() {
    return this.request<any[]>("/evc/experts");
  }

  async scheduleEvc(appId: string, preferredDate: string, panelSize: number = 3) {
    return this.request<any>("/evc/schedule", {
      method: "POST",
      body: JSON.stringify({ application_id: appId, preferred_date: preferredDate, panel_size: panelSize }),
    });
  }

  // Analytics & Dashboard
  async getDashboardKpis(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/analytics/dashboard-kpis${qs ? `?${qs}` : ""}`);
  }


  async getDelayPrediction(appId: string) {
    return this.request<any>(`/analytics/prediction/${appId}`);
  }

  // Audit
  async getAuditLogs(skip: number = 0, limit: number = 50) {
    return this.request<any[]>(`/audit/logs?skip=${skip}&limit=${limit}`);
  }

  async verifyAuditChain() {
    return this.request<any>("/audit/verify-chain");
  }

  // System
  async getSystemStatus() {
    return this.request<any>("/system/status");
  }

  async resetDemo() {
    return this.request<any>("/system/reset-demo", { method: "POST" });
  }
}

export const api = new ApiClient();
