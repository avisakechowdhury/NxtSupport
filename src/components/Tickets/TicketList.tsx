import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Ticket } from '../../types';
import { useTicketStore } from '../../store/ticketStore';
import { formatDistanceToNow } from 'date-fns';

// Badge utilities
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return <span className="badge bg-primary-100 text-primary-800">New</span>;
    case 'acknowledged':
      return <span className="badge bg-neutral-100 text-neutral-800">Acknowledged</span>;
    case 'inProgress':
      return <span className="badge bg-primary-100 text-primary-800">In Progress</span>;
    case 'responded':
      return <span className="badge bg-success-100 text-success-800">Responded</span>;
    case 'escalated':
      return <span className="badge bg-warning-100 text-warning-800">Escalated</span>;
    case 'resolved':
      return <span className="badge bg-success-100 text-success-800">Resolved</span>;
    case 'closed':
      return <span className="badge bg-neutral-100 text-neutral-800">Closed</span>;
    default:
      return <span className="badge bg-neutral-100 text-neutral-800">{status}</span>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'low':
      return (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-neutral-400 mr-2"></div>
          <span className="text-xs text-neutral-500">Low</span>
        </div>
      );
    case 'medium':
      return (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
          <span className="text-xs text-neutral-500">Medium</span>
        </div>
      );
    case 'high':
      return (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-warning-500 mr-2"></div>
          <span className="text-xs text-warning-700">High</span>
        </div>
      );
    case 'urgent':
      return (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-error-500 mr-2"></div>
          <span className="text-xs text-error-700">Urgent</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-neutral-400 mr-2"></div>
          <span className="text-xs text-neutral-500">{priority}</span>
        </div>
      );
  }
};

const TicketList = () => {
  const { tickets, fetchTickets, isLoading } = useTicketStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);

  const getFilterFromPath = () => {
    const path = location.pathname;
    if (path.includes('/tickets/new')) return 'new';
    if (path.includes('/tickets/escalated')) return 'escalated';
    return null;
  };

  useEffect(() => {
    fetchTickets();
    setSelectedStatus(getFilterFromPath());
  }, [fetchTickets, location.pathname]);

  useEffect(() => {
    let filtered = [...tickets];

    const statusFilter = selectedStatus || getFilterFromPath();
    if (statusFilter) {
      if (statusFilter === 'new') {
        filtered = filtered.filter(
          (t) => t.status === 'new' || t.status === 'acknowledged'
        );
      } else {
        filtered = filtered.filter((t) => t.status === statusFilter);
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.subject.toLowerCase().includes(term) ||
          t.senderEmail.toLowerCase().includes(term) ||
          t.senderName.toLowerCase().includes(term) ||
          t.body.toLowerCase().includes(term)
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.responseGeneratedAt || 0).getTime() -
        new Date(a.responseGeneratedAt || 0).getTime()
    );

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, selectedStatus, location.pathname]);

  const handleViewTicket = (id: string) => {
    navigate(`/tickets/${id}`);
  };

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-lg font-medium text-neutral-900 mb-4 sm:mb-0">
            {selectedStatus
              ? `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Tickets`
              : 'All Tickets'}
          </h2>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="inProgress">In Progress</option>
              <option value="responded">Responded</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-2 text-neutral-500">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <AlertCircle className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="mt-3 text-sm font-medium text-neutral-900">No tickets found</h3>
          <p className="mt-2 text-sm text-neutral-500">
            {searchTerm
              ? 'No tickets match your search criteria.'
              : "You don't have any tickets in this category."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  className="hover:bg-neutral-50 cursor-pointer"
                  onClick={() => handleViewTicket(ticket._id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">{ticket.ticketNumber}</div>
                    <div className="text-sm text-neutral-500 truncate max-w-xs">{ticket.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{ticket.senderName}</div>
                    <div className="text-sm text-neutral-500">{ticket.senderEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(ticket.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(ticket.priority)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {ticket.responseGeneratedAt
                      ? `${formatDistanceToNow(new Date(ticket.responseGeneratedAt))} ago`
                      : 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketList;
