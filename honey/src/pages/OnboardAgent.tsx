import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, MapPin, Phone, Building2, Shield } from 'lucide-react';
import api from '../services/api';

interface OnboardAgentFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  state?: string;
  lga?: string;
  city?: string;
  maxChats: number;
  specializations: string[];
}

const OnboardAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState<OnboardAgentFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    state: '',
    lga: '',
    city: '',
    maxChats: 5,
    specializations: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OnboardAgentFormData, string>>>({});

  // Nigerian states
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 
    'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 
    'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  // Specialization options
  const specializationOptions = [
    'Family Planning',
    'Contraception',
    'Sexual Health',
    'Pregnancy',
    'Reproductive Health',
    'STI/STD Information',
    'Emergency Contraception',
    'Youth Services',
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OnboardAgentFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.maxChats < 1 || formData.maxChats > 20) {
      newErrors.maxChats = 'Max chats must be between 1 and 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const agentData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        state: formData.state || undefined,
        lga: formData.lga || undefined,
        city: formData.city || undefined,
        maxChats: formData.maxChats,
        specializations: formData.specializations,
      };

      await api.post('/agents/register', agentData);

      setSuccess('Agent onboarded successfully! Redirecting to login...');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        state: '',
        lga: '',
        city: '',
        maxChats: 5,
        specializations: [],
      });

      // Redirect to agent login after 2 seconds
      setTimeout(() => {
        navigate('/agent-login');
      }, 2000);

    } catch (err: any) {
      console.error('Agent registration error:', err);
      setError(err.response?.data?.message || 'Failed to onboard agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OnboardAgentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Onboard New Agent
          </h1>
          <p className="text-gray-600">
            Create an account for a new healthcare support agent
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Personal Information
              </h3>
              
              {/* Full Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter agent's full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="agent@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                Security
              </h3>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Re-enter password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Location (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select state</option>
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* LGA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LGA
                  </label>
                  <input
                    type="text"
                    value={formData.lga}
                    onChange={(e) => handleInputChange('lga', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Local Government Area"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
              </div>
            </div>

            {/* Work Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Work Configuration
              </h3>

              {/* Max Concurrent Chats */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Concurrent Chats *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxChats}
                  onChange={(e) => handleInputChange('maxChats', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.maxChats ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maxChats && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxChats}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Number of simultaneous conversations this agent can handle (1-20)
                </p>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {specializationOptions.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.specializations.includes(spec)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Onboard Agent'}
              </button>
            </div>
          </form>
        </div>

        {/* Back to Dashboard Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardAgentPage;
