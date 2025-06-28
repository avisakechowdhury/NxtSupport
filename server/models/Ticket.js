import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',
    required: true 
  },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  senderEmail: { type: String, required: true },
  senderName: { type: String, required: true },
  gmailMessageId: { type: String, sparse: true },
  source: { 
    type: String, 
    enum: ['email', 'manual'], 
    default: 'email' 
  },
  status: { 
    type: String, 
    enum: ['new', 'acknowledged', 'inProgress', 'responded', 'escalated', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  responseText: { type: String, default: null },
  aiConfidence: { type: Number, default: 0 },
  originalLanguage: { type: String, default: 'en' },
  responseGeneratedAt: { type: Date, default: null },
  escalatedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index instead of individual ones to avoid duplicates
ticketSchema.index({ companyId: 1, gmailMessageId: 1 });

// Update the updatedAt field on save
ticketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Ticket', ticketSchema);