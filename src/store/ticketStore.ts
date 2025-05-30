import { create } from 'zustand';
import axios from 'axios';
import { Ticket, TicketActivity, TicketsState } from '../types';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';
let pollIntervalId: NodeJS.Timeout | null = null;
export const useTicketStore = create<TicketsState>((set, get) => ({
  tickets: [],
  currentTicket: null,
  activities: [],
  isLoading: false,
  error: null,

  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ tickets: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch tickets', isLoading: false });
    }
  },

  fetchTicketById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ currentTicket: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch ticket', isLoading: false });
    }
  },

  fetchTicketActivities: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tickets/${id}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ activities: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch ticket activities', isLoading: false });
    }
  },

  createTicket: async (ticket: Partial<Ticket>) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/tickets`, ticket, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set(state => ({ 
        tickets: [...state.tickets, response.data],
        currentTicket: response.data,
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to create ticket', isLoading: false });
    }
  },

  updateTicketStatus: async (id: string, status: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/tickets/${id}/status`, 
        { status, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set(state => {
        const updatedTickets = state.tickets.map(ticket => 
          ticket.id === id ? response.data.ticket : ticket
        );
        
        return {
          tickets: updatedTickets,
          currentTicket: response.data.ticket,
          activities: [...state.activities, response.data.activity],
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to update ticket status', isLoading: false });
    }
  },

  updateTicketPriority: async (id: string, priority: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/tickets/${id}/priority`,
        { priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set(state => {
        const updatedTickets = state.tickets.map(ticket => 
          ticket.id === id ? response.data.ticket : ticket
        );
        
        return {
          tickets: updatedTickets,
          currentTicket: response.data.ticket,
          activities: [...state.activities, response.data.activity],
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to update ticket priority', isLoading: false });
    }
  },

  assignTicket: async (id: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/tickets/${id}/assign`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set(state => {
        const updatedTickets = state.tickets.map(ticket => 
          ticket.id === id ? response.data.ticket : ticket
        );
        
        return {
          tickets: updatedTickets,
          currentTicket: response.data.ticket,
          activities: [...state.activities, response.data.activity],
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to assign ticket', isLoading: false });
    }
  },

  escalateTicket: async (id: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/tickets/${id}/escalate`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set(state => {
        const updatedTickets = state.tickets.map(ticket => 
          ticket.id === id ? response.data.ticket : ticket
        );
        
        return {
          tickets: updatedTickets,
          currentTicket: response.data.ticket,
          activities: [...state.activities, response.data.activity],
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to escalate ticket', isLoading: false });
    }
  },

  resolveTicket: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/tickets/${id}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set(state => {
        const updatedTickets = state.tickets.map(ticket => 
          ticket.id === id ? response.data.ticket : ticket
        );
        
        return {
          tickets: updatedTickets,
          currentTicket: response.data.ticket,
          activities: [...state.activities, response.data.activity],
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to resolve ticket', isLoading: false });
    }
  },

  addNote: async (id: string, note: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/tickets/${id}/notes`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set(state => ({
        activities: [...state.activities, response.data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to add note', isLoading: false });
    }
  },

 
  startPolling: () => {
    if (pollIntervalId) return; // Prevent multiple intervals

    pollIntervalId = setInterval(() => {
      get().fetchTickets();
    }, 30000); // Every 30 seconds
  },

  stopPolling: () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
  }
}));