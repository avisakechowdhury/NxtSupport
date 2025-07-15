import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicketStore } from '../../store/ticketStore';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import { User as UserIcon, Mail, ChevronDown, Send, CheckCircle, AlertTriangle, ArrowLeft, Plus, UserPlus, Loader2, Mail as MailIcon, Sparkles } from 'lucide-react';
import axios from 'axios';

function stripQuotedText(text: string) {
  return text.split(/On\s.+wrote:|From:.+\n|-----Original Message-----/)[0].trim();
}
function filterDuplicates(activities: any[]) {
  const seen = new Set();
  return activities.filter((a) => {
    const key = a.content ? a.content.trim() : a.details;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\n{2,}/g, '\n').trim();
}

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    fetchTicketById,
    fetchTicketActivities,
    currentTicket,
    activities,
    updateTicketStatus,
    assignTicket,
    addComment,
    isLoading,
    updateTicketPriority,
  } = useTicketStore();
  const { members, fetchTeamMembers } = useTeamStore();

  const [note, setNote] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [priorityEdit, setPriorityEdit] = useState(false);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailTo, setMailTo] = useState(currentTicket?.senderEmail || '');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [sendingMail, setSendingMail] = useState(false);

  // Priority color map
  const priorityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-700',
    urgent: 'bg-purple-100 text-purple-700',
  };

  // Priority update handler
  const handlePriorityUpdate = async (newPriority: string) => {
    if (!id || !currentTicket || currentTicket.priority === newPriority) return;
    setPriorityLoading(true);
    await updateTicketPriority(id, newPriority);
    await fetchTicketById(id);
    setPriorityLoading(false);
    setPriorityEdit(false);
  };

  // AI generation handlers (mocked)
  const handleAIGenerateEmail = () => {
    setMailBody('Dear Customer,\n\nThank you for reaching out. We are looking into your issue and will get back to you shortly.\n\nBest regards,\nSupport Team');
  };
  const handleAIGenerateComment = () => {
    setNote('AI Suggestion: Please follow up with the customer regarding their recent inquiry.');
  };
  const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';
  const handleSendMail = async () => {
    setSendingMail(true);
    console.log('Gmail API: Sending email', { to: mailTo, subject: mailSubject, body: mailBody });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/gmail/send`,
        {
          to: mailTo,
          subject: mailSubject,
          body: mailBody,
          ticketId: currentTicket?._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Gmail API: Email sent response', response.data);
      alert('Email sent successfully!');
      setShowMailModal(false);
      setMailTo(currentTicket?.senderEmail || '');
      setMailSubject('');
      setMailBody('');
      // Refresh activities after sending
      if (currentTicket?._id) await fetchTicketActivities(currentTicket._id);
    } catch (error) {
      console.error('Gmail API: Failed to send email', error);
      alert('Failed to send email. Please check the console for details.');
    } finally {
      setSendingMail(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketById(id);
      fetchTicketActivities(id);
    }
    fetchTeamMembers();
  }, [id, fetchTicketById, fetchTicketActivities, fetchTeamMembers]);

  const handleStatusChange = async (status: string) => {
    setActionLoading(true);
    await updateTicketStatus(id!, status);
    await fetchTicketById(id!);
    await fetchTicketActivities(id!);
    setActionLoading(false);
  };

  const handleAssign = async (userId: string) => {
    setAssignLoading(true);
    await assignTicket(id!, userId);
    await fetchTicketById(id!);
    setAssignLoading(false);
    setAssignOpen(false);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addComment(id!, note);
    setNote('');
    await fetchTicketActivities(id!);
  };

  // Reverse activities so newest is at the top
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    return filterDuplicates(
      [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }, [activities]);

  const isClosed = currentTicket?.status === 'resolved' || currentTicket?.status === 'escalated';

  // When opening the modal, always set mailTo to currentTicket?.senderEmail
  const openMailModal = () => {
    if (currentTicket?.senderEmail) setMailTo(currentTicket.senderEmail);
    setShowMailModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-100 via-orange-100 to-white p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left: Main Card */}
        <div className="flex-1">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative">
            {/* Top Bar: Ticket Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{currentTicket?.ticketNumber}</h2>
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {(currentTicket?.priority ? currentTicket.priority.charAt(0).toUpperCase() + currentTicket.priority.slice(1) : 'Low')}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  {currentTicket?.status || 'New'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{currentTicket?.senderEmail}</span>
                <span>•</span>
                <span>{new Date(currentTicket?.createdAt || '').toLocaleString()}</span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-inner">
              <div className="flex items-center mb-2">
                <UserIcon className="w-6 h-6 text-gray-400 mr-2" />
                <span className="font-semibold">{currentTicket?.senderName}</span>
              </div>
              <div className="text-gray-800 whitespace-pre-line">{stripHtml(currentTicket?.body || '')}</div>
            </div>

            {/* Activity Timeline (timeline style) */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Activity</h3>
              <div className="relative flex flex-col gap-8 pl-8">
                {/* Vertical line */}
                <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-blue-200 z-0" />
                {filteredActivities.map((activity, idx) => {
                  const isCustomerReply = activity.activityType === 'reply' && activity.userName !== user?.name;
                  const isComment = activity.activityType === 'comment';
                  const replyBody = isCustomerReply ? stripHtml(stripQuotedText(activity.content || '')) : '';
                  const commentBody = isComment ? stripHtml(activity.content || activity.details || '') : '';
                  return (
                    <div key={activity._id || idx} className="relative flex items-start gap-3 z-10">
                      {/* Timeline check icon */}
                      <div className="flex flex-col items-center">
                        <span className="bg-blue-500 text-white rounded-full p-1 shadow"><CheckCircle className="w-4 h-4" /></span>
                      </div>
                      <div className={`max-w-xl flex flex-col ${isCustomerReply ? 'self-start' : isComment ? 'self-end' : 'self-start'}`}>
                        <div className={`rounded-2xl px-5 py-3 shadow-sm mb-1 ${isCustomerReply ? 'bg-yellow-100 border-l-4 border-yellow-400' : isComment ? 'bg-blue-100 border-l-4 border-blue-400' : 'bg-gray-100'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                            <span className={`font-semibold ${isCustomerReply ? 'text-yellow-800' : isComment ? 'text-blue-800' : 'text-gray-700'}`}>{activity.userName}</span>
                            <span className="text-xs text-gray-400 ml-2">{new Date(activity.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-gray-800 whitespace-pre-line">
                            {isCustomerReply && <span className="font-medium text-yellow-900">Customer replied:</span>}
                            {isCustomerReply && replyBody}
                            {isComment && <span className="font-medium text-blue-900">Comment:</span>}
                            {isComment && commentBody}
                            {!isCustomerReply && !isComment && (activity.details || activity.content)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Right: Sticky Info Panel */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Information</h3>
            <div className="mb-2">
              <span className="block text-sm text-gray-500">Status</span>
              <span className="block text-base font-medium text-gray-900">{currentTicket?.status ? currentTicket.status.charAt(0).toUpperCase() + currentTicket.status.slice(1) : 'New'}</span>
            </div>
            <div className="mb-2">
              <span className="block text-sm text-gray-500">Priority</span>
              {(!isClosed && !priorityEdit) ? (
                <button
                  className={`mt-1 px-3 py-1 rounded-full text-sm font-bold cursor-pointer border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${priorityColors[currentTicket?.priority || 'low']}`}
                  onClick={() => setPriorityEdit(true)}
                  disabled={priorityLoading}
                >
                  {priorityLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : (currentTicket?.priority ? currentTicket.priority.charAt(0).toUpperCase() + currentTicket.priority.slice(1) : 'Low')}
                </button>
              ) : (!isClosed && priorityEdit) ? (
                <select
                  className="mt-1 px-3 py-1 rounded-full text-sm font-bold border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={currentTicket?.priority || 'low'}
                  onChange={e => handlePriorityUpdate(e.target.value)}
                  onBlur={() => setPriorityEdit(false)}
                  autoFocus
                  disabled={priorityLoading}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <span className={`mt-1 px-3 py-1 rounded-full text-sm font-bold ${priorityColors[currentTicket?.priority || 'low']}`}>{currentTicket?.priority ? currentTicket.priority.charAt(0).toUpperCase() + currentTicket.priority.slice(1) : 'Low'}</span>
              )}
            </div>
            <div className="mb-2">
              <span className="block text-sm text-gray-500">Created</span>
              <span className="block text-base font-medium text-gray-900">{currentTicket?.createdAt ? new Date(currentTicket.createdAt).toLocaleString() : ''}</span>
            </div>
            <div className="mb-2 relative">
              <span className="block text-sm text-gray-500">Assigned To</span>
              <span className="block text-base font-medium text-gray-900">
                {currentTicket?.assignedTo
                  ? typeof currentTicket.assignedTo === 'object'
                    ? `${(currentTicket.assignedTo as User).name} (${(currentTicket.assignedTo as User).role || 'Agent'})`
                    : 'Support Agent'
                  : 'Unassigned'}
              </span>
              {/* Assign button below Assigned To, only if not closed */}
              {!isClosed && (
                <>
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-blue-500 text-white font-bold py-2 shadow hover:bg-blue-600 transition mb-2"
                    onClick={() => setAssignOpen((v) => !v)}
                    disabled={assignLoading}
                  >
                    <UserPlus className="w-5 h-5" /> Assign
                  </button>
                  {/* Assign dropdown */}
                  {assignOpen && (
                    <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg w-48">
                      {members.map((member: User) => (
                        <button
                          key={member._id}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50"
                          onClick={() => handleAssign(member._id)}
                        >
                          {member.name} ({member.role})
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mb-2">
              <span className="block text-sm text-gray-500">Language</span>
              <span className="block text-base font-medium text-gray-900">{currentTicket?.originalLanguage === 'en' ? 'English' : currentTicket?.originalLanguage?.toUpperCase() || ''}</span>
            </div>
            <div className="mb-4">
              <span className="block text-sm text-gray-500">AI Confidence</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.round((currentTicket?.aiConfidence || 0) * 100)}%` }}></div>
              </div>
              <span className="block text-xs text-gray-700 mt-1">Classification {Math.round((currentTicket?.aiConfidence || 0) * 100)}%</span>
            </div>
            {/* Resolve and Escalate buttons side by side, only if not closed */}
            {!isClosed && (
              <div className="flex gap-2 mb-4">
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-green-500 text-white font-bold py-2 shadow hover:bg-green-600 transition"
                  onClick={() => handleStatusChange('resolved')}
                  disabled={actionLoading || isLoading}
                >
                  <CheckCircle className="w-5 h-5" /> Resolve
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-orange-500 text-white font-bold py-2 shadow hover:bg-orange-600 transition"
                  onClick={() => handleStatusChange('escalated')}
                  disabled={actionLoading || isLoading}
                >
                  <AlertTriangle className="w-5 h-5" /> Escalate
                </button>
              </div>
            )}
            {/* Add Note input in right panel, only if not closed */}
            {!isClosed && (
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="flex w-full gap-2">
                  <input
                    className="flex-1 px-4 py-2 rounded-lg border border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                    disabled={isLoading}
                  />
                  <button
                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center"
                    type="button"
                    title="AI Generated Comment"
                    onClick={handleAIGenerateComment}
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
                <button
                  className="w-12 h-12 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:shadow-lg hover:bg-blue-600"
                  onClick={handleAddNote}
                  disabled={isLoading}
                  type="button"
                >
                  <Plus className="w-6 h-6" />
                </button>
                {/* Quick Mail Button */}
                <button
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-full bg-indigo-500 text-white font-bold py-2 shadow hover:bg-indigo-600 transition"
                  onClick={() => { console.log('Quick Mail: Modal opened'); openMailModal(); }}
                  type="button"
                >
                  <MailIcon className="w-5 h-5" /> Quick Mail
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating Mail Composer Modal */}
      {showMailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
              onClick={() => setShowMailModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MailIcon className="w-6 h-6" />Send Quick Email</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-gray-100 cursor-not-allowed"
                value={mailTo}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                value={mailSubject}
                onChange={e => setMailSubject(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none min-h-[100px]"
                value={mailBody}
                onChange={e => setMailBody(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mb-4">
              <button
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-indigo-500 text-white font-bold py-2 shadow hover:bg-indigo-600 transition"
                onClick={handleSendMail}
                disabled={sendingMail}
              >
                {sendingMail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Send
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-blue-100 text-blue-700 font-bold py-2 shadow hover:bg-blue-200 transition"
                onClick={handleAIGenerateEmail}
                type="button"
              >
                <Sparkles className="w-5 h-5" /> AI Generate Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;