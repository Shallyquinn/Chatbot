import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  UserCheck,
  ThumbsUp,
  Clock,
  TrendingUp,
  MessageCircle,
  Settings,
  FileText,
  RefreshCw,
  AlertCircle,
  UserPlus,
} from 'lucide-react';

interface DashboardMetrics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    satisfiedUsers: number;
    avgResponseTime: string;
  };
  charts: {
    newUsers: Array<{ date: string; count: number }>;
    recurringUsers: Array<{ date: string; count: number }>;
    chatbotPerformance: {
      resolved: { count: number; percentage: string };
      escalated: { count: number; percentage: string };
      pending: { count: number; percentage: string };
    };
    dailyEngagement: Array<{ hour: number; count: number }>;
  };
}

interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  maxChats: number;
  _count?: {
    assignedConversations: number;
  };
}

interface QueueItem {
  id: string;
  conversationId: string;
  user?: {
    name?: string;
  };
  escalatedAt?: string;
  position: number;
  waitTime: string;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversationQueue, setConversationQueue] = useState<QueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'agents' | 'queue' | 'config'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );

  useEffect(() => {
    fetchDashboardData();
    fetchAgents();
    fetchConversationQueue();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const fetchConversationQueue = async () => {
    try {
      const response = await fetch('/api/admin/conversations/queue');
      if (response.ok) {
        const data = await response.json();
        setConversationQueue(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversation queue:', error);
    }
  };

  const handleBulkAssign = () => {
    setBulkAssignModalOpen(true);
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversations((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId],
    );
  };

  const handleAssignToAgent = async (agentId: string) => {
    try {
      const response = await fetch('/api/admin/conversations/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: [
            {
              agentId,
              conversationIds: selectedConversations,
            },
          ],
        }),
      });

      if (response.ok) {
        setBulkAssignModalOpen(false);
        setSelectedConversations([]);
        fetchConversationQueue();
        fetchAgents();
      }
    } catch (error) {
      console.error('Failed to assign conversations:', error);
    }
  };

  const MetricCard: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: string;
    color?: string;
  }> = ({ icon: Icon, title, value, subtitle, trend, color = 'emerald' }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            {value.toLocaleString()}
          </p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className={`p-3 rounded-xl bg-${color}-50`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          {trend && (
            <span
              className={`text-xs text-${color}-600 flex items-center font-medium`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">{agent.name}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            agent.status === 'ONLINE'
              ? 'bg-emerald-100 text-emerald-800'
              : agent.status === 'BUSY'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-slate-100 text-slate-800'
          }`}
        >
          {agent.status}
        </span>
      </div>
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Active Chats:</span>
          <span className="font-medium">
            {agent._count?.assignedConversations || 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Max Capacity:</span>
          <span className="font-medium">{agent.maxChats}</span>
        </div>
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              agent.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
            style={{
              width: `${Math.min(100, ((agent._count?.assignedConversations || 0) / agent.maxChats) * 100)}%`,
            }}
          />
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="flex-1 text-xs bg-slate-50 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
          View Chats
        </button>
        <button className="flex-1 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
          Edit
        </button>
      </div>
    </div>
  );

  const ConversationQueueItem: React.FC<{
    conversation: QueueItem;
    onSelect: (id: string) => void;
    selected: boolean;
  }> = ({ conversation, onSelect, selected }) => (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
      onClick={() => onSelect(conversation.conversationId)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-900">
          User: {conversation.user?.name || 'Anonymous'}
        </h4>
        <span className="text-xs text-slate-500">
          Position #{conversation.position}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600">Waiting: {conversation.waitTime}</span>
        <div
          className={`w-3 h-3 rounded-full ${selected ? 'bg-emerald-500' : 'bg-slate-300'}`}
        />
      </div>
    </div>
  );

  const BulkAssignModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Bulk Assign Conversations
        </h2>

        <div className="mb-6">
          <h3 className="font-medium text-slate-700 mb-2">
            Selected Conversations ({selectedConversations.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {conversationQueue
              .filter((conv) =>
                selectedConversations.includes(conv.conversationId),
              )
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg"
                >
                  User: {conversation.user?.name || 'Anonymous'}
                </div>
              ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-slate-700 mb-3">Available Agents</h3>
          <div className="grid grid-cols-1 gap-3">
            {agents
              .filter((agent) => agent.status === 'ONLINE')
              .map((agent) => (
                <button
                  key={agent.id}
                  className="p-4 text-left border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  onClick={() => handleAssignToAgent(agent.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-900">
                        {agent.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {agent._count?.assignedConversations || 0}/
                        {agent.maxChats} chats
                      </div>
                    </div>
                    <div className="text-emerald-600">
                      <UserPlus className="h-5 w-5" />
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            onClick={() => setBulkAssignModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pieColors = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Honey Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Monitor and manage your chatbot system
          </p>
        </div>

        <div className="px-6">
          <div className="flex space-x-8">
            {(['overview', 'agents', 'queue', 'config'] as const).map((tab) => (
              <button
                key={tab}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Users}
                title="Total Users"
                value={metrics.overview.totalUsers}
                subtitle="All time users"
                trend="+5.2%"
                color="blue"
              />
              <MetricCard
                icon={UserCheck}
                title="Active Users"
                value={metrics.overview.activeUsers}
                subtitle="Last 30 days"
                trend="+2.1%"
                color="emerald"
              />
              <MetricCard
                icon={ThumbsUp}
                title="Satisfied Users"
                value={metrics.overview.satisfiedUsers}
                subtitle="Positive feedback"
                trend="+8.3%"
                color="green"
              />
              <MetricCard
                icon={Clock}
                title="Response Time"
                value={metrics.overview.avgResponseTime}
                subtitle="Average response"
                trend="-12%"
                color="orange"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  New Users
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics.charts.newUsers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Recurring Users
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics.charts.recurringUsers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Chatbot Performance
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Resolved',
                          value: parseInt(
                            metrics.charts.chatbotPerformance.resolved.count.toString(),
                          ),
                        },
                        {
                          name: 'Escalated',
                          value: parseInt(
                            metrics.charts.chatbotPerformance.escalated.count.toString(),
                          ),
                        },
                        {
                          name: 'Pending',
                          value: parseInt(
                            metrics.charts.chatbotPerformance.pending.count.toString(),
                          ),
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieColors.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Daily Engagement Pattern
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics.charts.dailyEngagement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">
                Agent Management
              </h2>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Add New Agent</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>

            {agents.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-400" />
                <p className="text-slate-500">No agents found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">
                Conversation Queue ({conversationQueue.length})
              </h2>
              <div className="flex space-x-3">
                <button
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBulkAssign}
                  disabled={selectedConversations.length === 0}
                >
                  <Users className="h-4 w-4" />
                  <span>Bulk Assign ({selectedConversations.length})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {conversationQueue.map((conversation) => (
                <ConversationQueueItem
                  key={conversation.id}
                  conversation={conversation}
                  onSelect={handleConversationSelect}
                  selected={selectedConversations.includes(
                    conversation.conversationId,
                  )}
                />
              ))}

              {conversationQueue.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-400" />
                  <p className="text-slate-500">No conversations in queue</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Configuration Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Message Configuration
                  </h3>
                </div>
                <p className="text-slate-600 mb-4">
                  Update chatbot messages and responses without code changes
                </p>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                  Edit Messages
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    System Settings
                  </h3>
                </div>
                <p className="text-slate-600 mb-4">
                  Configure system-wide settings and parameters
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {bulkAssignModalOpen && <BulkAssignModal />}
    </div>
  );
};

export default AdminDashboard;
