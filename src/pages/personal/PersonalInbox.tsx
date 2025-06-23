import React, { useEffect, useState } from 'react';
import { usePersonalEmailStore } from '../../store/personalEmailStore';
import { useAuthStore } from '../../store/authStore';
import {
  Mail, Search, Filter, Star, Archive, Trash2, Tag, RefreshCw, Loader2, Power, Smile, Meh, Frown, MessageSquare,Briefcase, Users, Heart, Gift, User, AlertCircle
} from 'lucide-react';

const PersonalInbox = () => {
  const { user } = useAuthStore();
  const {
    emails,
    fetchEmails,
    categorizeEmail,
    connectGoogleAccount,
    disconnectGoogleAccount,
    isLoading,
    error
  } = usePersonalEmailStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState('');

  const [draftingEmailId, setDraftingEmailId] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    // Check if user has Google connected
    if (user?.emailConnected && user?.googleEmail) {
      setIsConnected(true);
      setConnectedEmail(user.googleEmail);
      fetchEmails();
    }
  }, [user, fetchEmails]);

  // Listen for OAuth callback
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data === 'google-auth-success') {
        setIsConnected(true);
        fetchEmails();
        // Refresh user data to get updated connection status
        window.location.reload();
      }
    };

    window.addEventListener('message', handleOAuthMessage);

    // Check URL params for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'google-success') {
      setIsConnected(true);
      setConnectedEmail(urlParams.get('email') || '');
      fetchEmails();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [fetchEmails]);

  const categories = [
    { name: 'All', icon: Mail, count: emails?.length || 0, color: 'text-neutral-600' },
    { name: 'Brand Enquiry', icon: Briefcase, count: emails?.filter(e => e.category === 'Brand Enquiry').length || 0, color: 'text-blue-600' },
    { name: 'Collaboration', icon: Users, count: emails?.filter(e => e.category === 'Collaboration').length || 0, color: 'text-green-600' },
    { name: 'Fan Mail', icon: Heart, count: emails?.filter(e => e.category === 'Fan Mail').length || 0, color: 'text-pink-600' },
    { name: 'Thank You', icon: Gift, count: emails?.filter(e => e.category === 'Thank You').length || 0, color: 'text-yellow-600' },
    { name: 'Business', icon: Briefcase, count: emails?.filter(e => e.category === 'Business').length || 0, color: 'text-purple-600' },
    { name: 'Personal', icon: User, count: emails?.filter(e => e.category === 'Personal').length || 0, color: 'text-indigo-600' },
    { name: 'Promotional', icon: Star, count: emails?.filter(e => e.category === 'Promotional').length || 0, color: 'text-orange-600' },
    { name: 'Important', icon: AlertCircle, count: emails?.filter(e => e.category === 'Important').length || 0, color: 'text-red-600' }
  ];

  const filteredEmails = emails?.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || email.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getCategoryIcon = (category: string) => {
    const categoryMap = {
      'Brand Enquiry': Briefcase,
      'Collaboration': Users,
      'Fan Mail': Heart,
      'Thank You': Gift,
      'Business': Briefcase,
      'Personal': User,
      'Promotional': Star,
      'Important': AlertCircle
    };
    return categoryMap[category] || Mail;
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      'Brand Enquiry': 'bg-blue-100 text-blue-800',
      'Collaboration': 'bg-green-100 text-green-800',
      'Fan Mail': 'bg-pink-100 text-pink-800',
      'Thank You': 'bg-yellow-100 text-yellow-800',
      'Business': 'bg-purple-100 text-purple-800',
      'Personal': 'bg-indigo-100 text-indigo-800',
      'Promotional': 'bg-orange-100 text-orange-800',
      'Important': 'bg-red-100 text-red-800'
    };
    return colorMap[category] || 'bg-neutral-100 text-neutral-800';
  };

  const handleConnectGoogle = async () => {
    try {
      await connectGoogleAccount();
    } catch (error) {
      console.error('Failed to connect Google account:', error);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (window.confirm('Are you sure you want to disconnect your Google account? This will stop email synchronization.')) {
      try {
        await disconnectGoogleAccount();
        setIsConnected(false);
        setConnectedEmail('');
      } catch (error) {
        console.error('Failed to disconnect Google account:', error);
      }
    }
  };

  const handleRefreshEmails = async () => {
    if (isConnected) {
      await fetchEmails();
    }
  };

  const handleDraftReply = async (emailId) => {
    setDraftingEmailId(emailId);
    setIsDrafting(true);
    setDraftContent('');
    try {
      // API call to POST /api/personal/emails/:emailId/draft-reply
      // const response = await api.post(`/personal/emails/${emailId}/draft-reply`);
      // setDraftContent(response.data.draft);
      setDraftContent("This is a sample AI-generated draft reply expressing interest in the collaboration and asking for more details."); // Placeholder
    } catch (err) {
      setDraftContent("Failed to generate draft.");
    } finally {
      setIsDrafting(false);
    }
  };

  const SentimentIcon = ({ sentiment }) => {
    if (sentiment === 'Positive') return <Smile className="h-4 w-4 text-green-500" />;
    if (sentiment === 'Negative') return <Frown className="h-4 w-4 text-red-500" />;
    return <Meh className="h-4 w-4 text-neutral-500" />;
  };

  // If not connected, show connection interface
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Inbox</h1>
          <p className="text-neutral-600">Connect your Gmail to start managing emails with AI assistance</p>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">Connect Your Gmail</h3>
            <p className="text-neutral-600 mb-8">
              Securely connect your Gmail account to start organizing and categorizing your emails with AI
            </p>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleConnectGoogle}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 border border-neutral-300 rounded-lg shadow-sm bg-white text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
              )}
              {isLoading ? 'Connecting...' : 'Sign in with Google'}
            </button>

            <div className="mt-6 text-sm text-neutral-500">
              <p>🔒 Your data is encrypted and secure</p>
              <p>📧 We only access emails you explicitly allow</p>
              <p>🤖 AI categorization happens locally and securely</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Inbox</h1>
          <p className="text-neutral-600">Manage your emails with AI assistance</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleRefreshEmails}
            disabled={isLoading}
            className="flex items-center px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Mail className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Gmail Connected</p>
              <p className="text-xs text-green-700">{connectedEmail}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefreshEmails}
              disabled={isLoading}
              className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
              title="Sync emails"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleDisconnectGoogle}
              className="p-2 text-red-600 hover:text-red-700"
              title="Disconnect Gmail"
            >
              <Power className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedCategory === category.name
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                  >
                    <div className="flex items-center">
                      <IconComponent className={`h-5 w-5 mr-3 ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <button className="w-full flex items-center justify-center p-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-purple-300 hover:text-purple-600 transition-colors">
                <Tag className="h-5 w-5 mr-2" />
                Add Label
              </button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {selectedCategory === 'All' ? 'All Emails' : selectedCategory}
                </h3>
                <span className="text-sm text-neutral-500">
                  {filteredEmails.length} emails
                </span>
              </div>
            </div>

            <div className="divide-y divide-neutral-200">
              {isLoading && filteredEmails.length === 0 ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Loading emails...</h3>
                  <p className="text-neutral-500">Fetching and categorizing your emails with AI</p>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="p-12 text-center">
                  <Mail className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No emails found</h3>
                  <p className="text-neutral-500">
                    {searchTerm ? 'Try adjusting your search terms' : 'Your inbox is empty or emails are still being processed'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleRefreshEmails}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Emails
                    </button>
                  )}
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const CategoryIcon = getCategoryIcon(email.category);
                  return (
                    <div key={email.id} className="p-6 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {email.from.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {email.from}
                              </p>
                              <div className="flex items-center space-x-2">
                                {email.category && (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(email.category)}`}>
                                    <CategoryIcon className="h-3 w-3 mr-1" />
                                    {email.category}
                                  </span>
                                )}
                                <span className="text-xs text-neutral-500">
                                  {email.time}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-sm font-medium text-neutral-900 mb-1">
                              {email.subject}
                            </h4>

                            <p className="text-sm text-neutral-600 line-clamp-2">
                              {email.preview}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <SentimentIcon sentiment={email.sentiment} /> {/* ADD THIS */}
                          <button
                            onClick={() => handleDraftReply(email.id)}
                            className="p-2 text-neutral-400 hover:text-blue-500"
                            title="Draft Reply with AI"
                          >
                            <MessageSquare className="h-4 w-4" /> {/* ADD THIS */}
                          </button>
                          <button className="p-2 text-neutral-400 hover:text-yellow-500 transition-colors">
                            <Star className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                            <Archive className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {draftingEmailId && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                              <h3 className="text-lg font-bold mb-4">AI-Generated Draft</h3>
                              {isDrafting ? <p>Generating...</p> : <textarea value={draftContent} rows={10} className="w-full p-2 border rounded-md" />}
                              <button onClick={() => setDraftingEmailId(null)} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Close</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInbox;