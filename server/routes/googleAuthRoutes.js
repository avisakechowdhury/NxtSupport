import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import * as googleAuthController from '../controllers/googleAuthController.js';

const router = express.Router();

router.get('/google/initiate', googleAuthController.initiateGoogleAuth);
router.get('/google/callback', googleAuthController.googleAuthCallback);
router.get('/google/inbox', authenticateToken, googleAuthController.getGoogleInbox);
router.post('/google/mark-unread', authenticateToken, googleAuthController.markAsUnread);
router.post('/google/disconnect', authenticateToken, googleAuthController.disconnectGoogleAccount);

export default router;