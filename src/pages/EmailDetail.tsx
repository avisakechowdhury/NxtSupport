import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessEmailStore } from '../store/businessEmailStore';
import { usePersonalEmailStore } from '../store/personalEmailStore';
import { useTicketStore } from '../store/ticketStore';
import { ArrowLeft, Mail, Clock, User, Reply, Forward, Archive, Trash2, Star, MoreHorizontal, Download, Flag } from 'lucide-react';

// Utility to generate a color from a string (e.g., email)
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
}

// Local type definitions for type guards
interface BusinessEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  dateTime: string;
  body?: string;
  bodyHtml?: string;
  type?: 'Complaint' | 'Normal' | string;
  isUnread?: boolean;
  ticketNumber?: string;
  acknowledged?: boolean;
}
interface PersonalEmail {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  category: string;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  bodyHtml?: string;
}

const EmailDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Try both stores for flexibility (business or personal)
  const { emails: businessEmails } = useBusinessEmailStore();
  const { emails: personalEmails } = usePersonalEmailStore();
  const email = businessEmails.find(e => e.id === id) || personalEmails.find(e => e.id === id);

  const [isStarred, setIsStarred] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAction = (action: string) => {
    // Implement backend logic for actions if needed
    // For now, just log
    console.log(`Action: ${action}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Type guards
  const isBusinessEmail = (e: any): e is BusinessEmail => {
    return e && 'type' in e;
  };
  const isPersonalEmail = (e: any): e is PersonalEmail => {
    return e && 'category' in e;
  };

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Mail className="relative h-20 w-20 text-white mb-6" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Email Not Found</h2>
        <p className="text-slate-300 mb-8 text-center max-w-md">The email you are looking for does not exist or has not been loaded yet.</p>
        <button 
          onClick={handleGoBack}
          className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Go Back
        </button>
      </div>
    );
  }

  const { tickets } = useTicketStore();
  // Try to find a related ticket by matching subject or sender
  const relatedTicket = email ? tickets.find(t => t.subject === email.subject || t.senderEmail === email.from) : null;

  return (
    <div className="min-h-screen bg-white py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleGoBack}
            className="group flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Inbox</span>
          </button>
        </div>
        {/* Email Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
          {/* Email Header */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Profile circle with first letter and unique color */}
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center shadow text-white text-2xl font-bold select-none"
                    style={{ background: stringToColor(email.from || email.subject || 'N') }}
                  >
                    {((email.from || email.subject || 'N').trim().charAt(0).toUpperCase())}
                  </div>
                  {('priority' in email && email.priority === 'high') ? (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">!</span>
                    </div>
                  ) : null}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 mb-1 tracking-tight flex items-center gap-2">
                    {email.subject}
                    {/* Show complaint tag if type/category or subject contains 'complaint' */}
                    {(isBusinessEmail(email) && email.type === 'Complaint') || (isPersonalEmail(email) && email.category === 'Complaint') || (email.subject && email.subject.toLowerCase().includes('complaint')) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 ml-2">Complaint</span>
                    ) : null}
                  </h1>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <span className="font-medium">{email.from}</span>
                    <span className="text-neutral-400">→</span>
                    <span className="text-sm">{('to' in email && typeof email.to === 'string') ? email.to : ''}</span>
                  </div>
                  {/* Ticket number if available */}
                  {relatedTicket && (
                    <div className="mt-1 text-xs text-neutral-500">
                      Ticket Number: <span className="font-semibold text-neutral-800">{relatedTicket.ticketNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(('dateTime' in email && email.dateTime) ? email.dateTime : ('time' in email && email.time ? email.time : ''))}
                </div>
                {('hasAttachments' in email && email.hasAttachments) ? (
                  <div className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                    <Download className="h-3 w-3" />
                    Attachment
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {/* Email Body */}
          <div className="p-6">
            <div className="prose max-w-none text-neutral-800">
              <div 
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html:
                  isBusinessEmail(email)
                    ? (email.bodyHtml && typeof email.bodyHtml === 'string' && email.bodyHtml)
                      || (email.body && typeof email.body === 'string' && email.body)
                      || (email.snippet && typeof email.snippet === 'string' && email.snippet)
                      || ''
                    : isPersonalEmail(email)
                      ? (email.bodyHtml && typeof email.bodyHtml === 'string' && email.bodyHtml)
                        || (email.preview && typeof email.preview === 'string' && email.preview)
                        || ''
                      : ''
                }}
                style={{ wordBreak: 'break-word' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail; 