import mongoose from 'mongoose';

const ticketActivitySchema = new mongoose.Schema({
  ticketId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket',
    required: true 
  },
  activityType: { 
    type: String, 
    enum: ['created', 'statusChanged', 'responded', 'escalated', 'assigned', 'note'],
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  userName: { type: String, default: null },
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TicketActivity', ticketActivitySchema);