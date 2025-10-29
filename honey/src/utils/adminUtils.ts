/**
 * Admin Dashboard Utilities
 * Filter, sort, and pagination utilities for admin dashboard
 */

import type { Agent, QueueItem } from "../types/admin";

/**
 * Filter agents by search term and status
 */
export const filterAgents = (
  agents: Agent[],
  searchTerm: string,
  statusFilter: "all" | "ONLINE" | "OFFLINE"
): Agent[] => {
  return agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

/**
 * Sort agents by specified field and direction
 */
export const sortAgents = (
  agents: Agent[],
  sortField: "name" | "status" | "chats" | null,
  sortDirection: "asc" | "desc"
): Agent[] => {
  if (!sortField) return agents;

  return [...agents].sort((a, b) => {
    let compareValue = 0;

    switch (sortField) {
      case "name":
        compareValue = a.name.localeCompare(b.name);
        break;
      case "status":
        compareValue = a.status.localeCompare(b.status);
        break;
      case "chats":
        compareValue =
          (a._count?.assignedConversations || 0) -
          (b._count?.assignedConversations || 0);
        break;
    }

    return sortDirection === "asc" ? compareValue : -compareValue;
  });
};

/**
 * Filter conversation requests by search term
 */
export const filterRequests = (
  requests: QueueItem[],
  searchTerm: string
): QueueItem[] => {
  if (!searchTerm) return requests;

  return requests.filter((request) =>
    (request.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
};

/**
 * Sort conversation requests by specified field and direction
 */
export const sortRequests = (
  requests: QueueItem[],
  sortField: "waitTime" | "position" | null,
  sortDirection: "asc" | "desc"
): QueueItem[] => {
  if (!sortField) return requests;

  return [...requests].sort((a, b) => {
    let compareValue = 0;

    switch (sortField) {
      case "position":
        compareValue = a.position - b.position;
        break;
      case "waitTime":
        compareValue = parseWaitTime(a.waitTime) - parseWaitTime(b.waitTime);
        break;
    }

    return sortDirection === "asc" ? compareValue : -compareValue;
  });
};

/**
 * Parse wait time string to minutes
 */
const parseWaitTime = (waitTime: string): number => {
  const match = waitTime.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

/**
 * Paginate array of items
 */
export const paginateItems = <T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): T[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

/**
 * Calculate total pages for pagination
 */
export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number
): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

/**
 * Calculate agent capacity usage percentage
 */
export const calculateAgentCapacity = (agent: Agent): number => {
  const activeChats = agent._count?.assignedConversations || 0;
  return Math.round((activeChats / agent.maxChats) * 100);
};

/**
 * Get agent availability status
 */
export const getAgentAvailability = (
  agent: Agent
): {
  isAvailable: boolean;
  reason?: string;
} => {
  if (agent.status === "OFFLINE") {
    return { isAvailable: false, reason: "Agent is offline" };
  }

  const activeChats = agent._count?.assignedConversations || 0;
  if (activeChats >= agent.maxChats) {
    return { isAvailable: false, reason: "Agent at maximum capacity" };
  }

  return { isAvailable: true };
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (
  headers: string[],
  rows: (string | number)[][],
  filename: string
): void => {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format agents data for CSV export
 */
export const formatAgentsForExport = (
  agents: Agent[]
): (string | number)[][] => {
  return agents.map((agent) => [
    agent.name,
    agent.email,
    agent.status,
    agent._count?.assignedConversations || 0,
    agent.maxChats,
    `${calculateAgentCapacity(agent)}%`,
  ]);
};
