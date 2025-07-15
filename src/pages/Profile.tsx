import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTeamStore } from '../store/teamStore';
import { User, Mail, Building, Shield, Edit, Save, X, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, company, updateUserProfile } = useAuthStore();
  const { members, fetchTeamMembers } = useTeamStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

  // Fetch team members for business users
  useEffect(() => {
    if (user?.accountType === 'business') {
      fetchTeamMembers();
    }
  }, [user?.accountType, fetchTeamMembers]);

  const handleEdit = () => {
    setEditedUser({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await updateUserProfile(editedUser);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleViewTeam = () => {
    navigate('/team');
  };

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
        setContactForm({ name: user?.name || '', email: user?.email || '', message: '' });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Profile</h1>
          <p className="text-neutral-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>
        
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">Personal Information</h2>
                {isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-3 py-1.5 border border-neutral-300 rounded text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                      <User className="h-5 w-5 text-neutral-400 mr-3" />
                      <span className="text-neutral-900">{user?.name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                      <Mail className="h-5 w-5 text-neutral-400 mr-3" />
                      <span className="text-neutral-900">{user?.email}</span>
                    </div>
                  )}
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                    <Shield className="h-5 w-5 text-neutral-400 mr-3" />
                    <span className="text-neutral-900 capitalize">
                      {user?.accountType === 'business' ? 'Business Account' : 'Personal Account'}
                    </span>
                  </div>
                </div>

                {/* Role (for business users) */}
                {user?.accountType === 'business' && user?.role && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Role
                    </label>
                    <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                      <Shield className="h-5 w-5 text-neutral-400 mr-3" />
                      <span className="text-neutral-900 capitalize">{user.role}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plan & Subscription Section (for business users) */}
          {user?.accountType === 'business' && (
            <div className="bg-white shadow-card rounded-lg overflow-hidden mt-6 animate-fade-in-up">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-1 flex items-center gap-2">
                    <span>Plan & Subscription</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">Coming Soon</span>
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Advanced subscription plans with more features are on the way. Stay tuned!
                  </p>
                  <div className="mt-2 text-sm text-neutral-900 font-semibold">
                    Current Plan: <span className="bg-neutral-100 px-2 py-0.5 rounded">Free</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    className="px-4 py-2 rounded-lg bg-primary-200 text-primary-700 font-medium cursor-not-allowed opacity-60 mb-2"
                    disabled
                  >
                    Upgrade (Coming Soon)
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
                    onClick={() => setShowContactModal(true)}
                  >
                    Talk to Us
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Business Information (for business users) */}
          {user?.accountType === 'business' && company && (
            <div className="bg-white shadow-card rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Business Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Company Name
                    </label>
                    <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                      <Building className="h-5 w-5 text-neutral-400 mr-3" />
                      <span className="text-neutral-900">{company.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Domain
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-900">{company.domain || 'Not set'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Support Email
                    </label>
                    <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                      <Mail className="h-5 w-5 text-neutral-400 mr-3" />
                      <span className="text-neutral-900">{company.supportEmail}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Connection Status
                    </label>
                    <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                      <div className={`h-2 w-2 rounded-full mr-3 ${
                        company.emailConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-neutral-900">
                        {company.emailConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Statistics (for business users) */}
          {user?.accountType === 'business' && (
            <div className="bg-white shadow-card rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Team Overview</h3>
                  {/* View Team button removed as requested */}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">{members.length}</div>
                    <div className="text-xs text-neutral-600">Total Members</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-error-600">
                      {members.filter(m => m.role === 'admin').length}
                    </div>
                    <div className="text-xs text-neutral-600">Admins</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {members.filter(m => m.role === 'agent').length}
                    </div>
                    <div className="text-xs text-neutral-600">Agents</div>
                  </div>
                </div>

                {members.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="text-center">
                      <div className="text-sm text-neutral-600 mb-1">Team Composition</div>
                      <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500">
                        <span className="flex items-center space-x-1">
                          <Shield className="h-3 w-3 text-error-600" />
                          <span>{Math.round((members.filter(m => m.role === 'admin').length / members.length) * 100)}% Admin</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-blue-600" />
                          <span>{Math.round((members.filter(m => m.role === 'agent').length / members.length) * 100)}% Agent</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-neutral-600" />
                          <span>{Math.round((members.filter(m => m.role === 'viewer').length / members.length) * 100)}% Viewer</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Connection Status (for personal users) */}
          {user?.accountType === 'personal' && (
            <div className="bg-white shadow-card rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Email Connection</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Connection Status
                    </label>
                    <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                      <div className={`h-2 w-2 rounded-full mr-3 ${
                        user.emailConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-neutral-900">
                        {user.emailConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                  </div>

                  {user.googleEmail && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Connected Email
                      </label>
                      <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                        <Mail className="h-5 w-5 text-neutral-400 mr-3" />
                        <span className="text-neutral-900">{user.googleEmail}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account Statistics */}
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Member Since</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                {user?.accountType === 'business' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Account Type</span>
                    <span className="text-sm font-medium text-neutral-900">Business</span>
                  </div>
                )}
                
                {user?.accountType === 'personal' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Account Type</span>
                    <span className="text-sm font-medium text-neutral-900">Personal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up">
            <button
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700"
              onClick={() => setShowContactModal(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Talk to Us</h3>
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
                  rows={5}
                  required
                />
              </div>
              {contactSuccess && <div className="p-3 bg-green-50 text-green-700 rounded">{contactSuccess}</div>}
              {contactError && <div className="p-3 bg-red-50 text-red-700 rounded">{contactError}</div>}
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50"
                disabled={contactLoading}
              >
                {contactLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 