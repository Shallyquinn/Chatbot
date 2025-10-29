// src/services/storageAdapter.ts
// Storage abstraction layer for multi-platform deployment (Web, WhatsApp, Messenger)

import { ChatbotState } from "@/chatbot/types";

/**
 * Storage adapter interface for platform-agnostic state persistence
 * Implementations: LocalStorageAdapter (web), ServerOnlyAdapter (WhatsApp/Messenger)
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * LocalStorage adapter for web browsers
 * Uses browser's localStorage API with async wrapper for consistency
 */
export class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.error("LocalStorageAdapter: Failed to get item:", error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("LocalStorageAdapter: Failed to set item:", error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }
      localStorage.removeItem(key);
    } catch (error) {
      console.error("LocalStorageAdapter: Failed to remove item:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }
      localStorage.clear();
    } catch (error) {
      console.error("LocalStorageAdapter: Failed to clear:", error);
    }
  }
}

/**
 * Server-only adapter for WhatsApp/Messenger
 * Uses backend API with Redis caching for performance
 */
export class ServerOnlyAdapter implements StorageAdapter {
  private baseUrl: string;
  private sessionId: string;

  constructor(baseUrl: string, sessionId: string) {
    this.baseUrl = baseUrl;
    this.sessionId = sessionId;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      // Call backend API that checks Redis first, then PostgreSQL
      const response = await fetch(
        `${this.baseUrl}/chat-sessions/storage/${this.sessionId}/${key}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.value || null;
    } catch (error) {
      console.error("ServerOnlyAdapter: Failed to get item:", error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Call backend API that saves to both Redis (cache) and PostgreSQL (persistent)
      const response = await fetch(
        `${this.baseUrl}/chat-sessions/storage/${this.sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key,
            value,
            ttl: 900, // 15 minutes cache in Redis
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("ServerOnlyAdapter: Failed to set item:", error);
      throw error; // Re-throw for critical operations
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/chat-sessions/storage/${this.sessionId}/${key}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("ServerOnlyAdapter: Failed to remove item:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/chat-sessions/storage/${this.sessionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("ServerOnlyAdapter: Failed to clear:", error);
    }
  }
}

/**
 * Factory function to create appropriate storage adapter based on platform
 * Uses environment variable VITE_PLATFORM to determine adapter type
 */
export function createStorageAdapter(
  baseUrl: string,
  sessionId: string
): StorageAdapter {
  const platform = import.meta.env.VITE_PLATFORM || "web";

  switch (platform.toLowerCase()) {
    case "whatsapp":
    case "messenger":
    case "server-only":
      console.log(`Using ServerOnlyAdapter for platform: ${platform}`);
      return new ServerOnlyAdapter(baseUrl, sessionId);

    case "web":
    case "browser":
    default:
      console.log("Using LocalStorageAdapter for web platform");
      return new LocalStorageAdapter();
  }
}

/**
 * Helper function to save chatbot state using storage adapter
 */
export async function saveChatbotState(
  adapter: StorageAdapter,
  state: ChatbotState
): Promise<void> {
  try {
    await adapter.setItem("chat_state", JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save chatbot state:", error);
    throw error;
  }
}

/**
 * Helper function to load chatbot state using storage adapter
 */
export async function loadChatbotState(
  adapter: StorageAdapter
): Promise<ChatbotState | null> {
  try {
    const stateJson = await adapter.getItem("chat_state");
    if (!stateJson) {
      return null;
    }
    return JSON.parse(stateJson) as ChatbotState;
  } catch (error) {
    console.error("Failed to load chatbot state:", error);
    return null;
  }
}
