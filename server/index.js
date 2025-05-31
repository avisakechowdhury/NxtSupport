import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
// import EmailListener from './services/emailListener.js'; // Keep if you still use IMAP

// Load environment variables
dotenv.config(); // Make sure .env is in the root of your project or server folder

// Import models
import Company from './models/Company.js';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import TicketActivity from './models/TicketActivity.js';

const app = express();

// Import routes
import googleAuthRoutes from './routes/googleAuthRoutes.js'; // Import the new Google Auth routes

import ticketRoutes from './routes/ticketRoutes.js';



// Middleware
// Configure CORS to allow your specific frontend and credentials
const allowedOrigins = [
    process.env.FRONTEND_URL, // For production (e.g., https://nxtsupport.vercel.app)
    'http://localhost:5173'  , // For local development

    console.log(process.env.FRONTEND_URL)
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Use the *specific* configuration

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Your existing Authentication middleware (ensure it sets req.user.companyId)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => { // userPayload is the decoded token
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // IMPORTANT: Ensure your JWT payload contains companyId
    if (!userPayload.companyId) {
        console.error('JWT token is missing companyId:', userPayload);
        return res.status(403).json({ error: 'Token is missing company association.' });
    }
    req.user = userPayload; // Decoded token payload (e.g., { id, email, role, companyId })
    next();
  });
};

app.use('/api/auth', googleAuthRoutes); // ✅ Register public routes first
app.use('/api/auth/protected', authenticateToken, googleAuthRoutes); // ✅ For protected ones

app.use('/api/tickets', ticketRoutes);


// Auth routes (your existing ones)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { company, admin, password } = req.body;

    const newCompany = new Company({
      name: company.name, 
      domain: company.domain,
      supportEmail: admin.email, // Initially set, can be updated by Google OAuth
      emailConnected: false
    });
    await newCompany.save();

    const newUser = new User({
      email: admin.email,
      name: admin.name,
      role: 'admin',
      companyId: newCompany._id,
      password // In production, hash this password
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, companyId: newCompany._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
      company: { id: newCompany._id, name: newCompany.name, supportEmail: newCompany.supportEmail, emailConnected: newCompany.emailConnected }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate({ path: 'companyId', model: Company }); // Populate company details
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (password !== user.password) return res.status(401).json({ error: 'Invalid credentials' }); // HASH PASSWORDS IN PRODUCTION
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, companyId: user.companyId._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      // Send relevant company data, including Google Auth status if available
      company: {
        id: user.companyId._id,
        name: user.companyId.name,
        supportEmail: user.companyId.supportEmail,
        emailConnected: user.companyId.emailConnected,
        googleAuthConnected: !!(user.companyId.googleAuth && user.companyId.googleAuth.accessToken),
        googleEmail: user.companyId.googleAuth ? user.companyId.googleAuth.connectedEmail : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: 'companyId', model: Company });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      company: {
        id: user.companyId._id,
        name: user.companyId.name,
        supportEmail: user.companyId.supportEmail,
        emailConnected: user.companyId.emailConnected,
        googleAuthConnected: !!(user.companyId.googleAuth && user.companyId.googleAuth.accessToken),
        googleEmail: user.companyId.googleAuth ? user.companyId.googleAuth.connectedEmail : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Use Google Auth routes (all routes in googleAuthRoutes.js will be prefixed with /api/auth)
// The authenticateToken middleware is applied within googleAuthRoutes.js where needed.
// app.use('/api/auth', googleAuthRoutes);
// credentials if needed for listener re-initialization.

// Global store for active email listeners (keyed by companyId)
// WARNING: This is an in-memory store. If the server restarts, listeners are lost.
// const activeEmailListeners = new Map();

// Email connection routes
app.post('/api/email/connect', authenticateToken, async (req, res) => {
  try {
    const { email, password } = req.body;
    const { companyId } = req.user; 

    if (!companyId) {
        console.error('Company ID not found in token for user:', req.user.email);
        return res.status(400).json({ error: 'Company ID not found in user session.' });
    }

    if (activeEmailListeners.has(companyId)) {
        const oldListener = activeEmailListeners.get(companyId);
        if (typeof oldListener.disconnect === 'function') {
            await oldListener.disconnect();
        }
        activeEmailListeners.delete(companyId);
        console.log(`Disconnected existing listener for company ${companyId}`);
    }

    const listener = new EmailListener({
        email,
        password,
        companyId: companyId,
        TicketModel: Ticket, // Pass the Mongoose model
        CompanyModel: Company, // Pass the Mongoose model
        // TicketActivityModel: TicketActivity // Pass if EmailListener uses it directly
    });

    await listener.connect(); // This is where EmailListener attempts connection
    console.log(`Successfully tested connection for ${email} for company ${companyId}`);

    await Company.findByIdAndUpdate(companyId, {
      emailConnected: true,
      supportEmail: email,
    });

    if (typeof listener.startPolling === 'function') {
        listener.startPolling(); 
    } else {
        console.warn(`EmailListener for ${email} does not have a startPolling method. Automatic email checking may not start.`);
    }
    
    activeEmailListeners.set(companyId, listener);
    console.log(`Email listener connected and polling started for ${email}, company ${companyId}`);

    res.json({ message: 'Email connected successfully', email: email });

  } catch (error) {
    // Log the full error for server-side debugging, including type and stack
    console.error(`Email connection error for company ${req.user?.companyId}, email ${req.body?.email}: Original Error Type: ${error?.constructor?.name}, Message: ${error?.message}, Stack: ${error?.stack}`);
    
    let userErrorMessage = 'An unexpected error occurred while trying to connect your email. Please check server logs for details.'; // Default generic message

    // Prioritize the message from the error object itself, as EmailListener should throw descriptive errors.
    if (error && typeof error.message === 'string' && error.message.trim() !== '') {
        userErrorMessage = error.message;
    } 
    // Add checks for specific error properties if EmailListener or other libraries set them (less common for simple Error objects)
    // else if (error && error.isCustomError && typeof error.customMessage === 'string') { 
    //     userErrorMessage = error.customMessage;
    // } 
    // Check for common network error codes if the message isn't specific enough from EmailListener
    else if (error && error.code) {
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
            userErrorMessage = `Could not connect to the email server (${error.code}). Please check the server address, port, and your network connection.`;
        }
    }
    
    // Fallback if somehow userErrorMessage is still not set well
    if (!userErrorMessage || userErrorMessage.trim() === '' || userErrorMessage.toLowerCase().includes('undefined')) {
        userErrorMessage = 'Failed to connect email. Please check your credentials and server settings. If the issue persists, check server logs or contact support.';
    }

    res.status(500).json({ error: userErrorMessage });
  }
});

app.get('/api/email/inbox', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.user;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID not found in token.' });
        }

        const listener = activeEmailListeners.get(companyId);

        if (!listener || (typeof listener.isConnected === 'function' && !listener.isConnected())) {
            console.warn(`Attempt to fetch inbox for company ${companyId}, but listener is not active or not found.`);
            const company = await Company.findById(companyId);
            if (company && company.emailConnected) { // If DB says connected but listener isn't active
                 return res.status(409).json({ error: 'Email service is not currently active. Please try reconnecting the email from settings.' });
            }
            return res.status(404).json({ error: 'Email connection not found or not active for this company.' });
        }

        let emails = [];
        if (typeof listener.getCurrentEmails === 'function') {
            emails = await listener.getCurrentEmails();
        } else {
            console.warn(`EmailListener for company ${companyId} does not have a getCurrentEmails method.`);
        }
        
        res.json({ emails: emails || [] });

    } catch (error) {
        console.error(`Error fetching inbox for company ${req.user?.companyId}:`, error.message, error.stack);
        res.status(500).json({ error: 'An error occurred while fetching emails.' });
    }
});

app.post('/api/email/disconnect', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.user;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID not found in token.' });
        }

        if (activeEmailListeners.has(companyId)) {
            const listener = activeEmailListeners.get(companyId);
            if (typeof listener.disconnect === 'function') {
                await listener.disconnect(); 
            }
            activeEmailListeners.delete(companyId);
            console.log(`Disconnected and removed listener for company ${companyId}`);
        }

        await Company.findByIdAndUpdate(companyId, {
            emailConnected: false,
        });

        res.json({ message: 'Email disconnected successfully.' });

    } catch (error) {
        console.error(`Error disconnecting email for company ${req.user?.companyId}:`, error.message, error.stack);
        res.status(500).json({ error: 'Failed to disconnect email.' });
    }
});

// Ticket Routes
app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// ... other ticket routes ...
app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const ticketCount = await Ticket.countDocuments({ companyId: req.user.companyId });
    const ticketNumber = `TKT-${(ticketCount + 1).toString().padStart(4, '0')}`;
    
    const ticket = new Ticket({
      ...req.body,
      ticketNumber,
      companyId: req.user.companyId,
      // If email comes from Google, you might want to link it here
      // source: req.body.source || (company.googleAuth && company.googleAuth.connectedEmail ? 'google_email' : 'unknown') 
    });
    await ticket.save();
    
    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'created',
      details: req.body.details || 'Ticket created' // Adjust details
    });
    await activity.save();
    
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google OAuth Redirect URI should be configured as: http://localhost:${PORT}/api/auth/google/callback (or your production equivalent)`);
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set in .env file. Google OAuth will not work.");
  }
});
