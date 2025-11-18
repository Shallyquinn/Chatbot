import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import type { QueueItem, Agent } from '../../types/admin';

interface AssignAgentModalProps {
  request: QueueItem;
  agents: Agent[];
  onAssign: (agentId: string) => Promise<void>;
  onClose: () => void;
}

const AssignAgentModal: React.FC<AssignAgentModalProps> = ({
  request,
  agents,
  onAssign,
  onClose,
}) => {
  const [isAssigning, setIsAssigning] = useState(false);

  const availableAgents = agents.filter(
    (agent) =>
      agent.status === 'ONLINE' &&
      (agent._count?.assignedConversations || 0) < agent.maxChats
  );

  const handleAssign = async (agentId: string) => {
    setIsAssigning(true);
    try {
      await onAssign(agentId);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isAssigning) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#1e1e1e]">Assign Agent</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isAssigning}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {/* Request Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Request from:</p>
            <p className="font-bold text-[#1e1e1e]">
              {request.user?.name || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Wait Time: {request.waitTime}</p>
            <p className="text-xs text-gray-500">Position: #{request.position}</p>
          </div>

          <p className="text-sm font-medium text-gray-700 mb-3">
            Select an available agent:
          </p>

          {/* Agent List */}
          <div className="space-y-2">
            {availableAgents.length > 0 ? (
              availableAgents.map((agent) => {
                const activeChats = agent._count?.assignedConversations || 0;
                const capacityPercent = Math.round((activeChats / agent.maxChats) * 100);

                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAssign(agent.id)}
                    disabled={isAssigning}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-[#006045] hover:bg-[#f0f8f6] transition-all flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <p className="font-medium text-[#1e1e1e]">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {activeChats}/{agent.maxChats} chats
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#006045] rounded-full"
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">{capacityPercent}%</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium mt-1">
                        Available
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No available agents at the moment</p>
                <p className="text-xs mt-1">
                  All agents are either offline or at full capacity
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAgentModal;
