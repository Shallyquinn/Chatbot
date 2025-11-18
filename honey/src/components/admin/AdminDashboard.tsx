import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import ApiService from '../../services/api.service';
import WebSocketService from '../../services/websocket.service';

interface QueueStats {
  total: number;
  waiting: number;
  assigned: number;
  resolved: number;
  avgWaitTime: number;
  avgResponseTime: number;
}

interface AgentStatus {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline' | 'busy';
  activeConversations: number;
  totalResolved: number;
}

export const AdminDashboard: React.FC = () => {
  const [queueStats, setQueueStats] = useState<QueueStats>({
    total: 0,
    waiting: 0,
    assigned: 0,
    resolved: 0,
    avgWaitTime: 0,
    avgResponseTime: 0
  });
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueueStats();
    fetchAgentStatuses();

    // Setup WebSocket listener for real-time queue updates
    const handleQueueUpdate = (data: any) => {
      setQueueStats(prev => ({
        ...prev,
        waiting: data.queueSize || prev.waiting,
        total: prev.total + 1
      }));
    };

    WebSocketService.on('queue_updated', handleQueueUpdate);

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQueueStats();
      fetchAgentStatuses();
    }, 30000);

    return () => {
      clearInterval(interval);
      WebSocketService.off('queue_updated', handleQueueUpdate);
    };
  }, []);

  const fetchQueueStats = async () => {
    try {
      const response = await ApiService.getQueueStats();
      setQueueStats(response.data);
    } catch (error) {
      console.error('Error fetching queue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentStatuses = async () => {
    try {
      const response = await ApiService.getAgentStatuses();
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agent statuses:', error);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: number;
    color: string;
  }> = ({ title, value, icon, trend, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+{trend}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Monitor queue and agent performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Conversations"
            value={queueStats.total}
            icon={<MessageCircle className="w-6 h-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Waiting in Queue"
            value={queueStats.waiting}
            icon={<Clock className="w-6 h-6 text-white" />}
            color="bg-yellow-500"
          />
          <StatCard
            title="Currently Assigned"
            value={queueStats.assigned}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-emerald-500"
          />
          <StatCard
            title="Resolved Today"
            value={queueStats.resolved}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Average Wait Time</h2>
            <p className="text-4xl font-bold text-emerald-600">
              {Math.floor(queueStats.avgWaitTime / 60)}m {queueStats.avgWaitTime % 60}s
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Average Response Time</h2>
            <p className="text-4xl font-bold text-blue-600">
              {Math.floor(queueStats.avgResponseTime / 60)}m {queueStats.avgResponseTime % 60}s
            </p>
          </div>
        </div>

        {/* Queue Alert */}
        {queueStats.waiting > 5 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">High Queue Volume Alert</p>
              <p className="text-sm text-red-700">
                {queueStats.waiting} conversations waiting. Consider assigning more agents.
              </p>
            </div>
          </div>
        )}

        {/* Agent Status Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Agent Status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Active Chats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Resolved Today
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{agent.name}</div>
                        <div className="text-sm text-slate-500">{agent.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center gap-2 text-sm`}>
                        {agent.status === 'online' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-700">Online</span>
                          </>
                        )}
                        {agent.status === 'offline' && (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Offline</span>
                          </>
                        )}
                        {agent.status === 'busy' && (
                          <>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-700">Busy</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {agent.activeConversations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {agent.totalResolved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
