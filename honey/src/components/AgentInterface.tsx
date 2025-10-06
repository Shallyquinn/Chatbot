import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  MoreHorizontal,
  User,
  Paperclip,
  Smile,
  Mic,
  Camera,
  Users,
  MessageCircle,
} from 'lucide-react';

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
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeTab, setActiveTab] = useState<
    'assigned' | 'channels' | 'agents'
  >('assigned');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAssignedUsers();
    fetchChannels();
    // Setup WebSocket would go here in a real implementation
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAssignedUsers = async () => {
    try {
      // Placeholder data - replace with actual API call
      const mockUsers: AssignedUser[] = [
        {
          id: '1',
          conversationId: 'conv-1',
          name: 'Abeni Coker',
          lastMessage: 'I need help with family planning options',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2,
          language: 'en',
        },
        {
          id: '2',
          conversationId: 'conv-2',
          name: 'Chidi Okwu',
          lastMessage: 'Thank you for the information',
          lastMessageTime: new Date(Date.now() - 300000).toISOString(),
          unreadCount: 0,
          language: 'en',
        },
      ];
      setAssignedUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch assigned users:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const mockChannels: Channel[] = [
        { id: '1', name: 'General Support', isActive: true },
        { id: '2', name: 'FPM Consultation', isActive: false },
        { id: '3', name: 'Emergency Support', isActive: false },
      ];
      setChannels(mockChannels);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      // Placeholder messages - replace with actual API call
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Hello, My name is Honey',
          timestamp: new Date(Date.now() - 600000),
          sender: 'bot',
          conversationId,
        },
        {
          id: '2',
          text: 'Please choose the language you want to chat with',
          timestamp: new Date(Date.now() - 580000),
          sender: 'bot',
          conversationId,
        },
        {
          id: '3',
          text: 'English',
          timestamp: new Date(Date.now() - 560000),
          sender: 'user',
          conversationId,
        },
        {
          id: '4',
          text: 'Perfect! How can I help you with family planning today?',
          timestamp: new Date(Date.now() - 540000),
          sender: 'bot',
          conversationId,
        },
        {
          id: '5',
          text: 'I would like to speak with a human agent please',
          timestamp: new Date(Date.now() - 300000),
          sender: 'user',
          conversationId,
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      conversationId: selectedConversation.conversationId,
      timestamp: new Date(),
      sender: 'agent',
    };

    try {
      // Add message optimistically to UI
      setMessages((prev) => [...prev, messageData]);
      setNewMessage('');

      // Update user's last message in the sidebar
      setAssignedUsers((prev) =>
        prev.map((user) =>
          user.conversationId === selectedConversation.conversationId
            ? {
                ...user,
                lastMessage: messageData.text,
                lastMessageTime: messageData.timestamp.toISOString(),
              }
            : user,
        ),
      );

      // Here you would send to your API
      // const response = await fetch('/api/agent/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(messageData)
      // });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove message from UI on error
      setMessages((prev) => prev.filter((m) => m.id !== messageData.id));
    }
  };

  const selectConversation = (user: AssignedUser) => {
    setSelectedConversation(user);
    fetchMessages(user.conversationId);

    // Mark messages as read
    setAssignedUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, unreadCount: 0 } : u)),
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAssignAgent = (agentName: string) => {
    console.log('Assigning to:', agentName);
    setShowMoreOptions(false);
  };

  const handlePauseChat = () => {
    console.log('Pausing chat');
    setShowMoreOptions(false);
  };

  const handleEndChat = () => {
    console.log('Ending chat');
    setShowMoreOptions(false);
  };

  const filteredUsers = assignedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const UserListItem: React.FC<{ user: AssignedUser; isActive: boolean }> = ({
    user,
    isActive,
  }) => (
    <div
      className={`p-4 cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors ${
        isActive ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
      }`}
      onClick={() => selectConversation(user)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-900">{user.name}</h4>
        <span className="text-xs text-slate-500">
          {new Date(user.lastMessageTime).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm text-slate-600 truncate mb-1">{user.lastMessage}</p>
      <div className="flex justify-between items-center">
        {user.language && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {user.language.toUpperCase()}
          </span>
        )}
        {user.unreadCount > 0 && (
          <span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-1 font-medium">
            {user.unreadCount}
          </span>
        )}
      </div>
    </div>
  );

  const MessageBubble: React.FC<{ message: Message; isFromAgent: boolean }> = ({
    message,
    isFromAgent,
  }) => (
    <div
      className={`flex mb-4 ${isFromAgent ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isFromAgent
            ? 'bg-emerald-600 text-white'
            : message.sender === 'bot'
              ? 'bg-slate-100 text-slate-900'
              : 'bg-white border border-slate-200 text-slate-900'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <span
          className={`text-xs mt-2 block ${
            isFromAgent ? 'text-emerald-100' : 'text-slate-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );

  const ChannelItem: React.FC<{ channel: Channel }> = ({ channel }) => (
    <div
      className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors ${
        channel.isActive
          ? 'bg-emerald-100 text-emerald-800'
          : 'hover:bg-slate-100'
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full mr-3 ${
          channel.isActive ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      ></div>
      <span className="text-sm font-medium flex-1">{channel.name}</span>
      <button 
        className="text-slate-400 hover:text-slate-600"
        aria-label="Channel options"
        title="Channel options"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex space-x-1 mb-4 bg-slate-100 rounded-lg p-1">
            {(['assigned', 'channels', 'agents'] as const).map((tab) => (
              <button
                key={tab}
                className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'assigned' && (
            <div>
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">
                  Assigned Conversations ({filteredUsers.length})
                </h3>
              </div>
              {filteredUsers.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  isActive={selectedConversation?.id === user.id}
                />
              ))}
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No assigned conversations</p>
                  <p className="text-sm">New assignments will appear here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="p-4">
              <div className="space-y-2">
                {channels.map((channel) => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="p-4">
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Agent directory coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-slate-200">
          <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
            Start New Conversation
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-600 font-bold text-lg">H</span>
                </div>
                <div>
                  <h2 className="font-semibold">Honey Chatbot</h2>
                  <p className="text-sm text-emerald-100">
                    Chatting with {selectedConversation.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
                  aria-label="Search messages"
                  title="Search messages"
                >
                  <Search className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button
                    className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    aria-label="More options"
                    title="More options"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {showMoreOptions && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10 min-w-48">
                      <button
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 text-sm"
                        onClick={() => handleAssignAgent('Another Agent')}
                      >
                        Assign to Another Agent
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 text-sm"
                        onClick={handlePauseChat}
                      >
                        Pause Conversation
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 text-sm"
                        onClick={handleEndChat}
                      >
                        End Conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white">
              <div className="max-w-4xl mx-auto">
                <div className="text-center text-slate-500 mb-6">
                  <p className="text-sm bg-slate-100 inline-block px-3 py-1 rounded-full">
                    Today
                  </p>
                </div>

                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isFromAgent={message.sender === 'agent'}
                  />
                ))}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <form onSubmit={sendMessage} className="flex items-end space-x-3">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Attach file"
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Add emoji"
                    title="Add emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Voice message"
                    title="Voice message"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Take photo"
                    title="Take photo"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type / to use a shortcut..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                      rows={1}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newMessage.trim()}
                    aria-label="Send message"
                    title="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
            <div className="text-center text-slate-500 max-w-md">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-slate-400" />
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

      {/* User Info Panel */}
      {selectedConversation && (
        <div className="w-64 bg-white border-l border-slate-200 p-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">
                {selectedConversation.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">
              {selectedConversation.name}
            </h3>
            <p className="text-sm text-slate-500">
              ID: {selectedConversation.id}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2 text-sm">
                Channel
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                Honey AI Chatbot
              </p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2 text-sm">
                Language
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                {selectedConversation.language?.toUpperCase() || 'EN'}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2 text-sm">
                Created On
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                {new Date().toLocaleDateString()}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2 text-sm">
                Status
              </h4>
              <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg font-medium">
                Active
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button className="w-full text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentInterface;
