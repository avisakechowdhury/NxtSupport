import React, { useEffect } from 'react';
import { usePersonalEmailStore } from '../../store/personalEmailStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Mail, 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  Briefcase, 
  Heart, 
  Gift,
  AlertCircle,
  CheckCircle,
  User,
  Loader2
} from 'lucide-react';

const PersonalDashboard = () => {
  const { user } = useAuthStore();
  const { 
    emailStats, 
    categorizedEmails, 
    emails,
    fetchEmailStats, 
    fetchCategorizedEmails,
    fetchEmails,
    isLoading 
  } = usePersonalEmailStore();

  useEffect(() => {
    if (user?.emailConnected) {
      fetchEmailStats();
      fetchCategorizedEmails();
      fetchEmails();
    }
  }, [user?.emailConnected, fetchEmailStats, fetchCategorizedEmails, fetchEmails]);

  const categoryIcons = {
    'Brand Enquiry': Briefcase,
    'Collaboration': Users,
    'Fan Mail': Heart,
    'Thank You': Gift,
    'Business': Briefcase,
    'Personal': User,
    'Promotional': Star,
    'Important': AlertCircle,
    'Other': Mail
  };

  const categoryColors = {
    'Brand Enquiry': 'from-blue-500 to-blue-600',
    'Collaboration': 'from-green-500 to-green-600',
    'Fan Mail': 'from-pink-500 to-pink-600',
    'Thank You': 'from-yellow-500 to-yellow-600',
    'Business': 'from-purple-500 to-purple-600',
    'Personal': 'from-indigo-500 to-indigo-600',
    'Promotional': 'from-orange-500 to-orange-600',
    'Important': 'from-red-500 to-red-600',
    'Other': 'from-gray-500 to-gray-600'
  };

  // Calculate real stats from actual data
  const totalEmails = emails?.length || 0;
  const importantEmails = emails?.filter(e => e.category === 'Important').length || 0;
  const processedEmails = emails?.filter(e => e.category && e.category !== 'Other').length || 0;
  const timeSavedHours = Math.round((processedEmails * 0.05) * 10) / 10; // 3 minutes per email = 0.05 hours

  if (!user?.emailConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-2">Welcome! Connect your Gmail to get started.</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Connect Your Gmail</h3>
          <p className="text-neutral-600 mb-6">
            Get started by connecting your Gmail account to begin organizing your emails with AI
          </p>
          <a 
            href="/personal/inbox"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            <Mail className="h-5 w-5 mr-2" />
            Go to Inbox
          </a>
        </div>
      </div>
    );
  }

  if (isLoading && totalEmails === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-neutral-600">Loading your email data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-2">Welcome back! Here's what's happening with your emails.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Total Emails</p>
              <p className="text-2xl font-semibold text-neutral-900">{totalEmails}</p>
              <p className="text-xs text-neutral-500">
                {emails?.filter(e => !e.isRead).length || 0} unread
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Important</p>
              <p className="text-2xl font-semibold text-neutral-900">{importantEmails}</p>
              <p className="text-xs text-neutral-500">Requires attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Processed</p>
              <p className="text-2xl font-semibold text-neutral-900">{processedEmails}</p>
              <p className="text-xs text-neutral-500">AI categorized</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Time Saved</p>
              <p className="text-2xl font-semibold text-neutral-900">{timeSavedHours}h</p>
              <p className="text-xs text-neutral-500">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Categories */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Email Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categorizedEmails || {}).map(([category, count]) => {
            const IconComponent = categoryIcons[category] || Mail;
            const colorClass = categoryColors[category] || 'from-gray-500 to-gray-600';
            
            return (
              <div key={category} className="bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">{category}</p>
                      <p className="text-xs text-neutral-500">{count} emails</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-neutral-900">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Assistant Activity */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">AI Assistant Activity</h3>
          <span className="text-sm text-neutral-500">Your AI assistant has been busy helping you manage your inbox</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <span className="text-sm text-neutral-700">Emails categorized today</span>
            <span className="text-lg font-semibold text-neutral-900">
              {emails?.filter(e => {
                const today = new Date().toDateString();
                return new Date(e.time).toDateString() === today;
              }).length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <span className="text-sm text-neutral-700">Total emails processed</span>
            <span className="text-lg font-semibold text-neutral-900">{processedEmails}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${totalEmails > 0 ? (processedEmails / totalEmails) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-neutral-500">
            {totalEmails > 0 ? Math.round((processedEmails / totalEmails) * 100) : 0}% of your emails were processed automatically
          </p>
        </div>
      </div>

      {/* Recent AI Activity Log */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {emails?.slice(0, 3).map((email, index) => (
            <div key={email.id} className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">
                  Categorized email from {email.from.split('<')[0].trim()}
                </p>
                <p className="text-xs text-neutral-500">
                  Subject: "{email.subject}" → {email.category}
                </p>
                <p className="text-xs text-neutral-400">{email.time}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">completed</span>
            </div>
          )) || (
            <div className="text-center py-8">
              <Mail className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default PersonalDashboard;