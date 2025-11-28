// src/chatbot/logging.ts
// Centralized logging utilities for escalation flow debugging

export const logEscalation = {
  userSelection: (choice: string, context?: any) => {
    console.log(' User Selection:', choice);
    console.log('Timestamp:', new Date().toISOString());
    if (context) {
      console.log('Context:', context);
    }
  },

  apiRequest: (endpoint: string, data: any) => {
    console.log(`API Request: ${endpoint}`);
    console.log('Request Data:', data);
    console.log('Timestamp:', new Date().toISOString());
  },

  apiResponse: (endpoint: string, response: any, duration?: number) => {
    console.log(`API Response: ${endpoint}`);
    console.log('Response Data:', response);
    if (duration) {
      console.log(`⏱ Duration: ${duration}ms`);
    }
    console.log(' Timestamp:', new Date().toISOString());
  },

  websocketEvent: (event: string, data?: any) => {
    console.log(` WebSocket Event: ${event}`);
    if (data) {
      console.log(' Event Data:', data);
    }
    console.log(' Timestamp:', new Date().toISOString());
  },

  stateUpdate: (field: string, oldValue: any, newValue: any) => {
    console.log(` State Update: ${field}`);
    console.log('  Old:', oldValue);
    console.log('  New:', newValue);
    console.log(' Timestamp:', new Date().toISOString());
  },

  error: (context: string, error: any) => {
    console.error(` Error in ${context}:`, error);
    console.error(' Timestamp:', new Date().toISOString());
    if (error?.stack) {
      console.error(' Stack:', error.stack);
    }
  },

  agentAssignment: (data: {
    status: string;
    agentId?: string;
    agentName?: string;
    position?: number;
    estimatedWaitTime?: number;
  }) => {
    console.log('🤝 Agent Assignment Result:');
    console.log('  Status:', data.status);
    if (data.agentId) {
      console.log('  Agent ID:', data.agentId);
      console.log('  Agent Name:', data.agentName);
    }
    if (data.position !== undefined) {
      console.log('  Queue Position:', data.position);
      console.log('  Estimated Wait:', data.estimatedWaitTime, 'minutes');
    }
    console.log(' Timestamp:', new Date().toISOString());
  },

  websocketConnection: (status: 'connecting' | 'connected' | 'error' | 'closed', details?: any) => {
    const icons = {
      connecting: '🔌',
      connected: '✅',
      error: '❌',
      closed: '🔒'
    };
    console.log(`${icons[status]} WebSocket ${status.toUpperCase()}`);
    if (details) {
      console.log(' Details:', details);
    }
    console.log(' Timestamp:', new Date().toISOString());
  },

  conversationFlow: (step: string, details?: any) => {
    console.log(` Flow Step: ${step}`);
    if (details) {
      console.log(' Details:', details);
    }
    console.log(' Timestamp:', new Date().toISOString());
  },
};

export const logBackend = {
  escalationStart: (conversationId: string, userId: string) => {
    console.log(' Backend: Escalation request received');
    console.log('  Conversation ID:', conversationId);
    console.log('  User ID:', userId);
    console.log(' Timestamp:', new Date().toISOString());
  },

  businessHoursCheck: (isWithinHours: boolean, hasOnlineAgents: boolean) => {
    console.log(' Business Hours Check:');
    console.log('  Within Hours:', isWithinHours);
    console.log('  Online Agents:', hasOnlineAgents);
    console.log(' Timestamp:', new Date().toISOString());
  },

  agentQuery: (total: number, online: number, available: number) => {
    console.log(' Agent Query Results:');
    console.log('  Total Agents:', total);
    console.log('  Online Agents:', online);
    console.log('  Available Agents:', available);
    console.log(' Timestamp:', new Date().toISOString());
  },

  agentAssignment: (agentId: string, agentName: string, currentChats: number) => {
    console.log(' Agent Assigned:');
    console.log('  Agent ID:', agentId);
    console.log('  Agent Name:', agentName);
    console.log('  Current Chats:', currentChats);
    console.log(' Timestamp:', new Date().toISOString());
  },

  queueEntry: (position: number, estimatedWaitTime: number) => {
    console.log(' Added to Queue:');
    console.log('  Position:', position);
    console.log('  Estimated Wait:', estimatedWaitTime, 'minutes');
    console.log(' Timestamp:', new Date().toISOString());
  },

  websocketNotification: (type: 'agent' | 'admin', recipientId: string | 'all', data: any) => {
    console.log(` Sending ${type} notification`);
    console.log('  Recipient:', recipientId === 'all' ? 'All Admins' : recipientId);
    console.log('  Notification Type:', data.type);
    console.log('  Data:', data);
    console.log(' Timestamp:', new Date().toISOString());
  },

  databaseUpdate: (table: string, operation: string, data: any) => {
    console.log(` Database ${operation}: ${table}`);
    console.log('  Data:', data);
    console.log(' Timestamp:', new Date().toISOString());
  },

  error: (context: string, error: any) => {
    console.error(` Backend Error in ${context}:`, error);
    console.error(' Timestamp:', new Date().toISOString());
    if (error?.stack) {
      console.error(' Stack:', error.stack);
    }
  },
};
