import React, { use, useState } from 'react';
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
  const [selectConversation, setSelectedConversation] = useState<string | null>(null);
  
  const handleSelectConversation = (user: any) => {
    setSelectedConversation(user.id);
  }
  return (
    <div
      onClick={onClick}
      className={`p-2 sm:p-4 cursor-pointer transition-all border-b border-slate-100 hover:bg-slate-50 ${
        isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
      }`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br bg-[#FFDDDD] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-[#A13737] text-sm sm:text-lg font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-slate-900 truncate text-sm sm:text-lg">
              {user.name}
            </h4>
            <span className="text-xs sm:text-xs text-slate-500 flex-shrink-0 ml-1 sm:ml-2">
              {user.lastMessageTime}
            </span>
          </div>
        </div>
      
      </div>
        <p className="text-xs sm:text-sm text-slate-600 truncate ml-10 sm:ml-0">{user.lastMessage}</p>
    </div>
  );
};
