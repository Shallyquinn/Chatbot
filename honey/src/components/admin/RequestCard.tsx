import React from 'react';
import type { QueueItem } from '../../types/admin';

interface RequestCardProps {
  request: QueueItem;
  onAssignClick: (request: QueueItem) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onAssignClick }) => {
  return (
    <div className="bg-white border border-[#e0e0e0] rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-[#1e1e1e] text-base">
            {request.user?.name || 'Unknown User'}
          </h3>
          <p className="text-[#7b7b7b] text-xs mt-1">Position: #{request.position}</p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
          Waiting
        </span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-[#7b7b7b]">Wait Time:</span>
          <span className="font-medium text-[#1e1e1e]">{request.waitTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#7b7b7b]">Escalated:</span>
          <span className="font-medium text-[#1e1e1e]">
            {request.escalatedAt
              ? new Date(request.escalatedAt).toLocaleTimeString()
              : 'N/A'}
          </span>
        </div>
        {request.priority && (
          <div className="flex justify-between">
            <span className="text-[#7b7b7b]">Priority:</span>
            <span
              className={`font-medium ${
                request.priority === 'URGENT'
                  ? 'text-red-600'
                  : request.priority === 'HIGH'
                  ? 'text-orange-600'
                  : 'text-gray-600'
              }`}
            >
              {request.priority}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => onAssignClick(request)}
        className="w-full px-4 py-2 bg-[#006045] text-white rounded-lg hover:bg-[#005038] transition-colors text-sm font-medium"
      >
        Assign Agent
      </button>
    </div>
  );
};

export default RequestCard;
