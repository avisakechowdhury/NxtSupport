export interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
  role?: 'admin' | 'agent' | 'viewer';
  companyId?: string;
  accountType?: 'business' | 'personal';
  emailConnected?: boolean;
  googleEmail?: string | null;
  createdAt?: Date;
}

export interface Company {
  _id: string;
  id?: string;
  name: string;
  domain: string;
  supportEmail: string;
  emailProvider?: 'gmail' | 'custom' | 'office365';
  emailConnected: boolean;
  googleAuthConnected?: boolean;
  googleEmail?: string | null;
}

export interface Comment {
  _id?: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface Ticket {
  _id: string;
  id?: string;
  ticketNumber: string;
  companyId: string;
  subject: string;
  body: string;
  senderEmail: string;
  senderName: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  gmailMessageId: string;
  aiConfidence: number;
  originalLanguage: string;
  lastReplyAt: Date;
  escalationCount: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  activities?: TicketActivity[];
  comments?: Comment[];
  assignedTo?: string | User;
}

export interface TicketActivity {
  _id: string;
  id?: string;
  ticketId: string;
  activityType: 'created' | 'updated' | 'reply' | 'status_changed' | 'priority_changed' | 'assigned' | 'comment' | 'escalated' | 'resolved';
  details: string;
  content?: string;
  performedBy: string;
  userName: string;
  oldValue?: any;
  newValue?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailConfig {
  provider: 'gmail' | 'custom' | 'office365';
  email: string;
  server?: string;
  useOAuth: boolean;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TicketsState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  activities: TicketActivity[];
  isLoading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  fetchTicketActivities: (id: string) => Promise<void>;
  createTicket: (ticket: Partial<Ticket>) => Promise<void>;
  updateTicketStatus: (id: string, status: string, reason?: string) => Promise<void>;
  updateTicketPriority: (id: string, priority: string) => Promise<void>;
  assignTicket: (id: string, userId: string) => Promise<void>;
  escalateTicket: (id: string, reason: string) => Promise<void>;
  resolveTicket: (id: string) => Promise<void>;
  addNote: (id: string, note: string) => Promise<void>;
  addComment: (id: string, text: string) => Promise<void>;
  generateAIResponse: (id: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export interface DashboardStats {
  totalTickets: number;
  newTickets: number;
  respondedTickets: number;
  escalatedTickets: number;
  resolvedTickets: number;
  averageResponseTime: number; // in hours
  ticketsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  ticketsByDay: {
    date: string;
    count: number;
  }[];
}

// Personal Email Types
export interface PersonalEmail {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  category: string;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
}

export interface PersonalEmailStats {
  totalEmails: number;
  importantEmails: number;
  processedEmails: number;
  timeSaved: string;
}