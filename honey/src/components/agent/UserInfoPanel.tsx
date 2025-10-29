import React from 'react';

interface AssignedUser {
  id: string;
  conversationId: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  language?: string;
}

interface UserInfoPanelProps {
  user: AssignedUser;
}

export const UserInfoPanel: React.FC<UserInfoPanelProps> = ({ user }) => {
  return (
    <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className="font-semibold text-slate-900">{user.name}</h3>
        <p className="text-sm text-slate-500">ID: {user.id}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-slate-900 mb-2 text-sm">Channel</h4>
          <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
            Honey AI Chatbot
          </p>
        </div>

        <div>
          <h4 className="font-medium text-slate-900 mb-2 text-sm">Language</h4>
          <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
            {user.language?.toUpperCase() || 'EN'}
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
          <h4 className="font-medium text-slate-900 mb-2 text-sm">Status</h4>
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
  );
};
