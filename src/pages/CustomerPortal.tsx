import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Clock, 
  MessageSquare, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Mail,
  FileText,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';

interface TicketActivity {
  _id: string;
  activityType: string;
  details: string;
  userName: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  body: string;
  senderEmail: string;
  senderName: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  escalatedAt?: string;
  assignedTo?: {
    name: string;
    email: string;
  };
  activities?: TicketActivity[];
  comments?: Array<{
    userName: string;
    text: string;
    createdAt: string;
  }>;
}

const CustomerPortal = () => {
  const { token } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing ticket link');
      setLoading(false);
      return;
    }

    fetchTicket();
  }, [token]);

  const fetchTicket = async () => {
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${API_URL}/tickets/public/${token}`);
      setTicket(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-5 w-5 text-neutral-500" />;
      case 'acknowledged':
        return <MessageSquare className="h-5 w-5 text-primary-500" />;
      case 'in_progress':
        return <User className="h-5 w-5 text-primary-500" />;
      case 'escalated':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      default:
        return <Clock className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-neutral-100 text-neutral-800';
      case 'acknowledged':
        return 'bg-primary-100 text-primary-800';
      case 'in_progress':
        return 'bg-primary-100 text-primary-800';
      case 'escalated':
        return 'bg-warning-100 text-warning-800';
      case 'resolved':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error-100 text-error-800';
      case 'high':
        return 'bg-warning-100 text-warning-800';
      case 'medium':
        return 'bg-primary-100 text-primary-800';
      case 'low':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-2 text-neutral-500">Loading ticket information...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Unable to Load Ticket</h2>
          <p className="text-neutral-500">{error || 'Ticket not found'}</p>
          <p className="text-sm text-neutral-400 mt-2">
            Please check your link or contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Support Ticket</h1>
                <p className="text-neutral-500">Track your support request</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-500">Ticket Number</div>
              <div className="text-lg font-semibold text-neutral-900">{ticket.ticketNumber}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">Ticket Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">{ticket.subject}</h3>
                  <p className="text-neutral-600 whitespace-pre-wrap">{ticket.body}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Created</div>
                    <div className="flex items-center text-sm text-neutral-900">
                      <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                      {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Last Updated</div>
                    <div className="flex items-center text-sm text-neutral-900">
                      <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                      {formatDate(ticket.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            {ticket.comments && ticket.comments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
                <div className="p-6 border-b border-neutral-200">
                  <h2 className="text-lg font-semibold text-neutral-900">Updates & Comments</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {ticket.comments.map((comment, index) => (
                      <div key={index} className="border-l-4 border-primary-200 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-neutral-900">{comment.userName}</div>
                          <div className="text-sm text-neutral-500">{formatDate(comment.createdAt)}</div>
                        </div>
                        <p className="text-neutral-600">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Current Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    {getStatusIcon(ticket.status)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Priority</div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </div>

                  {ticket.assignedTo && (
                    <div>
                      <div className="text-sm font-medium text-neutral-500 mb-1">Assigned To</div>
                      <div className="flex items-center text-sm text-neutral-900">
                        <User className="h-4 w-4 mr-2 text-neutral-400" />
                        {ticket.assignedTo.name}
                      </div>
                    </div>
                  )}

                  {ticket.resolvedAt && (
                    <div>
                      <div className="text-sm font-medium text-neutral-500 mb-1">Resolved</div>
                      <div className="flex items-center text-sm text-neutral-900">
                        <CheckCircle className="h-4 w-4 mr-2 text-success-500" />
                        {formatDate(ticket.resolvedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Name</div>
                    <div className="flex items-center text-sm text-neutral-900">
                      <User className="h-4 w-4 mr-2 text-neutral-400" />
                      {ticket.senderName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Email</div>
                    <div className="flex items-center text-sm text-neutral-900">
                      <Mail className="h-4 w-4 mr-2 text-neutral-400" />
                      {ticket.senderEmail}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-primary-50 rounded-lg border border-primary-200 p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Need Help?</h3>
              <p className="text-primary-700 text-sm mb-4">
                If you have additional information or questions about this ticket, please reply to the original email thread.
              </p>
              <div className="text-xs text-primary-600">
                <p>• This link is unique to your ticket</p>
                <p>• Keep it secure and don't share it publicly</p>
                <p>• The link will remain active until the ticket is resolved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal; 