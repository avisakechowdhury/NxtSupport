import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// POST /api/direct-mail/send
router.post('/send', async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing to, subject, or body.' });
  }

  // Use SMTP credentials from environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully', info });
  } catch (err) {
    console.error('Direct Mail: Failed to send email', err);
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

export default router; 