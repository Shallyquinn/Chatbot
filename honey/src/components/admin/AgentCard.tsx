import React from 'react';
import type { Agent } from '../../types/admin';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  const usagePercentage = Math.min(
    100,
    Math.round(((agent._count?.assignedConversations || 0) / agent.maxChats) * 100)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-[#eaf3f1] text-[#006045] ring-1 ring-[#006045]/20';
      case 'BUSY':
        return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#e0e0e0] rounded-lg p-5 shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1e1e1e] text-base truncate">{agent.name}</h3>
          <p className="text-[#7b7b7b] text-xs mt-1 truncate">{agent.email}</p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ml-2 shrink-0 ${getStatusColor(
            agent.status
          )}`}
        >
          {agent.status}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center py-2 px-3 bg-[#f8f9fa] rounded-md">
          <span className="text-[#7b7b7b] font-medium">Active Chats</span>
          <span className="font-bold text-[#1e1e1e] text-sm">
            {agent._count?.assignedConversations || 0}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 px-3 bg-[#f8f9fa] rounded-md">
          <span className="text-[#7b7b7b] font-medium">Max Capacity</span>
          <span className="font-bold text-[#1e1e1e] text-sm">{agent.maxChats}</span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="text-[#7b7b7b] font-medium">Capacity Usage</span>
            <span className="font-bold text-[#1e1e1e]">{usagePercentage}%</span>
          </div>
          <div className="h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#006045] to-[#008060] transition-all duration-500 ease-out"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
