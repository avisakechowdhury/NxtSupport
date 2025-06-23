import React, { useState } from 'react';
import { Mail, Lock, Building, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Building className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900">
          Create your business account
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Set up AI-powered email support for your business
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative\" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-neutral-700">
                Company Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="company-name"
                  name="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="block w-full pl-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nxt Mail"
                />
              </div>
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-neutral-700">
                Company Website
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="domain"
                  name="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  className="block w-full sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="www.example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="support-email" className="block text-sm font-medium text-neutral-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="support-email"
                  name="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  required
                  className="block w-full pl-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="support@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                Your Name
              </label>
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
                  className="block w-full pl-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700">
                Confirm password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full pl-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Need a personal account?{' '}
                <Link to="/register/personal" className="font-medium text-purple-600 hover:text-purple-500">
                  Sign up for personal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;