import axios from "axios";

// Define interfaces for type safety
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface LoginResponse {
  access_token: string;
  user?: User;
  admin?: User;
  agent?: User;
}

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

interface AgentData {
  name: string;
  email: string;
  password?: string;
  maxChats?: number;
  status?: string;
}

interface ConversationAssignment {
  conversationIds: string[];
  agentId: string;
}

interface MessageData {
  conversationId: string;
  content: string;
  type: string;
}

class ApiService {
  private api: any; // AxiosInstance type not available
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config: any) => { // AxiosRequestConfig type not available
        const token = localStorage.getItem("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error) // AxiosError type not available
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: any) => response, // AxiosResponse type not available
      (error: any) => { // AxiosError type not available
        if (error.response?.status === 401) {
          // Clear invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================

  async adminLogin(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post("/auth/admin/login", {
      email,
      password,
    });
    return response.data;
  }

  async agentLogin(email: string, password: string) {
    const response = await this.api.post("/auth/agent/login", {
      email,
      password,
    });
    return response.data;
  }

  // =============================================================================
  // ADMIN ENDPOINTS
  // =============================================================================

  // Dashboard metrics
  async getDashboardMetrics() {
    const response = await this.api.get("/admin/metrics");
    return response.data;
  }

  // Agent management
  async getAgents(status?: string) {
    const response = await this.api.get("/admin/agents", {
      params: status ? { status } : {},
    });
    return response.data;
  }

  async createAgent(agentData: AgentData) {
    const response = await this.api.post("/admin/agents", agentData);
    return response.data;
  }

  async updateAgent(id: string, agentData: Partial<AgentData>) {
    const response = await this.api.put(`/admin/agents/${id}`, agentData);
    return response.data;
  }

  async deleteAgent(id: string) {
    const response = await this.api.delete(`/admin/agents/${id}`);
    return response.data;
  }

  // Queue management
  async getConversationQueue() {
    const response = await this.api.get("/admin/conversations/queue");
    return response.data;
  }

  async bulkAssignConversations(
    assignments: ConversationAssignment
  ): Promise<ApiResponse> {
    const response = await this.api.post(
      "/admin/dashboard/bulk-assign",
      assignments
    );
    return response.data;
  }

  async assignConversation(conversationId: string, agentId: string) {
    const response = await this.api.put(
      `/admin/conversations/${conversationId}/assign`,
      {
        agentId,
      }
    );
    return response.data;
  }

  // Configuration management
  async getAllMessages(language = "en") {
    const response = await this.api.get("/admin/config/messages", {
      params: { language },
    });
    return response.data;
  }

  async updateMessage(key: string, value: string, language = "en") {
    const response = await this.api.put(`/admin/config/messages/${key}`, {
      value,
      language,
    });
    return response.data;
  }

  async getChatbotOptions(key: string) {
    const response = await this.api.get(`/admin/config/options/${key}`);
    return response.data;
  }

  async updateChatbotOptions(key: string, options: string[]) {
    const response = await this.api.put(`/admin/config/options/${key}`, {
      options,
    });
    return response.data;
  }

  // Real-time stats
  async getRealtimeStats() {
    const response = await this.api.get("/admin/realtime/stats");
    return response.data;
  }

  // =============================================================================
  // AGENT ENDPOINTS
  // =============================================================================

  // Profile management
  async getAgentProfile() {
    const response = await this.api.get("/agent/profile");
    return response.data;
  }

  async updateAgentProfile(profileData: Partial<User>): Promise<ApiResponse> {
    const response = await this.api.put("/agent/profile", profileData);
    return response.data;
  }

  async updateAgentStatus(status: string) {
    const response = await this.api.put("/agent/status", { status });
    return response.data;
  }

  // Conversations
  async getAssignedUsers() {
    const response = await this.api.get("/agent/assigned-users");
    return response.data;
  }

  async getConversationMessages(conversationId: string) {
    const response = await this.api.get(
      `/agent/conversations/${conversationId}/messages`
    );
    return response.data;
  }

  async sendAgentMessage(conversationId: string, text: string) {
    const response = await this.api.post("/agent/messages", {
      conversationId,
      text,
    });
    return response.data;
  }

  async completeConversation(
    conversationId: string,
    satisfaction?: number,
    notes?: string
  ) {
    const response = await this.api.post(
      `/agent/conversations/${conversationId}/complete`,
      {
        satisfaction,
        notes,
      }
    );
    return response.data;
  }

  async transferConversation(
    conversationId: string,
    targetAgentId: string,
    reason?: string
  ) {
    const response = await this.api.post(
      `/agent/conversations/${conversationId}/transfer`,
      {
        targetAgentId,
        reason,
      }
    );
    return response.data;
  }

  // Utility
  async getChannels() {
    const response = await this.api.get("/agent/channels");
    return response.data;
  }

  async getAgentStats() {
    const response = await this.api.get("/agent/stats");
    return response.data;
  }

  async getQuickResponses(category?: string) {
    const response = await this.api.post(
      "/agent/quick-responses",
      {},
      {
        params: category ? { category } : {},
      }
    );
    return response.data;
  }

  async sendHeartbeat() {
    const response = await this.api.post("/agent/activity/heartbeat");
    return response.data;
  }
}

export default new ApiService();
export type {
  User,
  LoginResponse,
  ApiResponse,
  AgentData,
  ConversationAssignment,
  MessageData,
};
