// import express from 'express';
// import { google } from 'googleapis';
// import PersonalUser from '../models/PersonalUser.js';
// import PersonalEmail from '../models/PersonalEmail.js';
// import authenticateToken from '../middleware/authenticateToken.js';
// import axios from 'axios';

// const router = express.Router();

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI_PERSONAL || 'http://localhost:3000/api/personal/google/callback';
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// const oauth2Client = new google.auth.OAuth2(
//   GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET,
//   REDIRECT_URI
// );

// /**
//  * Creates and configures a Google OAuth2 client for a user.
//  */
// const getGoogleClient = (user) => {
//   const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
//   if (user && user.googleAuth) {
//     client.setCredentials({
//       access_token: user.googleAuth.accessToken,
//       refresh_token: user.googleAuth.refreshToken,
//       expiry_date: user.googleAuth.expiryDate,
//     });
//   }
//   return client;
// };

// /**
//  * Refreshes the Google access token if it's nearing expiration.
//  */
// const refreshGoogleTokenIfNeeded = async (client, user) => {
//   const isTokenExpiring = user.googleAuth.expiryDate && Date.now() > user.googleAuth.expiryDate - 5 * 60 * 1000;
//   if (isTokenExpiring) {
//     if (!user.googleAuth.refreshToken) {
//       console.error(`User ${user.email} needs to re-authenticate. No refresh token.`);
//       user.emailConnected = false;
//       await user.save();
//       return false;
//     }
//     try {
//       const { credentials } = await client.refreshAccessToken();
//       user.googleAuth.accessToken = credentials.access_token;
//       if (credentials.expiry_date) user.googleAuth.expiryDate = credentials.expiry_date;
//       await user.save();
//       client.setCredentials(credentials);
//       console.log(`Token refreshed for user: ${user.email}`);
//     } catch (refreshError) {
//       console.error('Failed to refresh token:', refreshError.message);
//       user.emailConnected = false;
//       await user.save();
//       return false;
//     }
//   }
//   return true;
// };

// /**
//  * Analyzes email content using the Gemini API for category and sentiment.
//  * Returns a structured JSON object for reliable parsing.
//  */
// const analyzeEmailWithGemini = async (subject, body, customCategories = []) => {
//     if (!GEMINI_API_KEY) {
//         console.error("GEMINI_API_KEY is not set. Skipping analysis.");
//         return { category: 'Other', sentiment: 'Neutral' };
//     }
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
//   const standardCategories = ["Brand Enquiry", "Collaboration", "Fan Mail", "Thank You", "Business", "Personal", "Promotional", "Important", "Other"];
//   const allCategories = [...new Set([...standardCategories, ...customCategories])].join('", "');

//   const prompt = `Analyze the email below. Respond ONLY with a valid JSON object with two keys: "category" and "sentiment".
// 1.  "category": Classify the email into ONE of the following categories: ["${allCategories}"].
// 2.  "sentiment": Classify the email's tone as "Positive", "Neutral", or "Negative".

// Email Subject: ${subject}
// Email Body: ${body.substring(0, 4000)}

// JSON Response:`;

//   try {
//     const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
//     const rawText = response.data.candidates[0].content.parts[0].text;
//     const jsonString = rawText.match(/\{[\s\S]*\}/)[0];
//     const result = JSON.parse(jsonString);

//     const category = standardCategories.concat(customCategories).includes(result.category) ? result.category : 'Other';
//     const sentiment = ['Positive', 'Neutral', 'Negative'].includes(result.sentiment) ? result.sentiment : 'Neutral';

//     return { category, sentiment };
//   } catch (error) {
//     console.error('Error calling or parsing Gemini API:', error.message);
//     return { category: 'Other', sentiment: 'Neutral' };
//   }
// };

// // Initiate Google OAuth for personal account
// router.get('/google/initiate', authenticateToken, (req, res) => {
//   const scopes = [
//     'https://www.googleapis.com/auth/gmail.readonly',
//     'https://www.googleapis.com/auth/gmail.modify',
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//   ];

//   const state = Buffer.from(JSON.stringify({ userId: req.user.id })).toString('base64');

//   const authorizeUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: scopes,
//     prompt: 'consent',
//     state,
//   });

//   res.json({ authorizeUrl });
// });

// // Google OAuth callback for personal accounts - THIS SHOULD NOT BE PROTECTED
// router.get('/google/callback', async (req, res) => {
//   const { code, state, error: oauthError } = req.query;

//   if (oauthError) {
//     console.error('Google OAuth error:', oauthError);
//     return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=${encodeURIComponent(oauthError)}`);
//   }

//   if (!code || !state) {
//     console.error('Missing code or state in Google OAuth callback.');
//     return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=MissingCodeOrState`);
//   }

//   let userId;
//   try {
//     const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
//     userId = decodedState.userId;
//     if (!userId) throw new Error('User ID missing in state');
//   } catch (err) {
//     console.error('Error decoding state:', err.message);
//     return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=InvalidState`);
//   }

//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
//     const profile = await gmail.users.getProfile({ userId: 'me' });
//     const emailAddress = profile.data.emailAddress;

//     if (!emailAddress) throw new Error("Couldn't get user's email from Google.");

//     const user = await PersonalUser.findById(userId);
//     if (!user) {
//       console.error(`Personal user not found for ID: ${userId}`);
//       return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=UserNotFound`);
//     }

//     user.googleAuth = {
//       googleUserId: emailAddress,
//       accessToken: tokens.access_token,
//       refreshToken: tokens.refresh_token || user.googleAuth?.refreshToken,
//       expiryDate: tokens.expiry_date,
//       scope: tokens.scope,
//       connectedEmail: emailAddress,
//     };
//     user.emailConnected = true;

//     await user.save();

//     const successRedirectUrl = `${FRONTEND_URL}/personal/inbox?status=google-success&email=${encodeURIComponent(emailAddress)}`;

//     res.send(`
//       <html>
//         <head><title>Redirecting...</title></head>
//         <body>
//           <p>Google authentication successful! Redirecting...</p>
//           <script>
//             if (window.opener && !window.opener.closed) {
//               window.opener.postMessage('google-auth-success', '${FRONTEND_URL}');
//               window.close();
//             } else {
//               window.location.href = '${successRedirectUrl}';
//             }
//           </script>
//         </body>
//       </html>
//     `);

//   } catch (err) {
//     console.error('Error during OAuth callback processing:', err);
//     const errorMessage = err.response?.data?.error_description || err.message || 'OAuth error';
//     return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=${encodeURIComponent(errorMessage)}`);
//   }
// });

// // Fetch and categorize emails for personal account
// router.post('/sync', authenticateToken, async (req, res) => {
//   const user = await PersonalUser.findById(req.user.id);
//   if (!user || !user.emailConnected) {
//     return res.status(403).json({ error: 'Google account not connected.' });
//   }

//   // Immediately respond to the client to prevent timeout
//   res.status(202).json({ message: 'Email synchronization has started in the background. Your inbox will update shortly.' });

//   // --- Background Processing ---
//   (async () => {
//     try {
//       console.log(`[SYNC START] User: ${user.email}`);
//       const client = getGoogleClient(user);
//       if (!(await refreshGoogleTokenIfNeeded(client, user))) return;

//       const gmail = google.gmail({ version: 'v1', auth: client });
//       let nextPageToken = null;
//       let totalNewEmailsProcessed = 0;
      
//       do {
//         // 1. Fetch a page of message IDs from Gmail API
//         const listResponse = await gmail.users.messages.list({
//           userId: 'me',
//           maxResults: 100, // Fetch 100 at a time
//           pageToken: nextPageToken,
//           // No 'q' parameter to fetch from the entire mailbox, not just inbox.
//         });

//         const messages = listResponse.data.messages || [];
//         if (messages.length === 0) break;

//         const messageIds = messages.map(msg => msg.id);

//         // 2. Efficiently find which emails are already in our DB for this page
//         const existingEmails = await PersonalEmail.find({ userId: req.user.id, gmailMessageId: { $in: messageIds } }).select('gmailMessageId');
//         const existingMessageIds = new Set(existingEmails.map(e => e.gmailMessageId));

//         // 3. Determine which emails are new
//         const newMessageIds = messageIds.filter(id => !existingMessageIds.has(id));
//         console.log(`[SYNC PAGE] Found ${newMessageIds.length} new emails to process.`);
//         if (newMessageIds.length === 0) {
//             nextPageToken = listResponse.data.nextPageToken;
//             continue; // Move to the next page if no new emails on this one
//         }

//         // 4. Process only the new emails in this page
//         for (const messageId of newMessageIds) {
//           try {
//             const msgResponse = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
//             const { data: msg } = msgResponse;
            
//             const headers = msg.payload?.headers || [];
//             const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
//             const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
//             const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();
            
//             let body = '';
//             // A more robust way to get the plain text body
//             if (msg.payload?.parts?.find(p => p.mimeType === 'text/plain')?.body?.data) {
//                 body = Buffer.from(msg.payload.parts.find(p => p.mimeType === 'text/plain').body.data, 'base64').toString('utf-8');
//             } else if (msg.payload?.body?.data) {
//                 body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
//             }
            
//             const customCategories = user.preferences?.emailCategories?.map(c => c.name) || [];
//             const { category, sentiment } = await analyzeEmailWithGemini(subject, body || msg.snippet, customCategories);

//             const personalEmail = new PersonalEmail({
//               userId: req.user.id,
//               gmailMessageId: msg.id,
//               threadId: msg.threadId,
//               subject, from, body, snippet: msg.snippet, category, sentiment,
//               isRead: !msg.labelIds?.includes('UNREAD'),
//               receivedAt: new Date(date),
//             });
//             await personalEmail.save();
//             totalNewEmailsProcessed++;

//             // Rate-limiting delay for Gemini API
//             await new Promise(resolve => setTimeout(resolve, 500));
//           } catch(emailError){
//              console.error(`[SYNC ERROR] Failed to process message ${messageId}:`, emailError.message);
//              // Continue to the next email even if one fails
//           }
//         }
//         nextPageToken = listResponse.data.nextPageToken;
//       } while (nextPageToken);

//       console.log(`[SYNC END] User: ${user.email}. Processed ${totalNewEmailsProcessed} new emails.`);
//     } catch (error) {
//       console.error(`[FATAL SYNC ERROR] User ${user.email}:`, error);
//     }
//   })();
// });


// /**
//  * **MODIFIED:** This endpoint now quickly fetches already-processed emails from your DB.
//  */
// router.get('/emails', authenticateToken, async (req, res) => {
//     try {
//         const user = await PersonalUser.findById(req.user.id);
//         if (!user) return res.status(404).json({ error: 'User not found.' });

//         const emails = await PersonalEmail.find({ userId: req.user.id }).sort({ receivedAt: -1 }).limit(100);
        
//         // Format for frontend
//         const formattedEmails = emails.map(email => ({
//             id: email.gmailMessageId,
//             subject: email.subject,
//             from: email.from,
//             preview: email.snippet,
//             time: new Date(email.receivedAt).toLocaleString(),
//             category: email.category,
//             sentiment: email.sentiment,
//             isRead: email.isRead,
//         }));

//         res.json({ emails: formattedEmails });

//     } catch (err) {
//         console.error('Error fetching personal emails from DB:', err);
//         res.status(500).json({ error: 'Server error fetching emails.' });
//     }
// });


// /**
//  * **NEW:** Endpoint to generate a draft reply for an email.
//  */
// router.post('/emails/:emailId/draft-reply', authenticateToken, async (req, res) => {
//     try {
//         const email = await PersonalEmail.findOne({ 
//             gmailMessageId: req.params.emailId, 
//             userId: req.user.id 
//         });

//         if (!email) {
//             return res.status(404).json({ error: 'Email not found.' });
//         }

//         const prompt = `Based on the following email, which is categorized as "${email.category}", write a polite and professional draft reply in plain text.
//         - If the email is a "Brand Enquiry" or "Collaboration", express interest and ask for more details about the proposal.
//         - If it's "Fan Mail" or "Thank You", write a short, appreciative thank you note.
//         - For other categories, create a suitable, generic professional reply.

//         Keep the reply concise.
        
//         Original Email Subject: ${email.subject}
//         Original Email Body: ${email.body.substring(0, 2000)}

//         Draft Reply:`;
        
//         const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
//         const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
//         const draft = response.data.candidates[0].content.parts[0].text.trim();
        
//         res.json({ draft });

//     } catch (error) {
//         console.error('Error generating draft reply:', error);
//         res.status(500).json({ error: 'Failed to generate draft.' });
//     }
// });


// // Get email statistics
// router.get('/stats', authenticateToken, async (req, res) => {
//   try {
//     const totalEmails = await PersonalEmail.countDocuments({ userId: req.user.id });
//     const importantEmails = await PersonalEmail.countDocuments({ 
//       userId: req.user.id, 
//       category: 'Important' 
//     });
//     const processedEmails = await PersonalEmail.countDocuments({ 
//       userId: req.user.id, 
//       category: { $ne: 'Other' }
//     });

//     const timeSavedHours = Math.round((processedEmails * 0.05) * 10) / 10; // 3 minutes per email

//     res.json({
//       totalEmails,
//       importantEmails,
//       processedEmails,
//       timeSaved: `${timeSavedHours} hours`
//     });
//   } catch (error) {
//     console.error('Error fetching email stats:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get categorized email counts
// router.get('/categories', authenticateToken, async (req, res) => {
//   try {
//     const categories = await PersonalEmail.aggregate([
//       { $match: { userId: req.user.id } },
//       { $group: { _id: '$category', count: { $sum: 1 } } }
//     ]);

//     const categorizedEmails = {};
//     categories.forEach(cat => {
//       categorizedEmails[cat._id] = cat.count;
//     });

//     res.json(categorizedEmails);
//   } catch (error) {
//     console.error('Error fetching categorized emails:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Disconnect Google account
// router.post('/google/disconnect', authenticateToken, async (req, res) => {
//   try {
//     const user = await PersonalUser.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     if (user.googleAuth && user.googleAuth.refreshToken) {
//       // Revoke the token with Google
//       const tokenToRevoke = user.googleAuth.refreshToken;
//       await oauth2Client.revokeToken(tokenToRevoke);
//     }

//     // Clear Google auth data from the user's record
//     user.googleAuth = undefined;
//     user.emailConnected = false;
//     await user.save();

//     // Optional: Delete all synced emails for this user
//     await PersonalEmail.deleteMany({ userId: req.user.id });

//     res.json({ message: 'Google account disconnected successfully.' });

//   } catch (err) {
//     console.error('Error disconnecting Google account:', err);
//     res.status(500).json({ error: 'Server error during disconnection.' });
//   }
// });

// // Categorize email manually
// router.post('/emails/:emailId/categorize', authenticateToken, async (req, res) => {
//   const { category } = req.body;
//   const { emailId } = req.params;

//   if (!category) {
//     return res.status(400).json({ error: 'Category is required.' });
//   }

//   try {
//     const email = await PersonalEmail.findOneAndUpdate(
//       { gmailMessageId: emailId, userId: req.user.id },
//       { category: category },
//       { new: true }
//     );

//     if (!email) {
//       return res.status(404).json({ error: 'Email not found.' });
//     }

//     res.json({ message: 'Email categorized successfully.', email });

//   } catch (error) {
//     console.error('Error categorizing email:', error);
//     res.status(500).json({ error: 'Server error.' });
//   }
// });

// export default router;





import express from 'express';
import { google } from 'googleapis';
import PersonalUser from '../models/PersonalUser.js';
import PersonalEmail from '../models/PersonalEmail.js';
import authenticateToken from '../middleware/authenticateToken.js';
import axios from 'axios';

const router = express.Router();
  
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 560866680909-d9gqc5i9g3o20vj503mmamtd3k2ulj31.apps.googleusercontent.com;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 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;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// Analyze email with Gemini API for personal categorization
const categorizeEmailWithGemini = async (subject, body) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `Analyze the following email and categorize it into one of these categories: "Brand Enquiry", "Collaboration", "Fan Mail", "Thank You", "Business", "Personal", "Promotional", "Important", or "Other". 

Consider:
- Brand Enquiry: Emails from brands wanting to collaborate or partner
- Collaboration: Requests for partnerships, joint ventures, or working together
- Fan Mail: Messages from fans, followers, or admirers
- Thank You: Appreciation messages, gratitude emails
- Business: Professional correspondence, work-related emails
- Personal: Friends, family, personal matters
- Promotional: Marketing emails, advertisements, newsletters
- Important: Urgent matters, time-sensitive information
- Other: Everything else

Respond with only the category name.

Subject: ${subject}
Body: ${body}`;

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
    
    // Validate the response is one of our categories
    const validCategories = [
      'Brand Enquiry', 'Collaboration', 'Fan Mail', 'Thank You', 
      'Business', 'Personal', 'Promotional', 'Important', 'Other'
    ];
    
    if (validCategories.includes(resultText)) {
      return resultText;
    }
    
    return 'Other';
  } catch (error) {
    console.error('Error calling Gemini API for categorization:', error.message);
    return 'Other';
  }
};

// Initiate Google OAuth for personal account
router.get('/google/initiate', authenticateToken, (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const state = Buffer.from(JSON.stringify({ userId: req.user.id })).toString('base64');

  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state,
  });

  res.json({ authorizeUrl });
});

// Google OAuth callback for personal accounts - THIS SHOULD NOT BE PROTECTED
router.get('/google/callback', async (req, res) => {
  const { code, state, error: oauthError } = req.query;

  if (oauthError) {
    console.error('Google OAuth error:', oauthError);
    return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=${encodeURIComponent(oauthError)}`);
  }

  if (!code || !state) {
    console.error('Missing code or state in Google OAuth callback.');
    return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=MissingCodeOrState`);
  }

  let userId;
  try {
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    userId = decodedState.userId;
    if (!userId) throw new Error('User ID missing in state');
  } catch (err) {
    console.error('Error decoding state:', err.message);
    return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=InvalidState`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const emailAddress = profile.data.emailAddress;

    if (!emailAddress) throw new Error("Couldn't get user's email from Google.");

    const user = await PersonalUser.findById(userId);
    if (!user) {
      console.error(`Personal user not found for ID: ${userId}`);
      return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=UserNotFound`);
    }

    user.googleAuth = {
      googleUserId: emailAddress,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || user.googleAuth?.refreshToken,
      expiryDate: tokens.expiry_date,
      scope: tokens.scope,
      connectedEmail: emailAddress,
    };
    user.emailConnected = true;

    await user.save();

    const successRedirectUrl = `${FRONTEND_URL}/personal/inbox?status=google-success&email=${encodeURIComponent(emailAddress)}`;

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
    return res.redirect(`${FRONTEND_URL}/personal/inbox?status=google-error&message=${encodeURIComponent(errorMessage)}`);
  }
});

// Fetch and categorize emails for personal account
router.get('/emails', authenticateToken, async (req, res) => {
  try {
    const user = await PersonalUser.findById(req.user.id);
    if (!user || !user.googleAuth) {
      return res.status(403).json({ error: 'Google account not connected.' });
    }

    const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    client.setCredentials({
      access_token: user.googleAuth.accessToken,
      refresh_token: user.googleAuth.refreshToken,
      expiry_date: user.googleAuth.expiryDate,
    });

    // Refresh token if needed
    if (user.googleAuth.expiryDate && Date.now() > user.googleAuth.expiryDate - 5 * 60 * 1000) {
      if (!user.googleAuth.refreshToken) {
        return res.status(403).json({ error: 'Access token expired and no refresh token available.' });
      }

      try {
        const { credentials } = await client.refreshAccessToken();
        user.googleAuth.accessToken = credentials.access_token;
        if (credentials.expiry_date) user.googleAuth.expiryDate = credentials.expiry_date;
        if (credentials.refresh_token) user.googleAuth.refreshToken = credentials.refresh_token;
        await user.save();
        client.setCredentials(credentials);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return res.status(403).json({ error: 'Failed to refresh access token. Please re-authenticate.' });
      }
    }

    const gmail = google.gmail({ version: 'v1', auth: client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50,
    });

    const messages = response.data.messages || [];
    const emails = [];

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

        let body = '';
        if (msg.data.payload?.parts) {
          const textPart = msg.data.payload.parts.find((part) => part.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        } else if (msg.data.payload?.body?.data) {
          body = Buffer.from(msg.data.payload.body.data, 'base64').toString('utf-8');
        }

        const subject = subjectHeader?.value || 'No Subject';
        const from = fromHeader?.value || 'Unknown Sender';
        const date = dateHeader?.value || new Date().toISOString();
        const snippet = msg.data.snippet || '';

        // Check if email already exists
        const existingEmail = await PersonalEmail.findOne({ 
          gmailMessageId: messageId, 
          userId: req.user.id 
        });

        let category;
        if (existingEmail) {
          category = existingEmail.category;
        } else {
          // Only call AI for new emails
          category = await categorizeEmailWithGemini(subject, body || snippet);

          // Save the new email to the database
          const personalEmail = new PersonalEmail({
            userId: req.user.id,
            gmailMessageId: messageId,
            threadId: msg.data.threadId,
            subject,
            from,
            body: body || snippet,
            snippet,
            category,
            aiConfidence: 0.9,
            isRead: !msg.data.labelIds?.includes('UNREAD'),
            receivedAt: new Date(date),
          });
          await personalEmail.save();
        }

        emails.push({
          id: messageId,
          subject,
          from,
          preview: snippet,
          time: new Date(date).toLocaleString(),
          category: category,
          isRead: !msg.data.labelIds?.includes('UNREAD'),
          isStarred: false,
          labels: []
        });

      } catch (procError) {
        console.error(`Error processing message ${message.id}:`, procError);
      }
    }

    res.json({ emails });

  } catch (err) {
    console.error('Error fetching personal emails:', err);
    res.status(500).json({ error: 'Server error fetching emails.' });
  }
});

// Get email statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalEmails = await PersonalEmail.countDocuments({ userId: req.user.id });
    const importantEmails = await PersonalEmail.countDocuments({ 
      userId: req.user.id, 
      category: 'Important' 
    });
    const processedEmails = await PersonalEmail.countDocuments({ 
      userId: req.user.id, 
      category: { $ne: 'Other' }
    });

    const timeSavedHours = Math.round((processedEmails * 0.05) * 10) / 10; // 3 minutes per email

    res.json({
      totalEmails,
      importantEmails,
      processedEmails,
      timeSaved: `${timeSavedHours} hours`
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get categorized email counts
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await PersonalEmail.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categorizedEmails = {};
    categories.forEach(cat => {
      categorizedEmails[cat._id] = cat.count;
    });

    res.json(categorizedEmails);
  } catch (error) {
    console.error('Error fetching categorized emails:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Disconnect Google account
router.post('/google/disconnect', authenticateToken, async (req, res) => {
  try {
    const user = await PersonalUser.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.googleAuth && user.googleAuth.refreshToken) {
      // Revoke the token with Google
      const tokenToRevoke = user.googleAuth.refreshToken;
      await oauth2Client.revokeToken(tokenToRevoke);
    }

    // Clear Google auth data from the user's record
    user.googleAuth = undefined;
    user.emailConnected = false;
    await user.save();

    // Optional: Delete all synced emails for this user
    await PersonalEmail.deleteMany({ userId: req.user.id });

    res.json({ message: 'Google account disconnected successfully.' });

  } catch (err) {
    console.error('Error disconnecting Google account:', err);
    res.status(500).json({ error: 'Server error during disconnection.' });
  }
});

// Categorize email manually
router.post('/emails/:emailId/categorize', authenticateToken, async (req, res) => {
  const { category } = req.body;
  const { emailId } = req.params;

  if (!category) {
    return res.status(400).json({ error: 'Category is required.' });
  }

  try {
    const email = await PersonalEmail.findOneAndUpdate(
      { gmailMessageId: emailId, userId: req.user.id },
      { category: category },
      { new: true }
    );

    if (!email) {
      return res.status(404).json({ error: 'Email not found.' });
    }

    res.json({ message: 'Email categorized successfully.', email });

  } catch (error) {
    console.error('Error categorizing email:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;