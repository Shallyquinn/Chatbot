import React from 'react';
import { Circle } from 'lucide-react';

interface AgentStatusIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({ 
  status, 
  showLabel = false,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online', ring: 'ring-green-200' },
    offline: { color: 'bg-gray-400', label: 'Offline', ring: 'ring-gray-200' },
    away: { color: 'bg-yellow-500', label: 'Away', ring: 'ring-yellow-200' },
    busy: { color: 'bg-red-500', label: 'Busy', ring: 'ring-red-200' }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <Circle 
          className={`${sizeClasses[size]} ${config.color} rounded-full fill-current`}
        />
        {status === 'online' && (
          <span className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-75`}></span>
        )}
      </div>
      {showLabel && (
        <span className="text-sm text-slate-600">{config.label}</span>
      )}
    </div>
  );
};
