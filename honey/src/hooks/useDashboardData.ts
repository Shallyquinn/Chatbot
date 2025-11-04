/**
 * useDashboardData Hook
 * Custom hook for fetching and managing admin dashboard data
 */

import { useState, useEffect, useCallback } from "react";
import adminApi from "../services/adminApi";
import type {
  DashboardMetrics,
  Agent,
  QueueItem,
  AdminProfile,
} from "../types/admin";

interface UseDashboardDataReturn {
  metrics: DashboardMetrics | null;
  agents: Agent[];
  conversationQueue: QueueItem[];
  adminProfile: AdminProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchAgents: () => Promise<void>;
  refetchQueue: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

/**
 * Hook for managing dashboard data with auto-refresh
 */
export const useDashboardData = (
  autoRefreshInterval = 30000
): UseDashboardDataReturn => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversationQueue, setConversationQueue] = useState<QueueItem[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await adminApi.getDashboardMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard metrics:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch dashboard metrics";
      setError(errorMessage);
      // Don't throw - let component handle gracefully
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await adminApi.getAgents();
      setAgents(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch agents";
      setError(errorMessage);
      // Don't throw - let component handle gracefully
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    try {
      const data = await adminApi.getConversationQueue();
      setConversationQueue(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch conversation queue:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch conversation queue";
      setError(errorMessage);
      // Don't throw - let component handle gracefully
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await adminApi.getAdminProfile();
      setAdminProfile(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch admin profile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch admin profile";
      setError(errorMessage);
      // Don't throw - let component handle gracefully
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMetrics(),
        fetchAgents(),
        fetchQueue(),
        fetchProfile(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics, fetchAgents, fetchQueue, fetchProfile]);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        fetchMetrics();
        fetchAgents();
        fetchQueue();
      }, autoRefreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, fetchMetrics, fetchAgents, fetchQueue]);

  return {
    metrics,
    agents,
    conversationQueue,
    adminProfile,
    loading,
    error,
    refetch,
    refetchAgents: fetchAgents,
    refetchQueue: fetchQueue,
    refetchProfile: fetchProfile,
  };
};
