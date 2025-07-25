import { createOAuth2Client, createGmail } from './gmailClient.js';
import Company from '../../models/Company.js';
import Ticket from '../../models/Ticket.js';
import User from '../../models/User.js';
import * as geminiService from '../geminiService.js';
import * as ticketService from '../ticketService.js';
import { extractTicketNumber, stripHtml, getNextPriority } from '../../utils/emailUtils.js';
import Sentiment from 'sentiment';
import crypto from 'crypto';

const sentiment = new Sentiment();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Function to generate content hash for duplicate detection
function generateContentHash(emailBody, subject, senderEmail) {
  // Normalize content: remove extra whitespace, convert to lowercase
  const normalizedBody = (emailBody || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const normalizedSubject = (subject || '').replace(/^(Re:|Fwd:)\s*/i, '').trim().toLowerCase();
  const normalizedSender = senderEmail.toLowerCase();
  
  // Create hash from body + subject + sender for true duplicate detection
  const content = `${normalizedBody}|${normalizedSubject}|${normalizedSender}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Improved function to check for content duplicates
async function checkContentDuplicate(email, companyId) {
  const senderEmail = (email.from.match(/<(.+)>/)?.[1] || email.from).trim().toLowerCase();
  const contentHash = generateContentHash(email.body || email.snippet, email.subject, senderEmail);
  
  // Check if we've seen this exact content before (last 30 days to avoid old duplicates)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const existingTicket = await Ticket.findOne({
    companyId,
    contentHash: contentHash,
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  if (existingTicket) {
    console.log(`[CONTENT_DUPLICATE] Found identical content in ticket: ${existingTicket.ticketNumber}`);
    return { isDuplicate: true, ticket: existingTicket, contentHash };
  }
  
  return { isDuplicate: false, ticket: null, contentHash };
}

// Improved function to find potential reply tickets
async function findPotentialReplyTicket(email, companyId) {
  const senderEmail = (email.from.match(/<(.+)>/)?.[1] || email.from).trim().toLowerCase();
  
  console.log(`[REPLY_SEARCH] Looking for potential reply tickets from ${senderEmail}`);
  
  // First try: exact ticket number in subject (most reliable)
  const ticketNumber = extractTicketNumber(email.subject);
  if (ticketNumber) {
    const ticket = await Ticket.findOne({ 
      ticketNumber, 
      companyId 
    }).sort({ createdAt: -1 });
    if (ticket) {
      console.log(`[REPLY_SEARCH] Found ticket by number: ${ticketNumber}`);
      return ticket;
    }
  }
  
  // Second try: Re:/Fwd: prefix indicates likely reply
  const hasReplyPrefix = /^(Re:|Fwd:)\s*/i.test(email.subject);
  if (hasReplyPrefix) {
    // Look for most recent open ticket from same sender (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTicket = await Ticket.findOne({
      companyId,
      senderEmail: senderEmail,
      createdAt: { $gte: sevenDaysAgo },
      status: { $nin: ['closed', 'resolved'] }
    }).sort({ createdAt: -1 });
    
    if (recentTicket) {
      console.log(`[REPLY_SEARCH] Found ticket by Re:/Fwd: prefix and recent activity: ${recentTicket.ticketNumber}`);
      return recentTicket;
    }
  }
  
  // Third try: Check if email content references previous conversation
  const emailContent = (email.body || email.snippet || '').toLowerCase();
  const hasReplyIndicators = emailContent.includes('you mentioned') || 
                            emailContent.includes('as discussed') || 
                            emailContent.includes('following up') ||
                            emailContent.includes('regarding my previous') ||
                            emailContent.includes('still waiting') ||
                            emailContent.includes('no response');
  
  if (hasReplyIndicators) {
    // Look for most recent ticket from same sender (last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentTicket = await Ticket.findOne({
      companyId,
      senderEmail: senderEmail,
      createdAt: { $gte: fourteenDaysAgo },
      status: { $nin: ['closed', 'resolved'] }
    }).sort({ createdAt: -1 });
    
    if (recentTicket) {
      console.log(`[REPLY_SEARCH] Found ticket by reply indicators in content: ${recentTicket.ticketNumber}`);
      return recentTicket;
    }
  }
  
  console.log(`[REPLY_SEARCH] No potential reply ticket found for ${senderEmail}`);
  return null;
}

// Improved function to check if email is already processed
async function isEmailProcessed(gmailMessageId, companyId) {
  // Check if this Gmail message ID exists as main message or in processed array
  const existingTicket = await Ticket.findOne({
    companyId,
    $or: [
      { gmailMessageId: gmailMessageId },
      { processedGmailMessageIds: gmailMessageId }
    ]
  });
  
  if (existingTicket) {
    console.log(`[DUPLICATE] Gmail message already processed: ${existingTicket.ticketNumber}`);
    return { isDuplicate: true, ticket: existingTicket };
  }
  
  return { isDuplicate: false, ticket: null };
}

export const getGoogleInbox = async (req, res) => {
  console.log('[BACKEND] /google/inbox endpoint hit');
  
  if (!req.user || !req.user.companyId) {
    return res.status(401).json({ error: 'Authentication with company context required.' });
  }
  
  const { companyId } = req.user;
  console.log('[BACKEND] companyId:', companyId);
  
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const pageSize = parseInt(req.query.pageSize) > 0 ? parseInt(req.query.pageSize) : 50;
  
  try {
    const company = await Company.findById(companyId);
    if (!company || !company.googleAuth) {
      return res.status(403).json({ error: 'Google account not connected.' });
    }
    
    console.log('[BACKEND] company.googleAuth:', company.googleAuth);
    
    const client = createOAuth2Client();
    client.setCredentials({
      access_token: company.googleAuth.accessToken,
      refresh_token: company.googleAuth.refreshToken,
      expiry_date: company.googleAuth.expiryDate,
    });
    
    const gmail = createGmail(client);
    
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: pageSize,
      q: '',
      pageToken: req.query.pageToken || undefined,
    });
    
    let messages = listResponse.data.messages || [];
    console.log('[BACKEND] Number of messages fetched from Gmail:', messages.length);
    
    const nextPageToken = listResponse.data.nextPageToken;
    const emails = [];
    const supportEmail = company.googleAuth.connectedEmail?.toLowerCase() || '';
    console.log('[BACKEND] supportEmail:', supportEmail);

    // Step 1: Fetch all emails
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        console.log(`[INBOX] Fetching email ${i + 1}/${messages.length}: ID ${message.id}`);
        
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });
        
        const headers = msg.data.payload?.headers || [];
        const subjectHeader = headers.find((header) => header.name.toLowerCase() === 'subject');
        const fromHeader = headers.find((header) => header.name.toLowerCase() === 'from');
        const dateHeader = headers.find((header) => header.name.toLowerCase() === 'date');
        
        const fromValue = fromHeader?.value || 'Unknown Sender';
        let body = '';
        let htmlBody = '';
        
        const extractBody = (payload) => {
          if (payload.parts) {
            for (const part of payload.parts) {
              if (part.mimeType === 'text/plain' && part.body?.data) {
                body = Buffer.from(part.body.data, 'base64').toString('utf-8');
              } else if (part.mimeType === 'text/html' && part.body?.data) {
                htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
              } else if (part.parts) {
                extractBody(part);
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
        // Store both HTML and plain text
        const finalBodyHtml = htmlBody || '';
        const finalBody = body || (htmlBody ? stripHtml(htmlBody) : '');
        const isUnread = msg.data.labelIds?.includes('UNREAD') || false;
        const subjectValue = subjectHeader?.value || 'No Subject';
        const dateValue = dateHeader?.value || new Date().toISOString();
        const snippetValue = msg.data.snippet || '';
        const emailObj = {
          id: msg.data.id,
          subject: subjectValue,
          from: fromValue,
          dateTime: dateValue,
          snippet: snippetValue,
          body: finalBody, // for logic/AI
          bodyHtml: finalBodyHtml, // for display
          isUnread: isUnread
        };
        emails.push(emailObj);
        
      } catch (procError) {
        console.error(`[ERROR] Fetching email ${i + 1}: ${procError.message}`);
        continue;
      }
    }
    
    // Step 2: Wait and process first 5 emails
    // await new Promise(res => setTimeout(res, 30000));
    
    for (let i = 0; i < Math.min(5, emails.length); i++) {
      const email = emails[i];
      
      try {
        const senderEmail = (email.from.match(/<(.+)>/)?.[1] || email.from).trim().toLowerCase();
        
        // Skip if from support email
        if (senderEmail === supportEmail) {
          console.log(`[SKIP] Email ${i + 1}/5: From support email, skipping. Subject: ${email.subject}`);
          continue;
        }
        
        // CRITICAL FIX: Check if this Gmail message was already processed
        const emailProcessedCheck = await isEmailProcessed(email.id, companyId);
        if (emailProcessedCheck.isDuplicate) {
          console.log(`[ALREADY_PROCESSED] Email ${i + 1}/5: Gmail message already processed as ticket: ${emailProcessedCheck.ticket.ticketNumber}`);
          Object.assign(email, {
            type: emailProcessedCheck.ticket.type || 'Processed',
            ticketNumber: emailProcessedCheck.ticket.ticketNumber,
            priority: emailProcessedCheck.ticket.priority,
            acknowledged: true,
            alreadyProcessed: true
          });
          continue; // Skip all further processing for this email
        }
      
        await new Promise(res => setTimeout(res, 10000));
        
        console.log(`[PROCESSING] Email ${i + 1}/5: Subject: ${email.subject}, From: ${senderEmail}`);
        
        // Step 3: Check for content-based duplicates (not Gmail ID based)
        const duplicateCheck = await checkContentDuplicate(email, companyId);
        if (duplicateCheck.isDuplicate) {
          console.log(`[CONTENT_DUPLICATE] Email ${i + 1}/5: Identical content found, skipping. Original ticket: ${duplicateCheck.ticket.ticketNumber}`);
          Object.assign(email, {
            type: 'Duplicate',
            ticketNumber: duplicateCheck.ticket.ticketNumber,
            priority: duplicateCheck.ticket.priority,
            acknowledged: true,
            duplicateReason: 'Identical content'
          });
          continue;
        }
        
        // Step 4: Look for potential reply ticket
        const potentialReplyTicket = await findPotentialReplyTicket(email, companyId);
        
        if (potentialReplyTicket) {
          console.log(`[REPLY] Processing as reply to ticket: ${potentialReplyTicket.ticketNumber}`);
          
          // Check if this specific Gmail message was already processed for this ticket
          if (potentialReplyTicket.processedGmailMessageIds && 
              potentialReplyTicket.processedGmailMessageIds.includes(email.id)) {
            console.log(`[ALREADY_PROCESSED] Gmail message ${email.id} already processed for ticket ${potentialReplyTicket.ticketNumber}`);
            Object.assign(email, {
              type: 'Already Processed Reply',
              ticketNumber: potentialReplyTicket.ticketNumber,
              priority: potentialReplyTicket.priority,
              acknowledged: true,
              isReply: true,
              alreadyProcessed: true
            });
            continue;
          }
          
          // Analyze email for escalation
          const emailType = await geminiService.analyzeEmailWithGemini(
            email.subject, 
            email.body || email.snippet, 
            GEMINI_API_KEY
          );
          
          console.log(`[GEMINI] Reply analysis result: ${emailType.type}, Escalate: ${emailType.shouldEscalate}`);
          
          await new Promise(res => setTimeout(res, 10000));
          
          // Escalate priority if needed
          if (emailType.shouldEscalate) {
            const oldPriority = potentialReplyTicket.priority;
            const newPriority = getNextPriority(oldPriority);
            
            if (newPriority !== oldPriority) {
              potentialReplyTicket.priority = newPriority;
              console.log(`[ESCALATION] Priority escalated from ${oldPriority} to ${newPriority} for ticket ${potentialReplyTicket.ticketNumber}`);
            }
          }
          
          // Update last reply time
          potentialReplyTicket.lastReplyAt = new Date();
          
          // Add customer's reply as a comment
          const customerName = email.from.match(/^([^<]+)/)?.[1]?.trim() || 'Customer';
          
          // Try to find if customer has a user account
          const customerUser = await User.findOne({ 
            email: senderEmail,
            companyId 
          });
          
          const customerComment = {
            userId: customerUser?._id || null,
            userName: customerName,
            text: email.body || email.snippet,
            createdAt: new Date()
          };
          
          potentialReplyTicket.comments.push(customerComment);
          console.log(`[COMMENT] Added customer reply from ${customerName} as comment to ticket ${potentialReplyTicket.ticketNumber}`);
          
          // CRITICAL FIX: Track this Gmail message ID to prevent reprocessing
          if (!potentialReplyTicket.processedGmailMessageIds) {
            potentialReplyTicket.processedGmailMessageIds = [];
          }
          potentialReplyTicket.processedGmailMessageIds.push(email.id);
          console.log(`[TRACKING] Added Gmail message ${email.id} to processed list for ticket ${potentialReplyTicket.ticketNumber}`);
          
          // Add activity log
          await ticketService.addTicketActivity({
            ticketId: potentialReplyTicket._id,
            activityType: 'reply',
            details: `Customer replied${emailType.shouldEscalate ? ' - Priority escalated to ' + potentialReplyTicket.priority : ''}`,
            content: email.body || email.snippet
          });
          
          await potentialReplyTicket.save();
          
          // Update email object
          Object.assign(email, {
            type: emailType.type,
            ticketNumber: potentialReplyTicket.ticketNumber,
            priority: potentialReplyTicket.priority,
            acknowledged: true,
            isReply: true,
            replyToTicketNumber: potentialReplyTicket.ticketNumber
          });
          
          continue;
        }
        
        // Step 5: Process as new email
        // await new Promise(res => setTimeout(res, 10000));
        
        const emailType = await geminiService.analyzeEmailWithGemini(
          email.subject, 
          email.body || email.snippet, 
          GEMINI_API_KEY
        );
        
        console.log(`[GEMINI] New email analysis result: ${emailType.type}`);
        
        if (emailType.type === 'Complaint') {
          // Create new ticket
          let newTicketNumber;
          let ticket;
          let retryCount = 0;
          const maxRetries = 5;
          
          do {
            const ticketCount = await Ticket.countDocuments({ companyId });
            newTicketNumber = `INC${(ticketCount + 1 + retryCount).toString().padStart(6, '0')}`;
            
            const existingTicket = await Ticket.findOne({ ticketNumber: newTicketNumber });
            
            if (!existingTicket) {
              const sentimentResult = sentiment.analyze(`${email.subject} ${email.body || email.snippet}`);
              
              ticket = await ticketService.createTicket({
                ticketNumber: newTicketNumber,
                companyId,
                subject: email.subject,
                body: email.body || email.snippet,
                senderEmail: senderEmail,
                senderName: email.from.match(/^([^<]+)/)?.[1]?.trim() || 'Unknown Sender',
                gmailMessageId: email.id,
                contentHash: duplicateCheck.contentHash, // Store content hash for duplicate detection
                processedGmailMessageIds: [email.id], // Initialize with current Gmail message ID
                status: 'acknowledged',
                priority: sentimentResult.score < -5 ? 'high' : sentimentResult.score < -2 ? 'medium' : 'low',
                aiConfidence: 0.95,
                originalLanguage: 'en',
              });
              break;
            }
            retryCount++;
          } while (retryCount < maxRetries);
          
          if (!ticket) {
            console.log(`[SKIP] Email ${i + 1}/5: Could not create new ticket after retries. Subject: ${email.subject}`);
            continue;
          }
  
          await ticketService.addTicketActivity({
            ticketId: ticket._id,
            activityType: 'created',
            details: 'Ticket created from email complaint (Analyzed by AI)',
          });
          
          Object.assign(email, {
            type: 'Complaint',
            ticketNumber: newTicketNumber,
            priority: ticket.priority,
            acknowledged: true
          });
          
          console.log(`[TICKET] Created for email ${i + 1}/5: Subject: ${email.subject}, Ticket: ${newTicketNumber}`);

          // Send confirmation email to customer
          try {
            const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/ticket/${ticket.publicToken}`;
            
            const subject = (company.emailTemplate?.subject || '[{{ticketNumber}}] We have received your support request')
              .replace('{{ticketNumber}}', ticket.ticketNumber)
              .replace('{{companyName}}', company.name);
              
            const body = (company.emailTemplate?.body || '')
              .replace('{{customerName}}', ticket.senderName)
              .replace('{{companyName}}', company.name)
              .replace('{{subject}}', ticket.subject)
              .replace('{{ticketNumber}}', ticket.ticketNumber)
              .replace('{{portalUrl}}', portalUrl);
            
            // Use Gmail API to send the email
            const { google } = await import('googleapis');
            const client = new google.auth.OAuth2(
              process.env.GOOGLE_CLIENT_ID,
              process.env.GOOGLE_CLIENT_SECRET,
              process.env.GOOGLE_REDIRECT_URI
            );
            
            client.setCredentials({
              access_token: company.googleAuth.accessToken,
              refresh_token: company.googleAuth.refreshToken,
              expiry_date: company.googleAuth.expiryDate,
            });
            
            const gmail = google.gmail({ version: 'v1', auth: client });
            
            const emailLines = [
              `From: "${company.name} Support" <${company.googleAuth.connectedEmail}>`,
              `To: ${ticket.senderEmail}`,
              `Subject: ${subject}`,
              'Content-Type: text/plain; charset=utf-8',
              '',
              body
            ];
            
            const emailRaw = emailLines.join('\r\n').trim();
            const encodedEmail = Buffer.from(emailRaw)
              .toString('base64')
              .replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=+$/, '');
            
            await gmail.users.messages.send({
              userId: 'me',
              requestBody: { raw: encodedEmail }
            });
            
            console.log(`[GMAIL] Ticket creation email sent to ${ticket.senderEmail}`);
          } catch (sendErr) {
            console.error('[GMAIL] Failed to send ticket creation email:', sendErr.message);
          }
        } else {
          Object.assign(email, {
            type: 'Normal'
          });
          console.log(`[NORMAL] Email ${i + 1}/5: Classified as normal, no ticket created. Subject: ${email.subject}`);
        }
        
      } catch (procError) {
        console.error(`[ERROR] Processing email ${i + 1}/5: Subject: ${email.subject}`, procError.message);
        continue;
      }
    }
    
    res.json({ emails, nextPageToken, page, pageSize });
    
  } catch (err) {
    console.error('[ERROR] Server error fetching emails:', err.message);
    res.status(500).json({ error: 'Server error fetching emails.' });
  }
};