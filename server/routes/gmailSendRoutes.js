import express from 'express';
import { google } from 'googleapis';
import authenticateToken from '../middleware/authenticateToken.js';
import Company from '../models/Company.js';
import Ticket from '../models/Ticket.js';
import TicketActivity from '../models/TicketActivity.js';
import User from '../models/User.js';

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

// POST /api/gmail/send
router.post('/send', authenticateToken, async (req, res) => {
  try {
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ error: 'Only business users can send emails.' });
    }
    const { companyId, id: userId } = req.user;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found in user session.' });
    }
    const { to, subject, body, ticketId } = req.body;
    if (!to || !subject || !body || !ticketId) {
      return res.status(400).json({ error: 'Missing to, subject, body, or ticketId.' });
    }
    const company = await Company.findById(companyId);
    if (!company || !company.googleAuth) {
      return res.status(403).json({ error: 'Google account not connected.' });
    }
    // Set up OAuth2 client
    const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
    client.setCredentials({
      access_token: company.googleAuth.accessToken,
      refresh_token: company.googleAuth.refreshToken,
      expiry_date: company.googleAuth.expiryDate,
    });
    // Refresh token if needed
    if (company.googleAuth.expiryDate && Date.now() > company.googleAuth.expiryDate - 5 * 60 * 1000) {
      if (!company.googleAuth.refreshToken) {
        return res.status(403).json({ error: 'Access token expired and no refresh token available.' });
      }
      try {
        const { credentials } = await client.refreshAccessToken();
        company.googleAuth.accessToken = credentials.access_token;
        if (credentials.expiry_date) company.googleAuth.expiryDate = credentials.expiry_date;
        if (credentials.refresh_token) company.googleAuth.refreshToken = credentials.refresh_token;
        await company.save();
        client.setCredentials(credentials);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return res.status(403).json({ error: 'Failed to refresh access token. Please re-authenticate.' });
      }
    }
    const gmail = google.gmail({ version: 'v1', auth: client });
    // Compose raw email
    const emailLines = [
      'From: "' + company.name + ' Support" <' + company.googleAuth.connectedEmail + '>',
      'To: ' + to,
      'Subject: ' + subject,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ];
    const email = emailLines.join('\r\n').trim();
    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    try {
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });
      // Add activity to ticket
      const ticket = await Ticket.findOne({ _id: ticketId, companyId });
      const user = await User.findById(userId);
      if (ticket && user) {
        const activity = new TicketActivity({
          ticketId: ticket._id,
          activityType: 'comment',
          userId: user._id,
          userName: user.name,
          details: `Agent sent an email to customer: ${subject}`,
          content: body
        });
        await activity.save();
      }
      res.json({ message: 'Email sent successfully', data: result.data });
    } catch (err) {
      console.error('Gmail API: Failed to send email', err);
      res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
  } catch (error) {
    console.error('Gmail API: Unexpected error', error);
    res.status(500).json({ error: 'Unexpected server error', details: error.message });
  }
});

export default router; 