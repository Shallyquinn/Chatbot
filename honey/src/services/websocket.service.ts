// src/services/websocket.service.ts

type WebSocketCallback = (data: unknown) => void;

class WebSocketService {
  private socket: unknown = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, WebSocketCallback[]> = new Map();

  constructor() {
    // Initialize socket connection if socket.io is available
    this.connect();
  }

  private connect(): void {
    // Mock WebSocket implementation for now
    // When socket.io is installed, replace with actual implementation
    this.socket = null; // Placeholder for real socket connection
    console.log("WebSocket service initialized (mock mode)");
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  disconnect(): void {
    // Mock implementation
    console.log("WebSocket disconnected");
  }

  reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    }
  }

  // =============================================================================
  // USER REGISTRATION
  // =============================================================================

  registerAsUser(userId: string, userData: Record<string, unknown>): void {
    // Mock implementation
    console.log("Registered as user:", userId, userData);
  }

  registerAsAgent(agentId: string, agentData: Record<string, unknown>): void {
    // Mock implementation
    console.log("Registered as agent:", agentId, agentData);
  }

  registerAsAdmin(adminId: string, adminData: Record<string, unknown>): void {
    // Mock implementation
    console.log("Registered as admin:", adminId, adminData);
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
    console.log(
      `Sending message to conversation ${conversationId}: ${message} (to: ${recipientId}, from: ${senderType})`
    );
  }

  joinConversation(conversationId: string): void {
    console.log(`Joining conversation: ${conversationId}`);
  }

  leaveConversation(conversationId: string): void {
    console.log(`Leaving conversation: ${conversationId}`);
  }

  // =============================================================================
  // TYPING INDICATORS
  // =============================================================================

  startTyping(conversationId: string): void {
    console.log(`Started typing in conversation: ${conversationId}`);
  }

  stopTyping(conversationId: string): void {
    console.log(`Stopped typing in conversation: ${conversationId}`);
  }

  // =============================================================================
  // STATUS UPDATES
  // =============================================================================

  updateAgentStatus(status: string): void {
    console.log(`Agent status updated to: ${status}`);
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
    this.emit("BROADCAST", { event, data });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  isConnected(): boolean {
    // Mock implementation - always return true in mock mode
    return true;
  }

  getConnectionStatus(): string {
    return this.isConnected() ? "connected" : "disconnected";
  }
}

export default new WebSocketService();
export type { WebSocketCallback };
