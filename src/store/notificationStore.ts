import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

export interface Notification {
  _id: string;
  userId: string;
  userModel: 'User' | 'PersonalUser';
  companyId?: string;
  type: 'ticket_created' | 'ticket_assigned' | 'ticket_updated' | 'ticket_escalated' | 'ticket_resolved' | 'comment_added' | 'manual_ticket_created' | 'ticket_priority_increased';
  title: string;
  message: string;
  relatedTicketId?: {
    _id: string;
    ticketNumber: string;
    subject: string;
  };
  relatedUserId?: {
    _id: string;
    name: string;
    email: string;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: any;
  createdAt: string;
  readAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollIntervalId: NodeJS.Timeout | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ notifications: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch notifications', isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ unreadCount: response.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification._id === id ? { ...notification, isRead: true, readAt: new Date().toISOString() } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString()
        })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      set(state => ({
        notifications: state.notifications.filter(notification => notification._id !== id),
        unreadCount: state.notifications.find(n => n._id === id)?.isRead ? state.unreadCount : Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  clearAllNotifications: async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  },

  startPolling: () => {
    if (pollIntervalId) return; // Prevent multiple intervals

    // Initial fetch
    get().fetchNotifications();
    get().fetchUnreadCount();

    pollIntervalId = setInterval(() => {
      get().fetchNotifications();
      get().fetchUnreadCount();
    }, 10000); // Every 10 seconds
  },

  stopPolling: () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
  }
})); 