import React, { useRef, useEffect } from 'react';
import { TypingIndicator } from './TypingIndicator';
import { MessageReceipt } from './MessageReceipt';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'agent' | 'user' | 'bot';
  conversationId: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatAreaProps {
  messages: Message[];
  isUserTyping?: boolean;
  userName?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isUserTyping = false, userName = 'User' }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUserTyping]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'agent' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.sender === 'agent'
                  ? 'bg-emerald-600 text-white'
                  : message.sender === 'bot'
                  ? 'bg-blue-100 text-slate-900'
                  : 'bg-white text-slate-900 border border-slate-200'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span
                  className={`text-xs ${
                    message.sender === 'agent'
                      ? 'text-emerald-100'
                      : 'text-slate-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>
                {message.sender === 'agent' && message.status && (
                  <MessageReceipt status={message.status} />
                )}
              </div>
            </div>
          </div>
        ))}
        {isUserTyping && <TypingIndicator userName={userName} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
