import React from 'react';
import EmailConnector from '../components/EmailSetup/EmailConnector';

const EmailSetup = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-5">Email Integration</h2>
        <p className="text-neutral-500 mb-5">
          Configure your support email to start processing customer inquiries with AI
        </p>
      </div>
      
      <EmailConnector />
      
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Email Processing Settings</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">AI Classification</h4>
              <p className="text-sm text-neutral-500 mb-3">
                Control how the AI identifies customer complaints
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="confidence-threshold" className="block text-sm font-medium text-neutral-700">
                    Confidence Threshold
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="range"
                      id="confidence-threshold"
                      min="0"
                      max="100"
                      defaultValue="75"
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-neutral-700">75%</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    When AI confidence is below this threshold, the ticket will be flagged for human review
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="auto-translate"
                    name="auto-translate"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="auto-translate" className="ml-2 block text-sm text-neutral-700">
                    Enable automatic language translation
                  </label>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-neutral-200">
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Response Generation</h4>
              <p className="text-sm text-neutral-500 mb-3">
                Configure how AI generates responses to customer complaints
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="response-mode" className="block text-sm font-medium text-neutral-700">
                    Response Mode
                  </label>
                  <select
                    id="response-mode"
                    defaultValue="semi"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="auto">Fully Automated (Send responses automatically)</option>
                    <option value="semi">Semi-Automated (Generate, but require approval)</option>
                    <option value="manual">Manual (Don't auto-generate responses)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="response-confidence" className="block text-sm font-medium text-neutral-700">
                    Response Confidence Threshold
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="range"
                      id="response-confidence"
                      min="0"
                      max="100"
                      defaultValue="85"
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-neutral-700">85%</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Escalate responses with confidence below this threshold
                  </p>
                </div>
                
                <div className="pt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSetup;