import { create } from 'zustand';
import axios from 'axios';
import { AuthState, User, Company } from '../types';

const API_URL = 'http://localhost:3000/api';

export const useAuthStore = create<AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (company: Partial<Company>, admin: Partial<User>, password: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}>((set) => ({
  user: null,
  company: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user, company } = response.data;
      
      localStorage.setItem('token', token);
      set({ 
        user, 
        company,
        token, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Login failed', 
        isLoading: false,
        isAuthenticated: false
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ 
      user: null, 
      company: null,
      token: null, 
      isAuthenticated: false,
      error: null
    });
  },

  register: async (company, admin, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        company,
        admin,
        password
      });
      
      const { token, user, company: newCompany } = response.data;
      
      localStorage.setItem('token', token);
      set({ 
        user, 
        company: newCompany,
        token, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Registration failed', 
        isLoading: false,
        isAuthenticated: false
      });
    }
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { user, company } = response.data;
      
      set({ 
        user, 
        company,
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null, 
        company: null,
        token: null,
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
    }
  }
}));