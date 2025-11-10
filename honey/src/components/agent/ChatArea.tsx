import React, { useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'agent' | 'user' | 'bot';
  conversationId: string;
  avatar?: string;
  name?: string;
  userInfo?: { name?: string; avatar?: string };
}

interface ChatAreaProps {
  messages: Message[];
  user?: { name?: string; avatar?: string };
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, user }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#FFFDF7]">
      <div className="max-w-4xl mx-auto space-y-4 flex flex-col">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.sender === 'user' ? 'items-start' : 'items-end'
              }`}
          >
            <div className={`flex gap-3 ${message.sender === 'bot' ? 'flex-row-reverse' : 'justify-start'}`}>
              <div className='flex flex-row items-center gap-2'>
                <span className='text-xs text-[#A2A2A2]'>
                  {formatTime(message.timestamp)}
                </span>
                <span className='text-sm font-semibold'>
                  {message.sender === 'bot' ? 'Honey Chatbot' : message.sender === 'agent' ? 'Agent' : message.userInfo?.name || user?.name || 'You'}
                </span>
                {message.sender === 'bot' ? (
                  <img
                    src="/Honey_profile_pic.png"
                    alt="Honey Chatbot Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                ) : message.avatar ? (
                  <img
                    src={message.avatar}
                    alt={`${message.name} Avatar`}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div
              className={`max-w-[70%] rounded-xl px-4 py-6 border border-[#D4D4D4] mx-3 ${message.sender === 'agent'
                  ? 'bg-[#E8F5E9] text-[#383838]'     
                  : message.sender === 'user'
                    ? 'bg-[#ffff] text-slate-900'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
