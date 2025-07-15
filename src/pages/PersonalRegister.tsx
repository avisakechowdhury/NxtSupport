import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { BackgroundLines } from "../components/ui/background-lines";

const PersonalRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { registerPersonal, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }
    
    try {
      await registerPersonal({ name, email, password });
      navigate('/personal/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <BackgroundLines className="absolute inset-0 z-0 pointer-events-none" />
      {/* Centered glassy card */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-white/30 dark:border-zinc-700">
          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white text-center mb-2">Create your personal account</h2>
            <p className="text-base text-neutral-600 dark:text-neutral-300 text-center">Join thousands of influencers managing their emails with <span className="text-purple-500 font-semibold">AI</span></p>
          </div>
          {error && (
            <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded w-full text-center" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form className="space-y-6 w-full" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="off"
                  className="block w-full pl-10 sm:text-sm border-none rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 dark:bg-zinc-800/80 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-inner transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 sm:text-sm border-none rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 dark:bg-zinc-800/80 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-inner transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 sm:text-sm border-none rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 dark:bg-zinc-800/80 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-inner transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Confirm password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 sm:text-sm border-none rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 dark:bg-zinc-800/80 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-inner transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
          <div className="mt-8 w-full">
            <div className="text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                  Sign in
                </Link>
              </p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Need a business account?{' '}
                <Link to="/register/business" className="font-medium text-pink-600 hover:text-pink-500">
                  Sign up for business
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalRegister;