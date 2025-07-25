import { createOAuth2Client } from './gmailClient.js';

export function initiateGoogleAuth(req, res) {
  const { companyId } = req.query;
  if (!companyId) {
    return res.status(400).json({ error: 'Company ID is required.' });
  }
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];
  const state = Buffer.from(JSON.stringify({ companyId })).toString('base64');
  const oauth2Client = createOAuth2Client();
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state,
  });
  res.json({ authorizeUrl });
} 