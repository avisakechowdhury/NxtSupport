import React, { useState } from 'react';
import { Mail, PlusCircle } from 'lucide-react';
import { useTicketStore } from '../../store/ticketStore';

const TicketSimulator = () => {
  const { createTicket, isLoading } = useTicketStore();
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setEmail] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createTicket({
      subject,
      body,
      senderName,
      senderEmail,
      priority
    });
    
    // Reset form
    setSubject('');
    setBody('');
    setSenderName('');
    setEmail('');
    setPriority('medium');
    setShowForm(false);
    
    // Show success message
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-neutral-900">Email Simulator</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Simulate customer emails to test the system
            </p>
          </div>
          {!showForm && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setShowForm(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Email
            </button>
          )}
        </div>
      </div>
      
      {success && (
        <div className="p-4 bg-success-50 border-l-4 border-success-400 animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-success-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-success-700">
                Email successfully created and processed!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showForm ? (
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={senderEmail}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-neutral-700">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="body" className="block text-sm font-medium text-neutral-700">
                  Email Content
                </label>
                <textarea
                  id="body"
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md"
                  placeholder="Enter the content of the customer email..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-neutral-400">
              <Mail className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-neutral-900">Simulate customer emails</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Create mock emails to test the AI classification and response generation.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setShowForm(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketSimulator;