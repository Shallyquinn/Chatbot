import React, { useState } from 'react';
import {PencilIcon,ImageIcon, Zap, FileText, List, SendHorizonal, Mic } from 'lucide-react';

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
  placeholder = 'Send a message to your user',
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  const [activeTab, setActiveTab] = useState<"reply" | "private">("reply")
  const [message, setMessage] = useState("");
  const tabs = [
    {id: "reply", label: "Reply"},
    {id: "private", label: "Private Note"}
  ]

  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      onChange(value + '[Voice note recorded]');
    } else {
      // Start recording
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        // TODO: Implement actual recording logic
      } catch (error) {
        alert('Microphone access denied or not available');
      }
    }
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onChange(value + `[Image: ${file.name}]`);
      }
    };
    input.click();
  };

  const handleBotClick = () => {
    onChange(value + '/bot ');
  };

  const handleDocumentClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onChange(value + `[Document: ${file.name}]`);
      }
    };
    input.click();
  };

  const handleListClick = () => {
    onChange(value + '\n• ');
  };

  const actions = [
    {icon: Mic, label: "Voice Note", size: 20, onClick: handleVoiceRecording},
    {icon: ImageIcon, label: "Image", size: 20, onClick: handleImageClick},
    {icon: Zap, label:"Bot", size: 20, onClick: handleBotClick},
    {icon: FileText, label:"Document", size:20, onClick: handleDocumentClick},
    {icon: List, label: "List", size: 20, onClick: handleListClick}, 
  ]

  return (
    <div className=" border-slate-200  bg-white rounded-3xl border mx-6 sm:px-4 md:p-3">
      <div className='mx-6'>
        <div className='flex gap-8 border-b pb-4 border-slate-200'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "reply" | "private")}
              className={`pb-3 rounded-xl font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-emerald-500'
                  : 'text-slate-500 hover:text-slate-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700 rounded-full'/>}
            </button>
          ))}
          <div className='flex-1 flex items-center gap-2 text-slate-500 text-sm justify-end'>
              <PencilIcon size={20}/>
              <span>Type / to use a shortcut</span>
            </div>
        </div>
        <div className="space-y-4 mt-3">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full min-h-24 p-4 bg-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 text-gray-600 placeholder:text-gray-600"
            />

          <div className='flex items-center justify-between'>
              <div className='flex gap-4'>
               {actions.map((action)=> {
                const IconComponent = action.icon
                return (
                   <button
                    key={action.label}
                    onClick={action.onClick}
                    className='flex items-center gap-2 text-slate-500 text-sm hover:text-slate-600 transition-colors'
                    title={action.label}
                  >
                    <IconComponent size={action.size}/>
                  </button>
                )
               })}
              </div>
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="px-6 py-4 bg-[#006045] text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            
            <span className="font-medium text-lg">Send</span>
            <SendHorizonal size={25} />
          </button>
            </div>
            </div>
        </div>
    </div>
  );
};
