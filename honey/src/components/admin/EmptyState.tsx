import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="bg-white border-2 border-dashed border-[#e0e0e0] rounded-lg text-center py-16 px-4">
      <div className="bg-[#f8f9fa] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 opacity-50 text-[#7b7b7b]" />
      </div>
      <p className="text-base font-semibold text-[#7b7b7b]">{title}</p>
      <p className="text-sm text-[#949494] mt-1">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-[#006045] text-white rounded-lg hover:bg-[#005038] text-sm font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
