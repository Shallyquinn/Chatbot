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

    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    if (/iPad|Android(?!.*Mobile)/.test(ua)) return 'tablet';
    if (/Macintosh|Windows|Linux/i.test(ua)) return 'desktop';

    return 'unknown';
  }

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;

    const existingSession = localStorage.getItem('chatbot_session_id');
    if (existingSession) {
      this.sessionId = existingSession;
    } else {
      this.sessionId = this.generateSessionId();
      localStorage.setItem('chatbot_session_id', this.sessionId);
    }

    this.userId = localStorage.getItem('chat_user_id') ?? undefined;
    this.chatSessionId = localStorage.getItem('chat_session_id') ?? undefined;
  }
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getUserBySession(): Promise<ChatbotUserData | null> {
    try {
      return await this.request(
        `${this.baseUrl}/user/session/${this.sessionId}`,
        {
          method: 'GET',
        },
      );
    } catch (error) {
      console.error('Error fetching user by session:', error);
      return null;
    }
  }

  async askAI(question: string): Promise<string> {
    try {
      const response = await fetch(
        'https://firsthand-composed-piracy-honeyandbananac.replit.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: question }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.response ||
        "I apologize, but I'm having trouble connecting to my AI service at the moment."
      );
    } catch (error) {
      console.error('Error fetching AI response:', error);
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
      console.error('API error:', error);
      throw error;
    }
  }

  private async initializeUser(): Promise<void> {
    if (this.initialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    // const existingUser = await this.getUserBySession();
    this.initializationPromise = (async () => {
      try {
        const user = await this.createOrUpdateUser({});
        this.userId = user.user.id;
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize user:', error);
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
        console.error('Failed to initialize chat session:', error);
        throw error;
      }
    })();
    await this.chatSessionPromise;
    return this.chatSessionId!;
  }

  async createOrUpdateUser(userData: Partial<ChatbotUserData>) {
    return await this.request(`${this.baseUrl}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_session_id: this.sessionId,
        ...userData,
      }),
    });
  }

  async updateUser(userData: Partial<ChatbotUserData>): Promise<void> {
    await this.initializeUser();
    await this.request(`${this.baseUrl}/user/session/${this.sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }

  async initializeChatSession() {
    await this.initializeUser();
    try {
      const chatSession = await this.request(`${this.baseUrl}/chat-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_session_id: this.sessionId,
          user_id: this.userId,
          user_agent: navigator.userAgent,
          device_type: this.getDeviceType(),
          session_end_time: null,
        }),
      });

      if (chatSession && chatSession.session_id) {
        this.chatSessionId = chatSession.session_id;
        if (this.chatSessionId) {
          localStorage.setItem('chat_session_id', this.chatSessionId);
        }
      } else {
        throw new Error('Invalid chat session response');
      }
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw error;
    }
  }

  async getUser(userSessionId: string): Promise<ChatbotUserData | null> {
    try {
      return await this.request(`${this.baseUrl}/user/${userSessionId}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async createConversation(payload: Partial<ConversationPayload>) {
    await this.initializeUser();

    return this.request(`${this.baseUrl}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.sessionId,
        ...payload,
      }),
    });
  }

  async updateConversation(id: string, payload: Partial<ConversationPayload>) {
    return this.request(`${this.baseUrl}/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async createResponse(payload: Partial<ResponsePayload>) {
    await this.initializeUser();
    return this.request(`${this.baseUrl}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.chatSessionId,
        ...payload,
      }),
    });
  }

  async createFpmInteraction(payload: Partial<FpmInteraction>) {
    await this.initializeUser();
    return this.request(`${this.baseUrl}/fpm-interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.chatSessionId,
        ...payload,
      }),
    });
  }

  async endChatSession(): Promise<void> {
    if (!this.chatSessionId) return;

    await this.request(`${this.baseUrl}/chat-sessions/${this.chatSessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_end_time: new Date().toISOString(),
      }),
    });
  }

  async updateResponse(id: string, payload: Partial<ResponsePayload>) {
    await this.ensureChatSession();
    return this.request(`${this.baseUrl}/responses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
          method: 'GET',
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching clinics:', error);
      return [];
    }
  }

  async getClinicsByLGA(state: string, lga: string): Promise<ClinicLocation[]> {
    try {
      const response = await this.request(`${this.baseUrl}/clinics/lga`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, lga }),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching clinics by LGA:', error);
      return [];
    }
  }

  async getFpmInteractions(): Promise<FpmInteraction[]> {
    await this.ensureChatSession();
    try {
      const response = await this.request(
        `${this.baseUrl}/fpm-interactions/session/${this.chatSessionId}`,
        { method: 'GET' },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching FPM interactions:', error);
      return [];
    }
  }

  async updateFpmInteraction(id: string, payload: Partial<FpmInteraction>) {
    return this.request(`${this.baseUrl}/fpm-interactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async getConversations(): Promise<ConversationPayload[]> {
    await this.ensureChatSession();
    try {
      const response = await this.request(
        `${this.baseUrl}/conversations/session/${this.sessionId}`,
        { method: 'GET' },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async createReferral(
    referralData: Partial<ReferralData>,
  ): Promise<ReferralData> {
    return this.request(`${this.baseUrl}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...referralData,
        user_session_id: this.sessionId,
        chat_session_id: this.chatSessionId,
      }),
    });
  }

  async getReferrals(): Promise<ReferralData[]> {
    try {
      const response = await this.request(`${this.baseUrl}/referrals`, {
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }
  }

  async getResponsesByCategory(category: string): Promise<ResponsePayload[]> {
    try {
      const response = await this.request(
        `${this.baseUrl}/responses/session/${this.sessionId}/category/${category}`,
        { method: 'GET' },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching responses by category:', error);
      return [];
    }
  }

  async getResponsesByStep(step: string): Promise<ResponsePayload[]> {
    try {
      const response = await this.request(
        `${this.baseUrl}/responses/session/${this.sessionId}/step/${step}`,
        { method: 'GET' },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching responses by step:', error);
      return [];
    }
  }

  async getLatestResponse(): Promise<ResponsePayload | null> {
    try {
      const response = await this.request(
        `${this.baseUrl}/responses/session/${this.sessionId}/latest`,
        { method: 'GET' },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching latest response:', error);
      return null;
    }
  }

  // ============================================================================
  // SESSION STATE MANAGEMENT METHODS
  // ============================================================================

  async saveUserSession(sessionData: SessionSaveRequest): Promise<void> {
    try {
      await this.request(`${this.baseUrl}/chat-state-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      console.error('Failed to save session state:', error);
      throw error;
    }
  }

  async getUserSession(
    userSessionId?: string,
  ): Promise<SessionLoadResponse | null> {
    try {
      const sessionIdToUse = userSessionId || this.sessionId;
      const response = await this.request(
        `${this.baseUrl}/chat-state-sessions/${sessionIdToUse}`,
        { method: 'GET' },
      );
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        // No existing session found - this is normal for new users
        return null;
      }
      console.error('Error loading session state:', error);
      return null;
    }
  }
}

export const apiService = new ApiService('http://localhost:3000');
