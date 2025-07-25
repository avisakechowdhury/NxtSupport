import * as googleAuthService from '../services/googleAuthService.js';
import * as geminiService from '../services/geminiService.js';
import * as ticketService from '../services/ticketService.js';
import * as emailUtils from '../utils/emailUtils.js';

export const initiateGoogleAuth = async (req, res) => {
  return googleAuthService.initiateGoogleAuth(req, res);
};

export const googleAuthCallback = async (req, res) => {
  return googleAuthService.googleAuthCallback(req, res);
};

export const getGoogleInbox = async (req, res) => {
  return googleAuthService.getGoogleInbox(req, res);
};

export const markAsUnread = async (req, res) => {
  return googleAuthService.markAsUnread(req, res);
};

export const disconnectGoogleAccount = async (req, res) => {
  return googleAuthService.disconnectGoogleAccount(req, res);
}; 