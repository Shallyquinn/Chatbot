import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'chart' | 'profile';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="bg-white border border-[#e0e0e0] rounded-lg p-5 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-10 bg-gray-100 rounded-md" />
        <div className="h-10 bg-gray-100 rounded-md" />
        <div className="h-8 bg-gray-100 rounded-md" />
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-100 border-b border-gray-200" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 border-b border-gray-100 px-4 flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );

  const ChartSkeleton = () => (
    <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
      <div className="h-64 bg-gray-100 rounded" />
    </div>
  );

  const ProfileSkeleton = () => (
    <div className="animate-pulse">
      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" />
      <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-2" />
      <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return <TableSkeleton />;
      case 'chart':
        return <ChartSkeleton />;
      case 'profile':
        return <ProfileSkeleton />;
      case 'card':
      default:
        return (
          <>
            {Array.from({ length: count }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

export default LoadingSkeleton;
