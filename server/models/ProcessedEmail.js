import mongoose from 'mongoose';

const processedEmailSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  emailUid: {
    type: String,
    required: true
  },
  messageId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String,
    required: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    default: null
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'skipped'],
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to ensure uniqueness per company and email
processedEmailSchema.index({ companyId: 1, emailUid: 1 }, { unique: true });
processedEmailSchema.index({ companyId: 1, messageId: 1 });

const ProcessedEmail = mongoose.model('ProcessedEmail', processedEmailSchema);

export default ProcessedEmail; 