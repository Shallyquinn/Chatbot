// src/storage/storage.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get storage item with Redis cache-first approach
   * Checks Redis first, falls back to PostgreSQL if not cached
   */
  async getItem(sessionId: string, key: string): Promise<string | null> {
    // Try Redis cache first
    const cached = await this.redis.getStorageItem(sessionId, key);
    if (cached !== null) {
      console.log(`✅ Cache HIT for session:${sessionId}:${key}`);
      return cached;
    }

    console.log(
      `⚠️ Cache MISS for session:${sessionId}:${key}, checking database`,
    );

    // Fall back to database
    try {
      const record = await this.prisma.chatStateSession.findFirst({
        where: {
          user_session_id: sessionId,
        },
        select: {
          chat_state: true,
        },
      });

      if (!record || !record.chat_state) {
        return null;
      }

      // Parse chat_state and extract the requested key
      const chatState = JSON.parse(record.chat_state);
      const value = chatState[key] || null;

      // Cache for future requests (15 min TTL)
      if (value !== null) {
        await this.redis.setStorageItem(sessionId, key, value, 900);
      }

      return value;
    } catch (error) {
      console.error('Failed to get storage item from database:', error);
      return null;
    }
  }

  /**
   * Set storage item with dual write (Redis + PostgreSQL)
   * Writes to both cache and persistent storage
   */
  async setItem(
    sessionId: string,
    key: string,
    value: string,
    ttl: number = 900,
  ): Promise<void> {
    // Write to Redis cache first (fast)
    await this.redis.setStorageItem(sessionId, key, value, ttl);

    // Write to PostgreSQL (persistent)
    try {
      // Get existing chat_state or create empty object
      const existing = await this.prisma.chatStateSession.findFirst({
        where: {
          user_session_id: sessionId,
        },
      });

      let chatState: any = {};
      if (existing && existing.chat_state) {
        try {
          chatState = JSON.parse(existing.chat_state);
        } catch (e) {
          console.error('Failed to parse existing chat_state:', e);
        }
      }

      // Update the specific key
      chatState[key] = value;

      // Upsert to database
      await this.prisma.chatStateSession.upsert({
        where: {
          user_session_id: sessionId,
        },
        create: {
          user_session_id: sessionId,
          chat_state: JSON.stringify(chatState),
          last_activity: new Date(),
        },
        update: {
          chat_state: JSON.stringify(chatState),
          last_activity: new Date(),
        },
      });

      console.log(`✅ Saved storage item: session:${sessionId}:${key}`);
    } catch (error) {
      console.error('Failed to save storage item to database:', error);
      throw error;
    }
  }

  /**
   * Delete storage item from both Redis and PostgreSQL
   */
  async deleteItem(sessionId: string, key: string): Promise<void> {
    // Delete from Redis cache
    await this.redis.deleteStorageItem(sessionId, key);

    // Delete from PostgreSQL
    try {
      const existing = await this.prisma.chatStateSession.findFirst({
        where: {
          user_session_id: sessionId,
        },
      });

      if (existing && existing.chat_state) {
        const chatState = JSON.parse(existing.chat_state);
        delete chatState[key];

        await this.prisma.chatStateSession.update({
          where: {
            user_session_id: sessionId,
          },
          data: {
            chat_state: JSON.stringify(chatState),
            last_activity: new Date(),
          },
        });
      }

      console.log(`✅ Deleted storage item: session:${sessionId}:${key}`);
    } catch (error) {
      console.error('Failed to delete storage item from database:', error);
    }
  }

  /**
   * Clear all storage items for a session
   */
  async clearSession(sessionId: string): Promise<number> {
    // Clear from Redis
    const deletedCount = await this.redis.clearSessionStorage(sessionId);

    // Clear from PostgreSQL
    try {
      await this.prisma.chatStateSession.delete({
        where: {
          user_session_id: sessionId,
        },
      });

      console.log(`✅ Cleared session storage for: ${sessionId}`);
    } catch (error) {
      // Session might not exist in database
      console.warn('Failed to clear session from database:', error);
    }

    return deletedCount;
  }
}
