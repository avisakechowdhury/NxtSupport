import { create } from 'zustand';
import axios from 'axios';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  isActive: boolean;
  createdAt: string;
}

interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
  addTeamMember: (member: { name: string; email: string; role: string }) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
}

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

export const useTeamStore = create<TeamState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchTeamMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ members: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch team members', isLoading: false });
    }
  },

  addTeamMember: async (member) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/team`, member, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set(state => ({ 
        members: [...state.members, response.data],
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to add team member', isLoading: false });
      throw error;
    }
  },

  removeTeamMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set(state => ({ 
        members: state.members.filter(member => member._id !== id),
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to remove team member', isLoading: false });
      throw error;
    }
  },

  updateTeamMember: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/team/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set(state => ({
        members: state.members.map(member => 
          member._id === id ? response.data : member
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update team member', isLoading: false });
      throw error;
    }
  }
}));