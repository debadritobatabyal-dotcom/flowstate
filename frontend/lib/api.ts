function getBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").trim();
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api/v1")) {
    if (url.endsWith("/api")) url = `${url}/v1`;
    else url = `${url}/api/v1`;
  }
  return url;
}

const API_BASE_URL = getBaseUrl();

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

  private isExpired(token: string): boolean {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      // Buffer by 30 seconds
      return !payload.exp || payload.exp < Math.floor(Date.now() / 1000) + 30;
    } catch {
      return true;
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowstate_token");
      if (stored) {
        if (this.isExpired(stored)) {
          localStorage.removeItem("flowstate_token");
          this.token = null;
          return null;
        }
        this.token = stored;
      }
    }
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    let token = this.getToken();

    // Transparent demo fallback: auto-provision demo token so tables are never empty for first-time visitors
    const isPublicEndpoint = endpoint.includes("/auth/") || endpoint.includes("/health");
    if (!token && !isPublicEndpoint && typeof window !== "undefined") {
      try {
        const demoRes = await fetch(`${API_BASE_URL}/auth/demo-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "REGIONAL_OFFICER" }),
        });
        if (demoRes.ok) {
          const authData = await demoRes.json();
          if (authData.access_token) {
            this.setToken(authData.access_token);
            token = authData.access_token;
          }
        }
      } catch {
        // Fallback silently if offline
      }
    }

    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    // Auto-heal on 401 Unauthorized (expired token or invalid session)
    if (res.status === 401 && !isRetry && !isPublicEndpoint && typeof window !== "undefined") {
      this.setToken(null);
      try {
        const demoRes = await fetch(`${API_BASE_URL}/auth/demo-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "REGIONAL_OFFICER" }),
        });
        if (demoRes.ok) {
          const authData = await demoRes.json();
          if (authData.access_token) {
            this.setToken(authData.access_token);
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${authData.access_token}`,
            };
            const retryRes = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
              ...options,
              headers: retryHeaders,
            });
            if (retryRes.ok) {
              return retryRes.json();
            }
          }
        }
      } catch {
        // Fallback to standard error handling
      }
    }

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

  async scheduleEvc(appId: string, preferredDate: string, panelSize: number = 3, visitMode: string = "PHYSICAL") {
    return this.request<any>("/evc/schedule", {
      method: "POST",
      body: JSON.stringify({ application_id: appId, preferred_date: preferredDate, panel_size: panelSize, visit_mode: visitMode }),
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
