import React, { useState, useRef, useEffect } from 'react';
import {PencilIcon,ImageIcon, Zap, FileText, List, SendHorizonal, Mic, X} from 'lucide-react';
import { sendMessageWithAttachments } from '../../utils/fileUpload';

interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'document' | 'audio';
  url?: string;
  duration?: number;
  size?: number;
  uploadProgress?: number;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string, attachments?: AttachedFile[]) => void;
  disabled?: boolean;
  placeholder?: string;
  onMessageSent?: () => void;
  onTyping?: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Send a message to your user',
  onMessageSent,
  onTyping,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Handle typing indicator
    if (onTyping) {
      if (!isTyping) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || attachedFiles.length > 0) {
        handleSend();
      }
    }
  };

  const [activeTab, setActiveTab] = useState<"reply" | "private">("reply")
  const tabs = [
    {id: "reply", label: "Reply"},
    {id: "private", label: "Private Note"}
  ]

  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], `voice-${Date.now()}.wav`, { type: 'audio/wav' });
          
          const newAttachment: AttachedFile = {
            id: Date.now().toString(),
            file: audioFile,
            type: 'audio',
            url: URL.createObjectURL(audioBlob),
            duration: recordingTime,
            size: audioFile.size
          };
          
          setAttachedFiles(prev => [...prev, newAttachment]);
          setRecordingTime(0);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
      } catch (error) {
        alert('Microphone access denied or not available');
      }
    }
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach(file => {
        const newAttachment: AttachedFile = {
          id: Date.now().toString() + Math.random(),
          file,
          type: 'image',
          url: URL.createObjectURL(file),
          size: file.size
        };
        setAttachedFiles(prev => [...prev, newAttachment]);
      });
    };
    input.click();
  };

  const handleBotClick = () => {
    onChange(value + '/bot ');
  };

  const handleDocumentClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.xlsx,.pptx';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach(file => {
        const newAttachment: AttachedFile = {
          id: Date.now().toString() + Math.random(),
          file,
          type: 'document',
          size: file.size
        };
        setAttachedFiles(prev => [...prev, newAttachment]);
      });
    };
    input.click();
  };

  const removeAttachment = (id: string) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      // Clean up object URLs
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return updated;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (value.trim() || attachedFiles.length > 0) {
      setIsSending(true);
      
      try {
        // Send message with file uploads
        const result = await sendMessageWithAttachments(value, attachedFiles);
        
        if (result.success) {
          // Call the parent's onSend callback
          onSend(value, attachedFiles.length > 0 ? attachedFiles : undefined);
          
          // Clear form
          onChange('');
          setAttachedFiles([]);
          
          // Clean up object URLs
          attachedFiles.forEach(file => {
            if (file.url) {
              URL.revokeObjectURL(file.url);
            }
          });
          
          // Notify parent that message was sent
          if (onMessageSent) {
            onMessageSent();
          }
        } else {
          alert(`Failed to send message: ${result.error}`);
        }
      } catch (error) {
        alert('Failed to send message. Please try again.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleListClick = () => {
    onChange(value + '\n• ');
  };

  const actions = [
    {icon: Mic, label: "Voice Note", size: 20, onClick: handleVoiceRecording, active: isRecording},
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
            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                {attachedFiles.map((attachment) => (
                  <div key={attachment.id} className="relative group">
                    {attachment.type === 'image' && (
                      <div className="relative">
                        <img 
                          src={attachment.url} 
                          alt={attachment.file.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeAttachment(attachment.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {attachment.type === 'document' && (
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border relative min-w-32">
                        <FileText size={16} className="text-blue-500" />
                        <div className="flex flex-col">
                          <span className="text-xs max-w-20 truncate">{attachment.file.name}</span>
                          <span className="text-xs text-gray-400">{formatFileSize(attachment.size || 0)}</span>
                        </div>
                        <button
                          onClick={() => removeAttachment(attachment.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {attachment.type === 'audio' && (
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border relative min-w-32">
                        <Mic size={16} className="text-green-500" />
                        <div className="flex flex-col">
                          <span className="text-xs">{formatTime(attachment.duration || 0)}</span>
                          <span className="text-xs text-gray-400">{formatFileSize(attachment.size || 0)}</span>
                        </div>
                        <button
                          onClick={() => removeAttachment(attachment.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 text-sm font-medium">Recording... {formatTime(recordingTime)}</span>
              </div>
            )}
            
            <textarea
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed min-h-11 max-h-[120px]"
            />
          </div>

          <div className='flex items-center justify-between'>
              <div className='flex gap-4'>
               {actions.map((action)=> {
                const IconComponent = action.icon
                return (
                   <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`flex items-center gap-2 text-sm hover:text-slate-600 transition-colors ${
                      action.active ? 'text-red-500' : 'text-slate-500'
                    }`}
                    title={action.label}
                  >
                    <IconComponent size={action.size}/>
                  </button>
                )
               })}
              </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || isSending || (!value.trim() && attachedFiles.length === 0)}
            className="px-6 py-4 bg-[#006045] text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            
            <span className="font-medium text-lg">Send</span>
            <SendHorizonal size={25} />
          </button>
        </div>
      </div>
    </div>
  );
};
