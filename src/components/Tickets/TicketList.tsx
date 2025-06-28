import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useTicketStore } from '../../store/ticketStore';
import { useTeamStore } from '../../store/teamStore';
import { 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  User,
  Filter,
  X
} from 'lucide-react';

const TicketList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, fetchTickets, startPolling, stopPolling, isLoading } = useTicketStore();
  const { members, fetchTeamMembers } = useTeamStore();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  useEffect(() => {
    fetchTickets();
    fetchTeamMembers();
    startPolling();
    return () => stopPolling();
  }, [fetchTickets, fetchTeamMembers, startPolling, stopPolling]);

  // Filter tickets based on the current route and applied filters
  const filteredTickets = React.useMemo(() => {
    let result = tickets;

    // Route-based filtering
    if (location.pathname === '/tickets/escalated') {
      result = result.filter(ticket => ticket.status === 'escalated');
    } else if (location.pathname === '/tickets/new') {
      result = result.filter(ticket => ticket.status === 'new' || ticket.status === 'acknowledged');
    }

    // Apply additional filters
    if (filters.status) {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter(ticket => ticket.priority === filters.priority);
    }
    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        result = result.filter(ticket => !ticket.assignedTo);
      } else {
        result = result.filter(ticket => 
          ticket.assignedTo && 
          (typeof ticket.assignedTo === 'string' ? ticket.assignedTo === filters.assignedTo : ticket.assignedTo._id === filters.assignedTo)
        );
      }
    }

    return result;
  }, [tickets, location.pathname, filters]);

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assignedTo: ''
    });
  };

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

  const getLastUpdated = (ticket: any) => {
    // Priority order: resolvedAt > escalatedAt > responseGeneratedAt > updatedAt > createdAt
    const dates = [
      ticket.resolvedAt,
      ticket.escalatedAt,
      ticket.responseGeneratedAt,
      ticket.updatedAt,
      ticket.createdAt
    ].filter(Boolean);

    if (dates.length === 0) return 'Unknown';

    const latestDate = new Date(Math.max(...dates.map(date => new Date(date).getTime())));
    return `${formatDistanceToNow(latestDate)} ago`;
  };

  if (isLoading && filteredTickets.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        <p className="mt-2 text-neutral-500">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {location.pathname === '/tickets/escalated' ? 'Escalated Tickets' : 
             location.pathname === '/tickets/new' ? 'New Tickets' : 'All Tickets'}
          </h2>
          <p className="text-neutral-500">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {(filters.status || filters.priority || filters.assignedTo) && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="inProgress">In Progress</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Assigned To</label>
              <select
                value={filters.assignedTo}
                onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Assignments</option>
                <option value="unassigned">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <div className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No tickets found</h3>
          <p className="text-neutral-500">
            {location.pathname === '/tickets/escalated' 
              ? 'There are no escalated tickets at the moment.'
              : 'There are no tickets matching your current filters.'}
          </p>
        </div>
      ) : (
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
                          <div className="text-sm text-neutral-500 max-w-xs truncate">
                            {ticket.subject}
                          </div>
                          {ticket.source === 'manual' && (
                            <div className="text-xs text-purple-600 font-medium">
                              Created Manually
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        <span className="capitalize">{ticket.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {ticket.assignedTo && typeof ticket.assignedTo === 'object' 
                        ? ticket.assignedTo.name 
                        : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {getLastUpdated(ticket)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;