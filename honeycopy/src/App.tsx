import React, { useEffect, useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './chatbot/config';
import MessageParser from './chatbot/MessageParser';
import ActionProvider from './chatbot/ActionProvider';
import { supabase } from './supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import './App.css';

const App: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <Card className={`w-full h-full ${isMobile ? 'h-screen' : 'max-w-full'} shadow-xl overflow-hidden`}>
        <CardHeader className="w-full flex flex-row items-center bg-amber-600 justify-between sm:px-2 p-2">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 flex items-center justify-center mr-3 overflow-hidden">
              <img 
                src='../Honey_profile_pic.png' 
                alt='honey'
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  const nextElement = img.nextElementSibling as HTMLDivElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div 
                className="text-white text-lg sm:text-xl font-bold w-full h-full flex items-center justify-center"
                style={{ display: 'none' }}
              >
                H
              </div>
            </div>
            <div className="flex flex-col justify-start items-start">
              <h2 className="text-white text-base sm:text-lg font-semibold">
                Honey AI Chatbot
              </h2>
              <span className="text-white text-opacity-80 text-xs sm:text-sm">
                Family Planning Assistant
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-1 sm:p-2 text-white hover:bg-amber-500 rounded-full transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-1 sm:p-2 text-white hover:bg-amber-500 rounded-full transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-chat-background">
          <div className={`chatbot-container ${isMobile ? 'mobile-container' : ''}`}>
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;