import React from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="border-t border-slate-200 p-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            disabled={disabled}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed min-h-[44px] max-h-[120px]"
            />
          </div>

          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            disabled={disabled}
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
