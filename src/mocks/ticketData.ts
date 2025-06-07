import { Ticket, TicketActivity } from '../types';

export const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-1001',
    companyId: '1',
    subject: 'Faulty product received',
    body: 'I recently ordered your premium headphones and received them yesterday. Unfortunately, the right earcup isn\'t working at all. I\'ve tried them with multiple devices and the issue persists. I would like a replacement or refund as soon as possible.',
    senderEmail: 'customer1@example.com',
    senderName: 'Alex Johnson',
    status: 'new',
    priority: 'high',
    assignedTo: null,
    responseText: null,
    aiConfidence: 0.92,
    originalLanguage: 'en',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    responseGeneratedAt: null,
    escalatedAt: null,
    resolvedAt: null
  },
  {
    id: '2',
    ticketNumber: 'TKT-1002',
    companyId: '1',
    subject: 'Billing discrepancy on my account',
    body: 'I was charged $59.99 for my subscription this month, but according to my plan I should only be paying $39.99. Please review my account and refund the difference. I\'ve been a loyal customer for 3 years and am very disappointed.',
    senderEmail: 'customer2@example.com',
    senderName: 'Sarah Williams',
    status: 'acknowledged',
    priority: 'medium',
    assignedTo: null,
    responseText: null,
    aiConfidence: 0.89,
    originalLanguage: 'en',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    responseGeneratedAt: null,
    escalatedAt: null,
    resolvedAt: null
  },
  {
    id: '3',
    ticketNumber: 'TKT-1003',
    companyId: '1',
    subject: 'Rude customer service representative',
    body: 'I called your support line yesterday regarding my account issue. The representative (I believe his name was Mark) was extremely rude and dismissive. He refused to address my concerns and suggested I was wasting his time. This is unacceptable treatment and I demand an apology.',
    senderEmail: 'customer3@example.com',
    senderName: 'Robert Chen',
    status: 'escalated',
    priority: 'urgent',
    assignedTo: '5',
    responseText: 'Thank you for bringing this to our attention. We sincerely apologize for the negative experience you had with our customer service. This does not reflect our company values or the level of service we strive to provide. We are escalating this to our customer experience manager who will contact you directly to address your concerns.',
    aiConfidence: 0.76,
    originalLanguage: 'en',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    responseGeneratedAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString(),
    escalatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    resolvedAt: null
  },
  {
    id: '4',
    ticketNumber: 'TKT-1004',
    companyId: '1',
    subject: 'Late delivery of order #45678',
    body: 'I placed an order two weeks ago (order #45678) and selected express shipping which promised delivery within 3 business days. It\'s been 14 days and my package hasn\'t even shipped yet according to the tracking information. This is completely unacceptable.',
    senderEmail: 'customer4@example.com',
    senderName: 'Emma Davies',
    status: 'responded',
    priority: 'high',
    assignedTo: '3',
    responseText: 'We apologize for the delay with your order #45678. After checking our shipping system, we found that there was an unexpected inventory issue that caused this delay. We have expedited your order and it will ship today with priority delivery at no extra cost. We are also adding a 20% discount code to your account for your next purchase as a gesture of goodwill.',
    aiConfidence: 0.94,
    originalLanguage: 'en',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    responseGeneratedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    escalatedAt: null,
    resolvedAt: null
  },
  {
    id: '5',
    ticketNumber: 'TKT-1005',
    companyId: '1',
    subject: 'Refund not processed after 30 days',
    body: 'I returned an item to your store on May 5th and received confirmation that it was received on May 10th. Your policy states refunds are processed within 14 days, but it\'s been a month and I still haven\'t received my money back. I\'ve called twice and been told it\'s "processing" but this is ridiculous.',
    senderEmail: 'customer5@example.com',
    senderName: 'Michael Thompson',
    status: 'resolved',
    priority: 'medium',
    assignedTo: '4',
    responseText: 'We sincerely apologize for the delay in processing your refund. After investigating, we found that there was a technical issue with our payment processor that affected a batch of refunds including yours. We have manually processed your refund today and you should see the full amount back in your account within 2-3 business days. We have also added a $25 store credit to your account for the inconvenience caused.',
    aiConfidence: 0.88,
    originalLanguage: 'en',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    responseGeneratedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    escalatedAt: null,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: '6',
    ticketNumber: 'TKT-1006',
    companyId: '1',
    subject: 'Problème avec votre application mobile',
    body: 'Votre application mobile se bloque constamment lorsque j\'essaie de passer une commande. J\'ai essayé de la désinstaller et de la réinstaller trois fois, mais le problème persiste. C\'est très frustrant car je ne peux pas utiliser le bon de réduction qui expire demain.',
    senderEmail: 'customer6@example.com',
    senderName: 'Sophie Martin',
    status: 'inProgress',
    priority: 'medium',
    assignedTo: '3',
    responseText: null,
    aiConfidence: 0.91,
    originalLanguage: 'fr',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 35).toISOString(),
    responseGeneratedAt: null,
    escalatedAt: null,
    resolvedAt: null
  }
];

export const mockTicketActivities: TicketActivity[] = [
  {
    id: '101',
    ticketId: '1',
    activityType: 'created',
    userId: null,
    userName: 'System',
    details: 'Ticket created from customer email',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '102',
    ticketId: '1',
    activityType: 'statusChanged',
    userId: null,
    userName: 'System',
    details: 'Status changed from new to acknowledged',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: '201',
    ticketId: '2',
    activityType: 'created',
    userId: null,
    userName: 'System',
    details: 'Ticket created from customer email',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: '202',
    ticketId: '2',
    activityType: 'statusChanged',
    userId: null,
    userName: 'System',
    details: 'Status changed from new to acknowledged',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString()
  },
  {
    id: '301',
    ticketId: '3',
    activityType: 'created',
    userId: null,
    userName: 'System',
    details: 'Ticket created from customer email',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: '302',
    ticketId: '3',
    activityType: 'responded',
    userId: null,
    userName: 'AI Assistant',
    details: 'AI generated response sent to customer',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString()
  },
  {
    id: '303',
    ticketId: '3',
    activityType: 'escalated',
    userId: '1',
    userName: 'John Doe',
    details: 'Escalated: Customer complaint about staff requires manager review',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: '304',
    ticketId: '3',
    activityType: 'assigned',
    userId: '1',
    userName: 'John Doe',
    details: 'Assigned to Support Manager',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.9).toISOString()
  },
  {
    id: '401',
    ticketId: '4',
    activityType: 'created',
    userId: null,
    userName: 'System',
    details: 'Ticket created from customer email',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: '402',
    ticketId: '4',
    activityType: 'statusChanged',
    userId: null,
    userName: 'System',
    details: 'Status changed from new to acknowledged',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7.9).toISOString()
  },
  {
    id: '403',
    ticketId: '4',
    activityType: 'assigned',
    userId: '1',
    userName: 'John Doe',
    details: 'Assigned to Support Agent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7.5).toISOString()
  },
  {
    id: '404',
    ticketId: '4',
    activityType: 'responded',
    userId: null,
    userName: 'AI Assistant',
    details: 'AI generated response sent to customer',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString()
  },
  {
    id: '501',
    ticketId: '5',
    activityType: 'created',
    userId: null,
    userName: 'System',
    details: 'Ticket created from customer email',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: '502',
    ticketId: '5',
    activityType: 'statusChanged',
    userId: null,
    userName: 'System',
    details: 'Status changed from new to acknowledged',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23.9).toISOString()
  },
  {
    id: '503',
    ticketId: '5',
    activityType: 'assigned',
    userId: '1',
    userName: 'John Doe',
    details: 'Assigned to Support Agent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString()
  },
  {
    id: '504',
    ticketId: '5',
    activityType: 'responded',
    userId: null,
    userName: 'AI Assistant',
    details: 'AI generated response sent to customer',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString()
  },
  {
    id: '505',
    ticketId: '5',
    activityType: 'statusChanged',
    userId: '4',
    userName: 'Support Agent',
    details: 'Status changed from responded to resolved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: '601',
    ticketId: '6',
    activityType: 'created',
    userId: null,
    userName: 'System',
    details: 'Ticket created from customer email',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  },
  {
    id: '602',
    ticketId: '6',
    activityType: 'statusChanged',
    userId: null,
    userName: 'System',
    details: 'Status changed from new to acknowledged',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 35.9).toISOString()
  },
  {
    id: '603',
    ticketId: '6',
    activityType: 'assigned',
    userId: '1',
    userName: 'John Doe',
    details: 'Assigned to Tech Support',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 35.5).toISOString()
  }
];