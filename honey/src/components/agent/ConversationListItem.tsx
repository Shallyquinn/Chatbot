import React from 'react';
import { User } from 'lucide-react';

interface AssignedUser {
  id: string;
  conversationId: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  language?: string;
}

interface ConversationListItemProps {
  user: AssignedUser;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  user,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all border-b border-slate-100 hover:bg-slate-50 ${
        isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-slate-900 text-sm truncate">
              {user.name}
            </h4>
            <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
              {user.lastMessageTime}
            </span>
          </div>

          <p className="text-sm text-slate-600 truncate">{user.lastMessage}</p>

          {user.unreadCount > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                {user.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
