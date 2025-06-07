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