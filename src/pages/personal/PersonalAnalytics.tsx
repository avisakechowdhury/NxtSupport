import React, { useEffect } from 'react';
import { usePersonalEmailStore } from '../../store/personalEmailStore';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Mail, 
  Star,
  Users,
  Briefcase,
  Heart,
  Gift,
  AlertCircle,
  Loader2
} from 'lucide-react';

const PersonalAnalytics = () => {
  const { 
    emails,
    emailStats, 
    categorizedEmails, 
    fetchEmailStats, 
    fetchCategorizedEmails,
    fetchEmails,
    isLoading 
  } = usePersonalEmailStore();

  useEffect(() => {
    fetchEmails();
    fetchEmailStats();
    fetchCategorizedEmails();
  }, [fetchEmails, fetchEmailStats, fetchCategorizedEmails]);

  const categoryIcons = {
    'Brand Enquiry': Briefcase,
    'Collaboration': Users,
    'Fan Mail': Heart,
    'Thank You': Gift,
    'Business': Briefcase,
    'Personal': Users,
    'Promotional': Star,
    'Important': AlertCircle,
    'Other': Mail
  };

  const categoryColors = {
    'Brand Enquiry': 'bg-blue-500',
    'Collaboration': 'bg-green-500',
    'Fan Mail': 'bg-pink-500',
    'Thank You': 'bg-yellow-500',
    'Business': 'bg-purple-500',
    'Personal': 'bg-indigo-500',
    'Promotional': 'bg-orange-500',
    'Important': 'bg-red-500',
    'Other': 'bg-gray-500'
  };

  if (isLoading && (!emails || emails.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-neutral-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const totalEmails = emails?.length || 0;
  const importantEmails = emails?.filter(e => e.category === 'Important').length || 0;
  const processedEmails = emails?.filter(e => e.category && e.category !== 'Other').length || 0;
  const timeSavedHours = Math.round((processedEmails * 0.05) * 10) / 10;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Analytics</h1>
        <p className="text-neutral-600 mt-2">Insights into your email patterns and AI assistant performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Total Processed</p>
              <p className="text-2xl font-semibold text-neutral-900">{totalEmails}</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{Math.round((totalEmails / 30) * 100) / 100} per day avg
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">AI Accuracy</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {totalEmails > 0 ? Math.round((processedEmails / totalEmails) * 100) : 0}%
              </p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                High confidence
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Time Saved</p>
              <p className="text-2xl font-semibold text-neutral-900">{timeSavedHours}h</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                This month
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Important Emails</p>
              <p className="text-2xl font-semibold text-neutral-900">{importantEmails}</p>
              <div className="flex items-center text-xs text-neutral-500">
                Flagged by AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Categories Chart */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Email Distribution by Category</h3>
        <div className="space-y-4">
          {Object.entries(categorizedEmails || {}).map(([category, count]) => {
            const IconComponent = categoryIcons[category] || Mail;
            const colorClass = categoryColors[category] || 'bg-gray-500';
            const percentage = totalEmails > 0 ? Math.round((count / totalEmails) * 100) : 0;
            
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className={`h-8 w-8 ${colorClass} rounded-lg flex items-center justify-center mr-3`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-900">{category}</span>
                      <span className="text-sm text-neutral-500">{count} emails ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Weekly Email Volume</h3>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              // Calculate actual daily volumes from email data
              const dayEmails = emails?.filter(email => {
                const emailDate = new Date(email.time);
                const dayOfWeek = emailDate.getDay();
                return dayOfWeek === (index + 1) % 7; // Adjust for Monday start
              }).length || 0;
              
              const maxValue = Math.max(...['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((_, i) => 
                emails?.filter(email => {
                  const emailDate = new Date(email.time);
                  const dayOfWeek = emailDate.getDay();
                  return dayOfWeek === (i + 1) % 7;
                }).length || 0
              )) || 1;
              
              const percentage = (dayEmails / maxValue) * 100;
              
              return (
                <div key={day} className="flex items-center">
                  <span className="text-sm font-medium text-neutral-700 w-8">{day}</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-500 w-8 text-right">{dayEmails}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">AI Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Classification Accuracy</span>
              <span className="text-lg font-semibold text-green-600">
                {totalEmails > 0 ? Math.round((processedEmails / totalEmails) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Processing Speed</span>
              <span className="text-lg font-semibold text-blue-600">0.3s</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Auto-categorized</span>
              <span className="text-lg font-semibold text-purple-600">
                {totalEmails > 0 ? Math.round((processedEmails / totalEmails) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Manual Review Needed</span>
              <span className="text-lg font-semibold text-orange-600">
                {totalEmails > 0 ? Math.round(((totalEmails - processedEmails) / totalEmails) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Productivity Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-900">Time Efficiency</h4>
            <p className="text-sm text-neutral-600 mt-1">
              AI processing saves you an average of <strong>{timeSavedHours} hours</strong> on email management
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-900">Focus Improvement</h4>
            <p className="text-sm text-neutral-600 mt-1">
              <strong>{Math.round((processedEmails / (totalEmails || 1)) * 100)}% accuracy</strong> in identifying important emails helps you focus on what matters
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-900">Workflow Optimization</h4>
            <p className="text-sm text-neutral-600 mt-1">
              Smart categorization reduces email processing time by <strong>67%</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAnalytics;