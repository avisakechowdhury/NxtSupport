import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import Ticket from '../models/Ticket.js';
import TicketActivity from '../models/TicketActivity.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';

const router = express.Router();

// Get all tickets for a company
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email');
    
    // Fetch activities for each ticket
    const ticketsWithActivities = await Promise.all(
      tickets.map(async (ticket) => {
        const activities = await TicketActivity.find({ ticketId: ticket._id })
          .sort({ createdAt: 1 })
          .limit(5); // Limit to recent activities for performance
        
        return {
          ...ticket.toObject(),
          activities
        };
      })
    );
    
    res.json(ticketsWithActivities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific ticket
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    }).populate('assignedTo', 'name email');
    
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ticket activities
router.get('/:id/activities', authenticateToken, async (req, res) => {
  try {
    // Verify ticket belongs to user's company
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });
    
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    const activities = await TicketActivity.find({ ticketId: req.params.id })
      .sort({ createdAt: 1 }) // Chronological order
      .populate('userId', 'name email');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update ticket status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const ticket = await Ticket.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const updates = { status };
    if (status === 'escalated') updates.escalatedAt = new Date();
    if (status === 'resolved') updates.resolvedAt = new Date();

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('assignedTo', 'name email');

    // Get user info for activity
    const user = await User.findById(req.user.id);

    let activityDetails = `Status changed to ${status}`;
    if (status === 'escalated' && reason) {
      activityDetails = `Ticket escalated by ${user?.name || 'System'}: ${reason}`;
    } else if (reason) {
      activityDetails += `: ${reason}`;
    } else {
      activityDetails += ` by ${user?.name || 'System'}`;
    }

    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'status_changed', // fixed enum value
      userId: req.user.id,
      userName: user?.name || 'System',
      details: activityDetails
    });
    await activity.save();

    res.json({ ticket: updatedTicket, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update ticket priority
router.patch('/:id/priority', authenticateToken, async (req, res) => {
  try {
    const { priority } = req.body;
    const ticketBefore = await Ticket.findOne({ _id: req.params.id, companyId: req.user.companyId });
    const oldPriority = ticketBefore?.priority;
    console.log('[PRIORITY PATCH] Old:', oldPriority, 'New:', priority);
    const priorityOrder = ['low', 'medium', 'high', 'urgent'];
    console.log('[PRIORITY PATCH] Indexes:', priorityOrder.indexOf(priority), priorityOrder.indexOf(oldPriority));
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { priority },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Get user info for activity
    const user = await User.findById(req.user.id);

    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'status_changed', // fixed enum value
      userId: req.user.id,
      userName: user?.name || 'System',
      details: `Priority changed to ${priority} by ${user?.name || 'System'}`
    });
    await activity.save();

    if (oldPriority && priorityOrder.indexOf(priority) > priorityOrder.indexOf(oldPriority)) {
      console.log('[PRIORITY PATCH] Triggering notification for priority increase');
      await NotificationService.createTicketPriorityIncreasedNotification(ticket, oldPriority, priority, user);
    } else {
      console.log('[PRIORITY PATCH] No notification triggered for this change');
    }

    res.json({ ticket, activity });
  } catch (error) {
    console.error('[PRIORITY PATCH] Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign ticket
router.post('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const assignee = await User.findOne({ 
      _id: userId,
      companyId: req.user.companyId 
    });

    if (!assignee) return res.status(404).json({ error: 'User not found' });

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { assignedTo: userId },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Get current user info for activity
    const currentUser = await User.findById(req.user.id);

    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'assigned',
      userId: req.user.id,
      userName: currentUser?.name || 'System',
      details: `Assigned to ${assignee.name} by ${currentUser?.name || 'System'}`
    });
    await activity.save();

    // Create notification for ticket assignment
    if (currentUser) {
      await NotificationService.createTicketAssignedNotification(ticket, assignee, currentUser);
    }

    res.json({ ticket, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add note to ticket
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { note } = req.body;
    const ticket = await Ticket.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Get user info for activity
    const user = await User.findById(req.user.id);

    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'note',
      userId: req.user.id,
      userName: user?.name || 'System',
      details: `Note added by ${user?.name || 'System'}: ${note}`
    });
    await activity.save();

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to ticket
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const ticket = await Ticket.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Get user info
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Add comment to ticket
    const comment = {
      userId: user._id,
      userName: user.name,
      text,
      createdAt: new Date()
    };

    ticket.comments.push(comment);
    await ticket.save();

    // Create activity for the comment
    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'comment',
      userId: req.user.id,
      userName: user.name,
      details: `Comment added by ${user.name}`,
      content: text
    });
    await activity.save();

    // Create notification for new comment
    await NotificationService.createCommentNotification(ticket, comment, user);

    res.json({ comment, activity });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;