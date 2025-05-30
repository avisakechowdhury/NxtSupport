export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'viewer';
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  supportEmail: string;
  emailProvider: 'gmail' | 'custom' | 'office365';
  emailConnected: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  companyId: string;
  subject: string;
  body: string;
  senderEmail: string;
  senderName: string;
  status: 'new' | 'acknowledged' | 'inProgress' | 'responded' | 'escalated' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string | null;
  responseText: string | null;
  aiConfidence: number;
  originalLanguage: string;
  createdAt: string;
  updatedAt: string;
  responseGeneratedAt: string | null;
  escalatedAt: string | null;
  resolvedAt: string | null;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  activityType: 'created' | 'statusChanged' | 'responded' | 'escalated' | 'assigned' | 'note';
  userId: string | null;
  userName: string | null;
  details: string;
  createdAt: string;
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
  startPolling: () => () => void;
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