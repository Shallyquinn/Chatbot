import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Header from './Header';
import { ConversationSidebar } from './agent/ConversationSidebar';
import { ChatArea } from './agent/ChatArea';
import { MessageInput } from './agent/MessageInput';
import { UserInfoPanel } from './agent/UserInfoPanel';
import ApiService from '../services/api.service';
import WebSocketService from '../services/websocket.service';

interface AssignedUser {
  id: string;
  conversationId: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  channel: string;
  language?: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'agent' | 'user' | 'bot';
  conversationId: string;
  avatar?: string;  
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
    
    const handleConversationUpdate = (data: any) => {
      console.log('Conversation updated:', data);
      fetchAssignedUsers(); // Refresh the list
    };
    
    // Subscribe to WebSocket events
    WebSocketService.on('NEW_MESSAGE', handleNewMessage);
    WebSocketService.on('NEW_ASSIGNMENT', handleNewAssignment);
    WebSocketService.on('CONVERSATION_UPDATE', handleConversationUpdate);
    
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
    setLoading(true);
    
    // ConversationSidebar has its own dummy data, so we'll use empty array here
    setAssignedUsers([]);
    setLoading(false);
    
    // TODO: Replace with actual API call when backend is ready
    // try {
    //   const response = await ApiService.getAssignedUsers();
    //   const users = response.data || response;
    //   const formattedUsers: AssignedUser[] = users.map((user: any) => ({
    //     id: user.id || user.userId,
    //     conversationId: user.conversationId || user.id,
    //     name: user.name || user.userName || 'Anonymous User',
    //     lastMessage: user.lastMessage || 'No messages yet',
    //     lastMessageTime: user.lastMessageTime || user.updatedAt || new Date().toISOString(),
    //     unreadCount: user.unreadCount || 0,
    //     language: user.language || 'en',
    //   }));
    //   setAssignedUsers(formattedUsers);
    // } catch (error) {
    //   console.error('Failed to fetch assigned users:', error);
    // }
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
    setLoading(true);
    
    // Use dummy messages for now
    const dummyMessages: Message[] = [
      {
        id: '1',
        text: 'Hello, My name is Honey',
        timestamp: new Date(Date.now() - 300000),
        sender: 'bot',
        conversationId: conversationId,
        avatar: '/Honey_profile_pic.png'
      },
      {
        id: '2',
        text: 'Please choose the language you want to chat with',
        timestamp: new Date(Date.now() - 240000),
        sender: 'bot',
        conversationId: conversationId,
        avatar: '/Honey_profile_pic.png'
      },
      {
        id: '3',
        text: 'English',
        timestamp: new Date(Date.now() - 180000),
        sender: 'user',
        conversationId: conversationId,
        avatar: '/default-user-avatar.png'
      }
    ];
    
    setMessages(dummyMessages);
    setLoading(false);
    
    // Join conversation room for real-time updates when WebSocket is available
    try {
      WebSocketService.joinConversation(conversationId);
    } catch (error) {
      console.log('WebSocket not available for joining conversation');
    }
    
    // TODO: Replace with actual API call when backend is ready
    // try {
    //   const response = await ApiService.getConversationMessages(conversationId);
    //   const messageData = response.data || response;
    //   const formattedMessages: Message[] = messageData.map((msg: any) => ({
    //     id: msg.id,
    //     text: msg.content || msg.text || msg.message,
    //     timestamp: new Date(msg.createdAt || msg.timestamp),
    //     sender: msg.senderType || msg.sender || (msg.isFromBot ? 'bot' : msg.isFromAgent ? 'agent' : 'user'),
    //     conversationId: msg.conversationId || conversationId,
    //   }));
    //   setMessages(formattedMessages);
    // } catch (error) {
    //   console.error('Failed to fetch messages:', error);
    // }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    const messageData: Message = {
      id: `msg-${Date.now()}`,
      text: messageText,
      conversationId: selectedConversation.conversationId,
      timestamp: new Date(),
      sender: 'agent',
    };

    // Add message to UI
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');

    // Update user's last message in the sidebar
    setAssignedUsers((prev) =>
      prev.map((user) =>
        user.conversationId === selectedConversation.conversationId
          ? {
              ...user,
              lastMessage: messageText,
              lastMessageTime: new Date().toISOString(),
            }
          : user
      )
    );
    
    // Send via WebSocket when available
    try {
      WebSocketService.sendMessage(
        selectedConversation.conversationId,
        messageText,
        selectedConversation.id,
        'agent'
      );
    } catch (error) {
      console.log('WebSocket not available for sending message');
    }
    
    // TODO: Replace with actual API call when backend is ready
    // try {
    //   const response = await ApiService.sendAgentMessage(
    //     selectedConversation.conversationId,
    //     messageText
    //   );
    //   const sentMessage = response.data || response;
    //   // Update message with real ID from backend
    //   setMessages((prev) =>
    //     prev.map((m) =>
    //       m.id === messageData.id
    //         ? {
    //             ...m,
    //             id: sentMessage.id || messageData.id,
    //             timestamp: new Date(sentMessage.createdAt || m.timestamp),
    //           }
    //         : m
    //     )
    //   );
    // } catch (error) {
    //   console.error('Failed to send message:', error);
    //   setMessages((prev) => prev.filter((m) => m.id !== messageData.id));
    // }
  };

  const selectConversation = (user: AssignedUser) => {
    // Leave previous conversation
    if (selectedConversation) {
      WebSocketService.leaveConversation(selectedConversation.conversationId);
    }
    
    setSelectedConversation(user);
    fetchMessages(user.conversationId);

    // Mark messages as read
    setAssignedUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, unreadCount: 0 } : u)),
    );

  };





  

  const filteredUsers = assignedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );


  return (
    <div className="flex flex-col sm:flex-row bg-white h-screen">
      {/* Sidebar using ConversationSidebar component */}
           <ConversationSidebar
        assignedUsers={filteredUsers}
        selectedConversation={selectedConversation}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectConversation={selectConversation}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Chat Area */}
      <div className=' flex-1 flex flex-col'>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <Header className="shadow-md" />
            
            {/* Messages using ChatArea component */}
            {loading && messages.length === 0 ? (
              <div className="flex-1  flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                  <p className="text-slate-500 text-sm">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">Start the conversation</p>
                </div>
              </div>
            ) : (
              <ChatArea messages={messages} user={selectedConversation} />
            )}

            {/* Message Input using MessageInput component */}
            <div className='bg-[#FFFDF7]'>
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={sendMessage}
                disabled={loading}
                placeholder="Type your message..."
              />
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
            <div className="text-center text-slate-500 max-w-md">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-14 w-14 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No conversation selected
              </h3>
              <p className="text-slate-600 mb-4">
                Choose a conversation from the sidebar to start chatting with
                users who need assistance.
              </p>
              <div className="text-sm text-slate-500">
                <p>💡 Tip: Use keyboard shortcuts for faster responses</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Info Panel using UserInfoPanel component */}
      {selectedConversation && (
        <UserInfoPanel user={selectedConversation} />
      )}
    </div>
  );
};

export default AgentInterface;
