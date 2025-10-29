/**
 * Admin Dashboard Type Definitions
 */

export interface DashboardMetrics {
  overview: {
    totalConversations: number;
    activeConversations: number;
    queuedConversations: number;
    totalAgents: number;
    onlineAgents: number;
    avgResponseTime: string;
  };
  satisfaction?: {
    satisfied: number;
    dissatisfied: number;
    neutral: number;
  };
  chartData?: {
    newUsers: Array<{ month: string; users: number }>;
    recurringUsers: Array<{ day: string; users: number }>;
    dailyEngagement: Array<{ hour: string; engagement: number }>;
  };
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  status: "ONLINE" | "BUSY" | "OFFLINE";
  maxChats: number;
  currentChats?: number;
  isOnline?: boolean;
  lastActiveAt?: string;
  createdAt?: string;
  _count?: {
    assignedConversations: number;
  };
}

export interface QueueItem {
  id: string;
  conversationId: string;
  user?: {
    name?: string;
    user_session_id?: string;
  };
  escalatedAt?: string;
  position: number;
  waitTime: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status?: "WAITING" | "ASSIGNED" | "COMPLETED";
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateAdminProfileDto {
  name?: string;
  email?: string;
  profileImage?: string | null;
  currentPassword?: string;
  newPassword?: string;
}

export interface ChartData {
  newUsers: Array<{ month: string; users: number }>;
  recurringUsers: Array<{ day: string; users: number }>;
  performance: Array<{ name: string; value: number; color: string }>;
  engagement: Array<{ hour: string; engagement: number }>;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: any;
}

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  message: string;
  type: NotificationType;
  duration?: number;
}
