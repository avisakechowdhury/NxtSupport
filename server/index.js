import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import EmailListener from './services/emailListener.js'; // Business email listener service

// Load environment variables
dotenv.config();

// Import models
import Company from './models/Company.js';
import User from './models/User.js';
import PersonalUser from './models/PersonalUser.js';
import Ticket from './models/Ticket.js';
import TicketActivity from './models/TicketActivity.js';

const app = express();

// Import routes
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import personalAuthRoutes from './routes/personalAuthRoutes.js';
import personalEmailRoutes from './routes/personalEmailRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
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

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Enhanced Authentication middleware (supports both personal and business users)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // For business users, validate companyId is present
    if (userPayload.accountType === 'business' && !userPayload.companyId) {
        console.error('JWT token is missing companyId for business user:', userPayload);
        return res.status(403).json({ error: 'Token is missing company association.' });
    }
    
    req.user = userPayload;
    next();
  });
};

// Global store for active email listeners (for business users)
const activeEmailListeners = new Map();

// Routes
app.use('/api/auth', googleAuthRoutes);
app.use('/api/auth/protected', authenticateToken, googleAuthRoutes);
app.use('/api/auth', personalAuthRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/personal', personalEmailRoutes); // Personal routes handle auth internally
app.use('/api/preferences', authenticateToken, preferenceRoutes); // Add this line

// Business Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { company, admin, password } = req.body;

    const newCompany = new Company({
      name: company.name, 
      domain: company.domain,
      supportEmail: admin.email,
      emailConnected: false
    });
    await newCompany.save();

    const newUser = new User({
      email: admin.email,
      name: admin.name,
      role: 'admin',
      companyId: newCompany._id,
      password,
      accountType: 'business'
    });
    await newUser.save();

    const token = jwt.sign(
      { 
        id: newUser._id, 
        email: newUser.email, 
        role: newUser.role, 
        companyId: newCompany._id,
        accountType: 'business'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { 
        id: newUser._id, 
        email: newUser.email, 
        name: newUser.name, 
        role: newUser.role,
        accountType: 'business'
      },
      company: { 
        id: newCompany._id, 
        name: newCompany.name, 
        supportEmail: newCompany.supportEmail, 
        emailConnected: newCompany.emailConnected 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Universal Login (supports both personal and business users)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Try business user first
    let user = await User.findOne({ email }).populate({ path: 'companyId', model: Company });
    let isPersonal = false;
    
    // If not found in business users, try personal users
    if (!user) {
      user = await PersonalUser.findOne({ email });
      isPersonal = true;
    }
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (password !== user.password) return res.status(401).json({ error: 'Invalid credentials' });
    
    const tokenPayload = {
      id: user._id,
      email: user.email,
      accountType: isPersonal ? 'personal' : 'business'
    };
    
    if (!isPersonal) {
      tokenPayload.role = user.role;
      tokenPayload.companyId = user.companyId._id;
    }
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    const response = {
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        accountType: isPersonal ? 'personal' : 'business'
      }
    };
    
    if (!isPersonal) {
      response.user.role = user.role;
      response.company = {
        id: user.companyId._id,
        name: user.companyId.name,
        supportEmail: user.companyId.supportEmail,
        emailConnected: user.companyId.emailConnected,
        googleAuthConnected: !!(user.companyId.googleAuth && user.companyId.googleAuth.accessToken),
        googleEmail: user.companyId.googleAuth ? user.companyId.googleAuth.connectedEmail : null
      };
    }
    
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Enhanced /me endpoint (supports both user types)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    let user, company = null;
    
    if (req.user.accountType === 'personal') {
      user = await PersonalUser.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id).populate({ path: 'companyId', model: Company });
      if (user && user.companyId) {
        company = {
          id: user.companyId._id,
          name: user.companyId.name,
          supportEmail: user.companyId.supportEmail,
          emailConnected: user.companyId.emailConnected,
          googleAuthConnected: !!(user.companyId.googleAuth && user.companyId.googleAuth.accessToken),
          googleEmail: user.companyId.googleAuth ? user.companyId.googleAuth.connectedEmail : null
        };
      }
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const response = {
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        accountType: req.user.accountType
      }
    };
    
    if (req.user.accountType === 'business') {
      response.user.role = user.role;
      response.company = company;
    } else {
      // For personal users, add email connection status
      response.user.emailConnected = user.emailConnected;
      response.user.googleEmail = user.googleAuth ? user.googleAuth.connectedEmail : null;
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Business Email Connection Routes
app.post('/api/email/connect', authenticateToken, async (req, res) => {
  try {
    // Only business users can connect email
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ error: 'Email connection only available for business accounts' });
    }

    const { email, password } = req.body;
    const { companyId } = req.user; 

    if (!companyId) {
        console.error('Company ID not found in token for user:', req.user.email);
        return res.status(400).json({ error: 'Company ID not found in user session.' });
    }

    // Disconnect existing listener if present
    if (activeEmailListeners.has(companyId)) {
        const oldListener = activeEmailListeners.get(companyId);
        if (typeof oldListener.disconnect === 'function') {
            await oldListener.disconnect();
        }
        activeEmailListeners.delete(companyId);
        console.log(`Disconnected existing listener for company ${companyId}`);
    }

    // Create new email listener
    const listener = new EmailListener({
        email,
        password,
        companyId: companyId,
        TicketModel: Ticket,
        CompanyModel: Company,
    });

    await listener.connect();
    console.log(`Successfully tested connection for ${email} for company ${companyId}`);

    // Update company email status
    await Company.findByIdAndUpdate(companyId, {
      emailConnected: true,
      supportEmail: email,
    });

    // Start polling for new emails
    if (typeof listener.startPolling === 'function') {
        listener.startPolling(); 
    } else {
        console.warn(`EmailListener for ${email} does not have a startPolling method.`);
    }
    
    activeEmailListeners.set(companyId, listener);
    console.log(`Email listener connected and polling started for ${email}, company ${companyId}`);

    res.json({ message: 'Email connected successfully', email: email });

  } catch (error) {
    console.error(`Email connection error for company ${req.user?.companyId}:`, error);
    
    let userErrorMessage = 'An unexpected error occurred while trying to connect your email.';
    if (error && typeof error.message === 'string' && error.message.trim() !== '') {
        userErrorMessage = error.message;
    } else if (error && error.code) {
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
            userErrorMessage = `Could not connect to the email server (${error.code}). Please check the server address, port, and your network connection.`;
        }
    }

    res.status(500).json({ error: userErrorMessage });
  }
});

// Business Email Inbox Route
app.get('/api/email/inbox', authenticateToken, async (req, res) => {
    try {
        if (req.user.accountType !== 'business') {
            return res.status(403).json({ error: 'Email inbox only available for business accounts' });
        }

        const { companyId } = req.user;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID not found in token.' });
        }

        const listener = activeEmailListeners.get(companyId);

        if (!listener || (typeof listener.isConnected === 'function' && !listener.isConnected())) {
            console.warn(`Attempt to fetch inbox for company ${companyId}, but listener is not active.`);
            const company = await Company.findById(companyId);
            if (company && company.emailConnected) {
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
        console.error(`Error fetching inbox for company ${req.user?.companyId}:`, error);
        res.status(500).json({ error: 'An error occurred while fetching emails.' });
    }
});

// Business Email Disconnect Route
app.post('/api/email/disconnect', authenticateToken, async (req, res) => {
    try {
        if (req.user.accountType !== 'business') {
            return res.status(403).json({ error: 'Email disconnect only available for business accounts' });
        }

        const { companyId } = req.user;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID not found in token.' });
        }

        // Disconnect and remove listener
        if (activeEmailListeners.has(companyId)) {
            const listener = activeEmailListeners.get(companyId);
            if (typeof listener.disconnect === 'function') {
                await listener.disconnect(); 
            }
            activeEmailListeners.delete(companyId);
            console.log(`Disconnected and removed listener for company ${companyId}`);
        }

        // Update company status
        await Company.findByIdAndUpdate(companyId, {
            emailConnected: false,
        });

        res.json({ message: 'Email disconnected successfully.' });

    } catch (error) {
        console.error(`Error disconnecting email for company ${req.user?.companyId}:`, error);
        res.status(500).json({ error: 'Failed to disconnect email.' });
    }
});

// Business Ticket Routes
app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ error: 'Tickets only available for business accounts' });
    }
    
    const tickets = await Ticket.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Individual Business Ticket Route
app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ error: 'Tickets only available for business accounts' });
    }
    
    const ticket = await Ticket.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Business Ticket Creation Route
app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ error: 'Ticket creation only available for business accounts' });
    }
    
    const ticketCount = await Ticket.countDocuments({ companyId: req.user.companyId });
    const ticketNumber = `TKT-${(ticketCount + 1).toString().padStart(4, '0')}`;
    
    const ticket = new Ticket({
      ...req.body,
      ticketNumber,
      companyId: req.user.companyId,
    });
    await ticket.save();
    
    // Create ticket activity
    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'created',
      details: req.body.details || 'Ticket created'
    });
    await activity.save();
    
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Business Ticket Update Route
app.put('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ error: 'Ticket updates only available for business accounts' });
    }
    
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );
    
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    // Create update activity
    const activity = new TicketActivity({
      ticketId: ticket._id,
      activityType: 'updated',
      details: 'Ticket updated'
    });
    await activity.save();
    
    res.json(ticket);
  } catch (error) {
    console.error('Ticket update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Business Ticket Activity Route
app.get('/api/tickets/:id/activities', authenticateToken, async (req, res) => {
  try {
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ error: 'Ticket activities only available for business accounts' });
    }
    
    // Verify ticket belongs to user's company
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });
    
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    const activities = await TicketActivity.find({ ticketId: req.params.id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Error fetching ticket activities:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // Disconnect all email listeners
  for (const [companyId, listener] of activeEmailListeners) {
    try {
      if (typeof listener.disconnect === 'function') {
        await listener.disconnect();
      }
      console.log(`Disconnected email listener for company ${companyId}`);
    } catch (error) {
      console.error(`Error disconnecting listener for company ${companyId}:`, error);
    }
  }
  
  // Close MongoDB connection
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  
  process.exit(0);
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