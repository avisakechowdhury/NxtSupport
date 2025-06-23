import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Mic, 
  Zap,
  CreditCard,
  Crown,
  Settings as SettingsIcon
} from 'lucide-react';

const PersonalSettings = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Assistant', icon: Zap },
    { id: 'voice', label: 'Voice Commands', icon: Mic },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Time Zone</label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+5:30 (India Standard Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Language</label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Email Categories</h3>
              <p className="text-sm text-neutral-600 mb-4">Customize how your emails are automatically categorized</p>
              
              <div className="space-y-4">
                {[
                  { name: 'Brand Enquiry', color: 'bg-blue-500', keywords: 'collaboration, partnership, brand' },
                  { name: 'Fan Mail', color: 'bg-pink-500', keywords: 'love, fan, admire, follow' },
                  { name: 'Business', color: 'bg-purple-500', keywords: 'meeting, proposal, contract' },
                  { name: 'Personal', color: 'bg-green-500', keywords: 'family, friend, personal' }
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center">
                      <div className={`h-4 w-4 ${category.color} rounded-full mr-3`}></div>
                      <div>
                        <p className="font-medium text-neutral-900">{category.name}</p>
                        <p className="text-sm text-neutral-500">Keywords: {category.keywords}</p>
                      </div>
                    </div>
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">AI Assistant Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900">Auto-categorization</p>
                    <p className="text-sm text-neutral-500">Automatically categorize incoming emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900">Smart Notifications</p>
                    <p className="text-sm text-neutral-500">Only notify for important emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">AI Confidence Threshold</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    defaultValue="85"
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>50%</span>
                    <span>85%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Subscription & Billing</h3>
              
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <Crown className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Personal Plan</span>
                    </div>
                    <p className="text-purple-100">₹199/month • Next billing: Jan 15, 2024</p>
                  </div>
                  <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50">
                    Upgrade to Pro
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-2">Payment Method</h4>
                  <div className="flex items-center">
                    <div className="h-8 w-12 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold mr-3">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                      <p className="text-xs text-neutral-500">Expires 12/25</p>
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-2">Usage This Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Emails Processed</span>
                      <span>247 / 1000</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Coming Soon</h3>
            <p className="text-neutral-500">This settings section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-2">Manage your account preferences and AI assistant settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 bg-neutral-50 border-r border-neutral-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {renderTabContent()}
            
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalSettings;