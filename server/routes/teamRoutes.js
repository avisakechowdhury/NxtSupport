import express from 'express';
import User from '../models/User.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Get team members for a company
router.get('/', authenticateToken, async (req, res) => {
  try {
    const members = await User.find({ companyId: req.user.companyId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Add new team member
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      role,
      companyId: req.user.companyId,
      password: Math.random().toString(36).slice(-8) // Generate random password
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Remove team member
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await User.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });
    res.json({ message: 'Team member removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

export default router;