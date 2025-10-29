// src/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private isConnected: boolean = false;

  async onModuleInit() {
    // Initialize Redis client
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn(
              '⚠️ Redis: Max reconnection attempts reached. Running without Redis.',
            );
            return new Error('Redis: Max reconnection attempts reached');
          }
          // Exponential backoff: 100ms, 200ms, 400ms
          return Math.min(retries * 100, 500);
        },
      },
    });

    // Event listeners
    this.client.on('error', (err) => {
      // Only log once to avoid spam
      if (this.isConnected) {
        console.warn(
          '⚠️ Redis Client Error - continuing without cache:',
          err.message,
        );
      }
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('✅ Redis: Connected successfully');
      this.isConnected = true;
    });

    this.client.on('reconnecting', () => {
      console.log('⚠️ Redis: Reconnecting...');
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('❌ Redis: Connection closed');
      this.isConnected = false;
    });

    // Connect to Redis with graceful degradation
    try {
      await this.client.connect();
      console.log('✅ Redis cache enabled');
    } catch (error) {
      console.warn(
        '⚠️ Redis unavailable - continuing without cache. This is normal for local development.',
      );
      console.warn(
        '   To enable Redis caching, install and start Redis server.',
      );
      this.isConnected = false;
      // Don't throw - allow server to continue without Redis
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.quit();
    }
  }

  /**
   * Check if Redis is connected and available
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get value from Redis cache
   * @param key Redis key
   * @returns Cached value or null if not found/error
   */
  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      console.warn('Redis not available, skipping cache read');
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in Redis cache with optional TTL
   * @param key Redis key
   * @param value Value to cache
   * @param ttl Time-to-live in seconds (default: 900 = 15 minutes)
   */
  async set(key: string, value: string, ttl: number = 900): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Redis not available, skipping cache write');
      return;
    }

    try {
      await this.client.setEx(key, ttl, value);
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Delete key from Redis cache
   * @param key Redis key to delete
   */
  async del(key: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param pattern Key pattern (e.g., "session:*")
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      return await this.client.del(keys);
    } catch (error) {
      console.error(`Redis DEL pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists in Redis
   * @param key Redis key
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param key Redis key
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    if (!this.isAvailable()) {
      return -2;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Increment a counter
   * @param key Redis key
   * @returns New value after increment
   */
  async incr(key: string): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('Redis not available for increment operation');
    }

    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get chat session from cache (with automatic JSON parsing)
   */
  async getChatSession(sessionId: string): Promise<any | null> {
    const data = await this.get(`session:${sessionId}`);
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse cached session data:', error);
      return null;
    }
  }

  /**
   * Cache chat session (with automatic JSON stringification)
   * @param sessionId Session identifier
   * @param sessionData Session data object
   * @param ttl Time-to-live in seconds (default: 900 = 15 minutes)
   */
  async setChatSession(
    sessionId: string,
    sessionData: any,
    ttl: number = 900,
  ): Promise<void> {
    try {
      const jsonData = JSON.stringify(sessionData);
      await this.set(`session:${sessionId}`, jsonData, ttl);
    } catch (error) {
      console.error('Failed to cache session data:', error);
    }
  }

  /**
   * Delete chat session from cache
   */
  async deleteChatSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  /**
   * Get storage item (for StorageAdapter)
   */
  async getStorageItem(sessionId: string, key: string): Promise<string | null> {
    return await this.get(`storage:${sessionId}:${key}`);
  }

  /**
   * Set storage item (for StorageAdapter)
   */
  async setStorageItem(
    sessionId: string,
    key: string,
    value: string,
    ttl: number = 900,
  ): Promise<void> {
    await this.set(`storage:${sessionId}:${key}`, value, ttl);
  }

  /**
   * Delete storage item (for StorageAdapter)
   */
  async deleteStorageItem(sessionId: string, key: string): Promise<void> {
    await this.del(`storage:${sessionId}:${key}`);
  }

  /**
   * Clear all storage items for a session (for StorageAdapter)
   */
  async clearSessionStorage(sessionId: string): Promise<number> {
    return await this.delPattern(`storage:${sessionId}:*`);
  }
}
