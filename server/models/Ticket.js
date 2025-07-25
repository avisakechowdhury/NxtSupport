import mongoose from 'mongoose';
import crypto from 'crypto';

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
  gmailMessageId: { type: String, required: true },
  source: { 
    type: String, 
    enum: ['email', 'manual'], 
    default: 'email' 
  },
  status: { 
    type: String, 
    enum: ['new', 'acknowledged', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'low'
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'feature', 'bug', 'account'],
    default: 'general'
  },
  processedGmailMessageIds: {
    type: [String],
    default: []
  },
  contentHash: {
    type: String,
    index: true, // Index for faster lookups
    sparse: true // Allow null values for existing tickets
  },
  // complaintCategory: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'ComplaintCategory',
  //   default: null
  // },
  // complaintCategoryName: {
  //   type: String,
  //   default: null
  // },
  // complaintCategoryConfidence: {
  //   type: Number,
  //   default: 0
  // },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdByName: {
    type: String,
    default: null
  },
  publicToken: {
    type: String,
    unique: true,
    sparse: true
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null
    },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  responseText: { type: String, default: null },
  aiConfidence: { type: Number, default: 0 },
  originalLanguage: { type: String, default: 'en' },
  responseGeneratedAt: { type: Date, default: null },
  escalatedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  lastReplyAt: { type: Date, default: Date.now },
  escalationCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});
ticketSchema.index({ 
  companyId: 1, 
  contentHash: 1, 
  createdAt: -1 
}, { 
  sparse: true 
});

// Generate public token before saving
ticketSchema.pre('save', function(next) {
  if (!this.publicToken) {
    // Generate a unique token using ticket number and random bytes
    const randomBytes = crypto.randomBytes(16).toString('hex');
    this.publicToken = `${this.ticketNumber}_${randomBytes}`;
  }
  next();
});

// Index for efficient queries
ticketSchema.index({ companyId: 1, status: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ publicToken: 1 });

export default mongoose.model('Ticket', ticketSchema);