import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatbotState } from '../chatbot/types';

export type Language = 'English' | 'Yoruba' | 'Hausa';

interface LanguageContextType {
  currentLanguage: Language;
  switchLanguage: (language: Language) => void;
  chatState: ChatbotState | null;
  setChatState: (state: ChatbotState) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect current language from URL
  const detectLanguageFromPath = (): Language => {
    const path = location.pathname;
    if (path.includes('/chat/yoruba')) return 'Yoruba';
    if (path.includes('/chat/hausa')) return 'Hausa';
    return 'English';
  };

  const [currentLanguage, setCurrentLanguage] = useState<Language>(detectLanguageFromPath);
  const [chatState, setChatState] = useState<ChatbotState | null>(null);

  // Load unified chat state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('chat_state');
    const savedLanguage = localStorage.getItem('selected_language') as Language;
    
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setChatState(parsed);
      } catch (error) {
        console.error('Failed to parse saved state:', error);
      }
    }
    
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Update language when URL changes
  useEffect(() => {
    const detectedLanguage = detectLanguageFromPath();
    if (detectedLanguage !== currentLanguage) {
      setCurrentLanguage(detectedLanguage);
      localStorage.setItem('selected_language', detectedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Save chat state to localStorage whenever it changes
  useEffect(() => {
    if (chatState) {
      localStorage.setItem('chat_state', JSON.stringify(chatState));
    }
  }, [chatState]);

  const switchLanguage = (language: Language) => {
    // Save current language preference
    localStorage.setItem('selected_language', language);
    setCurrentLanguage(language);

    // Navigate using React Router (no page reload)
    const pathMap: Record<Language, string> = {
      'English': '/chat',
      'Yoruba': '/chat/yoruba',
      'Hausa': '/chat/hausa'
    };

    navigate(pathMap[language], { replace: false });
  };

  const value: LanguageContextType = {
    currentLanguage,
    switchLanguage,
    chatState,
    setChatState,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
