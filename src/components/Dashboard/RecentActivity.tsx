import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  AlertTriangle, 
  User, 
  MessageSquare, 
  Clock,
  PlusCircle
} from 'lucide-react';
import { useTicketStore } from '../../store/ticketStore';
import { Link } from 'react-router-dom';

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'created':
      return <PlusCircle className="h-5 w-5 text-primary-500" />;
    case 'statusChanged':
      return <Clock className="h-5 w-5 text-neutral-500" />;
    case 'responded':
      return <MessageSquare className="h-5 w-5 text-success-500" />;
    case 'escalated':
      return <AlertTriangle className="h-5 w-5 text-warning-500" />;
    case 'assigned':
      return <User className="h-5 w-5 text-primary-500" />;
    case 'note':
      return <MessageSquare className="h-5 w-5 text-neutral-500" />;
    default:
      return <Clock className="h-5 w-5 text-neutral-500" />;
  }
};

const RecentActivity = () => {
  const { tickets, fetchTickets, startPolling, stopPolling } = useTicketStore();

  useEffect(() => {
    fetchTickets();
    startPolling();
    return () => stopPolling();
  }, [fetchTickets, startPolling, stopPolling]);

  // Get all activities from tickets and sort by date
  const allActivities = tickets.flatMap(ticket => 
    ticket.activities?.map(activity => ({
      ...activity,
      ticketId: ticket.ticketNumber,
      ticketDbId: ticket._id
    })) || []
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Get 10 most recent activities
  const recentActivities = allActivities.slice(0, 10);

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-medium text-neutral-900">Recent Activity</h3>
        <p className="text-sm text-neutral-500">Latest ticket updates and changes</p>
      </div>
      <div className="border-t border-neutral-200">
        {recentActivities.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-500">No recent activity</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {recentActivities.map((activity) => (
              <li key={activity._id} className="p-4 hover:bg-neutral-50 transition-colors">
                <Link to={`/tickets/${activity.ticketDbId}`} className="block">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <ActivityIcon type={activity.activityType} />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-900">
                          {activity.userName || 'System'}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {formatDistanceToNow(new Date(activity.createdAt))} ago
                        </p>
                      </div>
                      <p className="text-sm text-neutral-600">{activity.details}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Ticket #{activity.ticketId}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-neutral-200 p-4">
        <Link 
          to="/tickets/all" 
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          View all activity
        </Link>
      </div>
    </div>
  );
};

export default RecentActivity;