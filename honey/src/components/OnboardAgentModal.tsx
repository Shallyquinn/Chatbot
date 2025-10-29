import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface OnboardAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agentData: AgentFormData) => void;
}

export interface AgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const OnboardAgentModal: React.FC<OnboardAgentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AgentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<AgentFormData>>({});

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
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
      onSubmit(formData);
      onClose();
    }
  };

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
        className="bg-white rounded-[12px] w-full max-w-[604px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 md:p-8 lg:p-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-[#7b7b7b]" />
          </button>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-[36px] mb-[100px]">
              {/* Header */}
              <div className="flex flex-col gap-[12px]">
                <h2 className="font-medium text-[#383838] text-[20px]">
                  Onboard New Agent
                </h2>
                <p className="font-normal text-[#7b7b7b] text-[16px]">
                  Add a new agent to the system by providing their details and assigning roles.
                </p>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-[36px]">
                {/* First Name and Last Name Row */}
                <div className="flex flex-col sm:flex-row gap-[19px]">
                  {/* First Name */}
                  <div className="flex-1 flex flex-col gap-[4px]">
                    <label 
                      htmlFor="firstName"
                      className="font-medium text-[#383838] text-[16px]"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      className={`bg-[#fbfbfb] border ${
                        errors.firstName ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-[16px] font-normal text-[#383838] text-[16px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    />
                    {errors.firstName && (
                      <span className="text-red-500 text-sm">{errors.firstName}</span>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="flex-1 flex flex-col gap-[4px]">
                    <label 
                      htmlFor="lastName"
                      className="font-medium text-[#383838] text-[16px]"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      className={`bg-[#fbfbfb] border ${
                        errors.lastName ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-[16px] font-normal text-[#383838] text-[16px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    />
                    {errors.lastName && (
                      <span className="text-red-500 text-sm">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-[4px]">
                  <label 
                    htmlFor="email"
                    className="font-medium text-[#383838] text-[16px]"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className={`bg-[#fbfbfb] border ${
                      errors.email ? 'border-red-500' : 'border-[#dedede]'
                    } rounded-[7px] p-[16px] font-normal text-[#383838] text-[16px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm">{errors.email}</span>
                  )}
                </div>

                {/* Role Dropdown */}
                <div className="flex flex-col gap-[4px]" data-dropdown-container>
                  <label 
                    htmlFor="role"
                    className="font-medium text-[#383838] text-[16px]"
                  >
                    Role
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className={`w-full bg-[#fbfbfb] border ${
                        errors.role ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-[16px] font-normal text-[16px] flex items-center justify-between focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    >
                      <span className={formData.role ? 'text-[#383838]' : 'text-[#7b7b7b]'}>
                        {formData.role || 'Select Agent Role'}
                      </span>
                      <ChevronDown 
                        className={`w-6 h-6 text-[#7b7b7b] transition-transform ${
                          isRoleDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isRoleDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-[#dedede] rounded-[7px] shadow-lg max-h-[240px] overflow-y-auto">
                        {roles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleSelect(role)}
                            className={`w-full text-left px-[16px] py-[12px] font-normal text-[16px] hover:bg-[#f5f5f5] transition-colors ${
                              formData.role === role
                                ? 'bg-[#eaf3f1] text-[#006045]'
                                : 'text-[#383838]'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.role && (
                    <span className="text-red-500 text-sm">{errors.role}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#006045] px-[24px] py-[20px] rounded-[10px] font-bold text-[20px] text-white hover:bg-[#005038] active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
            >
              Add Agent
            </button>
          </form>
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

export default OnboardAgentModal;
