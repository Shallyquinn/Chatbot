import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#e0e0e0] rounded-[15px] shadow-sm w-full ${className}`}>
      <div className="px-6 pt-[18px] pb-5">
        <div className="mb-2">
          <h3 className="font-medium text-[#1e1e1e] text-[20px] leading-normal">{title}</h3>
          {subtitle && (
            <p className="text-[#383838] text-[12px] font-normal mt-2 leading-normal">{subtitle}</p>
          )}
        </div>
        <div className="h-[450px] w-full mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
