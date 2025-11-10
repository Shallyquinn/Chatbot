import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './chatbot/config';
import MessageParser from './chatbot/MessageParser';
import ActionProvider from './chatbot/ActionProvider';
import ChatbotWithDividers from './components/ChatbotWithDividers';
import { ChatbotState, ChatMessage } from './chatbot/types';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import AdminLogin from './pages/AdminLogin';
import AgentLogin from './pages/AgentLogin';
import AdminDashboard from './components/AdminDashboard';
import AgentInterface from './components/AgentInterface';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Your existing chatbot component
const ChatbotApp: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // Use stable chatKey - don't change it unless absolutely necessary
  const chatKey = useMemo(() => 'chatbot-session', []);
  const [chatState, setChatState] = useState<ChatbotState>(config.initialState);
  const chatContainerRef = useRef(null);
  const lastMessageCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Memoize save handler to prevent infinite re-renders
  const handleSaveMessages = useCallback((messages: ChatMessage[]) => {
    // Only save if message count actually changed
    if (messages.length !== lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      try {
        localStorage.setItem('chat_messages', JSON.stringify(messages));
        const currentState = JSON.parse(localStorage.getItem('chat_state') || '{}');
        localStorage.setItem('chat_state', JSON.stringify({ ...currentState, messages }));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  }, []);

  // Stable config object - memoized to prevent Chatbot re-instantiation
  const stableConfig = useMemo(() => config, []);
  
  // Stable MessageParser - memoized to prevent Chatbot re-instantiation
  const stableMessageParser = useMemo(() => MessageParser, []);
  
  // Stable ActionProvider - memoized to prevent Chatbot re-instantiation
  const stableActionProvider = useMemo(() => ActionProvider, []);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth >= 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Force chatbot to re-render with saved state on mount - ONCE only
  useEffect(() => {
    if (isInitializedRef.current) return; // Prevent re-initialization
    isInitializedRef.current = true;
    
    const savedState = localStorage.getItem('chat_state');
    if (savedState) {
      console.log('✅ Restored state from localStorage:', JSON.parse(savedState));
      try {
        const parsed = JSON.parse(savedState);
        setChatState(parsed);
        lastMessageCountRef.current = parsed.messages?.length || 0;
      } catch (error) {
        console.error('Failed to parse saved state:', error);
      }
    } else {
      console.log('ℹ️ No saved state found, starting fresh');
    }
  }, []);

  // Listen for state changes from localStorage - DISABLED to prevent construction storm
  // The chatbot state is managed internally by react-chatbot-kit
  // Cross-tab sync is not critical for this use case
  useEffect(() => {
    // DISABLED: localStorage polling causes unnecessary re-renders
    // which triggers ActionProvider re-instantiation in react-chatbot-kit
    //
    // If cross-tab sync is needed in the future, implement using:
    // 1. window.addEventListener('storage', handler) for cross-tab events
    // 2. Only update on actual user-driven changes, not on mount
    // 3. Use a separate state management solution (Redux, Zustand, etc.)
    
    console.log('📝 LocalStorage polling disabled to prevent re-render storm');
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

    // Scroll after a short delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [chatState.messages]);

  return (
    <div className="min-h-screen bg-slate-100 flex p-0 sm:p-4 transition-colors duration-300">
      <div
        className={`w-full flex flex-col ${
          isMobile ? 'h-screen' : 'max-w-md min-h-screen'
        } shadow-xl overflow-hidden rounded-lg bg-white dark:bg-gray-800 transition-colors duration-300`}
        ref={chatContainerRef}
      >
        <Header 
          profileImage="./Honey_profile_pic.png"
          showSearch={true}
          onSearchClick={() => console.log('Search functionality')}
        />

        {/* Chat area with WhatsApp background */}
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

// New App component with routing
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Main chatbot route (default) */}
          <Route path="/" element={<ChatbotApp />} />
          <Route path="/chat" element={<ChatbotApp />} />

          {/* Authentication routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/agent/login" element={<AgentLogin />} />
          
          {/* Shorthand routes for convenience */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/agent" element={<Navigate to="/agent/login" replace />} />

          {/* Protected admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected agent routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute requiredRole="agent">
                <AgentInterface />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes to chatbot */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
