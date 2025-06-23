import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, User, Mail, Sparkles, BarChart3, Users } from 'lucide-react';

const AccountTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Welcome to NxtMail
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Choose how you want to use our AI-powered email management platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Personal Account */}
          <div 
            className="relative bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-primary-200"
            onClick={() => navigate('/register/personal')}
          >
            <div className="absolute top-6 right-6">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Popular
              </span>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-neutral-900">Personal</h3>
                <p className="text-neutral-600">For influencers & individuals</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-neutral-700">AI-powered email categorization</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-neutral-700">Smart inbox management</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-neutral-700">Brand collaborations tracking</span>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-neutral-700">Fan mail organization</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 mb-2">₹199/month</div>
              <p className="text-neutral-600 mb-6">Perfect for content creators</p>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                Get Started
              </button>
            </div>
          </div>

          {/* Business Account */}
          <div 
            className="relative bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-primary-200"
            onClick={() => navigate('/register/business')}
          >
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-neutral-900">Business</h3>
                <p className="text-neutral-600">For companies & teams</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary-500 mr-3" />
                <span className="text-neutral-700">AI customer support tickets</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary-500 mr-3" />
                <span className="text-neutral-700">Team collaboration tools</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-primary-500 mr-3" />
                <span className="text-neutral-700">Advanced analytics & reporting</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-primary-500 mr-3" />
                <span className="text-neutral-700">Automated response generation</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 mb-2">Custom Pricing</div>
              <p className="text-neutral-600 mb-6">Scale with your business</p>
              <button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSelection;