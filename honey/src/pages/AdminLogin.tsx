import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api.service';
import { Lock, User, AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ApiService.adminLogin(email, password);

      // Store token and user info
      localStorage.setItem('token', response.access_token);
      localStorage.setItem(
        'user',
        JSON.stringify({ ...response.admin, type: 'admin' }),
      );

      // Navigate to admin dashboard
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || 'Invalid credentials. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-[#e0e0e0]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#006045] to-[#004d35] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock className="h-10 w-10 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-[#1e1e1e]">Admin Portal</h1>
          <p className="text-[#7b7b7b] mt-2 text-sm">DKT Honey Chatbot Management</p>
        </div>

        <div className="bg-[#eaf3f1] border border-[#006045]/20 rounded-lg p-4 mb-6">
          <p className="text-[#006045] text-xs font-semibold mb-2">🔑 Demo Admin Credentials</p>
          <div className="text-[#383838] text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[#7b7b7b]">Email:</span>
              <span className="font-mono font-medium text-[#006045]">admin@honeychatbot.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7b7b7b]">Password:</span>
              <span className="font-mono font-medium text-[#006045]">admin123</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#383838] text-sm font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7b7b7b]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#006045] focus:border-[#006045] transition-all text-[#1e1e1e] placeholder:text-[#989898]"
                placeholder="admin@honeychatbot.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[#383838] text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7b7b7b]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-[#006045] focus:border-[#006045] transition-all text-[#1e1e1e] placeholder:text-[#989898]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#006045] text-white py-3 rounded-lg font-semibold hover:bg-[#005038] active:scale-95 transition-all disabled:bg-[#c5c5c5] disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/agent/login"
            className="text-[#006045] hover:text-[#005038] text-sm font-semibold transition-colors"
          >
            Agent Portal →
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
