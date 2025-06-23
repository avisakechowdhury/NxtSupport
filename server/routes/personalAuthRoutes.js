import express from 'express';
import jwt from 'jsonwebtoken';
import PersonalUser from '../models/PersonalUser.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Personal user registration
router.post('/register/personal', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await PersonalUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new personal user
    const newUser = new PersonalUser({
      name,
      email,
      password, // In production, hash this password
      accountType: 'personal'
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        email: newUser.email, 
        accountType: 'personal' 
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
        accountType: 'personal' 
      }
    });
  } catch (error) {
    console.error('Personal registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get personal user profile
router.get('/me/personal', authenticateToken, async (req, res) => {
  try {
    const user = await PersonalUser.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        accountType: user.accountType,
        subscription: user.subscription,
        emailConnected: user.emailConnected,
        googleAuthConnected: !!(user.googleAuth && user.googleAuth.accessToken),
        googleEmail: user.googleAuth ? user.googleAuth.connectedEmail : null
      }
    });
  } catch (error) {
    console.error('Error fetching personal user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;