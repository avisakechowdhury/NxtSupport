import express from 'express';
import { google } from 'googleapis';
import Company from '../models/Company.js'; 
import authenticateToken from '../middleware/authenticateToken.js';
import Sentiment from 'sentiment';
import Ticket from '../models/Ticket.js';
import TicketActivity from '../models/TicketActivity.js';
import dotenv from 'dotenv'
import axios from 'axios'; // Added for making API requests


dotenv.config()

const router = express.Router();

const sentiment = new Sentiment();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ;
const FRONTEND_URL = process.env.FRONTEND_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // <-- Add your Gemini API Key to .env file

console.log(GOOGLE_CLIENT_ID);
console.log(GOOGLE_CLIENT_SECRET);
console.log(REDIRECT_URI);
console.log(FRONTEND_URL);
console.log(GEMINI_API_KEY);
// console.log(process.env);

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("FATAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set in environment variables.");
  // Optionally, throw error to stop app startup
  throw new Error("Missing Google OAuth credentials");
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);


// New Function to Analyze Email with Gemini API
const analyzeEmailWithGemini = async (subject, body) => {
    // Corrected the model name from 'gemini-1.0-pro' to 'gemini-1.5-flash-latest'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    // The prompt instructs the model to classify the email and respond with a single word.
    const prompt = `Analyze the following email text and determine if it is a complaint. Respond with only one word: "Complaint" or "Normal".\n\n---\n\nSubject: ${subject}\n\nBody: ${body}`;

    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const resultText = response.data.candidates[0].content.parts[0].text.trim();
        console.log(`Gemini Analysis Result: ${resultText}`); 
        
        if (resultText.toLowerCase().includes('complaint')) {
            return 'Complaint';
        }
        return 'Normal';

    } catch (error) {
        // Updated error logging to be more informative
        if (error.response) {
            console.error('Error calling Gemini API:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error setting up Gemini API request:', error.message);
        }
        // Fallback to a default value in case of API error
        return 'Normal'; 
    }
};

// Helper function to render email template
const renderEmailTemplate = (template, variables) => {
  let rendered = template;
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    rendered = rendered.replace(new RegExp(placeholder, 'g'), variables[key]);
  });
  return rendered;
};

// Initiate Google OAuth flow, protected route
router.get('/google/initiate', (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    console.error('Missing companyId in /google/initiate request.');
    return res.status(400).json({ error: 'Company ID is required.' });
  }
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const state = Buffer.from(JSON.stringify({ companyId })).toString('base64');

  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state,
  });
  console.log('Generated authorizeUrl:', authorizeUrl); // Debug log
  res.json({ authorizeUrl });
});

// OAuth callback route (public)
router.get('/google/callback', async (req, res) => {
  const { code, state, error: oauthError } = req.query;

  if (oauthError) {
    console.error('Google OAuth error:', oauthError);
    return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=${encodeURIComponent(oauthError)}`);
  }

  if (!code || !state) {
    console.error('Missing code or state in Google OAuth callback.');
    return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=MissingCodeOrState`);
  }

  let companyId;
  try {
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    companyId = decodedState.companyId;
    if (!companyId) throw new Error('Company ID missing in state');
  } catch (err) {
    console.error('Error decoding state:', err.message);
    return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=InvalidState`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const emailAddress = profile.data.emailAddress;

    if (!emailAddress) throw new Error("Couldn't get user's email from Google.");

    const company = await Company.findById(companyId);
    if (!company) {
      console.error(`Company not found for ID: ${companyId}`);
      return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=CompanyNotFound`);
    }

    company.googleAuth = {
      googleUserId: emailAddress,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || company.googleAuth?.refreshToken,
      expiryDate: tokens.expiry_date,
      scope: tokens.scope,
      connectedEmail: emailAddress,
    };
    company.emailConnected = true;
    company.supportEmail = emailAddress;

    await company.save();

    const successRedirectUrl = `${FRONTEND_URL}/email-setup?status=google-success&email=${encodeURIComponent(emailAddress)}`;

    res.send(`
      <html>
        <head><title>Redirecting...</title></head>
        <body>
          <p>Google authentication successful! Redirecting...</p>
          <script>
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage('google-auth-success', '${FRONTEND_URL}');
              window.close();
            } else {
              window.location.href = '${successRedirectUrl}';
            }
          </script>
        </body>
      </html>
    `);

  } catch (err) {
    console.error('Error during OAuth callback processing:', err);
    const errorMessage = err.response?.data?.error_description || err.message || 'OAuth error';
    return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=${encodeURIComponent(errorMessage)}`);
  }
});



router.get('/google/inbox', authenticateToken, async (req, res) => {
  if (!req.user || !req.user.companyId) {
    return res.status(401).json({ error: 'Authentication with company context required.' });
  }
  const { companyId } = req.user;

  try {
    const company = await Company.findById(companyId);
    if (!company || !company.googleAuth) {
      return res.status(403).json({ error: 'Google account not connected.' });
    }

    const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
    client.setCredentials({
      access_token: company.googleAuth.accessToken,
      refresh_token: company.googleAuth.refreshToken,
      expiry_date: company.googleAuth.expiryDate,
    });

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

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 15,
    });

    const messages = response.data.messages || [];
    const emails = [];
    const supportEmail = company.googleAuth.connectedEmail.toLowerCase(); // Get support email once

    // (Old Method) - Static Keywords for Complaint Detection
    const complaintKeywords = [
      'complaint', 'issue', 'problem', 'not working', 'disappoint', 'unhappy', 'poor',
      'terrible', 'bad service', 'failed', 'error', 'not satisfied', 'dissatisfied',
      'frustrated', 'angry',
    ];

    for (const message of messages) {
      try {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });

        const messageId = msg.data.id;
        const headers = msg.data.payload?.headers || [];
        const subjectHeader = headers.find((header) => header.name.toLowerCase() === 'subject');
        const fromHeader = headers.find((header) => header.name.toLowerCase() === 'from');
        const dateHeader = headers.find((header) => header.name.toLowerCase() === 'date');

        const fromValue = fromHeader?.value || 'Unknown Sender';
        const senderEmail = (fromValue.match(/<(.+)>/)?.[1] || fromValue).trim().toLowerCase();

        if (senderEmail === supportEmail) {
          console.log(`Skipping email from self (${senderEmail}). Message ID: ${messageId}`);
          continue;
        }

        let body = '';
        let htmlBody = '';
        
        // Enhanced body extraction to handle both text and HTML
        const extractBody = (payload) => {
          if (payload.parts) {
            for (const part of payload.parts) {
              if (part.mimeType === 'text/plain' && part.body?.data) {
                body = Buffer.from(part.body.data, 'base64').toString('utf-8');
              } else if (part.mimeType === 'text/html' && part.body?.data) {
                htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
              } else if (part.parts) {
                extractBody(part); // Recursive for nested parts
              }
            }
          } else if (payload.body?.data) {
            if (payload.mimeType === 'text/html') {
              htmlBody = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            } else {
              body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            }
          }
        };

        extractBody(msg.data.payload);

        // Prefer HTML body for better rendering, fallback to text
        const finalBody = htmlBody || body;

        const isUnread = msg.data.labelIds?.includes('UNREAD') || false;
        const subjectValue = subjectHeader?.value || 'No Subject';
        const dateValue = dateHeader?.value || new Date().toISOString();
        const snippetValue = msg.data.snippet || '';

        // Check if ticket already exists to avoid duplicates
        const existingTicket = await Ticket.findOne({ 
          gmailMessageId: messageId, 
          companyId 
        });

        if (existingTicket) {
          emails.push({
            id: msg.data.id,
            subject: subjectValue,
            from: fromValue,
            dateTime: dateValue,
            snippet: snippetValue,
            body: finalBody,
            isUnread: isUnread,
            type: 'Complaint',
            ticketNumber: existingTicket.ticketNumber,
            acknowledged: true,
          });
          continue;
        }
        
        // --- START OF DETECTION LOGIC ---

        let isComplaint = false;

        // --- METHOD 1: New Gemini API Analysis (Recommended) ---
        // To use this, uncomment the following lines and comment out METHOD 2.
        const emailType = await analyzeEmailWithGemini(subjectValue, finalBody || snippetValue);
        isComplaint = (emailType === 'Complaint');
        
        // --- METHOD 2: Original Keyword and Sentiment Analysis ---
        // This is the old method. To use it, comment out METHOD 1 above.
        /*
        const subject = subjectValue.toLowerCase();
        const emailBody = (body || snippetValue).toLowerCase();
        const hasComplaintKeyword = complaintKeywords.some(
          (keyword) => subject.includes(keyword) || emailBody.includes(keyword)
        );
        const contentToAnalyze = `${subject} ${body || snippetValue}`;
        const sentimentResult = sentiment.analyze(contentToAnalyze);
        const isNegativeSentiment = sentimentResult.score < 0;
        isComplaint = hasComplaintKeyword || isNegativeSentiment;
        */
       // --- END OF DETECTION LOGIC ---


        if (isComplaint) {
          const ticketCount = await Ticket.countDocuments({ companyId: req.user.companyId });
          const ticketNumber = `INC${(ticketCount + 1).toString().padStart(6, '0')}`;

          const sentimentResult = sentiment.analyze(`${subjectValue} ${finalBody || snippetValue}`); // Still use sentiment for priority

          const ticket = new Ticket({
            ticketNumber,
            companyId: req.user.companyId,
            subject: subjectValue,
            body: finalBody || snippetValue,
            senderEmail: fromValue.match(/<(.+)>/)?.[1] || fromValue,
            senderName: fromValue.match(/^([^<]+)/)?.[1]?.trim() || 'Unknown Sender',
            gmailMessageId: messageId,
            status: 'acknowledged',
            priority: sentimentResult.score < -5 ? 'high' : sentimentResult.score < -2 ? 'medium' : 'low',
            aiConfidence: 0.95, // Higher confidence with Gemini
            originalLanguage: 'en',
          });

          await ticket.save();

          const activity = new TicketActivity({
            ticketId: ticket._id,
            activityType: 'created',
            details: 'Ticket created from email complaint (Analyzed by AI)',
          });
          await activity.save();

          // Use custom email template if available
          const template = company.emailTemplate;
          const useCustom = template?.useCustomTemplate && template?.subject && template?.body;
          
          const templateVars = {
            customerName: ticket.senderName,
            companyName: company.name,
            subject: ticket.subject,
            ticketNumber: ticket.ticketNumber
          };

          const emailSubject = useCustom 
            ? renderEmailTemplate(template.subject, templateVars)
            : `[${ticket.ticketNumber}] We have received your support request`;

          const emailContent = useCustom
            ? renderEmailTemplate(template.body, templateVars)
            : `Dear ${ticket.senderName},\n\nThank you for contacting our support team. This email confirms that we have received your message regarding: "${ticket.subject}".\n\nYour request has been assigned ticket number: ${ticket.ticketNumber}\n\nOur team will review your request and get back to you as soon as possible. You can reply to this email to add more information to your ticket.\n\nBest regards,\n${company.name} Support Team`;

          const emailLines = [
            'From: "' + company.name + ' Support" <' + company.googleAuth.connectedEmail + '>',
            'To: ' + ticket.senderEmail,
            'Subject: ' + emailSubject,
            'Content-Type: text/plain; charset=utf-8',
            '',
            emailContent
          ];

          const email = emailLines.join('\r\n').trim();
          const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

          await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
              raw: encodedEmail,
              threadId: msg.data.threadId
            }
          });

          emails.push({
            id: msg.data.id,
            subject: subjectValue,
            from: fromValue,
            dateTime: dateValue,
            snippet: snippetValue,
            body: finalBody,
            isUnread: isUnread,
            type: 'Complaint',
            ticketNumber: ticketNumber,
            acknowledged: true,
            sentimentScore: sentimentResult.score,
          });

        } else {
          emails.push({
            id: msg.data.id,
            subject: subjectValue,
            from: fromValue,
            dateTime: dateValue,
            snippet: snippetValue,
            body: finalBody,
            isUnread: isUnread,
            type: 'Normal',
            sentimentScore: sentiment.analyze(`${subjectValue} ${finalBody || snippetValue}`).score,
          });
        }

      } catch (procError) {
        console.error(`Error processing message ${message.id}:`, procError);
        // Continue processing other emails even if one fails
        continue;
      }
    }

    res.json({ emails });

  } catch (err) {
    console.error('Error fetching inbox:', err);
    const errorDetails = (err.code !== 11000) ? err.message : 'Duplicate key handled or other issue.';
    res.status(500).json({ error: 'Server error fetching emails.', details: errorDetails });
  }
});


// Disconnect Google account and revoke tokens; protected route
router.post('/google/disconnect', authenticateToken, async (req, res) => {
  if (!req.user || !req.user.companyId) {
    return res.status(401).json({ error: 'Authentication with company context required.' });
  }
  const { companyId } = req.user;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: 'Company not found.' });

    if (company.googleAuth) {
      const revocationClient = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
      const tokenToRevoke = company.googleAuth.refreshToken || company.googleAuth.accessToken;
      if (tokenToRevoke) {
        try {
          await revocationClient.revokeToken(tokenToRevoke);
          console.log(`Revoked token for company ${companyId}`);
        } catch (revokeErr) {
          console.warn(`Failed to revoke token: ${revokeErr.message}`);
        }
      }
    }

    company.googleAuth = undefined;
    company.emailConnected = false;
    // company.supportEmail = null; // optionally clear support email
    await company.save();

    res.json({ message: 'Google account disconnected successfully.' });

  } catch (err) {
    console.error('Error disconnecting Google account:', err);
    res.status(500).json({ error: 'Server error disconnecting Google account.' });
  }
});

export default router;