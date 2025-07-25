// Improved utility function to strip HTML tags, CSS, and scripts for clean logging
export function stripHtml(html) {
  // Remove <style> and <script> blocks
  let text = html.replace(/<style[\s\S]*?<\/style>/gi, '')
                 .replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove all HTML tags
  text = text.replace(/<[^>]*>?/gm, '');
  // Replace HTML entities
  text = text.replace(/&[a-z]+;/gi, ' ');
  // Replace multiple spaces/newlines with a single space
  text = text.replace(/\s+/g, ' ');
  // Trim and return as plain text paragraph
  return text.trim();
}

// Improved utility function to extract ticket number from subject
export function extractTicketNumber(subject) {
  // Match [INC000001], INC000001, or inc000001 (case-insensitive, with or without brackets or spaces)
  const match = subject.match(/(?:\[)?\s*INC\d{6}\s*(?:\])?/i);
  return match ? match[0].replace(/\[|\]|\s+/g, '').toUpperCase() : null;
}

// Utility function to get next priority level
export function getNextPriority(currentPriority) {
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const currentIndex = priorities.indexOf(currentPriority);
  return currentIndex < priorities.length - 1 ? priorities[currentIndex + 1] : currentPriority;
} 