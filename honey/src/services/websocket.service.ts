// src/services/websocket.service.ts
import { io, Socket } from "socket.io-client";

type WebSocketCallback = (data: unknown) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, WebSocketCallback[]> = new Map();
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Don't auto-connect on construction, wait for explicit registration
  }

  private connect(): void {
    const token = localStorage.getItem("token");
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

    console.log("🔌 Connecting to WebSocket server:", backendUrl);

    this.socket = io(backendUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      this.isConnected = false;
      if (reason === "io server disconnect") {
        // Server initiated disconnect, try to reconnect
        this.reconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔥 WebSocket connection error:", error);
      this.isConnected = false;
    });

    this.socket.on("auth_error", (data) => {
      console.error("🔒 Authentication error:", data);
      this.disconnect();
    });

    // Agent-specific events
    this.socket.on("agent_notification", (data) => {
      console.log("📬 Agent notification received:", data);
      this.triggerListeners("agent_notification", data);

      // Map notification types to specific events
      if (data.type === "NEW_ASSIGNMENT") {
        this.triggerListeners("NEW_ASSIGNMENT", data);
      } else if (data.type === "BULK_ASSIGNMENT") {
        this.triggerListeners("BULK_ASSIGNMENT", data);
      }
    });

    // Message events
    this.socket.on("new_message", (data) => {
      console.log("💬 New message received:", data);
      this.triggerListeners("NEW_MESSAGE", data);
      this.triggerListeners("new_message", data);
    });

    // Conversation updates
    this.socket.on("conversation_update", (data) => {
      console.log("🔄 Conversation update:", data);
      this.triggerListeners("CONVERSATION_UPDATE", data);
      this.triggerListeners("conversation_update", data);
    });

    // Typing indicators
    this.socket.on("user_typing", (data) => {
      this.triggerListeners("user_typing", data);
    });

    // Admin notifications
    this.socket.on("admin_notification", (data) => {
      console.log("📬 Admin notification received:", data);
      this.triggerListeners("admin_notification", data);

      if (data.type === "QUEUE_ALERT") {
        this.triggerListeners("QUEUE_ALERT", data);
      }
    });

    // Queue updates
    this.socket.on("queue_updated", (data) => {
      console.log("📊 Queue updated:", data);
      this.triggerListeners("queue_updated", data);
    });

    // Agent status updates
    this.socket.on("agent_status_updated", (data) => {
      console.log("👤 Agent status updated:", data);
      this.triggerListeners("agent_status_updated", data);
    });
  }

  private triggerListeners(event: string, data: unknown): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    console.log("🔌 WebSocket disconnected");
  }

  reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  // =============================================================================
  // USER REGISTRATION
  // =============================================================================

  registerAsUser(userId: string, userData: Record<string, unknown>): void {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }

    // Wait for connection before registering
    setTimeout(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit("register_user", { userId, ...userData });
        console.log("✅ Registered as user:", userId);
      }
    }, 100);
  }

  registerAsAgent(agentId: string, agentData: Record<string, unknown>): void {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }

    const token = localStorage.getItem("token");

    // Wait for connection before registering
    setTimeout(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit("register_agent", { agentId, token, ...agentData });
        console.log("✅ Registered as agent:", agentId);
      }
    }, 100);
  }

  registerAsAdmin(adminId: string, adminData: Record<string, unknown>): void {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }

    const token = localStorage.getItem("token");

    // Wait for connection before registering
    setTimeout(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit("register_admin", { adminId, token, ...adminData });
        console.log("✅ Registered as admin:", adminId);
      }
    }, 100);
  }

  // =============================================================================
  // MESSAGING
  // =============================================================================

  sendMessage(
    conversationId: string,
    message: string,
    recipientId: string,
    senderType: "user" | "agent"
  ): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("send_message", {
        conversationId,
        message,
        recipientId,
        senderType,
      });
      console.log(`📤 Sent message to conversation ${conversationId}`);
    } else {
      console.error("❌ Cannot send message: Socket not connected");
    }
  }

  joinConversation(conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("join_conversation", { conversationId });
      console.log(`✅ Joined conversation: ${conversationId}`);
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave_conversation", { conversationId });
      console.log(`👋 Left conversation: ${conversationId}`);
    }
  }

  // =============================================================================
  // TYPING INDICATORS
  // =============================================================================

  startTyping(conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing_start", { conversationId });
    }
  }

  stopTyping(conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing_stop", { conversationId });
    }
  }

  // =============================================================================
  // STATUS UPDATES
  // =============================================================================

  updateAgentStatus(status: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("agent_status_change", { status });
      console.log(`✅ Agent status updated to: ${status}`);
    }
  }

  // =============================================================================
  // EVENT LISTENERS
  // =============================================================================

  addEventListener(event: string, callback: WebSocketCallback): void {
    this.on(event, callback);
  }

  on(event: string, callback: WebSocketCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  emit(event: string, data: unknown): void {
    // Mock implementation
    console.log("Emitting event:", event, data);
  }

  off(event: string, callback?: WebSocketCallback): void {
    if (callback) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.listeners.delete(event);
    }
  }

  // =============================================================================
  // NOTIFICATION METHODS
  // =============================================================================

  // Notification methods for different user types
  notifyUser(userId: string, message: Record<string, unknown>): void {
    this.emit("USER_NOTIFICATION", { userId, message });
  }

  notifyAgent(agentId: string, message: Record<string, unknown>): void {
    this.emit("AGENT_NOTIFICATION", { agentId, message });
  }

  notifyAdmin(adminId: string, message: Record<string, unknown>): void {
    this.emit("ADMIN_NOTIFICATION", { adminId, message });
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: unknown): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("BROADCAST", { event, data });
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new WebSocketService();
export type { WebSocketCallback };
