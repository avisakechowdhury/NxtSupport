import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessEmailStore } from '../store/businessEmailStore';
import { usePersonalEmailStore } from '../store/personalEmailStore';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleGoBack}
            className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Inbox</span>
          </button>
        </div>
        {/* Email Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Email Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Profile circle with first letter and unique color */}
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg text-white text-2xl font-bold select-none"
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
                  <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">{email.subject}</h1>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="font-medium">{email.from}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-sm">{('to' in email && typeof email.to === 'string') ? email.to : ''}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(('dateTime' in email && email.dateTime) ? email.dateTime : ('time' in email && email.time ? email.time : ''))}
                </div>
                {('hasAttachments' in email && email.hasAttachments) ? (
                  <div className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    <Download className="h-3 w-3" />
                    Attachment
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {/* Email Body */}
          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-slate-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: ('body' in email && typeof email.body === 'string' && email.body) ? email.body : ('preview' in email && typeof email.preview === 'string' && email.preview) ? email.preview : ('snippet' in email && typeof email.snippet === 'string' && email.snippet ? email.snippet : '') }}
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