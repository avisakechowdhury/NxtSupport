import { create } from 'zustand';
import axios, { AxiosError } from 'axios';

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

interface EmailStats {
  totalEmails: number;
  importantEmails: number;
  processedEmails: number;
  timeSaved: string;
}

interface PersonalEmailState {
  emails: PersonalEmail[];
  emailStats: EmailStats | null;
  categorizedEmails: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  fetchEmails: () => Promise<void>;
  fetchEmailStats: () => Promise<void>;
  fetchCategorizedEmails: () => Promise<void>;
  categorizeEmail: (emailId: string, category: string) => Promise<void>;
  connectGoogleAccount: () => Promise<void>;
  disconnectGoogleAccount: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

export const usePersonalEmailStore = create<PersonalEmailState>((set, get) => ({
  emails: [],
  emailStats: null,
  categorizedEmails: {},
  isLoading: false,
  error: null,

  fetchEmails: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      const response = await axios.get<{ emails: PersonalEmail[] }>(`${API_URL}/personal/emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ emails: response.data.emails, isLoading: false });
    } catch (error) {
      const err = error as AxiosError;
      console.error('Failed to fetch emails', err.response?.data);
      set({ error: 'Failed to fetch emails', isLoading: false });
    }
  },

  fetchEmailStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      const response = await axios.get<EmailStats>(`${API_URL}/personal/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ emailStats: response.data, isLoading: false });
    } catch (error) {
      const err = error as AxiosError;
      console.error('Failed to fetch email stats', err.response?.data);
      set({ error: 'Failed to fetch email stats', isLoading: false });
    }
  },

  fetchCategorizedEmails: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      const response = await axios.get<Record<string, number>>(`${API_URL}/personal/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ categorizedEmails: response.data, isLoading: false });
    } catch (error) {
      const err = error as AxiosError;
      console.error('Failed to fetch categorized emails', err.response?.data);
      set({ error: 'Failed to fetch categorized emails', isLoading: false });
    }
  },

  categorizeEmail: async (emailId: string, category: string) => {
    try {
      const token = getToken();
      await axios.post(`${API_URL}/personal/emails/${emailId}/categorize`,
        { category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set(state => ({
        emails: state.emails.map(email =>
          email.id === emailId ? { ...email, category } : email
        ),
        error: null,
      }));
    } catch (error) {
      const err = error as AxiosError;
      console.error('Failed to categorize email', err.response?.data);
      set({ error: 'Failed to categorize email' });
    }
  },

  connectGoogleAccount: async () => {
    try {
      const token = getToken();
      const response = await axios.get<{ authorizeUrl: string }>(`${API_URL}/personal/google/initiate`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.authorizeUrl) {
        window.location.href = response.data.authorizeUrl;
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error('Failed to initiate Google connection', err.response?.data);
      set({ error: 'Failed to initiate Google connection' });
    }
  },

  disconnectGoogleAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      await axios.post(`${API_URL}/personal/google/disconnect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({ 
        emails: [], 
        emailStats: null, 
        categorizedEmails: {},
        isLoading: false,
        error: null 
      });
    } catch (error) {
      const err = error as AxiosError;
      console.error('Failed to disconnect Google account', err.response?.data);
      set({ error: 'Failed to disconnect Google account', isLoading: false });
    }
  }
}));