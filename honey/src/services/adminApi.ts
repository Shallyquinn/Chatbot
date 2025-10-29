/**
 * Admin API Service
 * Centralized API layer with error handling, retry logic, and type safety
 */

import type {
  DashboardMetrics,
  Agent,
  QueueItem,
  AdminProfile,
  UpdateAdminProfileDto,
} from "../types/admin";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface ApiError {
  message: string;
  statusCode?: number;
  details?: any;
}

class AdminApiService {
  private getAuthHeaders(): HeadersInit {
    const token =
      localStorage.getItem("token") || localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.details = errorData;
      } catch {
        // Response body is not JSON
      }

      // Handle specific error cases
      if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
      }

      throw error;
    }

    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retries = MAX_RETRIES
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (retries > 0 && this.isRetriableError(error)) {
        await this.delay(RETRY_DELAY);
        return this.fetchWithRetry<T>(url, options, retries - 1);
      }
      throw error;
    }
  }

  private isRetriableError(error: any): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.statusCode ||
      (error.statusCode >= 500 && error.statusCode < 600) ||
      error.message?.includes("fetch")
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      return await this.fetchWithRetry<DashboardMetrics>(
        `${API_BASE_URL}/admin/dashboard`
      );
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error);
      // Return default metrics on error
      return {
        overview: {
          totalConversations: 0,
          activeConversations: 0,
          queuedConversations: 0,
          totalAgents: 0,
          onlineAgents: 0,
          avgResponseTime: "0s",
        },
      };
    }
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    try {
      return await this.fetchWithRetry<Agent[]>(`${API_BASE_URL}/admin/agents`);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      return [];
    }
  }

  async createAgent(agentData: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    maxChats?: number;
  }): Promise<Agent> {
    return await this.fetchWithRetry<Agent>(`${API_BASE_URL}/admin/agents`, {
      method: "POST",
      body: JSON.stringify(agentData),
    });
  }

  async updateAgent(
    agentId: string,
    updateData: Partial<Agent>
  ): Promise<Agent> {
    return await this.fetchWithRetry<Agent>(
      `${API_BASE_URL}/admin/agents/${agentId}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.fetchWithRetry<void>(`${API_BASE_URL}/admin/agents/${agentId}`, {
      method: "DELETE",
    });
  }

  // Conversation Queue
  async getConversationQueue(): Promise<QueueItem[]> {
    try {
      return await this.fetchWithRetry<QueueItem[]>(
        `${API_BASE_URL}/admin/queue`
      );
    } catch (error) {
      console.error("Failed to fetch conversation queue:", error);
      return [];
    }
  }

  async assignConversation(
    conversationId: string,
    agentId: string
  ): Promise<{ success: boolean; message: string }> {
    return await this.fetchWithRetry<{ success: boolean; message: string }>(
      `${API_BASE_URL}/admin/assign-conversation`,
      {
        method: "POST",
        body: JSON.stringify({ conversationId, agentId }),
      }
    );
  }

  // Admin Profile
  async getAdminProfile(): Promise<AdminProfile> {
    try {
      return await this.fetchWithRetry<AdminProfile>(
        `${API_BASE_URL}/admin/profile`
      );
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      return {
        id: "",
        name: "Admin",
        email: "admin@email.com",
        role: "ADMIN",
      };
    }
  }

  async updateAdminProfile(
    updateData: UpdateAdminProfileDto
  ): Promise<{ success: boolean; message: string; admin: AdminProfile }> {
    return await this.fetchWithRetry<{
      success: boolean;
      message: string;
      admin: AdminProfile;
    }>(`${API_BASE_URL}/admin/profile`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  // Analytics
  async getAnalytics(days: number = 7): Promise<any> {
    try {
      return await this.fetchWithRetry<any>(
        `${API_BASE_URL}/admin/analytics?days=${days}`
      );
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      return null;
    }
  }
}

// Export singleton instance
export const adminApi = new AdminApiService();
export default adminApi;
