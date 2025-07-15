import React, { useState } from 'react';
import { Mail, Lock, Building, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    await register(
      { name: companyName, domain, supportEmail },
      { name, email: supportEmail },
      password
    );
    
    navigate('/email-setup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left side - Form */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              {/* Logo and Image */}
              <div className="flex flex-col items-center mb-8">
                <img
                  src="https://images.unsplash.com/photo-1667936504979-0e9683cbe47a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9ydHJhaXQlMjBjb21wYW55fGVufDB8fDB8fHww"
                  alt="Business"
                  className="w-24 h-24 rounded-full object-cover shadow-lg mb-4"
                />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Building className="w-6 h-6 text-gray-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      placeholder="Nxt Mail"
                    />
                  </div>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Website
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="www.example.com"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="support@example.com"
                  />
                </div>

                {/* Your Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all pr-12"
                      placeholder="••••••••••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="••••••••••••••••••••"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-400 text-black font-semibold py-3 px-4 rounded-xl hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Submit'}
                </button>

                {/* Social Login */}
                {/* Removed Google and Apple sign up buttons */}
              </form>

              {/* Footer Links */}
              <div className="mt-8 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Have any account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  Need a personal account?{' '}
                  <Link to="/register/personal" className="text-purple-600 hover:text-purple-500 font-medium">
                    Sign up for personal
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Image/Illustration */}
          <div
            className="lg:w-1/2 relative overflow-hidden"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1667936504979-0e9683cbe47a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9ydHJhaXQlMjBjb21wYW55fGVufDB8fDB8fHww')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Optional: keep this for text readability, or remove for no overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="text-center text-white">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4">
                    <Building className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Welcome to NxtMail</h2>
                  <p className="text-lg opacity-90">
                    AI-powered email support for your business
                  </p>
                </div>
                
                {/* Mock UI Elements */}
                <div className="space-y-4 max-w-sm mx-auto">
                  <div className="bg-white bg-opacity-20 rounded-xl p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Task Review With Team</span>
                      <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    </div>
                    <p className="text-xs opacity-80">09:30am-10:00am</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-xl p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Daily Meeting</span>
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    </div>
                    <p className="text-xs opacity-80">12:00pm-01:00pm</p>
                    <div className="flex -space-x-2 mt-2">
                      <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-white"></div>
                      <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                      <div className="w-6 h-6 bg-purple-400 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;