import React, { useState } from 'react';
import AdvancedAnalytics from '../components/Analytics/AdvancedAnalytics';
import CustomerSatisfactionAnalytics from '../components/Analytics/CustomerSatisfactionAnalytics';
import TeamPerformanceAnalytics from '../components/Analytics/TeamPerformanceAnalytics';
import { 
  BarChart3, 
  Heart, 
  Users, 
  TrendingUp,
  Download,
  Share2,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Modal } from '../components/Modal'; // If you have a Modal component, otherwise use a div

type AnalyticsTab = 'overview' | 'customer' | 'team' | 'performance';

const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    {
      id: 'overview' as AnalyticsTab,
      name: 'Business Overview',
      icon: BarChart3,
      description: 'Comprehensive business metrics and trends'
    },
    {
      id: 'team' as AnalyticsTab,
      name: 'Team Performance',
      icon: Users,
      description: 'Individual and team productivity analytics'
    },
    {
      id: 'performance' as AnalyticsTab,
      name: 'Performance Metrics',
      icon: TrendingUp,
      description: 'Detailed performance and efficiency metrics'
    },
    {
      id: 'customer' as AnalyticsTab,
      name: 'Customer Satisfaction',
      icon: Heart,
      description: 'Customer experience and satisfaction metrics'
    }
  ];

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');
  const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

  const handleContactChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess('');
    setContactError('');
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setContactSuccess('Thank you! We’ll get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        const data = await res.json();
        setContactError(data.error || 'Failed to send message.');
      }
    } catch (err) {
      setContactError('Failed to send message.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing analytics dashboard...');
  };

  const renderActiveTab = () => {
    // Tabs that should be blurred and require contact
    const restrictedTabs: AnalyticsTab[] = ['customer', 'team', 'performance'];
    if (restrictedTabs.includes(activeTab)) {
      let tabTitle = '';
      if (activeTab === 'customer') tabTitle = 'Customer Satisfaction Analytics';
      if (activeTab === 'team') tabTitle = 'Team Performance Analytics';
      if (activeTab === 'performance') tabTitle = 'Performance Metrics';
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg p-12">
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-4">{tabTitle}</h2>
            <button
              onClick={() => setShowContactModal(true)}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary-700 transition mb-4"
              style={{ fontSize: '1.25rem' }}
            >
              Contact Us
            </button>
            <p className="text-neutral-700 mb-8 max-w-md text-center text-lg font-medium">
              {tabTitle} are available on request.<br />
              For more details or to enable this feature, please contact us.
            </p>
          </div>
          {/* Optionally, you can show a blurred preview of the analytics here */}
          <div className="filter blur-sm pointer-events-none select-none opacity-60">
            {activeTab === 'customer' && <CustomerSatisfactionAnalytics />}
            {activeTab === 'team' && <TeamPerformanceAnalytics />}
            {activeTab === 'performance' && <AdvancedAnalytics />}
          </div>
          {/* Contact Modal */}
          {showContactModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700"
                >
                  <span className="text-2xl">&times;</span>
                </button>
                <h3 className="text-xl font-bold mb-4 text-neutral-900">Contact Us</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={e => handleContactChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={e => handleContactChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={e => handleContactChange('message', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                      required
                    />
                  </div>
                  {contactSuccess && <div className="text-green-600 text-sm">{contactSuccess}</div>}
                  {contactError && <div className="text-red-600 text-sm">{contactError}</div>}
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-60"
                  >
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
    switch (activeTab) {
      case 'overview':
        return <AdvancedAnalytics />;
      default:
        return <AdvancedAnalytics />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Analytics Dashboard</h1>
              <p className="text-neutral-500 mt-1">
                Comprehensive insights into your support operations and team performance
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              
              <button className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Description */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>{tabs.find(tab => tab.id === activeTab)?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <div className="space-y-6">
          {renderActiveTab()}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-white border-t border-neutral-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">24/7</div>
              <div className="text-sm text-neutral-500">Real-time Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">99.9%</div>
              <div className="text-sm text-neutral-500">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">&lt; 1s</div>
              <div className="text-sm text-neutral-500">Data Refresh</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">100%</div>
              <div className="text-sm text-neutral-500">Data Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard; 