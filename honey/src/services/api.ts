import { ChatbotUserData } from '@/types/ChatbotUserData';
import { ConversationPayload } from '@/types/ConversationPayload';
import { FpmInteraction } from '@/types/FpmInteractionData';
import { ResponsePayload } from '@/types/ResponseData';
import { ClinicLocation } from '@/types/ClinicLocation';
import { ReferralData } from '@/types/ReferralData';
import {
  SessionSaveRequest,
  SessionLoadResponse,
} from '@/types/ChatStateSession';
import { v4 as uuidv4 } from "uuid";

export class ApiService {
  private baseUrl: string;
  private sessionId: string;
  private userId?: string;
  private initialized: boolean = false;
  private chatSessionId?: string;
  private chatSessionInitialized: boolean = false;
  private initializationPromise?: Promise<void>;
  private chatSessionPromise?: Promise<void>;

  private getDeviceType(): string {
    const ua = navigator.userAgent;

    if (/mobile/i.test(ua)) return "mobile";
    if (/tablet/i.test(ua)) return "tablet";
    if (/iPad|Android(?!.*Mobile)/.test(ua)) return "tablet";
    if (/Macintosh|Windows|Linux/i.test(ua)) return "desktop";

    return "unknown";
  }

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;

    const existingSession = localStorage.getItem("chatbot_session_id");
    if (existingSession) {
      this.sessionId = existingSession;
    } else {
      this.sessionId = this.generateSessionId();
      localStorage.setItem("chatbot_session_id", this.sessionId);
    }

    this.userId = localStorage.getItem("chat_user_id") ?? undefined;
    this.chatSessionId = localStorage.getItem("chat_session_id") ?? undefined;
  }

  private generateSessionId(): string {
    // Always generate valid UUID for session ID
    return uuidv4();
  }

  async getUserBySession(): Promise<ChatbotUserData | null> {
    try {
      return await this.request(
        `${this.baseUrl}/user/session/${this.sessionId}`,
        {
          method: "GET",
        }
      );
    } catch (error) {
      console.error("Error fetching user by session:", error);
      return null;
    }
  }

  async askAI(question: string): Promise<string> {
    try {
      const aiServiceUrl =
        import.meta.env.VITE_AI_SERVICE_URL ||
        "https://firsthand-composed-piracy-honeyandbananac.replit.app/answer/";

      const response = await fetch(aiServiceUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memory: {
            user: question,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.response ||
        "I apologize, but I'm having trouble connecting to my AI service at the moment."
      );
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "I apologize, but I'm having trouble connecting to my AI service at the moment. Please try again later.";
    }
  }

  private async request(url: string, options: RequestInit) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error ${res.status}: ${errorText}`);
      }
      return await res.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }

  private async initializeUser(): Promise<void> {
    if (this.initialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = (async () => {
      try {
        // Check localStorage first for existing user_id
        const existingUserId = localStorage.getItem("chat_user_id");
        const existingUserSessionId = localStorage.getItem("user_session_id");

        if (existingUserId && existingUserSessionId) {
          try {
            // Validate that the user still exists in the backend
            const user = await this.getUser(existingUserSessionId);
            if (user && user.id === existingUserId) {
              console.log(
                "✅ Validated existing user_id from localStorage:",
                existingUserId
              );
              this.userId = existingUserId;
              this.initialized = true;
              return;
            } else {
              console.warn(
                "⚠️ User in localStorage doesn't match backend, re-creating user"
              );
              // Clear stale data and fall through to create new user
              localStorage.removeItem("chat_user_id");
              localStorage.removeItem("user_session_id");
              localStorage.removeItem("chat_session_id");
            }
          } catch (error) {
            console.warn(
              "⚠️ Could not validate user from localStorage, creating new user:",
              error
            );
            // Clear stale data and fall through to create new user
            localStorage.removeItem("chat_user_id");
            localStorage.removeItem("user_session_id");
            localStorage.removeItem("chat_session_id");
          }
        }

        // Try to register with backend - backend generates the UUID
        try {
          const response = await this.createOrUpdateUser({});

          // Backend returns { success: true, data: { id, sessionId } } or { id, sessionId }
          const userData = response?.data || response;

          if (userData && userData.id && userData.sessionId) {
            this.userId = userData.id;
            localStorage.setItem("chat_user_id", userData.id);
            // Also store the user_session_id for API calls
            localStorage.setItem("user_session_id", userData.sessionId);
            console.log(
              "✅ User registered with backend:",
              this.userId,
              "Session:",
              userData.sessionId
            );
            this.initialized = true;
          } else {
            // Backend responded but didn't return ID - this shouldn't happen
            console.error("❌ Backend didn't return user data:", response);
            throw new Error(
              "Backend registration failed - no user data returned"
            );
          }
        } catch (apiError: unknown) {
          console.error(
            "❌ Cannot create user - backend unavailable:",
            apiError
          );
          throw new Error("Backend unavailable - cannot create user");
        }

        this.initialized = true;
      } catch (error) {
        console.error("Failed to initialize user:", error);
        this.initialized = false;
        throw error;
        this.initialized = true;
      }
    })();

    return this.initializationPromise;
  }

  private async ensureChatSession(): Promise<string> {
    if (this.chatSessionInitialized && this.chatSessionId)
      return this.chatSessionId;
    if (this.chatSessionPromise) {
      await this.chatSessionPromise;
      return this.chatSessionId!;
    }

    this.chatSessionPromise = (async () => {
      try {
        await this.initializeUser();
        await this.initializeChatSession();
        this.chatSessionInitialized = true;
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
        throw error;
      }
    })();
    await this.chatSessionPromise;
    return this.chatSessionId!;
  }

  async createOrUpdateUser(userData: Partial<ChatbotUserData> = {}) {
    // Create a clean body object, filtering out undefined values
    const body: Partial<ChatbotUserData> & { user_session_id?: string } = {
      ...userData,
    };

    // Remove undefined and null values to avoid validation errors
    Object.keys(body).forEach((key) => {
      if (
        body[key as keyof typeof body] === undefined ||
        body[key as keyof typeof body] === null
      ) {
        delete body[key as keyof typeof body];
      }
    });

    // Don't send user_session_id for new user creation
    // Backend will generate it
    if (!this.userId) {
      delete body.user_session_id;
    }

    return await this.request(`${this.baseUrl}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  async updateUser(userData: Partial<ChatbotUserData>): Promise<void> {
    await this.initializeUser();
    await this.request(`${this.baseUrl}/user/session/${this.sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  }

  async initializeChatSession() {
    await this.initializeUser();

    // Check localStorage first for existing chat_session_id
    const existingSessionId = localStorage.getItem("chat_session_id");

    if (existingSessionId) {
      try {
        // Validate that the session still exists in the backend
        const session = await this.request(
          `${this.baseUrl}/chat-sessions/${existingSessionId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (session && session.session_id === existingSessionId) {
          console.log(
            "✅ Validated existing chat_session_id from localStorage:",
            existingSessionId
          );
          this.chatSessionId = existingSessionId;
          return;
        } else {
          console.warn(
            "⚠️ Chat session in localStorage doesn't match backend, creating new session"
          );
          localStorage.removeItem("chat_session_id");
        }
      } catch (error) {
        console.warn(
          "⚠️ Could not validate chat session from localStorage, creating new session:",
          error
        );
        localStorage.removeItem("chat_session_id");
      }
    }

    // Generate session ID upfront
    const newSessionId = uuidv4();

    try {
      // Get the user_session_id from localStorage (set during user registration)
      const userSessionId = localStorage.getItem("user_session_id");

      // Build the payload conditionally - only include user_session_id if it exists
      const payload: Record<string, unknown> = {
        session_id: newSessionId, // Send our generated ID
        user_id: this.userId,
        user_agent: navigator.userAgent,
        device_type: this.getDeviceType(),
        session_end_time: null,
      };

      // Only add user_session_id if it's a valid string
      if (userSessionId && typeof userSessionId === "string") {
        payload.user_session_id = userSessionId;
      }

      const chatSession = await this.request(`${this.baseUrl}/chat-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Validate response
      const actualData = chatSession.data || chatSession;
      const returnedSessionId =
        actualData.session_id ||
        actualData.id ||
        actualData.sessionId ||
        chatSession.session_id ||
        chatSession.id;

      if (returnedSessionId) {
        this.chatSessionId = returnedSessionId;
        localStorage.setItem("chat_session_id", returnedSessionId);
        console.log(
          "✅ Chat session registered with backend:",
          this.chatSessionId
        );
      } else {
        // Backend responded but didn't return ID - this shouldn't happen
        console.error("❌ Backend didn't return session_id:", chatSession);
        throw new Error(
          "Backend session creation failed - no session_id returned"
        );
      }
    } catch (error: unknown) {
      console.error("❌ Failed to create chat session:", error);
      throw error;
    }
  }

  async getUser(userSessionId: string): Promise<ChatbotUserData | null> {
    try {
      return await this.request(`${this.baseUrl}/user/${userSessionId}`, {
        method: "GET",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  async createConversation(payload: Partial<ConversationPayload>) {
    await this.initializeUser();
    await this.ensureChatSession(); // Ensure we have a chat_session_id

    try {
      return await this.request(`${this.baseUrl}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.chatSessionId, // Use chat_session_id, not user session_id
          user_id: this.userId, // Add user_id for backend validation
          ...payload,
        }),
      });
    } catch (error) {
      // If foreign key constraint error (session doesn't exist), reset and retry once
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Invalid session_id or user_id")) {
        console.warn(
          "⚠️ Session or user invalid, resetting and creating new..."
        );
        // Clear ALL stale data
        localStorage.removeItem("chat_session_id");
        localStorage.removeItem("chat_user_id");
        localStorage.removeItem("user_session_id");

        this.chatSessionId = undefined;
        this.chatSessionInitialized = false;
        this.chatSessionPromise = undefined;
        this.userId = undefined;
        this.initialized = false;
        this.initializationPromise = undefined;

        // Recreate user and session, then retry
        await this.initializeUser();
        await this.ensureChatSession();
        return this.request(`${this.baseUrl}/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: this.chatSessionId,
            user_id: this.userId,
            ...payload,
          }),
        });
      }
      throw error;
    }
  }

  async updateConversation(id: string, payload: Partial<ConversationPayload>) {
    return this.request(`${this.baseUrl}/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async createResponse(payload: Partial<ResponsePayload>) {
    await this.initializeUser();
    await this.ensureChatSession(); // Ensure we have a chat_session_id

    try {
      return await this.request(`${this.baseUrl}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.chatSessionId,
          user_id: this.userId, // Add user_id for backend validation
          ...payload,
        }),
      });
    } catch (error) {
      // If session invalid, recreate and retry
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("Invalid session_id") ||
        errorMessage.includes("Invalid user_id") ||
        errorMessage.includes("Internal server error")
      ) {
        console.warn(
          "⚠️ Session or user invalid in createResponse, resetting..."
        );
        // Clear ALL stale data
        localStorage.removeItem("chat_session_id");
        localStorage.removeItem("chat_user_id");
        localStorage.removeItem("user_session_id");

        this.chatSessionId = undefined;
        this.chatSessionInitialized = false;
        this.chatSessionPromise = undefined;
        this.userId = undefined;
        this.initialized = false;
        this.initializationPromise = undefined;

        // Recreate user and session, then retry
        await this.initializeUser();
        await this.ensureChatSession();
        return this.request(`${this.baseUrl}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: this.chatSessionId,
            user_id: this.userId,
            ...payload,
          }),
        });
      }
      throw error;
    }
  }

  async createFpmInteraction(payload: Partial<FpmInteraction>) {
    await this.initializeUser();
    await this.ensureChatSession(); // Ensure we have a chat_session_id

    try {
      return await this.request(`${this.baseUrl}/fpm-interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.chatSessionId,
          user_id: this.userId, // Add user_id for backend validation
          ...payload,
        }),
      });
    } catch (error) {
      // If session invalid, recreate and retry
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("Invalid session_id") ||
        errorMessage.includes("Invalid user_id") ||
        errorMessage.includes("Internal server error")
      ) {
        console.warn(
          "⚠️ Session or user invalid in createFpmInteraction, resetting..."
        );
        // Clear ALL stale data
        localStorage.removeItem("chat_session_id");
        localStorage.removeItem("chat_user_id");
        localStorage.removeItem("user_session_id");

        this.chatSessionId = undefined;
        this.chatSessionInitialized = false;
        this.chatSessionPromise = undefined;
        this.userId = undefined;
        this.initialized = false;
        this.initializationPromise = undefined;

        // Recreate user and session, then retry
        await this.initializeUser();
        await this.ensureChatSession();
        return this.request(`${this.baseUrl}/fpm-interactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: this.chatSessionId,
            user_id: this.userId,
            ...payload,
          }),
        });
      }
      throw error;
    }
  }

  async endChatSession(): Promise<void> {
    if (!this.chatSessionId) return;

    await this.request(`${this.baseUrl}/chat-sessions/${this.chatSessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_end_time: new Date().toISOString(),
      }),
    });
  }

  async updateResponse(id: string, payload: Partial<ResponsePayload>) {
    await this.ensureChatSession();
    return this.request(`${this.baseUrl}/responses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: this.chatSessionId,
        ...payload,
      }),
    });
  }

  async getClinicsByState(state: string): Promise<ClinicLocation[]> {
    try {
      const response = await this.request(
        `${this.baseUrl}/clinics/state/${state}`,
        {
          method: "GET",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching clinics:", error);
      return [];
    }
  }

  async getClinicsByLGA(state: string, lga: string): Promise<ClinicLocation[]> {
    try {
      const response = await this.request(`${this.baseUrl}/clinics/lga`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, lga }),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching clinics by LGA:", error);
      return [];
    }
  }

  async getFpmInteractions(): Promise<FpmInteraction[]> {
    await this.ensureChatSession();
    try {
      const response = await this.request(
        `${this.baseUrl}/fpm-interactions/session/${this.chatSessionId}`,
        { method: "GET" }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching FPM interactions:", error);
      return [];
    }
  }

  async updateFpmInteraction(id: string, payload: Partial<FpmInteraction>) {
    return this.request(`${this.baseUrl}/fpm-interactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async getConversations(): Promise<ConversationPayload[]> {
    await this.ensureChatSession();
    try {
      const response = await this.request(
        `${this.baseUrl}/conversations/session/${this.sessionId}`,
        { method: "GET" }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  }

  async createReferral(
    referralData: Partial<ReferralData>
  ): Promise<ReferralData> {
    await this.initializeUser();
    await this.ensureChatSession();

    // Validate required fields
    if (!referralData.clinic_id) {
      throw new Error("clinic_id is required for creating a referral");
    }

    try {
      return await this.request(`${this.baseUrl}/referrals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: this.userId, // Required by backend DTO
          session_id: this.chatSessionId, // Required by backend DTO
          clinic_id: referralData.clinic_id, // Required by backend DTO
          ...referralData,
          user_session_id: this.sessionId, // Keep for backwards compatibility
          chat_session_id: this.chatSessionId, // Keep for backwards compatibility
        }),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("Invalid session_id") ||
        errorMessage.includes("Invalid user_id")
      ) {
        console.warn(
          "⚠️ Session or user invalid in createReferral, resetting..."
        );
        // Clear ALL stale data
        localStorage.removeItem("chat_session_id");
        localStorage.removeItem("chat_user_id");
        localStorage.removeItem("user_session_id");

        this.chatSessionId = undefined;
        this.chatSessionInitialized = false;
        this.chatSessionPromise = undefined;
        this.userId = undefined;
        this.initialized = false;
        this.initializationPromise = undefined;

        // Recreate user and session, then retry
        await this.initializeUser();
        await this.ensureChatSession();
        return this.request(`${this.baseUrl}/referrals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: this.userId,
            session_id: this.chatSessionId,
            clinic_id: referralData.clinic_id,
            ...referralData,
            user_session_id: this.sessionId,
            chat_session_id: this.chatSessionId,
          }),
        });
      }
      throw error;
    }
  }

  async getReferrals(): Promise<ReferralData[]> {
    try {
      const response = await this.request(`${this.baseUrl}/referrals`, {
        method: "GET",
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching referrals:", error);
      return [];
    }
  }

  async getResponsesByCategory(category: string): Promise<ResponsePayload[]> {
    try {
      const response = await this.request(
        `${this.baseUrl}/responses/session/${this.sessionId}/category/${category}`,
        { method: "GET" }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching responses by category:", error);
      return [];
    }
  }

  async getResponsesByStep(step: string): Promise<ResponsePayload[]> {
    try {
      const response = await this.request(
        `${this.baseUrl}/responses/session/${this.sessionId}/step/${step}`,
        { method: "GET" }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching responses by step:", error);
      return [];
    }
  }

  async getLatestResponse(): Promise<ResponsePayload | null> {
    try {
      const response = await this.request(
        `${this.baseUrl}/responses/session/${this.sessionId}/latest`,
        { method: "GET" }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching latest response:", error);
      return null;
    }
  }

  // ============================================================================
  // SESSION STATE MANAGEMENT METHODS
  // ============================================================================

  async saveUserSession(sessionData: SessionSaveRequest): Promise<void> {
    try {
      await this.request(`${this.baseUrl}/chat-state-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      console.error("Failed to save session state:", error);
      throw error;
    }
  }

  async getUserSession(
    userSessionId?: string
  ): Promise<SessionLoadResponse | null> {
    try {
      const sessionIdToUse = userSessionId || this.sessionId;
      const response = await this.request(
        `${this.baseUrl}/chat-state-sessions/${sessionIdToUse}`,
        { method: "GET" }
      );
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        // No existing session found - this is normal for new users
        return null;
      }
      console.error("Error loading session state:", error);
      return null;
    }
  }

  // ============================================================================
  // AGENT ESCALATION METHODS
  // ============================================================================

  async escalateToAgent(conversationId: string): Promise<{
    status: "ASSIGNED" | "QUEUED";
    agentId?: string;
    agentName?: string;
    position?: number;
    estimatedWaitTime?: string;
  } | null> {
    try {
      // Ensure we have a valid userId
      await this.initializeUser();

      if (!this.userId) {
        console.error("❌ Cannot escalate: userId is not available");
        throw new Error("User session is not initialized");
      }

      console.log("🚀 Escalating conversation:", {
        conversationId,
        userId: this.userId,
      });

      const response = await this.request(
        `${this.baseUrl}/conversations/escalate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            userId: this.userId,
          }),
        }
      );

      console.log("✅ Escalation successful:", response);
      return response;
    } catch (error) {
      console.error("Failed to escalate to agent:", error);
      return null;
    }
  }

  async getQueueStatus(conversationId: string): Promise<{
    status: string;
    position?: number;
    estimatedWaitTime?: string;
    queuedAt?: Date;
  } | null> {
    try {
      const response = await this.request(
        `${this.baseUrl}/conversations/queue-status/${conversationId}`,
        { method: "GET" }
      );
      return response;
    } catch (error) {
      console.error("Failed to get queue status:", error);
      return null;
    }
  }
}

export const apiService = new ApiService('http://localhost:3000');
