import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Search, Filter, RefreshCw, Loader2, Power, Inbox, AlertCircle } from 'lucide-react';
import EmailConnector from '../components/EmailSetup/EmailConnector';

// This page will use the EmailConnector logic but with a full-page layout like PersonalInbox

const BusinessInbox = () => {
  // Use EmailConnector as a hook-like logic provider
  // We'll use a custom hook pattern to extract the logic if needed, but for now, render EmailConnector full-page
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Inbox</h1>
          <p className="text-neutral-600">Manage your business emails with AI assistance</p>
        </div>
        {/* Top bar with search, refresh, filter can be added here if needed */}
      </div>
      <div className="w-full">
        <EmailConnector />
      </div>
    </div>
  );
};

export default BusinessInbox;