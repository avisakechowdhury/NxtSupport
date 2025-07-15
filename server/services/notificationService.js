import Notification from '../models/Notification.js';
import User from '../models/User.js';
import PersonalUser from '../models/PersonalUser.js';

class NotificationService {
  // Create notification for ticket creation
  static async createTicketCreatedNotification(ticket, createdBy) {
    try {
      // Get all users in the company (for business accounts)
      const users = await User.find({ companyId: ticket.companyId });
      
      const notifications = users.map(user => ({
        userId: user._id,
        userModel: 'User',
        companyId: ticket.companyId,
        type: 'ticket_created',
        title: 'New Ticket Created',
        message: `Ticket #${ticket.ticketNumber} "${ticket.subject}" has been created`,
        relatedTicketId: ticket._id,
        relatedUserId: createdBy._id,
        priority: ticket.priority === 'urgent' ? 'high' : 'medium',
        metadata: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          priority: ticket.priority
        }
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for new ticket ${ticket.ticketNumber}`);
    } catch (error) {
      console.error('Error creating ticket created notification:', error);
    }
  }

  // Create notification for ticket assignment
  static async createTicketAssignedNotification(ticket, assignedTo, assignedBy) {
    try {
      const notification = {
        userId: assignedTo._id,
        userModel: 'User',
        companyId: ticket.companyId,
        type: 'ticket_assigned',
        title: 'Ticket Assigned to You',
        message: `Ticket #${ticket.ticketNumber} "${ticket.subject}" has been assigned to you`,
        relatedTicketId: ticket._id,
        relatedUserId: assignedBy._id,
        priority: ticket.priority === 'urgent' ? 'high' : 'medium',
        metadata: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          priority: ticket.priority,
          assignedBy: assignedBy.name
        }
      };

      await Notification.create(notification);
      console.log(`Created assignment notification for ticket ${ticket.ticketNumber} to user ${assignedTo.name}`);
    } catch (error) {
      console.error('Error creating ticket assigned notification:', error);
    }
  }

  // Create notification for manual ticket creation
  static async createManualTicketNotification(ticket, createdBy) {
    try {
      // Get all users in the company
      const users = await User.find({ companyId: ticket.companyId });
      
      const notifications = users.map(user => ({
        userId: user._id,
        userModel: 'User',
        companyId: ticket.companyId,
        type: 'manual_ticket_created',
        title: 'Manual Ticket Created',
        message: `Manual ticket #${ticket.ticketNumber} "${ticket.subject}" has been created by ${createdBy.name}`,
        relatedTicketId: ticket._id,
        relatedUserId: createdBy._id,
        priority: ticket.priority === 'urgent' ? 'high' : 'medium',
        metadata: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          priority: ticket.priority,
          createdBy: createdBy.name
        }
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for manual ticket ${ticket.ticketNumber}`);
    } catch (error) {
      console.error('Error creating manual ticket notification:', error);
    }
  }

  // Create notification for ticket status changes
  static async createTicketStatusNotification(ticket, oldStatus, newStatus, changedBy) {
    try {
      // Get all users in the company
      const users = await User.find({ companyId: ticket.companyId });
      
      const notifications = users.map(user => ({
        userId: user._id,
        userModel: 'User',
        companyId: ticket.companyId,
        type: 'ticket_updated',
        title: 'Ticket Status Updated',
        message: `Ticket #${ticket.ticketNumber} status changed from ${oldStatus} to ${newStatus}`,
        relatedTicketId: ticket._id,
        relatedUserId: changedBy._id,
        priority: newStatus === 'escalated' ? 'high' : 'medium',
        metadata: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          oldStatus,
          newStatus,
          changedBy: changedBy.name
        }
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for ticket status change ${ticket.ticketNumber}`);
    } catch (error) {
      console.error('Error creating ticket status notification:', error);
    }
  }

  // Create notification for ticket escalation
  static async createTicketEscalatedNotification(ticket, escalatedBy) {
    try {
      // Get all users in the company
      const users = await User.find({ companyId: ticket.companyId });
      
      const notifications = users.map(user => ({
        userId: user._id,
        userModel: 'User',
        companyId: ticket.companyId,
        type: 'ticket_escalated',
        title: 'Ticket Escalated',
        message: `Ticket #${ticket.ticketNumber} "${ticket.subject}" has been escalated`,
        relatedTicketId: ticket._id,
        relatedUserId: escalatedBy._id,
        priority: 'high',
        metadata: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          escalatedBy: escalatedBy.name
        }
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for escalated ticket ${ticket.ticketNumber}`);
    } catch (error) {
      console.error('Error creating ticket escalated notification:', error);
    }
  }

  // Create notification for ticket resolution
  static async createTicketResolvedNotification(ticket, resolvedBy) {
    try {
      // Get all users in the company
      const users = await User.find({ companyId: ticket.companyId });
      
      const notifications = users.map(user => ({
        userId: user._id,
        userModel: 'User',
        companyId: ticket.companyId,
        type: 'ticket_resolved',
        title: 'Ticket Resolved',
        message: `Ticket #${ticket.ticketNumber} "${ticket.subject}" has been resolved`,
        relatedTicketId: ticket._id,
        relatedUserId: resolvedBy._id,
        priority: 'medium',
        metadata: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          resolvedBy: resolvedBy.name
        }
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for resolved ticket ${ticket.ticketNumber}`);
    } catch (error) {
      console.error('Error creating ticket resolved notification:', error);
    }
  }

  // Create notification for new comments
  static async createCommentNotification(ticket, comment, commentedBy) {
    try {
      // Get all users in the company except the commenter
      const users = await User.find({ 
        companyId: ticket.companyId,
        _id: { $ne: commentedBy._id }
      });
      
      const notifications = users.map(user => ({
        userId: user._id,
        userModel: 'User',
        companyId: ticket.companyId,
        type: 'comment_added',
        title: 'New Comment Added',
        message: `${commentedBy.name} added a comment to ticket #${ticket.ticketNumber}`,
        relatedTicketId: ticket._id,
        relatedUserId: commentedBy._id,
        priority: 'medium',
        metadata: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          commentedBy: commentedBy.name,
          commentPreview: comment.text.substring(0, 100)
        }
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for new comment on ticket ${ticket.ticketNumber}`);
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  }

  // Create notification for ticket priority increase
  static async createTicketPriorityIncreasedNotification(ticket, oldPriority, newPriority, changedBy) {
    try {
      // Get all users in the company
      const users = await User.find({ companyId: ticket.companyId });
      const notifications = users.map(user => ({
        userId: user._id,
        userModel: 'User',
        companyId: ticket.companyId,
        type: 'ticket_priority_increased',
        title: 'Ticket Priority Increased',
        message: `Ticket #${ticket.ticketNumber} "${ticket.subject}" priority changed from ${oldPriority.charAt(0).toUpperCase() + oldPriority.slice(1)} to ${newPriority.charAt(0).toUpperCase() + newPriority.slice(1)}`,
        relatedTicketId: ticket._id,
        relatedUserId: changedBy._id,
        priority: newPriority,
        metadata: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          oldPriority,
          newPriority,
          changedBy: changedBy.name
        }
      }));
      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for ticket priority increase ${ticket.ticketNumber}`);
    } catch (error) {
      console.error('Error creating ticket priority increased notification:', error);
    }
  }
}

export default NotificationService; 