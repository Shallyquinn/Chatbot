import React from "react";
import { Card } from "@/components/ui/card";

export interface ChatMessageProps {
  message?: string;
  type: "bot" | "user";
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, type }) => {
  const isBot = type === "bot";
  
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <Card
        className={`max-w-[80%] p-4 ${
          isBot ? "bg-white" : "bg-orange-500 text-white"
        }`}
      >
        {message}
      </Card>
    </div>
  );
};

export default ChatMessage;
