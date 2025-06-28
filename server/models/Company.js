import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  domain: String,
  supportEmail: {
    type: String,
    required: true,
  },
  emailConnected: {
    type: Boolean,
    default: false,
  },
  // Google OAuth 2.0 Tokens
  googleAuth: {
    googleUserId: String,
    accessToken: String,
    refreshToken: String,
    expiryDate: Number,
    scope: String,
    connectedEmail: {
      type: String,
      unique: false, // Allow same email to be connected to multiple companies
    },
  },
  // Email template customization
  emailTemplate: {
    subject: {
      type: String,
      default: '[{{ticketNumber}}] We have received your support request'
    },
    body: {
      type: String,
      default: `Dear {{customerName}},

Thank you for contacting {{companyName}} Support.

This email confirms that we have received your message regarding: "{{subject}}".
Your request has been assigned ticket number: {{ticketNumber}}.

Our team will review your request and get back to you as soon as possible. You can reply to this email to add more information to your ticket.

Best regards,
The {{companyName}} Support Team`
    },
    useCustomTemplate: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Remove unique index if it exists
companySchema.index({ 'googleAuth.connectedEmail': 1 }, { unique: false });

const Company = mongoose.model('Company', companySchema);

export default Company;