import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

function renderTemplate(template: string, variables: Record<string, string>) {
  return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] || '');
}

const Settings = () => {
  const { company, token } = useAuthStore();
  const [emailTemplate, setEmailTemplate] = useState({
    subject: '[{{ticketNumber}}] We have received your support request',
    body: `Dear {{customerName}},

Thank you for contacting {{companyName}} Support.

This email confirms that we have received your message regarding: "{{subject}}".
Your request has been assigned ticket number: {{ticketNumber}}.

Our team will review your request and get back to you as soon as possible. You can reply to this email to add more information to your ticket.

Best regards,
The {{companyName}} Support Team`,
    useCustomTemplate: false,
    selectedTemplate: 'formal'
  });
  const [customerPortal, setCustomerPortal] = useState({
    enabled: true,
    includeInEmails: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (company?.emailTemplate) {
      setEmailTemplate(company.emailTemplate);
    }
    if (company?.customerPortal) {
      setCustomerPortal(company.customerPortal);
    }
  }, [company]);

  const handleSaveEmailTemplate = async () => {
    setIsLoading(true);
    setSaveMessage('');
    
    try {
      await axios.patch(`${API_URL}/company/email-template`, emailTemplate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveMessage('Email template saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save email template. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomerPortal = async () => {
    setIsLoading(true);
    setSaveMessage('');
    
    try {
      await axios.patch(`${API_URL}/company/customer-portal`, customerPortal, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveMessage('Customer portal settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save customer portal settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const templateVariables = [
    { name: '{{customerName}}', description: 'Customer\'s name from the email' },
    { name: '{{companyName}}', description: 'Your company name' },
    { name: '{{subject}}', description: 'Original email subject' },
    { name: '{{ticketNumber}}', description: 'Generated ticket number' },
    { name: '{{portalUrl}}', description: 'Unique link for customers to track their ticket' }
  ];
  
  const templatePresets = {
    formal: {
      name: 'Formal & Professional',
      description: 'Traditional business communication style',
      subject: '[{{ticketNumber}}] We have received your support request',
      body: `Dear {{customerName}},

Thank you for contacting {{companyName}} Support.

This email confirms that we have received your message regarding: "{{subject}}".
Your request has been assigned ticket number: {{ticketNumber}}.

Our team will review your request and get back to you as soon as possible. You can reply to this email to add more information to your ticket.

Best regards,
The {{companyName}} Support Team`
    },
    short: {
      name: 'Short & Concise',
      description: 'Brief and to the point',
      subject: 'Ticket #{{ticketNumber}} received',
      body: `Hi {{customerName}},

We got your request about "{{subject}}". We'll reply soon!

Thanks,
{{companyName}} Team`
    },
    casual: {
      name: 'Casual & Friendly',
      description: 'Warm and approachable tone',
      subject: 'Thanks for reaching out, {{customerName}}!',
      body: `Hey {{customerName}},

Thanks for contacting {{companyName}}. We're on it and will get back to you soon about "{{subject}}"!

Cheers,
The {{companyName}} Team`
    },
    empathetic: {
      name: 'Empathetic & Supportive',
      description: 'Understanding and caring approach',
      subject: 'We understand your concern - Ticket #{{ticketNumber}}',
      body: `Dear {{customerName}},

Thank you for reaching out to {{companyName}}. We understand how important this is to you, and we want you to know that we're here to help.

We've received your message about "{{subject}}" and have assigned it ticket number {{ticketNumber}}. Our team is reviewing your request and will respond with a solution as quickly as possible.

We appreciate your patience and look forward to resolving this for you.

Warm regards,
The {{companyName}} Support Team`
    },
    custom: {
      name: 'Custom Template',
      description: 'Create your own unique template',
      subject: emailTemplate.subject,
      body: emailTemplate.body
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    if (templateKey === 'custom') {
      setEmailTemplate({
        ...emailTemplate,
        selectedTemplate: templateKey,
        useCustomTemplate: true
      });
    } else {
      const preset = templatePresets[templateKey as keyof typeof templatePresets];
      setEmailTemplate({
        ...emailTemplate,
        selectedTemplate: templateKey,
        subject: preset.subject,
        body: preset.body,
        useCustomTemplate: true
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Strong, visible glowing background effect with standard Tailwind classes and fallback style */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-100 via-purple-100 to-neutral-200" />
      <div className="absolute left-1/3 top-1/4 w-96 h-96 rounded-full bg-blue-200 opacity-60 blur-3xl pointer-events-none -z-10" style={{filter: 'blur(80px)'}} />
      <div className="absolute right-10 bottom-10 w-80 h-80 rounded-full bg-purple-200 opacity-50 blur-2xl pointer-events-none -z-10" style={{filter: 'blur(60px)'}} />
      <div className="max-w-4xl mx-auto space-y-10 py-10 px-0">
        {/* Company Information - full width, no side spaces */}
        <div className="bg-white shadow-card rounded-2xl border border-neutral-200 overflow-hidden w-full">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              Company Information
              <span className="h-1 w-6 bg-blue-50 rounded"></span>
            </h3>
            <div className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
                <div className="p-3 bg-neutral-50 rounded-lg text-neutral-900 border border-neutral-200">{company?.name || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Domain</label>
                <div className="p-3 bg-neutral-50 rounded-lg text-neutral-900 border border-neutral-200">{company?.domain || '-'}</div>
              </div>
            </div>
            </div>
        </div>
        <div className="border-t border-neutral-200"></div>
        {/* Email Template Customization - grid layout */}
        <div className="bg-white shadow-card rounded-2xl border border-neutral-200 overflow-hidden w-full">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              Email Template Customization
              <span className="h-1 w-6 bg-blue-50 rounded"></span>
            </h3>
            <p className="text-neutral-500 mb-6 text-base">
            Customize the automatic response email sent to customers when a ticket is created.
          </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Template Editor */}
              <div>
                {saveMessage && (
                  <div className={`mb-4 p-3 rounded-md ${saveMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{saveMessage}</div>
                )}
                
                {/* Template Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-3">Choose Template Style</label>
                  <div className="flex flex-wrap gap-2 w-full mb-2">
                    {Object.entries(templatePresets).map(([key, template]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleTemplateChange(key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border 
                          ${emailTemplate.selectedTemplate === key
                            ? 'bg-blue-600 text-white border-blue-600 shadow'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-blue-50 hover:text-blue-700'}
                        `}
                        style={{ minWidth: 120 }}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {templatePresets[emailTemplate.selectedTemplate]?.description}
                  </div>
                </div>

                {/* Template Editor (only show when custom template is selected) */}
                {emailTemplate.useCustomTemplate && (
                  <>
                    <div>
                      <label htmlFor="email-subject" className="block text-sm font-medium text-neutral-700 mb-2">Email Subject</label>
                      <input 
                        type="text" 
                        id="email-subject" 
                        value={emailTemplate.subject} 
                        onChange={e => setEmailTemplate({ ...emailTemplate, subject: e.target.value })} 
                        className="block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md bg-neutral-50" 
                        placeholder="[{{ticketNumber}}] We have received your support request" 
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="email-body" className="block text-sm font-medium text-neutral-700 mb-2">Email Body</label>
                      <textarea 
                        id="email-body" 
                        rows={10} 
                        value={emailTemplate.body} 
                        onChange={e => setEmailTemplate({ ...emailTemplate, body: e.target.value })} 
                        className="block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md bg-neutral-50" 
                        placeholder="Enter your custom email template..." 
                      />
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg mt-4">
                      <h4 className="text-sm font-medium text-neutral-900 mb-3">Available Variables</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {templateVariables.map((variable) => (
                          <div key={variable.name} className="flex items-start">
                            <code className="text-xs bg-neutral-200 px-2 py-1 rounded mr-2 font-mono">{variable.name}</code>
                            <span className="text-xs text-neutral-600">{variable.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-6">
                  <button 
                    type="button" 
                    onClick={handleSaveEmailTemplate} 
                    disabled={isLoading} 
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Email Template'}
                  </button>
                </div>
              </div>
              {/* Right: Live Preview */}
              <div>
                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200 h-full flex flex-col">
                  <h4 className="text-base font-semibold text-neutral-900 mb-3">Live Preview</h4>
                  <div className="mb-2 text-xs text-neutral-500">This is how your email will look with sample data:</div>
                  <div className="border border-neutral-200 rounded p-4 bg-white whitespace-pre-line text-sm text-neutral-800 flex-1">
                    <strong>Subject:</strong> {renderTemplate(emailTemplate.subject, {
                      customerName: 'John Doe',
                      companyName: 'NxtSupport',
                      subject: 'No Subject',
                      ticketNumber: 'INC000123'
                    })}
                    <br /><br />
                    {renderTemplate(emailTemplate.body, {
                      customerName: 'John Doe',
                      companyName: 'NxtSupport',
                      subject: 'No Subject',
                      ticketNumber: 'INC000123'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200"></div>
        {/* Customer Portal Settings */}
        <div className="bg-white shadow-card rounded-2xl border border-neutral-200 overflow-hidden w-full">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              Customer Portal Settings
              <span className="h-1 w-6 bg-blue-50 rounded"></span>
            </h3>
            <p className="text-neutral-500 mb-6 text-base">
              Control whether customers can access their ticket status through a unique link.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900">Enable Customer Portal</h4>
                  <p className="text-sm text-neutral-500">Allow customers to view their ticket status through a unique link</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerPortal.enabled}
                    onChange={(e) => setCustomerPortal({ ...customerPortal, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900">Include Portal Link in Emails</h4>
                  <p className="text-sm text-neutral-500">Add the customer portal link to acknowledgment emails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerPortal.includeInEmails}
                    onChange={(e) => setCustomerPortal({ ...customerPortal, includeInEmails: e.target.checked })}
                    disabled={!customerPortal.enabled}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    customerPortal.enabled 
                      ? 'bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 peer-checked:bg-primary-600' 
                      : 'bg-neutral-100 cursor-not-allowed'
                  }`}></div>
                </label>
              </div>

              {customerPortal.enabled && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-primary-900 mb-2">How it works</h4>
                  <ul className="text-sm text-primary-700 space-y-1">
                    <li>• Each ticket gets a unique, secure link</li>
                    <li>• Customers can view their ticket status without logging in</li>
                    <li>• Links are included in acknowledgment emails (if enabled above)</li>
                    <li>• Example: https://yoursite.com/ticket/INC000001_a1b2c3d4e5f6</li>
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCustomerPortal}
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Portal Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200"></div>
        {/* AI Configuration */}
        <div className="bg-white shadow-card rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              AI Configuration
              <span className="h-1 w-6 bg-blue-50 rounded"></span>
            </h3>
          <form className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">AI Model</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-blue-300 bg-blue-50">
                    <span className="font-medium text-blue-900">Gemini</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 text-xs font-semibold">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed">
                    <span className="font-medium text-neutral-700">GPT-4</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 text-xs font-semibold">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed">
                    <span className="font-medium text-neutral-700">GPT-3.5</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 text-xs font-semibold">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed">
                    <span className="font-medium text-neutral-700">Claude 2</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 text-xs font-semibold">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed">
                    <span className="font-medium text-neutral-700">Custom Model</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 text-xs font-semibold">Coming Soon</span>
                  </div>
                </div>
                <div className="text-xs text-blue-600 mt-2">Only Gemini is available right now. More models coming soon!</div>
            </div>
            
            <div>
              <label htmlFor="default-language" className="block text-sm font-medium text-neutral-700">
                Default Language
              </label>
              <select
                id="default-language"
                name="default-language"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
              </select>
              <p className="mt-2 text-sm text-neutral-500">
                The system will automatically detect and translate emails in other languages.
              </p>
            </div>
            
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Tone and Style</h4>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="tone-formal"
                    name="tone"
                    type="radio"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                  />
                  <label htmlFor="tone-formal" className="ml-3 block text-sm font-medium text-neutral-700">
                    Formal and Professional
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="tone-friendly"
                    name="tone"
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                  />
                  <label htmlFor="tone-friendly" className="ml-3 block text-sm font-medium text-neutral-700">
                    Friendly and Conversational
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="tone-empathetic"
                    name="tone"
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                  />
                  <label htmlFor="tone-empathetic" className="ml-3 block text-sm font-medium text-neutral-700">
                    Empathetic and Supportive
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="tone-concise"
                    name="tone"
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                  />
                  <label htmlFor="tone-concise" className="ml-3 block text-sm font-medium text-neutral-700">
                    Brief and Concise
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save AI Settings
              </button>
            </div>
          </form>
        </div>
      </div>
        <div className="border-t border-neutral-200"></div>
        {/* Notification Settings */}
        <div className="bg-white shadow-card rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              Notification Settings
              <span className="h-1 w-6 bg-blue-50 rounded"></span>
            </h3>
          <form className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-3">Email Notifications</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="new-ticket"
                      name="new-ticket"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label htmlFor="new-ticket" className="ml-3 block text-sm font-medium text-neutral-700">
                      New ticket notifications
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="escalated-ticket"
                      name="escalated-ticket"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label htmlFor="escalated-ticket" className="ml-3 block text-sm font-medium text-neutral-700">
                      Escalated ticket alerts
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="daily-summary"
                      name="daily-summary"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label htmlFor="daily-summary" className="ml-3 block text-sm font-medium text-neutral-700">
                      Daily summary report
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-sm font-medium text-neutral-700 mb-3">Integration Webhooks</h4>
              
              <div>
                <label htmlFor="slack-webhook" className="block text-sm font-medium text-neutral-700">
                  Slack Webhook URL
                </label>
                <input
                  type="text"
                  name="slack-webhook"
                  id="slack-webhook"
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md"
                />
                <p className="mt-2 text-sm text-neutral-500">
                  Receive notifications in your Slack channel when important events occur.
                </p>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save Notification Settings
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;