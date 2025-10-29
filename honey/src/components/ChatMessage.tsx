import React from 'react';
import MessageTimestamp from './MessageTimestamp';
// import { Card } from "@/components/ui/card";

export interface ChatMessageProps {
  message?: string;
  type: 'bot' | 'user';
  timestamp?: string; // ISO timestamp string
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, type, timestamp }) => {
  const isBot = type === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
          isBot 
            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100' 
            : 'bg-[#dcf8c6] dark:bg-[#056162] text-gray-800 dark:text-white'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {message}
        </div>
        {timestamp && (
          <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mt-1`}>
            <MessageTimestamp timestamp={timestamp} messageType={type} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
