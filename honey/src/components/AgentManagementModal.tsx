import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Trash2, AlertTriangle, UserPlus, Users as UsersIcon } from 'lucide-react';

interface AgentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (agentData: AgentFormData) => void;
  onDeleteAgent: (agentId: string) => void;
  agents: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    currentChats: number;
    maxChats: number;
  }>;
}

export interface AgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AgentManagementModal: React.FC<AgentManagementModalProps> = ({
  isOpen,
  onClose,
  onAddAgent,
  onDeleteAgent,
  agents,
}) => {
  const [activeView, setActiveView] = useState<'add' | 'manage'>('add');
  const [formData, setFormData] = useState<AgentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<AgentFormData>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const roles = ['Support Agent', 'Senior Agent', 'Team Lead', 'Manager', 'Administrator'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setIsRoleDropdownOpen(false);
      }
    };

    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleDropdownOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
      });
      setErrors({});
      setIsRoleDropdownOpen(false);
      setDeleteConfirmId(null);
      setSearchQuery('');
      setActiveView('add');
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (field: keyof AgentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleSelect = (role: string) => {
    handleInputChange('role', role);
    setIsRoleDropdownOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AgentFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAddAgent(formData);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
      });
      setErrors({});
    }
  };

  const handleDeleteClick = (agentId: string) => {
    setDeleteConfirmId(agentId);
  };

  const confirmDelete = (agentId: string) => {
    onDeleteAgent(agentId);
    setDeleteConfirmId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Filter agents based on search query
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-[12px] w-full max-w-[700px] max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-[#7b7b7b]" />
          </button>

          <h2 className="font-semibold text-[#383838] text-[22px] mb-4">Agent Management</h2>

          {/* Tab Selector */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('add')}
              className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                activeView === 'add'
                  ? 'bg-white text-[#006045] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Add New Agent
            </button>
            <button
              onClick={() => setActiveView('manage')}
              className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                activeView === 'manage'
                  ? 'bg-white text-[#006045] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UsersIcon className="w-4 h-4" />
              Manage Agents ({agents.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'add' ? (
            /* ADD AGENT FORM */
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <p className="text-[#7b7b7b] text-[14px]">
                  Add a new agent to the system by providing their details and assigning roles.
                </p>

                {/* First Name and Last Name Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label htmlFor="firstName" className="font-medium text-[#383838] text-[14px]">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={`bg-[#fbfbfb] border ${
                        errors.firstName ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-3 text-[14px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    />
                    {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName}</span>}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <label htmlFor="lastName" className="font-medium text-[#383838] text-[14px]">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={`bg-[#fbfbfb] border ${
                        errors.lastName ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-3 text-[14px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    />
                    {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName}</span>}
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-medium text-[#383838] text-[14px]">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="agent@email.com"
                    className={`bg-[#fbfbfb] border ${
                      errors.email ? 'border-red-500' : 'border-[#dedede]'
                    } rounded-[7px] p-3 text-[14px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                  />
                  {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                </div>

                {/* Role Dropdown */}
                <div className="flex flex-col gap-2" data-dropdown-container>
                  <label htmlFor="role" className="font-medium text-[#383838] text-[14px]">
                    Role
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className={`w-full bg-[#fbfbfb] border ${
                        errors.role ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-3 text-[14px] flex items-center justify-between focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    >
                      <span className={formData.role ? 'text-[#383838]' : 'text-[#7b7b7b]'}>
                        {formData.role || 'Select Agent Role'}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#7b7b7b] transition-transform ${
                          isRoleDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isRoleDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-[#dedede] rounded-[7px] shadow-lg max-h-[200px] overflow-y-auto">
                        {roles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleSelect(role)}
                            className={`w-full text-left px-4 py-3 text-[14px] hover:bg-[#f5f5f5] transition-colors ${
                              formData.role === role ? 'bg-[#eaf3f1] text-[#006045]' : 'text-[#383838]'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.role && <span className="text-red-500 text-xs">{errors.role}</span>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#006045] px-6 py-3 rounded-[8px] font-semibold text-[16px] text-white hover:bg-[#005038] active:scale-[0.98] transition-all shadow-md hover:shadow-lg mt-4"
                >
                  Add Agent
                </button>
              </div>
            </form>
          ) : (
            /* MANAGE AGENTS VIEW */
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents by name or email..."
                  className="w-full bg-[#fbfbfb] border border-[#dedede] rounded-[7px] pl-10 pr-4 py-3 text-[14px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7b7b7b]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Agents List */}
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-8 text-[#7b7b7b]">
                    <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{searchQuery ? 'No agents found matching your search' : 'No agents available'}</p>
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="bg-[#fbfbfb] border border-[#dedede] rounded-[8px] p-4 hover:border-[#006045] transition-all"
                    >
                      {deleteConfirmId === agent.id ? (
                        /* DELETE CONFIRMATION */
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="font-medium text-[#383838] text-[14px]">Delete this agent?</p>
                              <p className="text-[#7b7b7b] text-[12px]">This action cannot be undone</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={cancelDelete}
                              className="px-4 py-2 text-[14px] font-medium text-[#383838] bg-white border border-[#dedede] rounded-md hover:bg-gray-50 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => confirmDelete(agent.id)}
                              className="px-4 py-2 text-[14px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* AGENT INFO */
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-[#383838] text-[14px]">{agent.name}</p>
                            <p className="text-[#7b7b7b] text-[12px]">{agent.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${
                                  agent.status === 'ONLINE'
                                    ? 'bg-green-100 text-green-700'
                                    : agent.status === 'AWAY'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    agent.status === 'ONLINE'
                                      ? 'bg-green-500'
                                      : agent.status === 'AWAY'
                                        ? 'bg-yellow-500'
                                        : 'bg-gray-500'
                                  }`}
                                />
                                {agent.status}
                              </span>
                              <span className="text-[#7b7b7b] text-[11px]">
                                {agent.currentChats}/{agent.maxChats} chats
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteClick(agent.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-all"
                            title="Delete agent"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AgentManagementModal;
