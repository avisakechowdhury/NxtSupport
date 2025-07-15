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

// Utility function to strip HTML tags, CSS, and scripts for clean logging
function stripHtml(html) {
  // Remove <style> and <script> blocks
  let text = html.replace(/<style[\s\S]*?<\/style>/gi, '')
                 .replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove all HTML tags
  text = text.replace(/<[^>]*>?/gm, '');
  // Replace multiple spaces/newlines with a single space
  text = text.replace(/\s+/g, ' ');
  // Trim and return as plain text paragraph
  return text.trim();
}

// Utility function to extract ticket number from subject
function extractTicketNumber(subject) {
    const ticketMatch = subject.match(/[IT]NC\d{6}/);
    return ticketMatch ? ticketMatch[0] : null;
}

// Utility function to get next priority level
function getNextPriority(currentPriority) {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorities.indexOf(currentPriority);
    return currentIndex < priorities.length - 1 ? priorities[currentIndex + 1] : currentPriority;
}

// New Function to Analyze Email with Gemini API
const analyzeEmailWithGemini = async (subject, body) => {
    const cleanBody = stripHtml(body).slice(0, 1000);
    
    // Check if this is a reply to an existing ticket
    const ticketNumber = extractTicketNumber(subject);
    if (ticketNumber) {
        const prompt = `Analyze the following email reply and determine if it contains a complaint or negative feedback. Consider that this is a reply to ticket ${ticketNumber}. Respond with only one word: "Complaint" or "Normal".\n\n---\n\nSubject: ${subject}\n\nBody: ${cleanBody}`;
        
        try {
            const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, 
                { contents: [{ parts: [{ text: prompt }] }] },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            const resultText = response.data.candidates[0].content.parts[0].text.trim();
            
            return {
                type: resultText.toLowerCase().includes('complaint') ? 'Complaint' : 'Normal',
                isReply: true,
                ticketNumber,
                shouldEscalate: resultText.toLowerCase().includes('complaint')
            };
        } catch (error) {
            console.error('Error analyzing reply with Gemini:', error.message);
            return { type: 'Normal', isReply: true, ticketNumber, shouldEscalate: false };
        }
    } else {
        // Original analysis for new emails
        const prompt = `Analyze the following email text and determine if it is a complaint. Respond with only one word: "Complaint" or "Normal".\n\n---\n\nSubject: ${subject}\n\nBody: ${cleanBody}`;
        
        try {
            const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, 
                { contents: [{ parts: [{ text: prompt }] }] },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            const resultText = response.data.candidates[0].content.parts[0].text.trim();
            
            return {
                type: resultText.toLowerCase().includes('complaint') ? 'Complaint' : 'Normal',
                isReply: false,
                shouldEscalate: false
            };
        } catch (error) {
            console.error('Error calling Gemini API:', error.message);
            return { type: 'Normal', isReply: false, shouldEscalate: false };
        }
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

  // Pagination params
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const pageSize = parseInt(req.query.pageSize) > 0 ? parseInt(req.query.pageSize) : 50;
  const maxResults = pageSize;
  const startIndex = (page - 1) * pageSize;
  console.log(`[INBOX PAGINATION] page=${page}, pageSize=${pageSize}, startIndex=${startIndex}`);

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

    // Fetch message IDs with pagination
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: '',
      pageToken: req.query.pageToken || undefined,
    });
    const messages = listResponse.data.messages || [];
    const nextPageToken = listResponse.data.nextPageToken;
    console.log(`[INBOX FETCH] Fetched ${messages.length} messages for page ${page}, nextPageToken=${nextPageToken}`);
    const emails = [];
    const supportEmail = company.googleAuth.connectedEmail?.toLowerCase() || '';

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
          // console.log(`Skipping email from self (${senderEmail}). Message ID: ${messageId}`);
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

        // Debug log: show subject and extracted ticket number
        const extractedTicketNumber = extractTicketNumber(subjectValue);
        // console.log('Processing email subject:', subjectValue, '| Extracted ticket number:', extractedTicketNumber);

        // First check if this is a reply to an existing ticket
        const ticketNumber = extractedTicketNumber;
        if (ticketNumber) {
            // This is a reply to an existing ticket
            const existingTicket = await Ticket.findOne({ ticketNumber });
            
            if (existingTicket) {
                // Analyze the reply
                const emailType = await analyzeEmailWithGemini(subjectValue, finalBody || snippetValue);
                
                if (emailType.shouldEscalate) {
                    // Update priority if it's a complaint
                    const newPriority = getNextPriority(existingTicket.priority);
                    existingTicket.priority = newPriority;
                    existingTicket.escalationCount += 1;
                }
                
                // Update last reply time
                existingTicket.lastReplyAt = new Date();
                
                // Add activity for the reply
                const activity = new TicketActivity({
                    ticketId: existingTicket._id,
                    activityType: 'reply',
                    details: `Customer replied to ticket${emailType.shouldEscalate ? ' - Priority escalated to ' + existingTicket.priority : ''}`,
                    content: finalBody || snippetValue
                });
                
                await activity.save();
                await existingTicket.save();

                emails.push({
                    id: msg.data.id,
                    subject: subjectValue,
                    from: fromValue,
                    dateTime: dateValue,
                    snippet: snippetValue,
                    body: finalBody,
                    isUnread: isUnread,
                    type: emailType.type,
                    ticketNumber: existingTicket.ticketNumber,
                    priority: existingTicket.priority,
                    acknowledged: true
                });
                
                continue; // Skip the rest of the loop since we've handled this email
            }
        }

        // Prevent duplicate tickets: check if a ticket with the same subject or gmailMessageId already exists
        const duplicateTicket = await Ticket.findOne({
            $or: [
                { gmailMessageId: messageId },
                { subject: subjectValue, companyId }
            ]
        });
        if (duplicateTicket) {
            // console.log('Duplicate ticket detected, skipping creation:', duplicateTicket.ticketNumber);
            continue;
        }

        // If we get here, this is a new email (not a reply)
        const emailType = await analyzeEmailWithGemini(subjectValue, finalBody || snippetValue);
        
        if (emailType.type === 'Complaint') {
            // Generate unique ticket number with retry logic
            let newTicketNumber;
            let ticket;
            let retryCount = 0;
            const maxRetries = 5;

            do {
                const ticketCount = await Ticket.countDocuments({ companyId: req.user.companyId });
                newTicketNumber = `INC${(ticketCount + 1 + retryCount).toString().padStart(6, '0')}`;
                
                // Check if this ticket number already exists
                const existingTicket = await Ticket.findOne({ ticketNumber: newTicketNumber });
                if (!existingTicket) {
                    const sentimentResult = sentiment.analyze(`${subjectValue} ${finalBody || snippetValue}`);

                    ticket = new Ticket({
                        ticketNumber: newTicketNumber,
                        companyId: req.user.companyId,
                        subject: subjectValue,
                        body: finalBody || snippetValue,
                        senderEmail: fromValue.match(/<(.+)>/)?.[1] || fromValue,
                        senderName: fromValue.match(/^([^<]+)/)?.[1]?.trim() || 'Unknown Sender',
                        gmailMessageId: messageId,
                        status: 'acknowledged',
                        priority: sentimentResult.score < -5 ? 'high' : sentimentResult.score < -2 ? 'medium' : 'low',
                        aiConfidence: 0.95,
                        originalLanguage: 'en',
                    });

                    await ticket.save();
                    break; // Successfully created ticket, exit loop
                }
                
                retryCount++;
            } while (retryCount < maxRetries);

            if (!ticket) {
                console.error('Failed to create ticket after maximum retries');
                continue; // Skip this email
            }

            const activity = new TicketActivity({
                ticketId: ticket._id,
                activityType: 'created',
                details: 'Ticket created from email complaint (Analyzed by AI)',
            });
            await activity.save();

            // Use custom email template if available
            const template = company.emailTemplate;
            const useCustom = template?.useCustomTemplate && template?.subject && template?.body;
            
            const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/ticket/${ticket.publicToken}`;
            // Check if customer portal is enabled and should include in emails
            const includePortalLink = company.customerPortal?.enabled && company.customerPortal?.includeInEmails;
            
            const templateVars = {
                customerName: ticket.senderName,
                companyName: company.name,
                subject: ticket.subject,
                ticketNumber: ticket.ticketNumber,
                portalUrl: includePortalLink ? portalUrl : ''
            };

            const emailSubject = useCustom 
                ? renderEmailTemplate(template.subject, templateVars)
                : `[${ticket.ticketNumber}] We have received your support request`;

            const emailContent = useCustom
                ? renderEmailTemplate(template.body, templateVars)
                : `Dear ${ticket.senderName},\n\nThank you for contacting our support team. This email confirms that we have received your message regarding: "${ticket.subject}".\n\nYour request has been assigned ticket number: ${ticket.ticketNumber}${includePortalLink ? `\n\nTrack your ticket status: ${portalUrl}` : ''}\n\nOur team will review your request and get back to you as soon as possible. You can reply to this email to add more information to your ticket.\n\nBest regards,\n${company.name} Support Team`;

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
                ticketNumber: newTicketNumber,
                priority: ticket.priority,
                acknowledged: true
            });
        } else {
            // Handle non-complaint emails
            emails.push({
                id: msg.data.id,
                subject: subjectValue,
                from: fromValue,
                dateTime: dateValue,
                snippet: snippetValue,
                body: finalBody,
                isUnread: isUnread,
                type: 'Normal'
            });
        }

      } catch (procError) {
        console.error(`Error processing message ${message.id}:`, procError);
        continue;
      }
    }

    res.json({ emails, nextPageToken, page, pageSize });
    // console.log(`[INBOX RESPONSE] Returned ${emails.length} emails, page=${page}, pageSize=${pageSize}, nextPageToken=${nextPageToken}`);
  } catch (err) {
    console.error('Error fetching inbox:', err);
    const errorDetails = (err.code !== 11000) ? err.message : 'Duplicate key handled or other issue.';
    res.status(500).json({ error: 'Server error fetching emails.', details: errorDetails });
  }
});

router.post('/google/mark-unread', authenticateToken, async (req, res) => {
  const { messageId } = req.body;
  if (!req.user || !req.user.companyId) {
    return res.status(401).json({ error: 'Authentication with company context required.' });
  }
  if (!messageId) {
    return res.status(400).json({ error: 'Missing messageId.' });
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
    const gmail = google.gmail({ version: 'v1', auth: client });
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: { addLabelIds: ['UNREAD'], removeLabelIds: ['INBOX'] },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking message as unread:', err);
    res.status(500).json({ error: 'Failed to mark as unread.' });
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