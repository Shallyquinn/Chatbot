import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  title,
  value,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#e0e0e0] rounded-lg shadow-sm h-full ${className}`}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex gap-3 items-start flex-1">
          <div className="bg-[#eaf3f1] border border-[#006045] rounded-full p-3 shrink-0">
            <Icon className="w-8 h-8 text-[#006045]" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#7b7b7b] text-xs font-medium leading-tight">{title}</p>
            <p className="font-bold text-[#1e1e1e] text-2xl mt-1.5 leading-none">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
        {trend && (
          <div className="flex gap-1 items-center mt-3 pt-3 border-t border-[#f0f0f0]">
            {trend.isPositive ? (
              <svg className="w-6 h-6 text-[#32bf4e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-[#e7473b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            <p className={`font-normal text-[11px] ${trend.isPositive ? 'text-[#32bf4e]' : 'text-[#e7473b]'}`}>
              {trend.value}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
