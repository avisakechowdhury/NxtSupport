import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['User', 'PersonalUser']
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: function() { return this.userModel === 'User'; }
  },
  type: {
    type: String,
    required: true,
    enum: [
      'ticket_created',
      'ticket_assigned',
      'ticket_updated',
      'ticket_escalated',
      'ticket_resolved',
      'comment_added',
      'manual_ticket_created',
      'ticket_priority_increased'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTicketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
  }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ companyId: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create(data);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId, userModel) {
  return this.countDocuments({ 
    userId, 
    userModel, 
    isRead: false 
  });
};

// Static method to get notifications for user
notificationSchema.statics.getUserNotifications = function(userId, userModel, limit = 50) {
  return this.find({ 
    userId, 
    userModel 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('relatedTicketId', 'ticketNumber subject')
  .populate('relatedUserId', 'name email');
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 