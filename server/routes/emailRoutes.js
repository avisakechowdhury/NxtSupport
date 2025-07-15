import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import Company from '../models/Company.js';

// activeEmailListeners will be injected from server/index.js
let activeEmailListeners = null;

const router = express.Router();

// Dependency injection for activeEmailListeners
export function setActiveEmailListeners(map) {
  activeEmailListeners = map;
}

// POST /api/email/send
router.post('/send', authenticateToken, async (req, res) => {
  try {
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ error: 'Only business users can send emails.' });
    }
    const { companyId } = req.user;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found in user session.' });
    }
    if (!activeEmailListeners || !activeEmailListeners.has(companyId)) {
      console.error('No active email listener for company', companyId);
      return res.status(409).json({ error: 'Email service is not currently active. Please reconnect your support email in settings.' });
    }
    const listener = activeEmailListeners.get(companyId);
    const { to, subject, body, ticketId } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing to, subject, or body.' });
    }
    // Compose mail options
    const mailOptions = {
      from: listener.config.email,
      to,
      subject,
      text: body,
      // Optionally add ticketId as a custom header for tracking
      headers: ticketId ? { 'X-Ticket-ID': ticketId } : undefined,
    };
    console.log('Quick Mail: Sending email', mailOptions);
    try {
      const info = await listener.transporter.sendMail(mailOptions);
      console.log('Quick Mail: Email sent', info);
      res.json({ message: 'Email sent successfully', info });
    } catch (err) {
      console.error('Quick Mail: Failed to send email', err);
      res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
  } catch (error) {
    console.error('Quick Mail: Unexpected error', error);
    res.status(500).json({ error: 'Unexpected server error', details: error.message });
  }
});

export default router; 