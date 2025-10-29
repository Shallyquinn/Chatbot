// src/components/ThemeDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, MoreVertical, UserPlus, Pause, X as XIcon, User } from 'lucide-react';
import ApiService from '../services/api.service';

interface Agent {
  id: string;
  name: string;
  email: string;
}

const ThemeDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const agentModalRef = useRef<HTMLDivElement>(null);

  // Get user type from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserType(user.type);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Close dropdown and modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        agentModalRef.current &&
        !agentModalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowAgentModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
    setIsOpen(false);
  };

  const handleAssignAgent = async () => {
    setShowAgentModal(true);
    setIsOpen(false);
    
    // Fetch agents if not already loaded
    if (agents.length === 0 && !loadingAgents) {
      setLoadingAgents(true);
      try {
        const response = await ApiService.getAgents();
        // Handle backend response wrapping
        const agentList = response.data || response;
        setAgents(Array.isArray(agentList) ? agentList : []);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoadingAgents(false);
      }
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    console.log('Selected agent:', agent);
    // TODO: Implement agent assignment logic
    setShowAgentModal(false);
  };

  const handlePauseChat = () => {
    console.log('Pause Chat clicked');
    setIsOpen(false);
  };

  const handleEndChat = () => {
    console.log('End Chat clicked');
    setIsOpen(false);
  };

  // Check if current user is admin or agent
  const canAssignAgent = userType === 'admin' || userType === 'agent';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Three dots button */}
      <button
        className="p-1 sm:p-1.5 text-white hover:bg-emerald-700 rounded-full transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More options"
        title="More options"
      >
        <MoreVertical className="md:h-8 md:w-8 sm:h-6 sm:w-6" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[220px] bg-white dark:bg-gray-800 rounded-[10px] shadow-2xl border border-[#dedede] dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex flex-col">
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5 border-b border-neutral-300 dark:border-gray-600"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-5 h-5 text-[#949494] dark:text-gray-400 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm font-medium text-[#949494] dark:text-gray-300">
                    Dark Mode
                  </span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5 text-[#949494] dark:text-gray-400 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm font-medium text-[#949494] dark:text-gray-300">
                    Light Mode
                  </span>
                </>
              )}
            </button>

            {/* Assign Agent - Only show for admin/agent */}
            {canAssignAgent && (
              <button
                onClick={handleAssignAgent}
                className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5 border-b border-neutral-300 dark:border-gray-600"
              >
                <UserPlus className="w-5 h-5 text-[#949494] dark:text-gray-400 flex-shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-[#949494] dark:text-gray-300">
                  Assign Agent
                </span>
              </button>
            )}

            {/* Pause Chat */}
            <button
              onClick={handlePauseChat}
              className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5 border-b border-neutral-300 dark:border-gray-600"
            >
              <Pause className="w-5 h-5 text-[#949494] dark:text-gray-400 flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium text-[#949494] dark:text-gray-300">
                Pause Chat
              </span>
            </button>

            {/* End Chat */}
            <button
              onClick={handleEndChat}
              className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5 rounded-b-[10px]"
            >
              <XIcon className="w-5 h-5 text-[#949494] dark:text-gray-400 flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium text-[#949494] dark:text-gray-300">
                End Chat
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Agent Assignment Modal */}
      {showAgentModal && canAssignAgent && (
        <div 
          ref={agentModalRef}
          className="absolute right-0 top-full mt-2 w-[320px] bg-white dark:bg-gray-800 rounded-[12px] shadow-2xl border border-[#dedede] dark:border-gray-700 z-50 overflow-hidden"
        >
          <div className="flex flex-col">
            {loadingAgents ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-[#949494] dark:text-gray-400">Loading agents...</p>
              </div>
            ) : agents.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-[#949494] dark:text-gray-400">No agents available</p>
              </div>
            ) : (
              agents.map((agent, index) => (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent)}
                  className={`w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex gap-5 items-center ${
                    index === 0 ? 'rounded-t-[12px]' : ''
                  } ${
                    index === agents.length - 1 ? 'rounded-b-[12px]' : 'border-b border-neutral-300 dark:border-gray-600'
                  }`}
                >
                  {/* Agent Avatar */}
                  <div className="w-[42px] h-[42px] rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  
                  {/* Agent Info */}
                  <div className="flex flex-col gap-1 items-start text-left">
                    <p className="font-medium text-[18px] text-[#707070] dark:text-gray-300">
                      {agent.name}
                    </p>
                    <p className="font-normal text-[12px] text-[#a2a2a2] dark:text-gray-500">
                      Agent ID: {agent.id}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
