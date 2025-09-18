import React, { useEffect, useState, useRef } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "./chatbot/config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";
// import MessageParser from "./chatbot/MessageParserWrapper";
// import ActionProvider from "./chatbot/ActionProviderWrapper";
// import { supabase } from "./supabaseClient";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeDropdown from "./components/ThemeDropdown";
import "./App.css";

const AppContent: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const chatContainerRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth >= 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Auto scroll to bottom on new messages
  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     const messageContainer = chatContainerRef.current.querySelector(
  //       ".react-chatbot-kit-chat-message-container"
  //     );
  //     if (messageContainer) {
  //       messageContainer.scrollTop = messageContainer.scrollHeight;
  //     }
  //   }
  // }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex p-0 sm:p-4 transition-colors duration-300">
      <div
        className={`w-full h-full ${
          isMobile ? "h-screen" : "max-w-md h-[600px]"
        } shadow-xl overflow-hidden rounded-lg bg-white dark:bg-gray-800 transition-colors duration-300`}
        ref={chatContainerRef}
      >
        <div className="flex flex-row items-center bg-emerald-800 dark:bg-emerald-900 justify-between px-3 sm:px-4 py-3 transition-colors duration-300">
          <div className="flex justify-between w-full">
            <div className="flex-row flex">
            <div className="w-15 h-15 sm:h-20 sm:w-20 rounded-full bg-white flex items-center justify-center mr-2 sm:mr-3 overflow-hidden">
              <img
                src="../Honey_profile_pic.png"
                alt="honey"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                  const nextElement = img.nextElementSibling as HTMLDivElement;
                  if (nextElement) {
                    nextElement.style.display = "flex";
                  }
                }}
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white text-base sm:text-lg font-semibold mb-0">
                Honey Chatbot
              </span>
              <span className="text-white text-opacity-80 text-xs sm:text-sm">
                Family Planning Assistant
              </span>
            </div>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-2">
            <button className="p-1 sm:p-1.5 text-white hover:bg-emerald-700 rounded-full transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="md:h-10 md:w-10 sm:h-8 sm:w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <ThemeDropdown />
          </div>
            
          </div>
          
        </div>

        {/* Chat area with WhatsApp background */}
        <div className="flex-1 relative">
          <div
            className={`chatbot-container ${
              isMobile ? "mobile-container" : ""
            } relative z-10`}
          >
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
