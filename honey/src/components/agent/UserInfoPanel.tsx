import React from 'react';

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

interface UserInfoPanelProps {
  user: AssignedUser;
}

export const UserInfoPanel: React.FC<UserInfoPanelProps> = ({ user }) => {
  return (
     <div className="w-full sm:w-80 lg:w-72 xl:w-80 border-[#949494] bg-white overflow-y-auto space-y-6">
      {/* User Profile */}
      <div className="p-6 border-b border-[#DEDEDE]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center text-lg font-semibold text-red-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-[#383838]">{user.name}</h3>
            <p className="text-sm text-muted-foreground text-[#949494]">ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* Channel Info */}
      <div className="p-6 border-b border-[#DEDEDE]">
        <h4 className="text-sm font-semibold text-foreground mb-2 text-[#383838]">Channel</h4>
        <p className="text-sm text-muted-foreground text-[#949494]">{user.channel}</p>
      </div>

      {/* Created On */}
      <div className="p-6 border-b border-[#DEDEDE]">
        <h4 className="text-sm font-semibold text-foreground mb-2 text-[#383838]">Created On</h4>
        <p className="text-sm text-muted-foreground text-[#949494]"> {new Date().toLocaleDateString()}</p>
      </div>


      {/* Opt-In */}
      <div className="p-6 border-b border-[#DEDEDE]">
        <h4 className="text-sm font-semibold text-foreground mb-2 text-[#383838]">Opt-In</h4>
        <p className="text-sm text-muted-foreground text-[#949494]">False</p>
      </div>

      {/* Fields */}
      <div className="p-6 border-b border-[#DEDEDE]">
        <h4 className="text-sm font-semibold text-foreground mb-3 text-[#383838]">Fields (22)</h4>
      </div>

      {/* Notes */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-foreground mb-3 text-[#383838]">Notes (22)</h4>
        <div className="space-y-2">
          <div className="text-xs bg-muted p-2 rounded text-muted-foreground text-[#949494]">
            User interested in family planning resources
          </div>
          <div className="text-xs bg-muted p-2 rounded text-muted-foreground">Follow up scheduled for next week</div>
        </div>
      </div>
    </div>
  );
};
