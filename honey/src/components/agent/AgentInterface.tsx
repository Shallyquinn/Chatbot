import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'bot' | 'agent';
  timestamp: Date;
  sender?: string;
}

interface Conversation {
  id: string;
  conversationId: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageAt: Date;
  status: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  messages: Message[];
}

interface AgentStats {
  activeConversations: number;
  queuedConversations: number;
  totalConversationsToday: number;
  averageResponseTime: number;
}

// Get API URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AgentInterface() {
  const [agentId, setAgentId] = useState<string>('');
  const [agentName, setAgentName] = useState<string>('Agent');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [queuedConversations, setQueuedConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [stats, setStats] = useState<AgentStats>({
    activeConversations: 0,
    queuedConversations: 0,
    totalConversationsToday: 0,
    averageResponseTime: 0,
  });
  const [expandedSection, setExpandedSection] = useState<'assigned' | 'queued'>('assigned');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get agent from localStorage or authentication
    const storedAgentId = localStorage.getItem('agent_id');
    const storedAgentName = localStorage.getItem('agent_name');
    
    if (storedAgentId) {
      setAgentId(storedAgentId);
      setAgentName(storedAgentName || 'Agent');
      setIsLoading(true);
      fetchDashboard(storedAgentId);
      fetchConversations(storedAgentId).finally(() => setIsLoading(false));
      
      // Poll for updates every 10 seconds
      const interval = setInterval(() => {
        fetchConversations(storedAgentId);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const fetchDashboard = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setError(null);
      } else {
        console.error('Failed to fetch dashboard: HTTP', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      setError('Unable to load dashboard data');
    }
  };

  const fetchConversations = async (id: string) => {
    try {
      const [assignedResponse, queuedResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/agents/${id}/conversations/assigned`),
        fetch(`${API_BASE_URL}/agents/${id}/conversations/queued`),
      ]);

      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json();
        setConversations(assignedData);
        setError(null);
      } else {
        console.error('Failed to fetch assigned conversations: HTTP', assignedResponse.status);
      }

      if (queuedResponse.ok) {
        const queuedData = await queuedResponse.json();
        setQueuedConversations(queuedData);
      } else {
        console.error('Failed to fetch queued conversations: HTTP', queuedResponse.status);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setError('Unable to load conversations');
    }
  };

  const handlePickConversation = async (conversation: Conversation) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/agents/${agentId}/conversations/${conversation.conversationId}/assign`,
        { method: 'POST' }
      );

      if (response.ok) {
        await fetchConversations(agentId);
        setSelectedConversation(conversation);
        setError(null);
      } else {
        setError('Failed to pick conversation');
      }
    } catch (error) {
      console.error('Failed to pick conversation:', error);
      setError('Unable to pick conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const messageToSend = messageInput;
    setMessageInput('');
    setIsSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/agents/${agentId}/conversations/${selectedConversation.conversationId}/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageToSend }),
        }
      );

      if (response.ok) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: messageToSend,
          type: 'agent',
          timestamp: new Date(),
          sender: agentName,
        };

        setSelectedConversation({
          ...selectedConversation,
          messages: [...(selectedConversation.messages || []), newMessage],
        });
        setError(null);
      } else {
        setError('Failed to send message');
        setMessageInput(messageToSend); // Restore message on failure
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Unable to send message');
      setMessageInput(messageToSend); // Restore message on failure
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-[360px] border-r border-[#949494] flex flex-col">
        {/* Header Tabs */}
        <div className="border-b border-[#949494]">
          <div className="flex items-center justify-center gap-4 py-3">
            <Button variant="ghost" className="text-[#989898]">
              Channels
            </Button>
            <div className="flex flex-col items-center">
              <Button variant="ghost" className="text-[#006045] font-medium">
                Agents
              </Button>
              <div className="w-[85px] h-[6px] bg-[#006045] rounded-full" />
            </div>
            <Button variant="ghost" className="text-[#989898]">
              Admin
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-600 hover:text-red-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Channel Info */}
        <div className="p-6 border-b border-[#949494]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-[#25D366]" />
              <span className="text-[#383838] text-lg font-medium">
                DKT AI Chatbot
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setExpandedSection(expandedSection === 'assigned' ? 'queued' : 'assigned')
              }
            >
              {expandedSection === 'assigned' ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Assigned Users Section */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4">
            <h3 className="text-[#383838] text-lg font-medium">Assigned Users</h3>
          </div>

          <ScrollArea className="flex-1">
            {/* Loading State */}
            {isLoading && conversations.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#006045] animate-spin" />
              </div>
            ) : (
              <>
                {/* Assigned Conversations */}
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full px-9 py-3.5 flex flex-col gap-3.5 text-left hover:bg-[#f8f8f8] transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-[#f8f8f8]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-8 h-8 bg-[#ffdddd]">
                          <AvatarFallback className="text-[#a13737] font-semibold">
                            {getInitials(conv.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[#383838] font-medium">{conv.userName}</span>
                      </div>
                      <span className="text-[#a2a2a2] text-sm">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-[#7b7b7b] text-sm truncate">{conv.lastMessage}</p>
                  </button>
                ))}
              </>
            )}

            {/* Queued Conversations */}
            {expandedSection === 'queued' && queuedConversations.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="px-6 py-2">
                  <h4 className="text-[#7b7b7b] text-sm font-medium">
                    Queued ({queuedConversations.length})
                  </h4>
                </div>
                {queuedConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handlePickConversation(conv)}
                    disabled={isLoading}
                    className="w-full px-9 py-3.5 flex flex-col gap-3.5 text-left hover:bg-[#f8f8f8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-8 h-8 bg-[#ffdddd]">
                          <AvatarFallback className="text-[#a13737] font-semibold">
                            {getInitials(conv.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[#383838] font-medium">{conv.userName}</span>
                      </div>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[#006045] animate-spin" />
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Pick
                        </Badge>
                      )}
                    </div>
                    <p className="text-[#7b7b7b] text-sm truncate">{conv.lastMessage}</p>
                  </button>
                ))}
              </>
            )}
          </ScrollArea>
        </div>

        {/* Stats Footer */}
        <div className="p-6 border-t border-[#949494] space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#7b7b7b]">Active Chats:</span>
            <span className="text-[#383838] font-medium">{stats.activeConversations}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#7b7b7b]">Today's Total:</span>
            <span className="text-[#383838] font-medium">
              {stats.totalConversationsToday}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#7b7b7b]">Avg Response:</span>
            <span className="text-[#383838] font-medium">
              {stats.averageResponseTime}s
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-[#e0e0e0] px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-[#ffdddd]">
                  <AvatarFallback className="text-[#a13737] font-semibold">
                    {getInitials(selectedConversation.userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-[#383838] font-medium">
                    {selectedConversation.userName}
                  </h3>
                  <p className="text-[#7b7b7b] text-sm">
                    User ID: {selectedConversation.userId.substring(0, 8)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-[#d5ece5] text-[#006045] border-[#006045]"
                >
                  Active
                </Badge>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-4xl mx-auto">
                {selectedConversation.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'agent' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type !== 'agent' && (
                      <Avatar className="w-8 h-8 bg-[#ffdddd]">
                        <AvatarFallback className="text-[#a13737]">
                          {message.type === 'user' ? 'U' : 'AI'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.type === 'agent'
                          ? 'bg-[#006045] text-white'
                          : message.type === 'user'
                          ? 'bg-[#f0f0f0] text-[#383838]'
                          : 'bg-[#e3f2fd] text-[#383838]'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    {message.type === 'agent' && (
                      <Avatar className="w-8 h-8 bg-[#006045]">
                        <AvatarFallback className="text-white">A</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-[#e0e0e0] p-4">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageInput(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !isSending && handleSendMessage()}
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-[#006045] hover:bg-[#004d36]"
                  disabled={isSending || !messageInput.trim()}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-[#a2a2a2] mx-auto mb-4" />
              <h3 className="text-[#383838] text-xl font-medium mb-2">
                No Conversation Selected
              </h3>
              <p className="text-[#7b7b7b]">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
