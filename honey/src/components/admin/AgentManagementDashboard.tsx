import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  UserCheck,
  ChevronDown,
  ChevronUp,
  Download,
  UserPlus
} from 'lucide-react';
import ApiService from '../../services/api.service';

// API Response Types
interface AgentAPIResponse {
  id: string;
  name: string;
  email: string;
  agentId?: string;
  isOnline: boolean;
  activeConversations?: number;
}

interface ConversationAPIResponse {
  id: string;
  userId: string;
  userName?: string;
  lastMessage?: string;
  createdAt: string;
  platform?: 'whatsapp' | 'web';
}

// UI Types
interface Agent {
  id: string;
  name: string;
  email: string;
  agentId: string;
  status: 'online' | 'offline' | 'busy';
  activeChats: number;
  isCollapsed?: boolean;
}

interface ChatRequest {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  platform: 'whatsapp' | 'web';
  selected?: boolean;
}

interface DashboardStats {
  totalRequests: number;
  requestsChange: number;
  totalAgents: number;
  agentsChange: number;
  activeChats: number;
  chatsChange: number;
  responseTime: string;
  responseChange: number;
}

const AgentManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'channels' | 'agents' | 'admin'>('agents');
  const [viewMode, setViewMode] = useState<'agents' | 'requests'>('requests');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 5,
    requestsChange: -2,
    totalAgents: 20,
    agentsChange: -5,
    activeChats: 15,
    chatsChange: 12.7,
    responseTime: '2.5s',
    responseChange: -3,
  });
  // TODO: Re-add showOnboardModal state when implementing agent onboarding modal
  // TODO: Re-add selectedRequests state when implementing bulk assignment feature

  useEffect(() => {
    fetchAgents();
    fetchRequests();
    fetchStats();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await ApiService.get('/admin/agents');
      const agentData = response.data || response;
      setAgents(agentData.map((agent: AgentAPIResponse) => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        agentId: agent.agentId || `AG-${agent.id.slice(0, 6)}`,
        status: agent.isOnline ? 'online' : 'offline',
        activeChats: agent.activeConversations || 0,
        isCollapsed: false,
      })));
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await ApiService.get('/admin/queue');
      const requestData = response.data || response;
      setRequests(requestData.map((req: any) => ({
        id: req.conversationId || req.id,
        userId: req.user?.id || req.userId,
        userName: req.user?.name || `User ${(req.user?.id || req.userId || 'unknown').slice(0, 8)}`,
        message: req.lastMessage || 'Requested human agent assistance',
        timestamp: req.queuedAt || req.assignedAt || req.createdAt,
        platform: 'whatsapp',
        selected: false,
      })));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      // Mock data for testing
      setRequests([
        {
          id: '1',
          userId: 'user1',
          userName: 'Faith Evans',
          message: 'Need help with family planning',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          platform: 'whatsapp',
          selected: false,
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Faith Evans',
          message: 'Need help with family planning',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          platform: 'whatsapp',
          selected: false,
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Faith Evans',
          message: 'Need help with family planning',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          platform: 'whatsapp',
          selected: false,
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'Faith Evans',
          message: 'Need help with family planning',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          platform: 'whatsapp',
          selected: false,
        },
        {
          id: '5',
          userId: 'user5',
          userName: 'Faith Evans',
          message: 'Need help with family planning',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          platform: 'whatsapp',
          selected: false,
        },
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ApiService.get('/admin/queue/stats');
      const statsData = response.data || response;
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const toggleAgentCollapse = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, isCollapsed: !agent.isCollapsed } : agent
    ));
  };

  // TODO: Implement these functions when UI features are ready:
  // - handleAssignAgent: Manual assignment from dropdown
  // - toggleRequestSelection: Checkbox selection for bulk operations  
  // - handleBulkAssign: Bulk assignment to single agent

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div className="flex h-screen bg-[#fffdf7]">
      {/* Sidebar */}
      <div className="w-[360px] bg-white border-r border-[#949494] flex flex-col">
        {/* Tabs */}
        <div className="flex flex-col gap-6 pt-10 px-6">
          <div className="flex items-center justify-center gap-4">
            <button
              className={`px-4 py-3 text-[18px] ${
                activeTab === 'channels' ? 'text-[#989898]' : 'text-[#989898]'
              }`}
              onClick={() => setActiveTab('channels')}
            >
              Channels
            </button>
            <div className="flex flex-col items-center">
              <button
                className={`px-4 py-3 text-[18px] font-medium ${
                  activeTab === 'agents' ? 'text-[#006045]' : 'text-[#989898]'
                }`}
                onClick={() => setActiveTab('agents')}
              >
                Agents
              </button>
              {activeTab === 'agents' && (
                <div className="w-[85px] h-[6px] bg-[#006045]" />
              )}
            </div>
            <button
              className={`px-4 py-3 text-[18px] ${
                activeTab === 'admin' ? 'text-[#006045]' : 'text-[#989898]'
              }`}
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </button>
          </div>
          <div className="h-[1px] bg-[#e0e0e0]" />
        </div>

        {/* Channel/Platform Section */}
        <div className="flex flex-col gap-6 px-7 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M23.8 13.93C23.8 19.39 19.39 23.8 13.93 23.8C12.32 23.8 10.79 23.38 9.45 22.68L4.2 24.15L5.67 18.9C4.97 17.56 4.55 16.03 4.55 14.42C4.55 8.96 8.96 4.55 14.42 4.55C19.88 4.55 24.29 8.96 24.29 14.42" fill="#25D366"/>
                </svg>
              </div>
              <span className="text-[20px] font-medium text-[#383838]">DKT AI Chatbot</span>
            </div>
            <ChevronUp className="w-9 h-9 text-[#707070]" />
          </div>
          <div className="h-[1px] bg-[#e0e0e0]" />
        </div>

        {/* Agents List */}
        <div className="flex-1 flex flex-col gap-5 px-7 overflow-y-auto">
          {agents.slice(0, 3).map((agent) => (
            <div key={agent.id}>
              <div className="flex items-start justify-between">
                <div className="flex gap-5 items-start">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#f1f1f1] border border-[#dedede] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#707070]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[18px] font-medium text-[#707070]">{agent.name}</p>
                    <p className="text-[12px] text-[#a2a2a2]">Agent ID: {agent.agentId}</p>
                  </div>
                </div>
                <button onClick={() => toggleAgentCollapse(agent.id)}>
                  {agent.isCollapsed ? (
                    <ChevronDown className="w-9 h-9 text-[#707070]" />
                  ) : (
                    <ChevronUp className="w-9 h-9 text-[#707070]" />
                  )}
                </button>
              </div>
              <div className="h-[1px] bg-[#e8e8e8] mt-5" />
            </div>
          ))}
        </div>

        {/* Assigned Users Section */}
        <div className="flex flex-col px-7 py-6">
          <div className="h-[1px] bg-[#e0e0e0] mb-4" />
          <h3 className="text-[20px] font-medium text-[#383838] mb-4">Assigned Users</h3>
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex flex-col gap-2 px-9 py-3 ${i === 1 ? 'bg-[#f8f8f8]' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#ffdddd] flex items-center justify-center">
                      <span className="text-[18px] font-semibold text-[#a13737]">A</span>
                    </div>
                    <span className="text-[18px] font-medium text-[#383838]">Abeni Coker</span>
                  </div>
                  <span className="text-[14px] text-[#a2a2a2]">5:05pm</span>
                </div>
                <p className="text-[14px] text-[#7b7b7b] truncate">
                  Can you help with family planning for a family living
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Onboard Agent Button - TODO: Implement modal functionality */}
        <div className="px-8 py-4">
          <button
            onClick={() => console.log('TODO: Open onboard agent modal')}
            className="w-full bg-[#006045] text-white text-[20px] font-bold py-5 px-6 rounded-[10px] hover:bg-[#005038] transition-colors"
          >
            Onboard Agent
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6">
        {/* Header */}
        <div className="flex items-start justify-between pt-16 pb-10">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[32px] font-semibold text-[#1e1e1e]">Agent Dashboard</h1>
            <p className="text-[20px] text-[#383838]">
              Keep track of agent activity, performance, and availability.
            </p>
          </div>
          <button className="flex items-center gap-3 bg-[#006045] text-white px-6 py-5 rounded-[10px] hover:bg-[#005038] transition-colors">
            <Download className="w-6 h-6" />
            <span className="text-[20px] font-bold">Export</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4 mb-10">
          <div className="bg-white border border-[#e0e0e0] rounded-[10px] p-5 flex-1">
            <div className="flex flex-col gap-3">
              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 bg-[#eaf3f1] border-[0.5px] border-[#006045] rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-[#006045]" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[18px] text-[#7b7b7b]">Requests</p>
                  <p className="text-[36px] font-bold text-[#1e1e1e]">{stats.totalRequests}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className={`text-[16px] font-light ${stats.requestsChange >= 0 ? 'text-[#32bf4e]' : 'text-[#e7473b]'}`}>
                  {stats.requestsChange >= 0 ? '+' : ''}{stats.requestsChange}% from yesterday
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e0e0e0] rounded-[10px] p-5 flex-1">
            <div className="flex flex-col gap-3">
              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 bg-[#eaf3f1] border-[0.5px] border-[#006045] rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#006045]" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[18px] text-[#7b7b7b]">Total Agents</p>
                  <p className="text-[36px] font-bold text-[#1e1e1e]">{stats.totalAgents}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className={`text-[16px] font-light ${stats.agentsChange >= 0 ? 'text-[#32bf4e]' : 'text-[#e7473b]'}`}>
                  {stats.agentsChange >= 0 ? '+' : ''}{stats.agentsChange}% from yesterday
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e0e0e0] rounded-[10px] p-5 flex-1">
            <div className="flex flex-col gap-3">
              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 bg-[#eaf3f1] border-[0.5px] border-[#006045] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#006045]" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[18px] text-[#7b7b7b]">Active Chats</p>
                  <p className="text-[36px] font-bold text-[#1e1e1e]">{stats.activeChats}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className={`text-[16px] font-light ${stats.chatsChange >= 0 ? 'text-[#32bf4e]' : 'text-[#e7473b]'}`}>
                  {stats.chatsChange >= 0 ? '+' : ''}{stats.chatsChange}% from yesterday
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e0e0e0] rounded-[10px] p-5 flex-1">
            <div className="flex flex-col gap-3">
              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 bg-[#eaf3f1] border-[0.5px] border-[#006045] rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#006045]" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[18px] text-[#7b7b7b]">Response Time</p>
                  <p className="text-[36px] font-bold text-[#1e1e1e]">{stats.responseTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className={`text-[16px] font-light ${stats.responseChange >= 0 ? 'text-[#32bf4e]' : 'text-[#e7473b]'}`}>
                  {stats.responseChange >= 0 ? '+' : ''}{stats.responseChange}% from yesterday
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className={`px-4 py-3 text-[18px] ${
              viewMode === 'agents' ? 'text-[#989898]' : 'text-[#989898]'
            }`}
            onClick={() => setViewMode('agents')}
          >
            Agents
          </button>
          <div className="flex flex-col items-center">
            <button
              className={`px-4 py-3 text-[18px] font-medium ${
                viewMode === 'requests' ? 'text-[#006045]' : 'text-[#989898]'
              }`}
              onClick={() => setViewMode('requests')}
            >
              Requests({requests.length})
            </button>
            {viewMode === 'requests' && (
              <div className="w-[136px] h-[6px] bg-[#006045]" />
            )}
          </div>
        </div>
        <div className="h-[1px] bg-[#e0e0e0] mb-8" />

        {/* Requests Grid */}
        <div className="flex flex-wrap gap-6 overflow-y-auto pb-10">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-[#e0e0e0] rounded-[15px] p-5 w-[calc(20%-19.2px)]"
            >
              <div className="flex flex-col gap-14">
                <div className="flex flex-col gap-14">
                  <div className="flex items-center gap-14">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f1f1f1] border border-[#dedede] rounded-full flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-[#707070]" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-[20px] font-medium text-[#1e1e1e]">{request.userName}</p>
                        <p className="text-[14px] text-[#949494]">{getTimeAgo(request.timestamp)}</p>
                      </div>
                    </div>
                    {request.platform === 'whatsapp' && (
                      <div className="w-7 h-7">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <path d="M23.8 13.93C23.8 19.39 19.39 23.8 13.93 23.8C12.32 23.8 10.79 23.38 9.45 22.68L4.2 24.15L5.67 18.9C4.97 17.56 4.55 16.03 4.55 14.42C4.55 8.96 8.96 4.55 14.42 4.55C19.88 4.55 24.29 8.96 24.29 14.42" fill="#25D366"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <button className="bg-[#006045] text-white text-[16px] font-semibold py-3.5 px-6 rounded-[10px] hover:bg-[#005038] transition-colors flex items-center justify-center gap-2">
                  Assign Agent
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentManagementDashboard;
