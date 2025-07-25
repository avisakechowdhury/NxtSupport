import React, { useState, useEffect, useCallback } from 'react';
import { Mail, AlertCircle, RefreshCw, Inbox, Loader2, Power, User as UserIcon, CornerUpLeft } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useBusinessEmailStore } from '../../store/businessEmailStore';
import { useNavigate } from 'react-router-dom';

// Assuming useAuthStore provides company info and updates it
// For this example, we'll mock a simplified version or assume it's globally available
interface Company {
  id: string;
  name: string;
  supportEmail: string | null;
  emailConnected: boolean;
  googleAuthConnected?: boolean;
  googleEmail?: string | null;
}

interface AuthStore {
  company: Company | null;
  token: string | null; // Auth token for API calls
  setCompanyAuthStatus: (status: { googleAuthConnected: boolean; googleEmail: string | null; emailConnectedOverall: boolean }) => void;
  fetchCompanyData: () => Promise<void>; // To refresh company data after OAuth
}

// Mock useAuthStore for standalone example - REPLACE WITH YOUR ACTUAL STORE
// IMPORTANT: This mock should ideally be replaced by your actual global Zustand store.
// Defining a store hook inside a component can lead to unexpected behavior and re-renders.
const useAuthStore = (): AuthStore => {
  const [company, setCompany] = useState<Company | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
  const [, setMockConnectError] = useState<string>(''); // For mock store internal use

  const API_URL_FOR_STORE = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

  // console.log(API_URL_FOR_STORE, 'Api URL for Store')

  const fetchCompanyData = useCallback(async () => {
    if (!authToken) {
        // console.log("AuthStore: No auth token, cannot fetch company data.");
        return;
    }
    try {
      const response = await axios.get<{ company: Company }>(`${API_URL_FOR_STORE}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCompany(response.data.company);
      // console.log("AuthStore: Fetched company data:", response.data.company);
    } catch (error) {
      console.error("AuthStore: Failed to fetch company data", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Handle unauthorized access, e.g., clear token, redirect to login
        localStorage.removeItem('token');
        setAuthToken(null);
        setCompany(null);
        // Consider a global redirect or event for login
      }
    }
  }, [authToken, API_URL_FOR_STORE]); // API_URL_FOR_STORE is stable

  useEffect(() => {
    if (authToken && !company) {
        // // console.log("AuthStore: Initial fetch of company data triggered.");
        fetchCompanyData();
    }
  }, [authToken, company, fetchCompanyData]);
  
  useEffect(() => {
    const handleOauthMessage = (event: MessageEvent) => {
        // Ensure the message is from a trusted origin if your frontend and backend are on different domains
        // For example: if (event.origin !== 'http://localhost:3000') return;
        if (event.data === 'google-auth-success') {
            // console.log('AuthStore: Received google-auth-success message. Fetching company data.');
            fetchCompanyData();
        }
    };
    window.addEventListener('message', handleOauthMessage);
    
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const emailFromParam = urlParams.get('email');
    const messageFromParam = urlParams.get('message');

    if (status === 'google-success') {
        // console.log('AuthStore: Google auth success via redirect. Email:', emailFromParam, "Fetching company data.");
        fetchCompanyData();
        window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
    } else if (status === 'google-error') {
        console.error('AuthStore: Google auth error via redirect:', messageFromParam);
        setMockConnectError(`Google connection failed: ${messageFromParam || 'Please try again.'}`);
        window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
    }

    return () => {
        window.removeEventListener('message', handleOauthMessage);
    };
  }, [fetchCompanyData]); // fetchCompanyData is memoized

  return {
    company,
    token: authToken,
    setCompanyAuthStatus: (statusUpdate) => {
      // console.log("AuthStore: Updating company auth status", statusUpdate);
      setCompany(prev => prev ? { 
        ...prev, 
        ...statusUpdate,
        supportEmail: statusUpdate.googleEmail !== undefined ? statusUpdate.googleEmail : prev.supportEmail
      } : null);
    },
    fetchCompanyData,
  };
};


interface Email {
  id: string;
  subject: string;
  from: string;
  dateTime: string;
  snippet: string;
  body?: string;
  type?: 'Complaint' | 'Normal' | string; // Be more specific or keep as string
  isUnread?: boolean;
  ticketNumber?: string; // Added field
  acknowledged?: boolean; // Added field
  isReply?: boolean; // Added field
  replyToTicketNumber?: string; // Added field
}

interface FetchEmailsResponse {
  emails: Email[];
  nextPageToken?: string | null;
  page?: number;
}

interface ApiError {
  error: string;
  details?: string;
}

// Utility to generate a color from a string (e.g., email)
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
}

const EmailConnector: React.FC = () => {
  const { company, token, setCompanyAuthStatus, fetchCompanyData } = useAuthStore();

  // Use business email store for all state
  const {
    emails,
    isLoading,
    error = '',
    page,
    nextPageToken,
    pageSize,
    fetchEmails,
    clearEmails
  } = useBusinessEmailStore();
  
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

  // console.log(API_BASE_URL, 'Api Base URL')

  // Handler for Google Sign-In
  const handleGoogleSignIn = async () => {
    console.log('handleGoogleSignIn called');
    console.log('company:', company);
    console.log('token:', token);
    if (!token) {
      setConnectError('Please log in to authenticate with Google.');
      return;
    }
    if (!company?.id) {
      setConnectError('Company ID is missing. Please reload the page or contact support.');
      return;
    }
    setIsConnectingGoogle(true);
    setConnectError('');
    try {
      const response = await axios.get<{ authorizeUrl: string }>(
        `${API_BASE_URL}/auth/google/initiate`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { companyId: company.id },
        }
      );
      const { authorizeUrl } = response.data;
      console.log('authorizeUrl received from backend:', authorizeUrl);
      if (authorizeUrl) {
        window.location.href = authorizeUrl;
      } else {
        throw new Error('No authorizeUrl received from backend');
      }
    } catch (err) {
      const error = err as AxiosError;
      setConnectError(error.response?.data?.error || 'Could not start Google Sign-In.');
      setIsConnectingGoogle(false);
    }
  };

  const handleRefresh = () => {
    if (company?.googleAuthConnected && token) {
      fetchEmails(true); // Always force fetch latest emails
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to disconnect your Google account?')) return;
    setIsDisconnecting(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/google/disconnect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanyAuthStatus({ googleAuthConnected: false, googleEmail: null, emailConnectedOverall: false });
      clearEmails();
      setConnectError('Google account disconnected successfully.');
    } catch (err) {
      setConnectError('Failed to disconnect Google account.');
    } finally {
      setIsDisconnecting(false);
    }
  };
  const handlePrevPage = () => {
    // TODO: Implement previous page logic
    alert('Previous page not implemented yet.');
  };
  const handleNextPage = () => {
    // TODO: Implement next page logic
    alert('Next page not implemented yet.');
  };

  useEffect(() => {
    if (company) {
      // console.log("EmailConnector: Company data updated/loaded:", company);
      // If coming back from Google error redirect, connectError might be set by URL param handling in store
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('status') === 'google-error') {
        setConnectError(`Google connection failed: ${urlParams.get('message') || 'Please try again.'}`);
        // Clean up URL params after reading them
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
        // console.log("EmailConnector: Company data is null.");
    }
  }, [company]);

  // Only keep this useEffect for fetching emails
  useEffect(() => {
    if (company?.googleAuthConnected && token) {
      fetchEmails(true);
    }
  }, [company?.googleAuthConnected, token]);

  useEffect(() => {
    console.log('Company data updated:', company);
  }, [company]);

  // Show loading spinner only if company is null (still loading)
  if (!company) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <p className="ml-4 text-lg text-neutral-600">Loading email configuration...</p>
      </div>
    );
  }

  // If company is loaded but not connected, show connect UI
  if (!company.googleAuthConnected || !company.googleEmail) {
    return (
      <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-4xl mx-auto">
        <div className="p-8">
          <div className="flex items-center mb-6">
              <Mail className="h-8 w-8 text-primary-600 mr-3" />
              <h3 className="text-2xl font-semibold text-neutral-900">Connect Your Support Email</h3>
          </div>
          {connectError && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <AlertCircle className="h-5 w-5 text-red-500 inline mr-2" /> {connectError}
            </div>
          )}
          <div className="mt-4">
              <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isConnectingGoogle}
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60"
              >
                  {isConnectingGoogle ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google" className="w-5 h-5 mr-2"/>}
                  Sign in with Google
              </button>
              <p className="mt-2 text-xs text-neutral-500">
                Connect your Gmail or Google Workspace account securely using OAuth 2.0.
              </p>
          </div>
        </div>
      </div>
    );
  }

  // If connected, show the connected UI
  if (company.googleAuthConnected && company.googleEmail) {
    return (
      <>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google" className="h-10 w-10 mr-3"/>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Connected with Google</h3>
                  <p className="text-sm text-green-600 truncate max-w-xs sm:max-w-sm md:max-w-md" title={company.googleEmail}>
                    {company.googleEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading || isConnectingGoogle}
                  className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 disabled:opacity-50 disabled:cursor-wait"
                  aria-label="Refresh emails"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  onClick={handleGoogleDisconnect}
                  disabled={isConnectingGoogle || isDisconnecting}
                >
                  {isConnectingGoogle || isDisconnecting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Power className="h-5 w-5 mr-2 text-red-500" />}
                  Disconnect Google
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-neutral-800">Google Mail Inbox (Recent)</h4>
            </div>

            {connectError && ( // Display general connection errors here as well
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <AlertCircle className="h-5 w-5 text-red-500 inline mr-2" /> {connectError}
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative">
                <AlertCircle className="h-5 w-5 text-red-400 inline mr-2" /> {error}
              </div>
            )}

            {isLoading && emails.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-10 text-center">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-2" />
                <p className="text-neutral-600">Loading emails...</p>
              </div>
            ) : emails.length === 0 && !error && !connectError ? (
              <div className="text-center py-10">
                <Inbox className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">No recent emails found in your Google inbox.</p>
              </div>
            ) : emails.length > 0 && (
              <>
                <ul className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2 custom-scrollbar">
                {emails.map((email) => (
                  <li 
                    key={email.id} 
                      className={`flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md border border-neutral-200 cursor-pointer transition-all ${email.isUnread ? 'border-blue-500' : 'border-transparent'}`}
                      onClick={() => navigate(`/email/${email.id}`)}
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center bg-black text-white font-bold text-lg select-none"
                        >
                          {((email.from || email.subject || 'N').trim().charAt(0).toUpperCase())}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold truncate ${email.isUnread ? 'text-blue-700' : 'text-neutral-900'}`}>{email.subject}</span>
                          <span className="text-xs text-neutral-500 ml-2 whitespace-nowrap">{new Date(email.dateTime).toLocaleString()}</span>
                        </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-neutral-600 truncate max-w-xs">{email.snippet}</span>
                        {email.isReply && email.replyToTicketNumber && (
                          <span className="flex items-center ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                            <CornerUpLeft className="h-4 w-4 mr-1" /> Reply to Ticket #{email.replyToTicketNumber}
                          </span>
                        )}
                          {email.isUnread && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Unread</span>}
                        {email.acknowledged && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Acknowledged</span>
                        )}
                        {email.ticketNumber && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Ticket: {email.ticketNumber}</span>
                        )}
                      </div>
                      </div>
                  </li>
                ))}
              </ul>
                <div className="flex justify-between items-center mt-4 text-xs">
                  <button onClick={handlePrevPage} disabled={page <= 1} className="px-2 py-1 rounded bg-neutral-200 text-neutral-700 disabled:opacity-50">Prev</button>
                  <span>Page {page}</span>
                  <button onClick={handleNextPage} disabled className="px-2 py-1 rounded bg-neutral-200 text-neutral-700 opacity-50 cursor-not-allowed">Next</button>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-4xl mx-auto">
      <div className="p-8">
        <div className="flex items-center mb-6">
            <Mail className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-2xl font-semibold text-neutral-900">Connect Your Support Email</h3>
        </div>
        
        {connectError && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <AlertCircle className="h-5 w-5 text-red-500 inline mr-2" /> {connectError}
          </div>
        )}
        
        <div className="mt-4">
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isConnectingGoogle}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60"
            >
                {isConnectingGoogle ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google" className="w-5 h-5 mr-2"/>}
                Sign in with Google
            </button>
            <p className="mt-2 text-xs text-neutral-500">
              Connect your Gmail or Google Workspace account securely using OAuth 2.0.
            </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConnector;