import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useTicketStore } from '../../store/ticketStore';
import { 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  User
} from 'lucide-react';

const TicketList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, fetchTickets, startPolling, stopPolling, isLoading } = useTicketStore();

  useEffect(() => {
    fetchTickets();
    startPolling();
    return () => stopPolling();
  }, [fetchTickets, startPolling, stopPolling]);

  // Filter tickets based on the current route
  const filteredTickets = React.useMemo(() => {
    if (location.pathname === '/tickets/escalated') {
      return tickets.filter(ticket => ticket.status === 'escalated');
    }
    return tickets;
  }, [tickets, location.pathname]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-5 w-5 text-neutral-500" />;
      case 'acknowledged':
        return <MessageSquare className="h-5 w-5 text-primary-500" />;
      case 'inProgress':
        return <User className="h-5 w-5 text-primary-500" />;
      case 'escalated':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      default:
        return <Clock className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-neutral-100 text-neutral-800';
      case 'acknowledged':
        return 'bg-primary-100 text-primary-800';
      case 'inProgress':
        return 'bg-primary-100 text-primary-800';
      case 'escalated':
        return 'bg-warning-100 text-warning-800';
      case 'resolved':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error-100 text-error-800';
      case 'high':
        return 'bg-warning-100 text-warning-800';
      case 'medium':
        return 'bg-primary-100 text-primary-800';
      case 'low':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (isLoading && filteredTickets.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        <p className="mt-2 text-neutral-500">Loading tickets...</p>
      </div>
    );
  }

  if (filteredTickets.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No tickets found</h3>
        <p className="text-neutral-500">
          {location.pathname === '/tickets/escalated' 
            ? 'There are no escalated tickets at the moment.'
            : 'There are no tickets to display at the moment.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredTickets.map((ticket) => (
              <tr 
                key={ticket._id} 
                className="hover:bg-neutral-50 cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket._id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {ticket.subject}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1 capitalize">{ticket.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {ticket.assignedTo && typeof ticket.assignedTo === 'object' 
                    ? ticket.assignedTo.name 
                    : 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {ticket.status === 'new' || ticket.status === 'acknowledged'
                    ? `${formatDistanceToNow(new Date(ticket.createdAt))} ago`
                    : ticket.responseGeneratedAt
                      ? `${formatDistanceToNow(new Date(ticket.responseGeneratedAt))} ago`
                      : 'Unknown'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketList;
