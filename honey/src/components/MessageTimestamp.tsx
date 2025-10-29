import React from 'react';

interface MessageTimestampProps {
  timestamp: string; // ISO timestamp string
  messageType: 'bot' | 'user';
}

const MessageTimestamp: React.FC<MessageTimestampProps> = ({ timestamp, messageType }) => {
  const formatTime = (isoTimestamp: string): string => {
    const date = new Date(isoTimestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Format as HH:MM with leading zeros
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}`;
  };

  return (
    <span 
      className={`message-timestamp text-[10px] ml-2 ${
        messageType === 'user' 
          ? 'text-gray-500 dark:text-gray-400' 
          : 'text-gray-400 dark:text-gray-500'
      }`}
    >
      {formatTime(timestamp)}
    </span>
  );
};

export default MessageTimestamp;
