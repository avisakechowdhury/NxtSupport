import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '../store/ticketStore';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../store/authStore';
import { 
  Plus, 
  User, 
  Mail, 
  AlertTriangle, 
  FileText, 
  Clock,
  ArrowLeft
} from 'lucide-react';

const ManualTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createManualTicket, isLoading } = useTicketStore();
  const { members, fetchTeamMembers } = useTeamStore();
  
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    senderName: '',
    senderEmail: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: '',
    category: 'general'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Description is required';
    }

    if (!formData.senderName.trim()) {
      newErrors.senderName = 'Customer name is required';
    }

    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = 'Customer email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) {
      newErrors.senderEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const ticketData = {
        ...formData,
        source: 'manual',
        createdBy: user?.id,
        createdByName: user?.name
      };

      await createManualTicket(ticketData);
      navigate('/tickets/all');
    } catch (error) {
      console.error('Failed to create manual ticket:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const priorityColors = {
    low: 'bg-neutral-100 text-neutral-800',
    medium: 'bg-primary-100 text-primary-800',
    high: 'bg-warning-100 text-warning-800',
    urgent: 'bg-error-100 text-error-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/tickets/all')}
            className="mr-4 p-2 text-neutral-500 hover:text-neutral-700 rounded-md hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Create Manual Ticket</h2>
            <p className="text-neutral-500">Create a support ticket manually for customer issues</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <Plus className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900">Ticket Information</h3>
              <p className="text-sm text-neutral-500">Fill in the details for the new support ticket</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="senderName" className="block text-sm font-medium text-neutral-700 mb-2">
                Customer Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  id="senderName"
                  value={formData.senderName}
                  onChange={(e) => handleInputChange('senderName', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.senderName ? 'border-error-300' : 'border-neutral-300'
                  }`}
                  placeholder="Enter customer name"
                />
              </div>
              {errors.senderName && (
                <p className="mt-1 text-sm text-error-600">{errors.senderName}</p>
              )}
            </div>

            <div>
              <label htmlFor="senderEmail" className="block text-sm font-medium text-neutral-700 mb-2">
                Customer Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="email"
                  id="senderEmail"
                  value={formData.senderEmail}
                  onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.senderEmail ? 'border-error-300' : 'border-neutral-300'
                  }`}
                  placeholder="customer@example.com"
                />
              </div>
              {errors.senderEmail && (
                <p className="mt-1 text-sm text-error-600">{errors.senderEmail}</p>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.subject ? 'border-error-300' : 'border-neutral-300'
              }`}
              placeholder="Brief description of the issue"
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-error-600">{errors.subject}</p>
            )}
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-neutral-700 mb-2">
              Description *
            </label>
            <textarea
              id="body"
              rows={6}
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.body ? 'border-error-300' : 'border-neutral-300'
              }`}
              placeholder="Detailed description of the customer's issue or request..."
            />
            {errors.body && (
              <p className="mt-1 text-sm text-error-600">{errors.body}</p>
            )}
          </div>

          {/* Priority and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[formData.priority]}`}>
                  {formData.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-neutral-700 mb-2">
                Assign To
              </label>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="general">General Support</option>
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="account">Account Issue</option>
            </select>
          </div>

          {/* Created By Info */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-neutral-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-neutral-900">Created by: {user?.name}</p>
                <p className="text-xs text-neutral-500">This ticket will be marked as manually created</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => navigate('/tickets/all')}
              className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualTicket;