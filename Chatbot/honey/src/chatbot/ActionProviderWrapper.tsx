// src/chatbot/ActionProviderWrapper.tsx - FIXED VERSION
import React from "react";
import ActionProvider from "./ActionProvider";
import { ChatbotState, ChatMessage } from "./types";

// FIXED: Define proper props interface for the wrapper
interface ActionProviderWrapperProps {
  createChatBotMessage: (
    message: string,
    options?: {
      delay?: number;
      widget?: string;
      loading?: boolean;
      payload?: unknown;
      terminateLoading?: boolean;
      withAvatar?: boolean;
    }
  ) => ChatMessage;
  setState: React.Dispatch<React.SetStateAction<ChatbotState>>;
  state: ChatbotState;
  children: React.ReactNode;
}

// FIXED: Create a proper React component wrapper
const ActionProviderWrapper: React.FC<ActionProviderWrapperProps> = ({
  createChatBotMessage,
  setState,
  state,
  children,
}) => {
  // Create ActionProvider instance
  const actionProviderInstance = new ActionProvider(
    createChatBotMessage,
    setState,
    state
  );

  // FIXED: Clone children and pass the actionProvider instance
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            ...(child.props || {}),
            actionProvider: actionProviderInstance,
          });
        }
        return child;
      })}
    </>
  );
};

export default ActionProviderWrapper;