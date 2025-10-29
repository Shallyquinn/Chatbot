import React from 'react';
import DateDivider from './DateDivider';
import { ChatMessage as ChatMessageType } from '@/chatbot/types';

interface CustomMessageListProps {
  messages: ChatMessageType[];
  children: React.ReactNode;
}

const CustomMessageList: React.FC<CustomMessageListProps> = ({ messages, children }) => {
  // Helper to check if we need a date divider between two messages
  const needsDateDivider = (prevTimestamp?: string, currentTimestamp?: string): boolean => {
    if (!prevTimestamp || !currentTimestamp) return false;
    
    const prevDate = new Date(prevTimestamp);
    const currentDate = new Date(currentTimestamp);
    
    // Reset time to midnight for accurate date comparison
    prevDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    return prevDate.getTime() !== currentDate.getTime();
  };

  // Render messages with date dividers
  const renderMessagesWithDividers = () => {
    if (!Array.isArray(messages) || messages.length === 0) {
      return children;
    }

    const elements: React.ReactNode[] = [];
    
    // Always show date divider for first message
    if (messages[0]?.timestamp) {
      elements.push(
        <DateDivider key={`divider-0`} timestamp={messages[0].timestamp} />
      );
    }

    // Process each message
    React.Children.forEach(children, (child, index) => {
      const currentMessage = messages[index];
      const previousMessage = messages[index - 1];

      // Add date divider if date changed
      if (index > 0 && needsDateDivider(previousMessage?.timestamp, currentMessage?.timestamp)) {
        elements.push(
          <DateDivider 
            key={`divider-${index}`} 
            timestamp={currentMessage.timestamp!} 
          />
        );
      }

      // Add the message
      elements.push(
        <div key={`message-${index}`}>
          {child}
        </div>
      );
    });

    return elements;
  };

  return (
    <div className="custom-message-list">
      {renderMessagesWithDividers()}
    </div>
  );
};

export default CustomMessageList;
