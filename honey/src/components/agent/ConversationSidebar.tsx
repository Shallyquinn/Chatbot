import React from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { ConversationListItem } from './ConversationListItem';

interface AssignedUser {
  id: string;
  conversationId: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
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
  const filteredUsers = assignedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Tabs */}
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

      {/* Search */}
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

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-emerald-600" />
        <h3 className="font-semibold text-slate-900">
          Assigned Users ({assignedUsers.length})
        </h3>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              {searchTerm
                ? 'No conversations found'
                : 'No assigned conversations yet'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
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
