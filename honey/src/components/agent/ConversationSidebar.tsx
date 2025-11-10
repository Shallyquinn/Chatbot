import React, { useState } from 'react';
import { Search, MessageCircle, ChevronUp, ChevronDown, Menu, X } from 'lucide-react';
import { ConversationListItem } from './ConversationListItem';

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



interface ConversationSidebarProps {
  assignedUsers: AssignedUser[];
  selectedConversation: AssignedUser | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectConversation: (user: AssignedUser) => void;
  activeTab: 'channels' | 'agents' | 'admin';
  onTabChange: (tab: 'channels' | 'agents' | 'admin') => void;

}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  assignedUsers,
  selectedConversation,
  searchTerm,
  onSearchChange,
  onSelectConversation,
  activeTab,
  onTabChange,
}) => {
  const [expandedChannels, setExpandedChannels] = useState<string[]>(["DKT AI CHATBOT"]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const channels = [
    {id: "honey-banana", name: "HoneyandBanana Bot", image: "/messenger.png"},
    {id: "honey", name: "Honey Bot", image: "/Telegram.png"},
    {id: "dkt", name: "DKT AI Chatbot", image: "/Whatsapp.png"},
  ];



  const dummyUsers: AssignedUser[] = [
    {
      id: "1",
      conversationId: "conv-1",
      name: "Abeni Coker",
      lastMessage: "Can you help with family planning for a...",
      lastMessageTime: "5:05pm",
      unreadCount: 1,
      channel: "DKT AI Chatbot",
      language: "English"
    },
    {
      id: "2",
      conversationId: "conv-2",
      name: "John Smith",
      lastMessage: "I need information about contraceptives",
      lastMessageTime: "4:32pm",
      unreadCount: 2,
      channel: "Honey Bot",
      language: "English"
    },
    {
      id: "3",
      conversationId: "conv-3",
      name: "Sarah Johnson",
      lastMessage: "Thank you for your help!",
      lastMessageTime: "3:15pm",
      unreadCount: 0,
      channel: "HoneyandBanana Bot",
      language: "English"
    }
  ];

  const allUsers = assignedUsers.length > 0 ? assignedUsers : dummyUsers;
  const filteredChats = allUsers.filter((user)=> 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleChannel = (channelId: string) => {
    setExpandedChannels((prev) => 
    prev.includes(channelId)
      ? prev.filter((id) => id !== channelId)
      : [...prev, channelId]
    );
  };
  

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-full sm:w-80 lg:w-72 xl:w-80'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300`}>
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-2 border-b border-slate-200">
        {!isCollapsed && <span className="text-sm font-medium text-slate-700">Conversations</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>
      {/* Tabs */}
      {!isCollapsed && (
      <div className="flex items-center justify-around border-b border-slate-200 px-4 py-3">
        <button
          onClick={() => onTabChange('channels')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'channels'
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Channels
        </button>
        <button
          onClick={() => onTabChange('agents')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'agents'
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Agents
        </button>
        <button
          onClick={() => onTabChange('admin')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'admin'
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Admin
        </button>
      </div>
      )}

      {/* Search */}
      {!isCollapsed && (
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>
      )}

      {/* Header */}
      {!isCollapsed && (
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-emerald-600" />
        <h3 className="font-semibold text-slate-900">
          Assigned Users ({filteredChats.length})
        </h3>
      </div>
      )}

      {!isCollapsed && (
      <div className='flex overflow-y-auto border-b border-slate-200 mb-6'>
        <div className='p-2'>
          {channels.map((channel)=> (
            <div key={channel.id}>
              <button
              onClick={() => toggleChannel(channel.id)}
              className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium'
              >
                <img
                  src={channel.image}
                  alt={`${channel.name} icon`}
                  className="w-6 h-6 rounded-full"
                />
                <span className='flex-1 text-left'>{channel.name}</span>
                {expandedChannels.includes(channel.id) ? (
                  <ChevronUp size={8}/>
                ): (
                  <ChevronDown size={8}/>
                )}
              </button>
              {expandedChannels.includes(channel.id) && (
                <div className='ml-2 mt-1 space-y-1'>
                  {filteredChats.filter(user => 
                    channel.name === 'DKT AI Chatbot' || 
                    channel.name === 'Honey Bot' || 
                    channel.name === 'HoneyandBanana Bot'
                  ).map((user)=> (
                    <button
                    key={user.id}
                    onClick={() => onSelectConversation(user)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedConversation?.id === user.id
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                    >
                      <div className='flex flex-col'>
                        <span className='text-left font-medium'>{user.name}</span>
                        <span className='text-xs text-slate-500 truncate'>{user.lastMessage}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      )}
      

      {/* Conversation List */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              {searchTerm
                ? 'No conversations found'
                : 'No assigned conversations yet'}
            </p>
          </div>
        ) : isCollapsed ? (
          filteredChats.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectConversation(user)}
              className={`p-2 cursor-pointer transition-all hover:bg-slate-50 ${
                selectedConversation?.id === user.id ? 'bg-emerald-50' : ''
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br bg-[#FFDDDD] rounded-full flex items-center justify-center">
                <span className="text-[#A13737] text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          ))
        ) : (
          filteredChats.map((user) => (
            <ConversationListItem
              key={user.id}
              user={user}
              isSelected={selectedConversation?.id === user.id}
              onClick={() => onSelectConversation(user)}
            />
          ))
        )}
      </div>
    </div>
  );
};
