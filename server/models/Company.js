import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  domain: String,
  supportEmail: String, // This might store the Google email after connection
  emailConnected: { // Indicates if any email is connected
    type: Boolean,
    default: false,
  },
  // IMAP/SMTP credentials (if you keep the old system)
  emailConfig: {
    imapHost: String,
    imapPort: Number,
    smtpHost: String,
    smtpPort: Number,
    username: String,
    passwordEncrypted: String, // Store encrypted password
  },
  // Google OAuth 2.0 Tokens
  googleAuth: {
    googleUserId: String, // Google's unique ID for the user who authorized
    accessToken: String,
    refreshToken: String,
    expiryDate: Number, // Timestamp for access token expiry
    scope: String, // Scopes granted
    connectedEmail: String, // The email address connected via Google OAuth
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

const Company = mongoose.model('Company', companySchema);

export default Company;
