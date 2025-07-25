import Ticket from '../models/Ticket.js';
import TicketActivity from '../models/TicketActivity.js';
import { getNextPriority } from '../utils/emailUtils.js';

export const createTicket = async (ticketData) => {
  const ticket = new Ticket(ticketData);
  await ticket.save();
  return ticket;
};

export const updateTicket = async (ticketId, updateData) => {
  return Ticket.findByIdAndUpdate(ticketId, updateData, { new: true });
};

export const findDuplicateTicket = async ({ gmailMessageId, companyId }) => {
  console.log(`[TICKET SERVICE] Checking for duplicate ticket with Gmail ID: ${gmailMessageId}, Company ID: ${companyId}`);
  const duplicate = await Ticket.findOne({
    gmailMessageId,
    companyId
  });
  if (duplicate) {
    console.log(`[TICKET SERVICE] Found duplicate ticket: ${duplicate.ticketNumber}`);
  } else {
    console.log(`[TICKET SERVICE] No duplicate ticket found`);
  }
  return duplicate;
};

export const escalateTicketPriority = async (ticket) => {
  const newPriority = getNextPriority(ticket.priority);
  ticket.priority = newPriority;
  ticket.escalationCount = (ticket.escalationCount || 0) + 1;
  await ticket.save();
  return ticket;
};

export const addTicketActivity = async (activityData) => {
  const activity = new TicketActivity(activityData);
  await activity.save();
  return activity;
}; 