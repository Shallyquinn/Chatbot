import { ChatbotUserData } from "@/types/ChatbotUserData";
import { ConversationPayload } from "@/types/ConversationPayload";
import { FpmInteraction } from "@/types/FpmInteractionData";
import { ResponsePayload } from "@/types/ResponseData";


export class ApiService {
    private baseUrl: string;
    private sessionId: string;
    private userId?: string;
    private initialized: boolean = false;
    private chatSessionId?: string;
    private chatSessionInitialized: boolean = false;
    private initializationPromise?: Promise<void>;
    private chatSessionPromise?: Promise<void>;

    constructor(baseUrl: string = 'http://localhost:3000') {
        this.baseUrl = baseUrl;


    // const existingSession = localStorage.getItem('chatbot_session_id');
    // if(existingSession) {
    //     this.sessionId = existingSession;
    // } else {
    //     this.sessionId = this.generateSessionId();
    //     localStorage.setItem('chatbot_session_id', this.sessionId)
        
    // }
    // }
    this.sessionId = this.generateSessionId();
}
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    // const existingUser = await this.getUserBySession();
    this.initializationPromise = (async () => {
       try { 
        const user = await this.createOrUpdateUser({});
        this.userId = user.user.id;
        this.initialized = true;
    } catch (error) {
        console.error("Failed to initialize user:", error);
    }
    })();

    return this.initializationPromise;
   
  }

  private async ensureChatSession(): Promise<string> {
    if(this.chatSessionInitialized && this.chatSessionId) return this.chatSessionId;
    if (this.chatSessionPromise) {
      await this.chatSessionPromise;
      return this.chatSessionId!;
    }

    this.chatSessionPromise = (async ()=> {
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

   async updateUser(userData: Partial<ChatbotUserData>) {
    await this.initializeUser();
    return this.request(`${this.baseUrl}/user/session/${this.sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  }


  async initializeChatSession() {
    await this.initializeUser()
    try {
      const chatSession = await this.request(`${this.baseUrl}/chat-sessions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user_session_id: this.sessionId,
          user_id: this.userId,
          user_agent: navigator.userAgent,
          device_type:"desktop",
          session_end_time:null,
        }),
      });

      if (chatSession && chatSession.session_id) {
        this.chatSessionId = chatSession.session_id;
      } else {
        throw new Error('Invalid chat session response');
      }
    } catch (error) {
      console.error("Failed to create chat session:", error);
      throw error;
    }
  }

   async createConversation(payload: Partial<ConversationPayload>) {
    await this.initializeUser();

    return this.request(`${this.baseUrl}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionid: this.sessionId,
        ...payload
      }),
    });
  }
  

  async updateConversation(id: string, payload: Partial<ConversationPayload>) {
    return this.request(`${this.baseUrl}/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  
  async createResponse(payload:Partial<ResponsePayload>) { 
    await this.initializeUser       
  return this.request(`${this.baseUrl}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     session_id: this.chatSessionId,
        ...payload
    }),
  });
}

async createFpmInteraction(payload:Partial<FpmInteraction>){
  await this.initializeUser
  return this.request(`${this.baseUrl}/fpm-interactions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      session_id: this.chatSessionId,
      ...payload
    })
  })
}


  // async updateResponse(id: string, payload: Partial<ResponsePayload>) {
  //   return this.request(`${this.baseUrl}/responses/${id}`, {
  //     method:'PATCH',
  //     headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         sessionId:this.chatSessionId,
  //         conversation_id
  //         ...payload
  //       })
  //     });
  // }

  
}

export const apiService = new ApiService("http://localhost:3000");