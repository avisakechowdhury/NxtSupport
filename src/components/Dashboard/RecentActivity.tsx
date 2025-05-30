import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  AlertTriangle, 
  User, 
  MessageSquare, 
  Clock,
  PlusCircle
} from 'lucide-react';
import { mockTicketActivities } from '../../mocks/ticketData';

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
  // Get 10 most recent activities
  const recentActivities = [...mockTicketActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-medium text-neutral-900">Recent Activity</h3>
        <p className="text-sm text-neutral-500">Latest ticket updates and changes</p>
      </div>
      <div className="border-t border-neutral-200">
        <ul className="divide-y divide-neutral-200">
          {recentActivities.map((activity) => (
            <li key={activity.id} className="p-4 hover:bg-neutral-50 transition-colors">
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
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-neutral-200 p-4">
        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          View all activity
        </a>
      </div>
    </div>
  );
};

export default RecentActivity;