import mongoose from 'mongoose';

const personalUserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  accountType: {
    type: String,
    default: 'personal',
    enum: ['personal']
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active'
    },
    expiresAt: Date
  },
  googleAuth: {
    googleUserId: String,
    accessToken: String,
    refreshToken: String,
    expiryDate: Number,
    scope: String,
    connectedEmail: String,
  },
  emailConnected: {
    type: Boolean,
    default: false,
  },
  preferences: {
    emailCategories: [{
      name: String,
      color: String, // You can add this for the frontend
      keywords: [String] // Future use: auto-categorize based on keywords
    }],
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
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

personalUserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PersonalUser = mongoose.model('PersonalUser', personalUserSchema);

export default PersonalUser;