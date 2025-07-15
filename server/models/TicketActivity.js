import mongoose from 'mongoose';

const ticketActivitySchema = new mongoose.Schema({
  ticketId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket',
    
    required: true 
  },
  activityType: { 
    type: String, 
    enum: ['created', 'updated', 'reply', 'status_changed', 'priority_changed', 'assigned', 'comment', 'escalated', 'resolved'],
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  userName: { type: String, default: null },
  details: { type: String, required: true },
  content: {
    type: String,
    required: false
  },
  performedBy: {
    type: String,
    default: 'system'
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('TicketActivity', ticketActivitySchema);