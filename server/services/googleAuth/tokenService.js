import { createOAuth2Client } from './gmailClient.js';
import Company from '../../models/Company.js';

export async function refreshAccessTokenIfNeeded(company) {
  if (company.googleAuth.expiryDate && Date.now() > company.googleAuth.expiryDate - 5 * 60 * 1000) {
    if (!company.googleAuth.refreshToken) {
      throw new Error('Access token expired and no refresh token available.');
    }
    const client = createOAuth2Client();
    client.setCredentials({
      access_token: company.googleAuth.accessToken,
      refresh_token: company.googleAuth.refreshToken,
      expiry_date: company.googleAuth.expiryDate,
    });
    const { credentials } = await client.refreshAccessToken();
    company.googleAuth.accessToken = credentials.access_token;
    if (credentials.expiry_date) company.googleAuth.expiryDate = credentials.expiry_date;
    if (credentials.refresh_token) company.googleAuth.refreshToken = credentials.refresh_token;
    await company.save();
    client.setCredentials(credentials);
    return client;
  }
  return null;
} 