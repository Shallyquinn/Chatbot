import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Define the context type
interface TypingContextType {
  typing: boolean;
  setTyping: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a default value
const TypingContext = createContext<TypingContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  const [typing, setTyping] = useState<boolean>(true);

  useEffect(() => {
    // Get the element by class name
    const chatInputContainer = document.querySelector(
      ".react-chatbot-kit-chat-input-container"
    );
    console.log("typing = ", typing);
    if (chatInputContainer) {
      // Toggle the display based on the `typing` state
      chatInputContainer.style.display = typing ? "block" : "none";
    }
  }, [typing]);

  const value: TypingContextType = {
    typing,
    setTyping,
  };

  return <TypingContext.Provider value={value}>{children}</TypingContext.Provider>;
};

// Custom hook to use the TypingContext
export const useProvider = (): TypingContextType => {
  const context = useContext(TypingContext);
  if (context === undefined) {
    throw new Error("useProvider must be used within a Provider");
  }
  return context;
};