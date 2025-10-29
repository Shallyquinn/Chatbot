import React, { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import DateDivider from './DateDivider';
import { ChatbotState } from '@/chatbot/types';

interface ChatbotWithDividersProps {
  children: React.ReactNode;
  state?: ChatbotState;
}

const ChatbotWithDividers: React.FC<ChatbotWithDividersProps> = ({ children, state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRootsRef = useRef<Map<string, Root>>(new Map());

  useEffect(() => {
    if (!containerRef.current || !state?.messages) return;

    const messageContainer = containerRef.current.querySelector(
      '.react-chatbot-kit-chat-message-container'
    );

    if (!messageContainer) return;

    const currentRoots = dividerRootsRef.current;

    // Clean up previous dividers asynchronously to avoid race condition
    const oldRoots = Array.from(currentRoots.values());
    requestAnimationFrame(() => {
      oldRoots.forEach((root) => {
        try {
          root.unmount();
        } catch (error) {
          console.warn('Error unmounting divider root:', error);
        }
      });
    });
    currentRoots.clear();

    // Remove old divider elements
    messageContainer.querySelectorAll('.date-divider-wrapper').forEach((el) => {
      el.remove();
    });

    // Helper to check if dates are different
    const isDifferentDate = (timestamp1: string, timestamp2: string): boolean => {
      const date1 = new Date(timestamp1);
      const date2 = new Date(timestamp2);
      date1.setHours(0, 0, 0, 0);
      date2.setHours(0, 0, 0, 0);
      return date1.getTime() !== date2.getTime();
    };

    // Get all message elements
    const messageElements = messageContainer.querySelectorAll(
      '.react-chatbot-kit-chat-bot-message-container, .react-chatbot-kit-user-chat-message-container'
    );

    // Insert date dividers
    messageElements.forEach((messageEl, index) => {
      const currentMessage = state.messages[index];
      const previousMessage = state.messages[index - 1];

      // Add divider at the start or when date changes
      if (
        currentMessage?.timestamp &&
        (index === 0 || (previousMessage?.timestamp && isDifferentDate(previousMessage.timestamp, currentMessage.timestamp)))
      ) {
        const dividerWrapper = document.createElement('div');
        dividerWrapper.className = 'date-divider-wrapper';
        
        messageEl.parentNode?.insertBefore(dividerWrapper, messageEl);

        // Create React root and render divider
        const root = createRoot(dividerWrapper);
        root.render(<DateDivider timestamp={currentMessage.timestamp} />);
        
        currentRoots.set(`divider-${index}`, root);
      }
    });

    // Cleanup on unmount - also use requestAnimationFrame
    return () => {
      const rootsToCleanup = Array.from(currentRoots.values());
      requestAnimationFrame(() => {
        rootsToCleanup.forEach((root) => {
          try {
            root.unmount();
          } catch (error) {
            console.warn('Error unmounting divider root:', error);
          }
        });
      });
      currentRoots.clear();
    };
  }, [state?.messages]);

  return (
    <div ref={containerRef} className="chatbot-with-dividers">
      {children}
    </div>
  );
};

export default ChatbotWithDividers;
