import mongoose from 'mongoose';

const personalEmailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PersonalUser',
    required: true
  },
  gmailMessageId: {
    type: String,
    required: true
  },
  threadId: String,
  subject: String,
  from: String,
  to: String,
  body: String,
  snippet: String,
  category: {
    type: String,
    enum: [
      'Brand Enquiry',
      'Collaboration', 
      'Fan Mail',
      'Thank You',
      'Business',
      'Personal',
      'Promotional',
      'Important',
      'Other'
    ],
    default: 'Other'
  },
  aiConfidence: {
    type: Number,
    default: 0
  },
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative'],
    default: 'Neutral'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  labels: [String],
  receivedAt: Date,
  processedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to avoid duplicates
personalEmailSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });
personalEmailSchema.index({ userId: 1, receivedAt: -1 });
personalEmailSchema.index({ userId: 1, category: 1 });

const PersonalEmail = mongoose.model('PersonalEmail', personalEmailSchema);

export default PersonalEmail;