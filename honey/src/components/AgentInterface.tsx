import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Header from './Header';
import ApiService from '../services/api.service';
import WebSocketService from '../services/websocket.service';
import { ConversationSidebar } from './agent/ConversationSidebar';
import { ChatArea } from './agent/ChatArea';
import { MessageInput } from './agent/MessageInput';
import { UserInfoPanel } from './agent/UserInfoPanel';
import { AgentStatusIndicator } from './agent/AgentStatusIndicator';

interface AssignedUser {
  id: string;
  conversationId: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  language?: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'agent' | 'user' | 'bot';
  conversationId: string;
  avatar?: string;
  attachments?: any[];
}

interface Channel {
  id: string;
  name: string;
  isActive: boolean;
}

const AgentInterface: React.FC = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<AssignedUser | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<
    'channels' | 'agents' | 'admin'
  >('channels');
  const [loading, setLoading] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'away' | 'busy'>('online');

  useEffect(() => {
    // Get agent info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Register agent with WebSocket
        WebSocketService.registerAsAgent(user.id, {
          name: user.name,
          email: user.email,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Fetch initial data
    fetchAssignedUsers();
    fetchChannels();
    
    // Setup WebSocket listeners for real-time updates
    const handleNewMessage = (data: any) => {
      const message: Message = {
        id: data.id,
        text: data.content || data.text,
        timestamp: new Date(data.createdAt || data.timestamp),
        sender: data.senderType || data.sender,
        conversationId: data.conversationId,
      };
      
      setMessages((prev) => [...prev, message]);
      
      // Update last message in sidebar
      setAssignedUsers((prev) =>
        prev.map((user) =>
          user.conversationId === data.conversationId
            ? {
                ...user,
                lastMessage: message.text,
                lastMessageTime: message.timestamp.toISOString(),
                unreadCount: selectedConversation?.conversationId === data.conversationId 
                  ? 0 
                  : user.unreadCount + 1,
              }
            : user
        )
      );
    };
    
    const handleNewAssignment = (data: any) => {
      console.log('New conversation assigned:', data);
      fetchAssignedUsers(); // Refresh the list
    };
    
    const handleUserTyping = (data: any) => {
      if (data.conversationId === selectedConversation?.conversationId) {
        setUserTyping(data.isTyping);
        if (data.isTyping) {
          // Auto-hide after 3 seconds
          setTimeout(() => setUserTyping(false), 3000);
        }
      }
    };
    
    const handleConversationUpdate = (data: any) => {
      console.log('Conversation updated:', data);
      fetchAssignedUsers(); // Refresh the list
    };
    
    // Subscribe to WebSocket events
    WebSocketService.on('NEW_MESSAGE', handleNewMessage);
    WebSocketService.on('NEW_ASSIGNMENT', handleNewAssignment);
    WebSocketService.on('CONVERSATION_UPDATE', handleConversationUpdate);
    WebSocketService.on('user_typing', handleUserTyping);
    
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchAssignedUsers();
    }, 30000);
    
    // Cleanup on unmount
    return () => {
      WebSocketService.off('NEW_MESSAGE', handleNewMessage);
      WebSocketService.off('NEW_ASSIGNMENT', handleNewAssignment);
      WebSocketService.off('CONVERSATION_UPDATE', handleConversationUpdate);
      clearInterval(refreshInterval);
      
      if (selectedConversation) {
        WebSocketService.leaveConversation(selectedConversation.conversationId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAssignedUsers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAssignedUsers();
      const users = response.data || response;
      
      // Transform backend data to match interface
      const formattedUsers: AssignedUser[] = users.map((user: any) => ({
        id: user.id || user.userId,
        conversationId: user.conversationId || user.id,
        name: user.name || user.userName || 'Anonymous User',
        lastMessage: user.lastMessage || 'No messages yet',
        lastMessageTime: user.lastMessageTime || user.updatedAt || new Date().toISOString(),
        unreadCount: user.unreadCount || 0,
        language: user.language || 'en',
      }));
      
      setAssignedUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to fetch assigned users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await ApiService.getChannels();
      const channelData = response.data || response;
      
      const formattedChannels: Channel[] = channelData.map((channel: any) => ({
        id: channel.id,
        name: channel.name || 'Unnamed Channel',
        isActive: channel.isActive || channel.status === 'active',
      }));
      
      // Channels are fetched but not displayed in modular version
      console.log('Channels loaded:', formattedChannels);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await ApiService.getConversationMessages(conversationId);
      const messageData = response.data || response;
      
      const formattedMessages: Message[] = messageData.map((msg: any) => ({
        id: msg.id,
        text: msg.content || msg.text || msg.message,
        timestamp: new Date(msg.createdAt || msg.timestamp),
        sender: msg.senderType || msg.sender || (msg.isFromBot ? 'bot' : msg.isFromAgent ? 'agent' : 'user'),
        conversationId: msg.conversationId || conversationId,
      }));
      
      setMessages(formattedMessages);
      
      // Join conversation room for real-time updates
      WebSocketService.joinConversation(conversationId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !selectedConversation) return;

    const tempId = `msg-${Date.now()}`;
    const messageData: Message = {
      id: tempId,
      text: messageText.trim(),
      conversationId: selectedConversation.conversationId,
      timestamp: new Date(),
      sender: 'agent',
    };

    try {
      // Add message optimistically to UI
      setMessages((prev) => [...prev, messageData]);
      setNewMessage('');

      // Send to backend API
      const response = await ApiService.sendAgentMessage(
        selectedConversation.conversationId,
        messageText.trim()
      );
      
      const sentMessage = response.data || response;
      
      // Update message with real ID from backend
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: sentMessage.id || tempId,
                timestamp: new Date(sentMessage.createdAt || m.timestamp),
              }
            : m
        )
      );

      // Update user's last message in the sidebar
      setAssignedUsers((prev) =>
        prev.map((user) =>
          user.conversationId === selectedConversation.conversationId
            ? {
                ...user,
                lastMessage: messageText.trim(),
                lastMessageTime: new Date().toISOString(),
              }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const handleConversationSelect = (user: AssignedUser) => {
    if (selectedConversation?.conversationId !== user.conversationId) {
      // Leave previous conversation
      if (selectedConversation) {
        WebSocketService.leaveConversation(selectedConversation.conversationId);
      }
      
      setSelectedConversation(user);
      fetchMessages(user.conversationId);
      
      // Mark as read
      setAssignedUsers((prev) =>
        prev.map((u) =>
          u.conversationId === user.conversationId
            ? { ...u, unreadCount: 0 }
            : u
        )
      );
    }
  };



  const filteredUsers = assignedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <ConversationSidebar
        assignedUsers={filteredUsers}
        selectedConversation={selectedConversation}
        onSelectConversation={handleConversationSelect}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        {selectedConversation ? (
          <>
            <div className="border-b border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {selectedConversation.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Conversation ID: {selectedConversation.conversationId}
                    </p>
                  </div>
                </div>
                <AgentStatusIndicator 
                  status={agentStatus} 
                  onStatusChange={setAgentStatus}
                />
              </div>
            </div>
            
            <ChatArea 
              messages={messages}
              isUserTyping={userTyping}
              userName={selectedConversation.name}
            />
            
            <MessageInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={sendMessage}
              disabled={loading}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
      
      {selectedConversation && (
        <UserInfoPanel 
          user={selectedConversation}
        />
      )}
    </div>
  );
};

export default AgentInterface;
