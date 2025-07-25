import { createOAuth2Client } from './gmailClient.js';
import Company from '../../models/Company.js';
import { google } from 'googleapis';
const FRONTEND_URL = process.env.FRONTEND_URL;

export async function googleAuthCallback(req, res) {
  const { code, state, error: oauthError } = req.query;
  // Mask code for logging
  const maskedCode = code ? code.substring(0, 5) + '...' : undefined;
  console.log('[BACKEND][OAuth Callback] Received query params:', {
    code: maskedCode,
    state: state ? '[REDACTED]' : undefined,
    oauthError
  });
  if (oauthError) {
    console.log('[BACKEND][OAuth Callback] OAuth error in query:', oauthError);
    return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=${encodeURIComponent(oauthError)}`);
  }
  if (!code || !state) {
    console.log('[BACKEND][OAuth Callback] Missing code or state:', { code: !!code, state: !!state });
    return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=MissingCodeOrState`);
  }
  let companyId;
  try {
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    companyId = decodedState.companyId;
    console.log('[BACKEND][OAuth Callback] Decoded state:', decodedState);
    if (!companyId) throw new Error('Company ID missing in state');
  } catch (err) {
    console.error('[BACKEND][OAuth Callback] Error decoding state:', err);
    return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=InvalidState`);
  }
  try {
    console.log('[BACKEND][OAuth Callback] Callback started.');
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Replace require with imported google
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const emailAddress = profile.data.emailAddress;
    if (!emailAddress) throw new Error("Couldn't get user's email from Google.");
    const company = await Company.findById(companyId);
    if (!company) {
      console.error('[BACKEND][OAuth Callback] Company not found for ID:', companyId);
      return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=CompanyNotFound`);
    }
    console.log('[BACKEND][OAuth Callback] Tokens received:', tokens);
    console.log('[BACKEND][OAuth Callback] Email address from Google:', emailAddress);
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
    console.log('[BACKEND][OAuth Callback] Company before save:', company);
    try {
      await company.save();
      console.log('[BACKEND][OAuth Callback] Company saved successfully:', {
        companyId: companyId,
        emailAddress,
        googleAuth: company.googleAuth,
        supportEmail: company.supportEmail,
        emailConnected: company.emailConnected
      });
    } catch (saveError) {
      console.error('[BACKEND][OAuth Callback] Error saving company:', saveError);
    }
    const successRedirectUrl = `${FRONTEND_URL}/email-setup?status=google-success&email=${encodeURIComponent(emailAddress)}`;
    console.log('[BACKEND][OAuth Callback] Callback completed successfully.');
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
    console.error('[BACKEND][OAuth Callback] General error in callback:', err);
    const errorMessage = err.response?.data?.error_description || err.message || 'OAuth error';
    return res.redirect(`${FRONTEND_URL}/email-setup?status=google-error&message=${encodeURIComponent(errorMessage)}`);
  }
} 