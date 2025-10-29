import React from 'react';

interface DateDividerProps {
  timestamp: string; // ISO timestamp string
}

const DateDivider: React.FC<DateDividerProps> = ({ timestamp }) => {
  const formatDateLabel = (isoTimestamp: string): string => {
    const messageDate = new Date(isoTimestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to midnight for accurate date comparison
    const resetTime = (date: Date) => {
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const messageDateOnly = resetTime(new Date(messageDate));
    const todayOnly = resetTime(new Date(today));
    const yesterdayOnly = resetTime(new Date(yesterday));

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      // Format as "MM/DD/YYYY" or your preferred format
      const options: Intl.DateTimeFormatOptions = {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      };
      return messageDate.toLocaleDateString(undefined, options);
    }
  };

  return (
    <div className="flex justify-center my-4">
      <div className="bg-white/80 dark:bg-gray-700/80 px-3 py-1.5 rounded-lg shadow-sm">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          {formatDateLabel(timestamp)}
        </span>
      </div>
    </div>
  );
};

export default DateDivider;
