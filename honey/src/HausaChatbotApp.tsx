import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './hausa-chatbot/config';
import MessageParser from './hausa-chatbot/MessageParser';
import ActionProvider from './hausa-chatbot/ActionProvider';
import ChatbotWithDividers from './components/ChatbotWithDividers';
import { ChatbotState, ChatMessage } from './hausa-chatbot/types';
import Header from './components/Header';
import './App.css';

const HausaChatbotApp: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const chatKey = useMemo(() => 'hausa-chatbot-session', []);
  const [chatState, setChatState] = useState<ChatbotState>(config.initialState);
  const chatContainerRef = useRef(null);
  const lastMessageCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  
  // Set up navigation callback for ActionProvider
  useEffect(() => {
    ActionProvider.setNavigationCallback((path: string) => {
      navigate(path);
    });
  }, [navigate]);

  // Memoize save handler to prevent infinite re-renders
  const handleSaveMessages = useCallback((messages: ChatMessage[]) => {
    if (messages.length !== lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      try {
        // Save to unified chat_state (conversation continuity)
        localStorage.setItem('chat_messages', JSON.stringify(messages));
        const currentState = JSON.parse(localStorage.getItem('chat_state') || '{}');
        localStorage.setItem('chat_state', JSON.stringify({ ...currentState, messages }));
      } catch (error) {
        console.error('Error saving Hausa messages:', error);
      }
    }
  }, []);

  const stableConfig = useMemo(() => config, []);
  const stableMessageParser = useMemo(() => MessageParser, []);
  const stableActionProvider = useMemo(() => ActionProvider, []);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth >= 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Restore state on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    // Use unified chat_state for conversation continuity
    const savedState = localStorage.getItem('chat_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setChatState(parsed);
        lastMessageCountRef.current = parsed.messages?.length || 0;
      } catch (error) {
        console.error('Failed to parse saved state:', error);
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      const messageContainer = document.querySelector(
        '.react-chatbot-kit-chat-message-container'
      );
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    };
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [chatState.messages]);

  return (
    <div className="min-h-screen bg-slate-100 flex p-0 sm:p-4 transition-colors duration-300">
      <div
        className={`w-full flex flex-col ${
          isMobile ? 'h-screen' : 'max-w-md h-[600px]'
        } shadow-xl overflow-hidden rounded-lg bg-white dark:bg-gray-800 transition-colors duration-300`}
        ref={chatContainerRef}
      >
        <Header 
          profileImage="./Honey_profile_pic.png"
          showSearch={true}
          onSearchClick={() => console.log('Search functionality')}
        />

        <div className="flex-1 relative overflow-hidden">
          <div
            className={`chatbot-container ${
              isMobile ? 'mobile-container' : ''
            } relative z-10`}
          >
            <ChatbotWithDividers state={chatState}>
              <Chatbot
                key={chatKey}
                config={stableConfig}
                messageParser={stableMessageParser}
                actionProvider={stableActionProvider}
                saveMessages={handleSaveMessages}
              />
            </ChatbotWithDividers>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HausaChatbotApp;
