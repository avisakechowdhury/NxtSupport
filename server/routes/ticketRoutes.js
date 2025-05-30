import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import Ticket from '../models/Ticket.js';
import TicketActivity from '../models/TicketActivity.js';
import User from '../models/User.js';

const router = express.Router();

// Get all tickets for a company
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email');
    res.json(tickets);
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
    const activities = await TicketActivity.find({ ticketId: req.params.id })
      .sort({ createdAt: -1 })
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

    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'statusChanged',
      userId: req.user.id,
      userName: req.user.name,
      details: `Status changed to ${status}${reason ? `: ${reason}` : ''}`
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
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { priority },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'statusChanged',
      userId: req.user.id,
      userName: req.user.name,
      details: `Priority changed to ${priority}`
    });
    await activity.save();

    res.json({ ticket, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign ticket
router.post('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ 
      _id: userId,
      companyId: req.user.companyId 
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { assignedTo: userId },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'assigned',
      userId: req.user.id,
      userName: req.user.name,
      details: `Assigned to ${user.name}`
    });
    await activity.save();

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

    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'note',
      userId: req.user.id,
      userName: req.user.name,
      details: note
    });
    await activity.save();

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;