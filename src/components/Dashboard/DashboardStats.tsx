import React, { useEffect } from 'react';
import { useTicketStore } from '../../store/ticketStore';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  TicketCheck, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  isPositive,
  to
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  isPositive?: boolean;
  to: string;
}) => {
  const changeIsPositive = isPositive !== undefined ? isPositive : change >= 0;
  return (
    <Link to={to} className="block group focus:outline-none">
      <div className="bg-white overflow-hidden shadow-card rounded-lg transition ring-2 ring-transparent group-hover:ring-primary-200 group-focus:ring-primary-400 cursor-pointer">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-neutral-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-neutral-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900">
                  {value}
                </div>
                {change !== 0 && (
                  <div className={`ml-2 flex items-center text-sm font-medium ${
                    changeIsPositive ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {changeIsPositive ? (
                      <ArrowUpCircle className="h-4 w-4 flex-shrink-0 self-center" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 flex-shrink-0 self-center" />
                    )}
                    <span className="ml-1">
                      {Math.abs(change)}%
                    </span>
                  </div>
                )}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const PriorityCard = ({ ticketsByPriority }: { ticketsByPriority: any }) => {
  return (
    <div className="bg-white overflow-hidden shadow-card rounded-lg">
      <div className="p-5">
        <h3 className="text-lg font-medium text-neutral-900">Tickets by Priority</h3>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-100 text-error-800">
              <AlertCircle className="h-4 w-4 mr-1" />
              Urgent: {ticketsByPriority.urgent}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-800">
              <AlertTriangle className="h-4 w-4 mr-1" />
              High: {ticketsByPriority.high}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              <Bell className="h-4 w-4 mr-1" />
              Medium: {ticketsByPriority.medium}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-800">
              <TicketCheck className="h-4 w-4 mr-1" />
              Low: {ticketsByPriority.low}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResponseTimeCard = ({ tickets }: { tickets: any[] }) => {
  // Calculate average response time from real data
  const calculateAverageResponseTime = () => {
    const respondedTickets = tickets.filter(ticket => 
      ticket.responseGeneratedAt && ticket.createdAt
    );
    
    if (respondedTickets.length === 0) return 0;
    
    const totalResponseTime = respondedTickets.reduce((total, ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const responded = new Date(ticket.responseGeneratedAt).getTime();
      return total + (responded - created);
    }, 0);
    
    // Convert to hours
    return Math.round((totalResponseTime / respondedTickets.length) / (1000 * 60 * 60) * 10) / 10;
  };

  const averageResponseTime = calculateAverageResponseTime();
  
  return (
    <div className="bg-white overflow-hidden shadow-card rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-6 w-6 text-neutral-500" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-neutral-500 truncate">
              Average Response Time
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-neutral-900">
                {averageResponseTime} hours
              </div>
            </dd>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-100">
                  Target: 4 hours
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-100">
              <div 
                style={{ width: `${Math.min(100, (averageResponseTime / 8) * 100)}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  averageResponseTime <= 4 ? 'bg-success-500' : 'bg-warning-500'
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardStats = () => {
  const { tickets, fetchTickets } = useTicketStore();

  useEffect(() => {
    fetchTickets();
    // Set up polling for real-time updates
    const interval = setInterval(fetchTickets, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Helper to get ticket count for a period
  const getPeriodTicketCount = (tickets: any[], start: Date, end: Date, filterFn?: (t: any) => boolean) =>
    tickets.filter(t => {
      const created = new Date(t.createdAt);
      return created >= start && created < end && (!filterFn || filterFn(t));
    }).length;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculate real-time statistics for this month
  const stats = {
    totalTickets: getPeriodTicketCount(tickets, startOfThisMonth, now),
    newTickets: getPeriodTicketCount(tickets, startOfThisMonth, now, t => t.status === 'new' || t.status === 'acknowledged'),
    respondedTickets: getPeriodTicketCount(tickets, startOfThisMonth, now, t => t.status === 'responded'),
    escalatedTickets: getPeriodTicketCount(tickets, startOfThisMonth, now, t => t.status === 'escalated'),
    resolvedTickets: getPeriodTicketCount(tickets, startOfThisMonth, now, t => t.status === 'resolved'),
    ticketsByPriority: {
      low: getPeriodTicketCount(tickets, startOfThisMonth, now, t => t.priority === 'low'),
      medium: getPeriodTicketCount(tickets, startOfThisMonth, now, t => t.priority === 'medium'),
      high: getPeriodTicketCount(tickets, startOfThisMonth, now, t => t.priority === 'high'),
      urgent: getPeriodTicketCount(tickets, startOfThisMonth, now, t => t.priority === 'urgent')
    }
  };

  // Calculate previous period stats
  const prevStats = {
    totalTickets: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth),
    newTickets: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth, t => t.status === 'new' || t.status === 'acknowledged'),
    respondedTickets: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth, t => t.status === 'responded'),
    escalatedTickets: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth, t => t.status === 'escalated'),
    resolvedTickets: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth, t => t.status === 'resolved'),
    ticketsByPriority: {
      low: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth, t => t.priority === 'low'),
      medium: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth, t => t.priority === 'medium'),
      high: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth, t => t.priority === 'high'),
      urgent: getPeriodTicketCount(tickets, startOfLastMonth, endOfLastMonth, t => t.priority === 'urgent')
    }
  };

  // Calculate real growth rates
  const calcGrowth = (current: number, previous: number) =>
    previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-5">Dashboard</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Tickets" 
          value={stats.totalTickets} 
          change={calcGrowth(stats.totalTickets, prevStats.totalTickets)} 
          icon={TicketCheck} 
          to="/tickets/all"
        />
        <StatCard 
          title="New Tickets" 
          value={stats.newTickets} 
          change={calcGrowth(stats.newTickets, prevStats.newTickets)} 
          icon={Bell} 
          to="/tickets/new"
        />
        <StatCard 
          title="Escalated" 
          value={stats.escalatedTickets} 
          change={calcGrowth(stats.escalatedTickets, prevStats.escalatedTickets)} 
          icon={AlertTriangle}
          isPositive={false} // Escalated tickets going up is bad
          to="/tickets/escalated"
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolvedTickets} 
          change={calcGrowth(stats.resolvedTickets, prevStats.resolvedTickets)} 
          icon={CheckCircle} 
          to="/tickets/all"
        />
      </div>
      
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PriorityCard ticketsByPriority={stats.ticketsByPriority} />
        <ResponseTimeCard tickets={tickets} />
      </div>
    </div>
  );
};

export default DashboardStats;