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
import { mockTicketsGrowth } from '../../mocks/statsData';

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
}) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white overflow-hidden shadow-card rounded-lg">
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
              
              <div className={`ml-2 flex items-center text-sm font-medium ${
                isPositive ? 'text-success-600' : 'text-error-600'
              }`}>
                {isPositive ? (
                  <ArrowUpCircle className="h-4 w-4 flex-shrink-0 self-center" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4 flex-shrink-0 self-center" />
                )}
                <span className="ml-1">
                  {Math.abs(change)}%
                </span>
              </div>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

const PriorityCard = ({ ticketsByPriority }) => {
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

const ResponseTimeCard = () => {
  const averageResponseTime = 6; // This should be calculated from actual ticket data
  
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

  const stats = {
    totalTickets: tickets.length,
    newTickets: tickets.filter(t => t.status === 'new').length,
    respondedTickets: tickets.filter(t => t.status === 'responded').length,
    escalatedTickets: tickets.filter(t => t.status === 'escalated').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
    ticketsByPriority: {
      low: tickets.filter(t => t.priority === 'low').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      high: tickets.filter(t => t.priority === 'high').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length
    }
  };

  const { 
    total: totalGrowth, 
    new: newGrowth, 
    responded: respondedGrowth, 
    escalated: escalatedGrowth, 
    resolved: resolvedGrowth 
  } = mockTicketsGrowth;

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-5">Dashboard</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Tickets" 
          value={stats.totalTickets} 
          change={totalGrowth} 
          icon={TicketCheck} 
        />
        <StatCard 
          title="New Tickets" 
          value={stats.newTickets} 
          change={newGrowth} 
          icon={Bell} 
        />
        <StatCard 
          title="Escalated" 
          value={stats.escalatedTickets} 
          change={escalatedGrowth} 
          icon={AlertTriangle} 
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolvedTickets} 
          change={resolvedGrowth} 
          icon={CheckCircle} 
        />
      </div>
      
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PriorityCard ticketsByPriority={stats.ticketsByPriority} />
        <ResponseTimeCard />
      </div>
    </div>
  );
};

export default DashboardStats;