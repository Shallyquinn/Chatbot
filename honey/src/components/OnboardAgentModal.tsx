import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Eye, EyeOff } from 'lucide-react';

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
  password: string;
  state: string;
  lga: string;
  primaryLanguage: string;
  secondaryLanguage: string;
}

const OnboardAgentModal: React.FC<OnboardAgentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AgentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
    state: '',
    lga: '',
    primaryLanguage: '',
    secondaryLanguage: '',
  });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isPrimaryLangDropdownOpen, setIsPrimaryLangDropdownOpen] = useState(false);
  const [isSecondaryLangDropdownOpen, setIsSecondaryLangDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<AgentFormData>>({});

  const roles = ['Support Agent', 'Senior Agent', 'Team Lead', 'Manager', 'Administrator'];
  const languages = ['English', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin'];
  
  // Nigerian states
  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara'
  ];

  // Generate secure default password
  const generateDefaultPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setIsRoleDropdownOpen(false);
        setIsPrimaryLangDropdownOpen(false);
        setIsSecondaryLangDropdownOpen(false);
      }
    };

    if (isRoleDropdownOpen || isPrimaryLangDropdownOpen || isSecondaryLangDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleDropdownOpen, isPrimaryLangDropdownOpen, isSecondaryLangDropdownOpen]);

  // Reset form when modal closes and auto-generate password when it opens
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        password: '',
        state: '',
        lga: '',
        primaryLanguage: '',
        secondaryLanguage: '',
      });
      setErrors({});
      setIsRoleDropdownOpen(false);
      setIsPrimaryLangDropdownOpen(false);
      setIsSecondaryLangDropdownOpen(false);
    } else {
      // Auto-generate password when modal opens
      setFormData(prev => ({
        ...prev,
        password: generateDefaultPassword()
      }));
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

  const handlePrimaryLanguageSelect = (lang: string) => {
    handleInputChange('primaryLanguage', lang);
    setIsPrimaryLangDropdownOpen(false);
  };

  const handleSecondaryLanguageSelect = (lang: string) => {
    handleInputChange('secondaryLanguage', lang);
    setIsSecondaryLangDropdownOpen(false);
  };

  const handleStateSelect = (state: string) => {
    handleInputChange('state', state);
    // Reset LGA when state changes
    setFormData(prev => ({ ...prev, lga: '' }));
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

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.lga) {
      newErrors.lga = 'LGA is required';
    }

    if (!formData.primaryLanguage) {
      newErrors.primaryLanguage = 'Primary language is required';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
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

                {/* Password Field */}
                <div className="flex flex-col gap-[4px]">
                  <label 
                    htmlFor="password"
                    className="font-medium text-[#383838] text-[16px]"
                  >
                    Default Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Auto-generated password"
                      className={`w-full bg-[#fbfbfb] border ${
                        errors.password ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-[16px] pr-[48px] font-normal text-[#383838] text-[16px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-[#7b7b7b]" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#7b7b7b]" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-sm">{errors.password}</span>
                  )}
                  <p className="text-xs text-[#7b7b7b]">
                    Agent will be prompted to change this password on first login
                  </p>
                </div>

                {/* State and LGA Row */}
                <div className="flex flex-col sm:flex-row gap-[19px]">
                  {/* State */}
                  <div className="flex-1 flex flex-col gap-[4px]">
                    <label 
                      htmlFor="state"
                      className="font-medium text-[#383838] text-[16px]"
                    >
                      State
                    </label>
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleStateSelect(e.target.value)}
                      className={`bg-[#fbfbfb] border ${
                        errors.state ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-[16px] font-normal text-[#383838] text-[16px] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <span className="text-red-500 text-sm">{errors.state}</span>
                    )}
                  </div>

                  {/* LGA */}
                  <div className="flex-1 flex flex-col gap-[4px]">
                    <label 
                      htmlFor="lga"
                      className="font-medium text-[#383838] text-[16px]"
                    >
                      LGA
                    </label>
                    <input
                      id="lga"
                      type="text"
                      value={formData.lga}
                      onChange={(e) => handleInputChange('lga', e.target.value)}
                      placeholder="Enter LGA"
                      className={`bg-[#fbfbfb] border ${
                        errors.lga ? 'border-red-500' : 'border-[#dedede]'
                      } rounded-[7px] p-[16px] font-normal text-[#383838] text-[16px] placeholder:text-[#7b7b7b] focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                    />
                    {errors.lga && (
                      <span className="text-red-500 text-sm">{errors.lga}</span>
                    )}
                  </div>
                </div>

                {/* Primary and Secondary Language Row */}
                <div className="flex flex-col sm:flex-row gap-[19px]">
                  {/* Primary Language */}
                  <div className="flex-1 flex flex-col gap-[4px]" data-dropdown-container>
                    <label 
                      htmlFor="primaryLanguage"
                      className="font-medium text-[#383838] text-[16px]"
                    >
                      Primary Language
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPrimaryLangDropdownOpen(!isPrimaryLangDropdownOpen)}
                        className={`w-full bg-[#fbfbfb] border ${
                          errors.primaryLanguage ? 'border-red-500' : 'border-[#dedede]'
                        } rounded-[7px] p-[16px] font-normal text-[16px] flex items-center justify-between focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all`}
                      >
                        <span className={formData.primaryLanguage ? 'text-[#383838]' : 'text-[#7b7b7b]'}>
                          {formData.primaryLanguage || 'Select Primary Language'}
                        </span>
                        <ChevronDown 
                          className={`w-6 h-6 text-[#7b7b7b] transition-transform ${
                            isPrimaryLangDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isPrimaryLangDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-[#dedede] rounded-[7px] shadow-lg max-h-[200px] overflow-y-auto">
                          {languages.map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => handlePrimaryLanguageSelect(lang)}
                              className={`w-full text-left px-[16px] py-[12px] font-normal text-[16px] hover:bg-[#f5f5f5] transition-colors ${
                                formData.primaryLanguage === lang
                                  ? 'bg-[#eaf3f1] text-[#006045]'
                                  : 'text-[#383838]'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.primaryLanguage && (
                      <span className="text-red-500 text-sm">{errors.primaryLanguage}</span>
                    )}
                  </div>

                  {/* Secondary Language */}
                  <div className="flex-1 flex flex-col gap-[4px]" data-dropdown-container>
                    <label 
                      htmlFor="secondaryLanguage"
                      className="font-medium text-[#383838] text-[16px]"
                    >
                      Secondary Language <span className="text-[#7b7b7b] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSecondaryLangDropdownOpen(!isSecondaryLangDropdownOpen)}
                        className="w-full bg-[#fbfbfb] border border-[#dedede] rounded-[7px] p-[16px] font-normal text-[16px] flex items-center justify-between focus:outline-none focus:border-[#006045] focus:ring-1 focus:ring-[#006045] transition-all"
                      >
                        <span className={formData.secondaryLanguage ? 'text-[#383838]' : 'text-[#7b7b7b]'}>
                          {formData.secondaryLanguage || 'Select Secondary Language'}
                        </span>
                        <ChevronDown 
                          className={`w-6 h-6 text-[#7b7b7b] transition-transform ${
                            isSecondaryLangDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isSecondaryLangDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-[#dedede] rounded-[7px] shadow-lg max-h-[200px] overflow-y-auto">
                          {languages
                            .filter(lang => lang !== formData.primaryLanguage)
                            .map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => handleSecondaryLanguageSelect(lang)}
                                className={`w-full text-left px-[16px] py-[12px] font-normal text-[16px] hover:bg-[#f5f5f5] transition-colors ${
                                  formData.secondaryLanguage === lang
                                    ? 'bg-[#eaf3f1] text-[#006045]'
                                    : 'text-[#383838]'
                                }`}
                              >
                                {lang}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
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
