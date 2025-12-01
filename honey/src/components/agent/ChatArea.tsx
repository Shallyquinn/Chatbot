import React, { useRef, useEffect } from 'react';
import { TypingIndicator } from './TypingIndicator';
import { MessageReceipt } from './MessageReceipt';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'agent' | 'user' | 'bot';
  conversationId: string;
  avatar?: string;
  name?: string;
  userInfo?: { name?: string; avatar?: string };
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: {
    id: string;
    type: 'image' | 'document' | 'audio';
    file: File;
    url?: string;
    size?: number;
    duration?: number;
  }[];
}

interface ChatAreaProps {
  messages: Message[];
  user?: { name?: string; avatar?: string };
  typing?: boolean;
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
            <div
              className={`max-w-[70%] rounded-xl px-4 py-6 border border-[#D4D4D4] mx-3 ${message.sender === 'agent'
                  ? 'bg-[#E8F5E9] text-[#383838]'     
                  : message.sender === 'user'
                    ? 'bg-[#ffff] text-slate-900'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
            >
              {message.text && (
                <p>{message.text}</p>
              )}
              {message.attachments?.map((attachment) => (
                <div key={attachment.id} className='mb-3'>
                  {attachment.type === 'image' && attachment.url && (
                    <img
                      src={attachment.url}
                      alt={attachment.file.name}
                      className='rounded-xl max-w-56 h-auto object-cover cursor-pointer'
                      onClick={() => window.open(attachment.url, '_blank')}
                    />
                  )}

                  {attachment.type === 'document' && (
                    <div className='flex items-center gap-3 bg-gray-100 p-3 rounded-xl cursor-pointer hover:bg-gray-200'>
                      <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
                        <span className='text-white text-xs font-bold'>DOC</span>
                      </div>
                      <div className='flex flex-col'>
                        <span className='text-sm font-medium text-slate-900'>{attachment.file.name}</span>
                        <span className='text-xs text-slate-600'>{Math.round((attachment.size || 0) / 1024)} KB</span>
                      </div>
                    </div>
                  )}

                  {attachment.type === 'audio' && attachment.url && (
                    <div className='flex items-center gap-3 bg-green-50 p-3 rounded-xl'>
                      <div className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center'>
                        <span className='text-white text-xs font-bold'>🎵</span>
                      </div>
                      <div className='flex flex-col'>
                        <span className='text-sm font-medium text-slate-900'>Voice Message</span>
                        <span className='text-xs text-slate-600'>{attachment.duration}s • {Math.round((attachment.size || 0) / 1024)} KB</span>
                      </div>
                      <audio controls className='ml-2'>
                        <source src={attachment.url} type="audio/wav" />
                      </audio>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {isUserTyping && <TypingIndicator userName={userName} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
