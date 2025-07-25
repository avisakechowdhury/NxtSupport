import axios from 'axios';
import { stripHtml, extractTicketNumber } from '../utils/emailUtils.js';

export const analyzeEmailWithGemini = async (subject, body, geminiApiKey) => {
  const cleanBody = stripHtml(body).slice(0, 1000);
  const ticketNumber = extractTicketNumber(subject);
  if (ticketNumber) {
    const prompt = `Analyze the following email reply and determine if it contains a complaint or negative feedback. Consider that this is a reply to ticket ${ticketNumber}. Respond with only one word: "Complaint" or "Normal".\n\n---\n\nSubject: ${subject}\n\nBody: ${cleanBody}`;
    try {
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
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
    const prompt = `Analyze the following email text and determine if it is a complaint. Respond with only one word: "Complaint" or "Normal".\n\n---\n\nSubject: ${subject}\n\nBody: ${cleanBody}`;
    try {
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
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