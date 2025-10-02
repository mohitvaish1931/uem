import React, { useState } from 'react';
import { Bus, User, Lock, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { User as UserType } from '../../types';
import { authService, TokenManager } from '../../services';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login({ email, password });
      TokenManager.setToken(response.token);
      onLogin(response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
          
          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300 relative">
              <Bus className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">UEM Transport System</h1>
            <p className="text-gray-600 font-medium">Advanced Bus Management Portal</p>
            <div className="flex items-center justify-center space-x-1 mt-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 font-semibold">Secure Access</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <User className="w-5 h-5 absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg relative z-10">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
              <p className="text-red-600 text-xs mt-1">
                Note: Make sure the backend server is running on port 5000.
              </p>
            </div>
          )}


        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 relative z-10">
          <p className="text-sm font-medium">© 2024 UEM College Jaipur - Transportation Department</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            <span className="text-xs text-white/60">Powered by Advanced Technology</span>
            <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;