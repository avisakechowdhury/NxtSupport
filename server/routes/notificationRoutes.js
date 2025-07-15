import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import PersonalUser from '../models/PersonalUser.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userModel = req.user.accountType === 'personal' ? 'PersonalUser' : 'User';
    const notifications = await Notification.getUserNotifications(req.user.id, userModel);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userModel = req.user.accountType === 'personal' ? 'PersonalUser' : 'User';
    const count = await Notification.getUnreadCount(req.user.id, userModel);
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userModel = req.user.accountType === 'personal' ? 'PersonalUser' : 'User';
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
      userModel
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userModel = req.user.accountType === 'personal' ? 'PersonalUser' : 'User';
    await Notification.updateMany(
      { 
        userId: req.user.id, 
        userModel, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userModel = req.user.accountType === 'personal' ? 'PersonalUser' : 'User';
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
      userModel
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear all notifications
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userModel = req.user.accountType === 'personal' ? 'PersonalUser' : 'User';
    await Notification.deleteMany({
      userId: req.user.id,
      userModel
    });
    
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 