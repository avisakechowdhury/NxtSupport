export { initiateGoogleAuth } from './googleAuth/initiateService.js';
export { googleAuthCallback } from './googleAuth/callbackService.js';
export { getGoogleInbox } from './googleAuth/inboxService.js';
// Add markAsUnread and disconnectGoogleAccount as needed 

export async function disconnectGoogleAccount(req, res) {
  try {
    const { companyId } = req.user;
    if (!companyId) return res.status(400).json({ error: 'Company ID not found in user session.' });
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: 'Company not found.' });
    company.googleAuth = undefined;
    company.emailConnected = false;
    company.supportEmail = undefined;
    await company.save();
    res.json({ message: 'Google account disconnected successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect Google account.' });
  }
} 