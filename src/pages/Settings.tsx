import React from 'react';
import { useAuthStore } from '../store/authStore';

const Settings = () => {
  const { company } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-5">Settings</h2>
        <p className="text-neutral-500 mb-5">
          Configure your AI support system settings
        </p>
      </div>
      
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Company Information</h3>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-neutral-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company-name"
                  id="company-name"
                  defaultValue={company?.name}
                  className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="company-domain" className="block text-sm font-medium text-neutral-700">
                  Domain
                </label>
                <input
                  type="text"
                  name="company-domain"
                  id="company-domain"
                  defaultValue={company?.domain}
                  className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-neutral-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">AI Configuration</h3>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="ai-model" className="block text-sm font-medium text-neutral-700">
                AI Model
              </label>
              <select
                id="ai-model"
                name="ai-model"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                defaultValue="gpt4"
              >
                <option value="gpt4">GPT-4 (Recommended)</option>
                <option value="gpt35">GPT-3.5 (Faster)</option>
                <option value="claude">Claude 2</option>
                <option value="custom">Custom Model</option>
              </select>
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
      
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Notification Settings</h3>
          
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
  );
};

export default Settings;