import { create } from 'zustand';
import axios, { AxiosError } from 'axios';

interface BusinessEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  dateTime: string;
  body?: string;
  type?: 'Complaint' | 'Normal' | string;
  isUnread?: boolean;
  ticketNumber?: string;
  acknowledged?: boolean;
}

interface BusinessEmailState {
  emails: BusinessEmail[];
  isLoading: boolean;
  error: string | null;
  page: number;
  nextPageToken: string | null;
  pageSize: number;
  fetchEmails: (isInitial?: boolean, pageOverride?: number, pageTokenOverride?: string | null) => Promise<void>;
  clearEmails: () => void;
}

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';
const getToken = () => localStorage.getItem('token');

export const useBusinessEmailStore = create<BusinessEmailState>((set, get) => ({
  emails: [],
  isLoading: false,
  error: null,
  page: 1,
  nextPageToken: null,
  pageSize: 50,

  fetchEmails: async (isInitial = false, pageOverride?: number, pageTokenOverride?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      const pageToFetch = pageOverride || get().page;
      const pageTokenToUse = pageTokenOverride || undefined;
      const response = await axios.get<{ emails: BusinessEmail[]; nextPageToken?: string | null; page?: number }>(
        `${API_URL}/auth/google/inbox`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: pageToFetch, pageSize: get().pageSize, pageToken: pageTokenToUse },
        }
      );
      set({
        emails: response.data.emails || [],
        nextPageToken: response.data.nextPageToken || null,
        page: response.data.page || 1,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const err = error as AxiosError;
      set({ error: 'Failed to fetch emails', isLoading: false });
    }
  },

  clearEmails: () => set({ emails: [], page: 1, nextPageToken: null }),
})); 