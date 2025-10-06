// src/chatbot/MessageParserWrapper.tsx
import MessageParser from './MessageParser';
import { ChatbotState } from './types';
import ActionProvider from './ActionProvider';

// React 19 compatible wrapper for MessageParser
const MessageParserWrapper = (
  actionProvider: ActionProvider,
  state: ChatbotState,
) => {
  const safeState = state || {
    messages: [],
    currentStep: 'language',
  };

  // Return a function that creates the MessageParser instance
  return new MessageParser(actionProvider, safeState);
};

// Ensure the wrapper can be called as a constructor
MessageParserWrapper.prototype = MessageParser.prototype;

export default MessageParserWrapper;
