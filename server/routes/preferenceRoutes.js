import express from 'express';
import PersonalUser from '../models/PersonalUser.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Get all user preferences
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await PersonalUser.findById(req.user.id).select('preferences');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.preferences || { emailCategories: [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a custom email category
router.post('/categories', authenticateToken, async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const user = await PersonalUser.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check for duplicates
    if (user.preferences.emailCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        return res.status(409).json({ error: 'Category with this name already exists.' });
    }

    user.preferences.emailCategories.push({ name, color: color || '#cccccc' });
    await user.save();
    res.status(201).json(user.preferences.emailCategories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a custom email category
router.delete('/categories/:categoryId', authenticateToken, async (req, res) => {
  try {
    const user = await PersonalUser.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.preferences.emailCategories.pull({ _id: req.params.categoryId });
    await user.save();
    res.json(user.preferences.emailCategories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
