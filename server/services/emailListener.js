import Imap from 'imap-simple';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import Ticket from '../models/Ticket.js'; // Assuming this is the correct path
import Company from '../models/Company.js'; // Assuming this is the correct path
import ProcessedEmail from '../models/ProcessedEmail.js'; // Add this import
import NotificationService from './notificationService.js';
// import aiTrainingService from './aiTrainingService.js';
// It's good practice to import your models if you need to interact with them directly,
// but often these are passed in from the route handler if EmailListener is a generic service.

// Helper to guess IMAP/SMTP host from email domain
const guessEmailServerHost = (email, servicePrefix) => {
  if (!email || !email.includes('@')) {
    return null; // Invalid email
  }
  const domain = email.split('@')[1];
  // Common patterns (this is a very basic guess and might not be accurate for all providers)
  if (domain === 'gmail.com') {
    return `${servicePrefix}.gmail.com`;
  }
  if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
    return servicePrefix === 'imap' ? 'outlook.office365.com' : 'smtp.office365.com';
  }
  if (domain === 'yahoo.com') {
    return `${servicePrefix}.mail.yahoo.com`;
  }
  // Generic guess for custom domains
  return `${servicePrefix}.${domain}`;
};

// Utility function to extract ticket number from subject (same as in googleAuthRoutes)
function extractTicketNumber(subject) {
    const ticketMatch = subject.match(/[IT]NC\d{6}/);
    return ticketMatch ? ticketMatch[0] : null;
}

// Utility function to get next priority level (same as in googleAuthRoutes)
function getNextPriority(currentPriority) {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorities.indexOf(currentPriority);
    return currentIndex < priorities.length - 1 ? priorities[currentIndex + 1] : currentPriority;
}

class EmailListener {
  constructor(config) {
    // Config should include: email, password, companyId
    // It might also include TicketModel, TicketActivityModel if they are to be used here
    this.config = config;
    this.imapConnection = null; // To store the active IMAP connection

    // Determine SMTP host and port
    const smtpHost = guessEmailServerHost(this.config.email, 'smtp');
    const smtpPort = 587; // Common port for TLS, 465 for SSL

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports like 587
      auth: {
        user: this.config.email,
        pass: this.config.password, // User's actual email password
      },
      tls: {
        // IMPORTANT: In a production environment, you should not disable certificate verification.
        // This is a security risk. Remove `rejectUnauthorized: false` if your server has a valid certificate.
        rejectUnauthorized: false, // Kept from original context, but be cautious
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
    });
    console.log(`Nodemailer transporter configured for ${this.config.email} on host ${smtpHost}:${smtpPort}`);
  }

  async connect() {
    // Determine IMAP host and port
    const imapHost = guessEmailServerHost(this.config.email, 'imap');
    const imapPort = 993; // Standard IMAP SSL/TLS port

    console.log(`Attempting IMAP connection for ${this.config.email} to ${imapHost}:${imapPort}`);

    try {
      const connection = await Imap.connect({
        imap: {
          user: this.config.email,
          password: this.config.password, // User's actual email password
          host: imapHost,
          port: imapPort,
          tls: true,
          authTimeout: 15000, // Increased timeout
          tlsOptions: {
            // IMPORTANT: In a production environment, you should not disable certificate verification.
            // This is a security risk. Remove `rejectUnauthorized: false` if your server has a valid certificate.
            rejectUnauthorized: false, // Kept from original context, but be cautious
          },
        },
      });

      console.log(`IMAP connected successfully for ${this.config.email}`);
      this.imapConnection = connection; // Store the connection
      return connection; // Return for immediate use if needed by the caller (e.g., initial test)
    } catch (error) {
      console.error(`IMAP connection error for ${this.config.email} on ${imapHost}:${imapPort}:`, error.message);
      // Provide more specific error messages based on common error codes/types
      if (error.message && (error.message.includes('TIMEDOUT') || error.message.includes('ETIMEDOUT'))) {
        throw new Error(`Connection to email server timed out. Please check server details and network. (Host: ${imapHost})`);
      }
      if (error.message && (error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN'))) {
        throw new Error(`Email server host not found: ${imapHost}. Please check the domain name.`);
      }
      if (error.message && error.message.toLowerCase().includes('authentication failed')) {
        throw new Error('Authentication failed: Please verify your email address and password. If you are using Gmail or Outlook, ensure that IMAP access is enabled and app-specific passwords are used if 2FA is on.');
      }
      if (error.message && error.message.toLowerCase().includes('unauthorized')) {
        throw new Error('Authorization failed. Ensure your account allows IMAP access and the credentials are correct.');
      }
      // Generic error
      throw new Error(`Failed to connect to IMAP server ${imapHost}. Error: ${error.message}`);
    }
  }

  // Method to be called by the route to start polling (if this listener instance is kept active)
  startPolling() {
    if (!this.config.companyId) {
      console.error("Cannot start polling without companyId.");
      return;
    }
    console.log(`Starting email polling for company ${this.config.companyId} / email ${this.config.email}`);
    // Ensure this.processNewEmails is bound correctly or use an arrow function
    this.pollingInterval = setInterval(async () => {
      try {
        await this.processNewEmails(this.config.companyId);
      } catch (error) {
        console.error(`Error during scheduled email processing for ${this.config.email}:`, error.message);
        // Optionally, stop polling if too many consecutive errors occur
      }
    }, 60000); // Check every minute
  }

  // Method to stop polling
  async disconnect() {
    console.log(`Disconnecting listener for ${this.config.email}`);
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log(`Polling stopped for ${this.config.email}`);
    }
    if (this.imapConnection) {
      try {
        await this.imapConnection.end();
        console.log(`IMAP connection ended for ${this.config.email}`);
      } catch (err) {
        console.error(`Error ending IMAP connection for ${this.config.email}:`, err.message);
      }
      this.imapConnection = null;
    }
  }

  isConnected() {
    return this.imapConnection && this.imapConnection.isAuthenticated && !this.imapConnection.isEnded;
  }


  async processNewEmails(companyId) {
    // Ensure companyId is available
    if (!companyId && this.config.companyId) {
      companyId = this.config.companyId;
    }
    if (!companyId) {
      console.error("processNewEmails called without companyId.");
      throw new Error("Missing companyId for processing emails.");
    }

    let connection;
    try {
      // Use existing connection if available and valid, otherwise reconnect
      if (this.imapConnection && this.imapConnection.isAuthenticated && !this.imapConnection.isEnded) {
        connection = this.imapConnection;
        console.log(`Using existing IMAP connection for ${this.config.email} to process new emails.`);
      } else {
        console.log(`No active IMAP connection found for ${this.config.email}, attempting to reconnect.`);
        connection = await this.connect(); // This will set this.imapConnection
      }

      await connection.openBox('INBOX');
      console.log(`Opened INBOX for ${this.config.email}`);

      const searchCriteria = ['UNSEEN']; // Fetch only unread emails
      const fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], // Fetch specific headers and text body
        markSeen: true, // Mark emails as read after fetching
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      console.log(`Found ${messages.length} new messages for ${this.config.email}.`);

      for (const message of messages) {
        const emailUid = message.attributes.uid.toString();
        
        // Check if this email has already been processed
        const alreadyProcessed = await ProcessedEmail.findOne({
          companyId: companyId,
          emailUid: emailUid
        });
        
        if (alreadyProcessed) {
          console.log(`Email ${emailUid} already processed, skipping...`);
          continue;
        }
        // The body for 'TEXT' part is usually in message.parts.find(part => part.which === 'TEXT').body
        const textPart = message.parts.find(part => part.which === 'TEXT');
        const rawEmailBody = textPart ? textPart.body : '';

        if (!rawEmailBody) {
          console.warn(`Skipping message ${message.attributes.uid} due to empty text body.`);
          continue;
        }

        // simpleParser expects the full raw email, not just the text part.
        // To use simpleParser effectively with imap-simple, you usually fetch the entire message body.
        // For now, we'll try to parse what we have, but this might be limited.
        // A more robust way is to fetch `bodies: ['']` for the full raw message.
        // Let's assume the TEXT part is sufficient for simpleParser for basic text content.
        const parsed = await simpleParser(rawEmailBody);

        console.log(`Processing email: Subject - "${parsed.subject}" from ${parsed.from?.text}`);

        // Create ticket (ensure Ticket model is correctly imported/passed)
        const ticket = await this.createTicket({
          subject: parsed.subject || 'No Subject',
          body: parsed.text || parsed.html || 'No Content', // Prefer text, fallback to html, then empty
          senderEmail: parsed.from?.value[0]?.address || 'unknown@example.com',
          senderName: parsed.from?.value[0]?.name || (parsed.from?.value[0]?.address?.split('@')[0] || 'Unknown Sender'),
          companyId: companyId, // Ensure companyId is passed
          rawEmail: rawEmailBody, // Store raw email if needed for later processing or display
          messageId: parsed.messageId, // Useful for tracking
          emailUid: emailUid, // Add email UID for tracking
          receivedDate: parsed.date || new Date(),
        });

        // Send acknowledgment
        await this.sendAcknowledgment(ticket);
      }
      // Note: imap-simple doesn't automatically close the box.
      // If you are done with this box for now, you might consider connection.closeBox(false);
      // However, for polling, keeping it open or reopening quickly is common.
      // The main connection is ended in disconnect().

    } catch (error) {
      console.error(`Error processing emails for ${this.config.email}:`, error.message, error.stack);
      // If error is due to connection, disconnect to allow re-establishment on next poll
      if (error.message.includes('Connection ended') || error.message.includes('Unable to connect') || error.message.includes('TIMEDOUT')) {
        if (this.imapConnection) {
          try {
            await this.imapConnection.end(); // Attempt to gracefully end
          } catch (e) { /* ignore errors ending a broken connection */ }
          this.imapConnection = null;
        }
      }
      throw error; // Re-throw to be caught by the polling interval's error handler
    }
    // `finally` block to end connection removed from here, as connection is reused for polling.
    // Connection is managed by connect() and disconnect() methods.
  }

  async createTicket(data) {
    try {
      // First check if this is a reply to an existing ticket
      const ticketNumber = extractTicketNumber(data.subject);
      let ticket = null;
      let action = 'created';
      
      if (ticketNumber) {
        // This is a reply to an existing ticket
        const existingTicket = await Ticket.findOne({ ticketNumber });
        if (existingTicket) {
          console.log(`Found existing ticket ${ticketNumber}, updating instead of creating new ticket`);
          
          // Update priority (assuming reply with complaint)
          const newPriority = getNextPriority(existingTicket.priority);
          existingTicket.priority = newPriority;
          existingTicket.escalationCount += 1;
          existingTicket.lastReplyAt = new Date();
          
          // Add the reply to the ticket
          await existingTicket.save();
          
          ticket = existingTicket;
          action = 'updated';
        }
      }

      // If we get here, this is a new ticket
      if (!ticket) {
        // Generate unique ticket number with retry logic
        let newTicketNumber;
        let retryCount = 0;
        const maxRetries = 5;

        do {
          const ticketCount = await Ticket.countDocuments({ companyId: data.companyId });
          newTicketNumber = `INC${(ticketCount + 1 + retryCount).toString().padStart(6, '0')}`;
          
          // Check if this ticket number already exists
          const existingTicket = await Ticket.findOne({ ticketNumber: newTicketNumber });
          if (!existingTicket) {
            // Categorize the email using AI
            let categorization = null;
            try {
              // categorization = await aiTrainingService.categorizeEmail(emailContent, data.companyId);
              // console.log(`Email categorized as: ${categorization.category} (confidence: ${categorization.confidence}%)`);
              console.log('Email categorization disabled');
            } catch (error) {
              console.error('Error categorizing email:', error);
              categorization = {
                category: 'default',
                categoryId: null,
                confidence: 0,
                reasoning: 'Categorization failed'
              };
            }

            // Create ticket with categorization data
            const ticketData = {
              ticketNumber,
              companyId: data.companyId,
              subject: data.subject,
              body: data.body,
              senderEmail: data.senderEmail,
              senderName: data.senderName,
              status: 'new',
              priority: 'low',
              // complaintCategory: categorization.categoryId,
              // complaintCategoryName: categorization.category,
              // complaintCategoryConfidence: categorization.confidence
            };

            ticket = new Ticket(ticketData);

            await ticket.save();
            break; // Successfully created ticket, exit loop
          }
          
          retryCount++;
        } while (retryCount < maxRetries);

        if (!ticket) {
          console.error('Failed to create ticket after maximum retries');
          throw new Error('Failed to create ticket due to duplicate ticket numbers');
        }

        // Create notification for new ticket (system created)
        const systemUser = {
          _id: 'system',
          name: 'System',
          email: 'system@nxtsupport.com'
        };
        await NotificationService.createTicketCreatedNotification(ticket, systemUser);
      }

      // Record this email as processed
      await ProcessedEmail.create({
        companyId: data.companyId,
        emailUid: data.emailUid,
        messageId: data.messageId,
        subject: data.subject,
        senderEmail: data.senderEmail,
        ticketId: ticket._id,
        action: action
      });

      return ticket;
    } catch (error) {
      console.error('Error creating/updating ticket:', error);
      throw error;
    }
  }

  async sendAcknowledgment(ticket) {
    // Ensure Company model is available
    if (!Company) {
      console.error("Company model is not available in EmailListener.");
      throw new Error("Company model configuration error.");
    }
    try {
      const company = await Company.findById(ticket.companyId);
      if (!company) {
        console.error(`Company not found for ID: ${ticket.companyId}. Cannot send acknowledgment.`);
        return;
      }

      const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/ticket/${ticket.publicToken}`;
      
      // Check if company has custom email template
      const useCustom = company.emailTemplate?.useCustomTemplate && 
                       company.emailTemplate?.subject && 
                       company.emailTemplate?.body;
      
      // Check if customer portal is enabled and should include in emails
      const includePortalLink = company.customerPortal?.enabled && company.customerPortal?.includeInEmails;
      
      const templateVars = {
        customerName: ticket.senderName || 'Customer',
        companyName: company.name,
        subject: ticket.subject,
        ticketNumber: ticket.ticketNumber,
        portalUrl: includePortalLink ? portalUrl : ''
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

      const emailSubject = useCustom 
        ? renderEmailTemplate(company.emailTemplate.subject, templateVars)
        : `[${ticket.ticketNumber}] We've Received Your Support Request: ${ticket.subject}`;

      const emailContent = useCustom
        ? renderEmailTemplate(company.emailTemplate.body, templateVars)
        : `Dear ${ticket.senderName || 'Customer'},

Thank you for contacting ${company.name} Support.

This email confirms that we have received your message regarding: "${ticket.subject}".
Your request has been assigned ticket number: ${ticket.ticketNumber}.${includePortalLink ? `

Track your ticket status: ${portalUrl}` : ''}

Our team will review your request and get back to you as soon as possible. You can reply to this email to add more comments to your ticket.

Best regards,
The ${company.name} Support Team
${this.config.email}`;

      const mailOptions = {
        from: `"${company.name} Support" <${this.config.email}>`, // Send from the connected support email
        to: ticket.senderEmail,
        subject: emailSubject,
        text: emailContent,
        replyTo: this.config.email, // Ensure replies go to the support inbox
        inReplyTo: ticket.messageId, // Threading: original email's Message-ID
        references: ticket.messageId, // Threading
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Acknowledgment sent for ticket ${ticket.ticketNumber} to ${ticket.senderEmail}`);
    } catch (error) {
      console.error(`Error sending acknowledgment for ticket ${ticket.ticketNumber}:`, error.message, error.stack);
      // Don't re-throw here, as failing to send ack shouldn't stop ticket creation.
    }
  }

  // Method to get currently fetched/stored emails (for the /api/email/inbox route)
  // This is a placeholder. In a real scenario, you'd fetch from a temporary store or DB
  // that `processNewEmails` populates. For now, it will fetch the latest few emails on demand.
  async getCurrentEmails(limit = 20) {
    let connection;
    try {
      if (this.imapConnection && this.imapConnection.isAuthenticated && !this.imapConnection.isEnded) {
        connection = this.imapConnection;
      } else {
        connection = await this.connect();
      }

      await connection.openBox('INBOX');

      // Fetch recent messages (e.g., last 20). '*' means all messages.
      // For "last N", you need to know the total number of messages first.
      // Or fetch by UID range if you know the last fetched UID.
      // For simplicity, let's fetch the last 'limit' messages based on sequence number.
      // This is not ideal for performance on large mailboxes.
      const box = await connection.getBoxInfo();
      const totalMessages = box.messages.total;
      let startSeq = Math.max(1, totalMessages - limit + 1);

      const searchCriteria = [[startSeq, totalMessages > 0 ? totalMessages : '*']];
      if (totalMessages === 0) { // Handle empty inbox
        return [];
      }

      const fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT', 'UID'], // Add UID
        // markSeen: false, // Don't mark as seen when just viewing inbox
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      const formattedEmails = [];

      for (const message of messages.reverse()) { // Show newest first
        const textPart = message.parts.find(part => part.which === 'TEXT');
        const headerPart = message.parts.find(part => part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');

        if (headerPart && headerPart.body) {
          // simpleParser is better for full raw email, but we can extract from headers here
          const subject = headerPart.body.subject && headerPart.body.subject[0] ? headerPart.body.subject[0] : 'No Subject';
          const from = headerPart.body.from && headerPart.body.from[0] ? headerPart.body.from[0] : 'Unknown Sender';
          const date = headerPart.body.date && headerPart.body.date[0] ? new Date(headerPart.body.date[0]) : new Date();
          const snippet = textPart && textPart.body ? textPart.body.substring(0, 150) + (textPart.body.length > 150 ? '...' : '') : 'No preview available.';
          const uid = message.attributes.uid;

          formattedEmails.push({
            id: uid.toString(), // Use UID as a unique ID
            subject: subject,
            from: from,
            date: date.toISOString(),
            snippet: snippet,
          });
        }
      }
      return formattedEmails;
    } catch (error) {
      console.error(`Error in getCurrentEmails for ${this.config.email}:`, error.message);
      throw error; // Re-throw to be handled by the route
    }
    // Connection is not ended here if it was pre-existing and reused.
  }
}

export default EmailListener;
