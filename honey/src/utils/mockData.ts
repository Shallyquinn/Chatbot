/**
 * Mock Data Utilities
 * Centralized mock data generators for admin dashboard
 * Used as fallback when real data is unavailable
 */

export interface MockNewUsersDataPoint {
  month: string;
  users: number;
}

export interface MockRecurringUsersDataPoint {
  day: string;
  users: number;
}

export interface MockPerformanceDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export interface MockEngagementDataPoint {
  hour: string;
  engagement: number;
}

/**
 * Generate mock new users data for chart visualization
 */
export const generateMockNewUsersData = (): MockNewUsersDataPoint[] => [
  { month: "Jan", users: 400 },
  { month: "Feb", users: 300 },
  { month: "Mar", users: 600 },
  { month: "Apr", users: 800 },
  { month: "May", users: 500 },
  { month: "Jun", users: 900 },
  { month: "Jul", users: 700 },
  { month: "Aug", users: 1000 },
  { month: "Sep", users: 850 },
];

/**
 * Generate mock recurring users data for chart visualization
 */
export const generateMockRecurringUsersData =
  (): MockRecurringUsersDataPoint[] => [
    { day: "Mon", users: 340 },
    { day: "Tue", users: 630 },
    { day: "Wed", users: 110 },
    { day: "Thu", users: 450 },
    { day: "Fri", users: 210 },
    { day: "Sat", users: 210 },
    { day: "Sun", users: 510 },
    { day: "Mon", users: 415 },
    { day: "Tue", users: 340 },
  ];

/**
 * Generate mock performance data for chart visualization
 */
export const generateMockPerformanceData = (): MockPerformanceDataPoint[] => [
  { name: "Resolved", value: 78, color: "#006045" },
  { name: "Escalated", value: 15, color: "#30A584" },
  { name: "Pending", value: 7, color: "#B2D2B4" },
];

/**
 * Generate mock engagement data for chart visualization
 */
export const generateMockEngagementData = (): MockEngagementDataPoint[] => [
  { hour: "6am", engagement: 20 },
  { hour: "8am", engagement: 45 },
  { hour: "10am", engagement: 60 },
  { hour: "12pm", engagement: 80 },
  { hour: "2pm", engagement: 75 },
  { hour: "4pm", engagement: 90 },
  { hour: "6pm", engagement: 70 },
  { hour: "8pm", engagement: 50 },
  { hour: "10pm", engagement: 30 },
];

/**
 * Mock metrics for dashboard overview
 */
export const generateMockMetrics = () => ({
  totalUsers: 1200,
  activeUsers: 800,
  satisfiedUsers: 700,
  responseTime: "2.5s",
});

/**
 * Mock agent metrics
 */
export const generateMockAgentMetrics = () => ({
  requests: 5,
  totalAgents: 20,
  activeChats: 15,
  responseTime: "2.5s",
});

/**
 * Check if dashboard has real data
 */
export const hasRealDashboardData = (totalConversations?: number): boolean => {
  return !!totalConversations && totalConversations > 0;
};

/**
 * Check if agent data is available
 */
export const hasAgentData = (agentsCount: number): boolean => {
  return agentsCount > 0;
};
