import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  ArrowUpCircle, 
  MessageSquare, 
  AlertTriangle, 
  User,
  Clock,
  Clipboard,
  Languages
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useTicketStore } from '../../store/ticketStore';
import { TicketActivity } from '../../types';

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentTicket, 
    activities, 
    fetchTicketById, 
    fetchTicketActivities, 
    generateAIResponse,
    escalateTicket,
    resolveTicket,
    assignTicket,
    isLoading 
  } = useTicketStore();
  
  const [escalationReason, setEscalationReason] = useState('');
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [responseConfidence, setResponseConfidence] = useState(0);

  useEffect(() => {
    if (id) {
      fetchTicketById(id);
      fetchTicketActivities(id);
    }
  }, [id, fetchTicketById, fetchTicketActivities]);

  const handleGenerateResponse = async () => {
    if (!id) return;
    
    setIsGeneratingResponse(true);
    await generateAIResponse(id);
    setIsGeneratingResponse(false);
    
    // Set a random confidence level between 75% and 98%
    setResponseConfidence(Math.floor(Math.random() * 23) + 75);
  };

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !escalationReason) return;
    
    await escalateTicket(id, escalationReason);
    setShowEscalateForm(false);
    setEscalationReason('');
  };

  const handleResolve = async () => {
    if (!id) return;
    await resolveTicket(id);
  };

  const handleAssign = async () => {
    if (!id) return;
    // In a real app, you would show a user selector
    await assignTicket(id, '3');
  };

  if (isLoading || !currentTicket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="mr-4 text-neutral-500 hover:text-neutral-700"
              onClick={() => navigate('/tickets/all')}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-neutral-900">
              Ticket {currentTicket.ticketNumber}
            </h2>
          </div>
          
          <div className="flex space-x-3">
            {currentTicket.status !== 'resolved' && currentTicket.status !== 'closed' && (
              <button
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500"
                onClick={handleResolve}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Resolve
              </button>
            )}
            
            {currentTicket.status !== 'escalated' && (
              <button
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-warning-600 hover:bg-warning-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500"
                onClick={() => setShowEscalateForm(true)}
              >
                <ArrowUpCircle className="h-4 w-4 mr-1" />
                Escalate
              </button>
            )}
            
            {!currentTicket.assignedTo && (
              <button
                className="inline-flex items-center px-3 py-1.5 border border-neutral-300 text-xs font-medium rounded text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleAssign}
              >
                <User className="h-4 w-4 mr-1" />
                Assign
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Ticket details */}
          <div className="md:col-span-2">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {currentTicket.subject}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentTicket.status === 'escalated' 
                    ? 'bg-warning-100 text-warning-800' 
                    : currentTicket.status === 'resolved' || currentTicket.status === 'responded'
                    ? 'bg-success-100 text-success-800'
                    : 'bg-primary-100 text-primary-800'
                }`}>
                  {currentTicket.status.charAt(0).toUpperCase() + currentTicket.status.slice(1)}
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentTicket.priority === 'urgent' 
                    ? 'bg-error-100 text-error-800' 
                    : currentTicket.priority === 'high'
                    ? 'bg-warning-100 text-warning-800'
                    : currentTicket.priority === 'medium'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {currentTicket.priority.charAt(0).toUpperCase() + currentTicket.priority.slice(1)} Priority
                </span>
                
                {currentTicket.originalLanguage !== 'en' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                    <Languages className="h-3 w-3 mr-1" />
                    {currentTicket.originalLanguage.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
                <div className="flex items-start mb-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-neutral-500" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">
                      {currentTicket.senderName} <span className="text-neutral-500 font-normal">&lt;{currentTicket.senderEmail}&gt;</span>
                    </p>
                    <p className="text-xs text-neutral-500">
                      {format(new Date(currentTicket.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line">{currentTicket.body}</p>
                </div>
              </div>
              
              {showEscalateForm && (
                <div className="bg-warning-50 p-4 rounded-lg border border-warning-200 mb-6 animate-fade-in">
                  <h4 className="text-sm font-medium text-warning-800 mb-2">Escalate Ticket</h4>
                  <form onSubmit={handleEscalate}>
                    <label className="block text-sm text-warning-700 mb-1">
                      Reason for escalation
                    </label>
                    <textarea
                      className="block w-full rounded-md border-warning-300 shadow-sm focus:border-warning-500 focus:ring-warning-500 sm:text-sm mb-3"
                      rows={3}
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      required
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => setShowEscalateForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-warning-600 hover:bg-warning-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500"
                      >
                        Escalate
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {currentTicket.responseText ? (
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
                  <div className="flex items-start mb-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">
                        AI Response
                      </p>
                      <p className="text-xs text-neutral-500">
                        {currentTicket.responseGeneratedAt ? format(new Date(currentTicket.responseGeneratedAt), "MMM d, yyyy 'at' h:mm a") : 'Generated automatically'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line">{currentTicket.responseText}</p>
                  </div>
                  
                  <div className="mt-3 flex justify-between">
                    <div className="flex items-center text-xs text-neutral-500">
                      <div className="flex items-center">
                        <span className="mr-1">Confidence:</span>
                        <div className="bg-neutral-200 rounded-full h-2 w-20">
                          <div 
                            className={`rounded-full h-2 ${
                              currentTicket.aiConfidence > 0.9 
                                ? 'bg-success-500' 
                                : currentTicket.aiConfidence > 0.7 
                                ? 'bg-primary-500' 
                                : 'bg-warning-500'
                            }`}
                            style={{ width: `${currentTicket.aiConfidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-1">{Math.round(currentTicket.aiConfidence * 100)}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <button className="text-xs text-primary-600 hover:text-primary-800" title="Copy to clipboard">
                        <Clipboard className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={handleGenerateResponse}
                    disabled={isGeneratingResponse}
                  >
                    {isGeneratingResponse ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating AI Response...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Generate AI Response
                      </>
                    )}
                  </button>
                </div>
              )}
              
              <div className="border-t border-neutral-200 pt-4">
                <h4 className="text-sm font-medium text-neutral-900 mb-3">Activity Log</h4>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {activities.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== activities.length - 1 ? (
                            <span
                              className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200"
                              aria-hidden="true"
                            ></span>
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            <div>
                              <div className="relative px-1">
                                <div className="h-8 w-8 bg-neutral-100 rounded-full ring-8 ring-white flex items-center justify-center">
                                  {activity.activityType === 'created' && (
                                    <Clock className="h-4 w-4 text-neutral-500" />
                                  )}
                                  {activity.activityType === 'statusChanged' && (
                                    <Clock className="h-4 w-4 text-neutral-500" />
                                  )}
                                  {activity.activityType === 'responded' && (
                                    <MessageSquare className="h-4 w-4 text-primary-500" />
                                  )}
                                  {activity.activityType === 'escalated' && (
                                    <AlertTriangle className="h-4 w-4 text-warning-500" />
                                  )}
                                  {activity.activityType === 'assigned' && (
                                    <User className="h-4 w-4 text-primary-500" />
                                  )}
                                  {activity.activityType === 'note' && (
                                    <MessageSquare className="h-4 w-4 text-neutral-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-neutral-900">
                                    {activity.userName || 'System'}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-sm text-neutral-500">
                                  {formatDistanceToNow(new Date(activity.createdAt))} ago
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-neutral-700">
                                <p>{activity.details}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Metadata */}
          <div className="md:col-span-1">
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <h4 className="text-sm font-medium text-neutral-900 mb-3">Ticket Information</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500">Status</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {currentTicket.status.charAt(0).toUpperCase() + currentTicket.status.slice(1)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-neutral-500">Priority</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {currentTicket.priority.charAt(0).toUpperCase() + currentTicket.priority.slice(1)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-neutral-500">Created</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {format(new Date(currentTicket.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                
                {currentTicket.assignedTo && (
                  <div>
                    <p className="text-xs text-neutral-500">Assigned To</p>
                    <p className="text-sm font-medium text-neutral-900">
                      Support Agent
                    </p>
                  </div>
                )}
                
                {currentTicket.escalatedAt && (
                  <div>
                    <p className="text-xs text-neutral-500">Escalated At</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {format(new Date(currentTicket.escalatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                )}
                
                {currentTicket.resolvedAt && (
                  <div>
                    <p className="text-xs text-neutral-500">Resolved At</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {format(new Date(currentTicket.resolvedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-neutral-500">Language</p>
                  <div className="flex items-center text-sm font-medium text-neutral-900">
                    {currentTicket.originalLanguage === 'en' ? 'English' : currentTicket.originalLanguage === 'fr' ? 'French' : currentTicket.originalLanguage.toUpperCase()}
                    {currentTicket.originalLanguage !== 'en' && (
                      <span className="ml-1 text-xs text-neutral-500">(Auto-translated)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-900 mb-3">AI Confidence</h4>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-neutral-500">Classification</p>
                      <p className="text-xs font-medium text-neutral-700">
                        {Math.round(currentTicket.aiConfidence * 100)}%
                      </p>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${
                          currentTicket.aiConfidence > 0.9 
                            ? 'bg-success-500' 
                            : currentTicket.aiConfidence > 0.75 
                            ? 'bg-primary-500' 
                            : 'bg-warning-500'
                        }`}
                        style={{ width: `${currentTicket.aiConfidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {responseConfidence > 0 && (
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-500">Response</p>
                        <p className="text-xs font-medium text-neutral-700">
                          {responseConfidence}%
                        </p>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${
                            responseConfidence > 90 
                              ? 'bg-success-500' 
                              : responseConfidence > 80 
                              ? 'bg-primary-500' 
                              : 'bg-warning-500'
                          }`}
                          style={{ width: `${responseConfidence}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-900 mb-3">Actions</h4>
                
                <div className="space-y-2">
                  <button
                    className="w-full flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Add Note
                  </button>
                  
                  <button
                    className="w-full flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Forward
                  </button>
                  
                  {currentTicket.status !== 'resolved' && currentTicket.status !== 'closed' && (
                    <button
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500"
                      onClick={handleResolve}
                    >
                      Resolve Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;