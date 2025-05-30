

import jwt from 'jsonwebtoken';
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => { // userPayload is the decoded token
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // IMPORTANT: Ensure your JWT payload contains companyId
    if (!userPayload.companyId) {
        console.error('JWT token is missing companyId:', userPayload);
        return res.status(403).json({ error: 'Token is missing company association.' });
    }
    req.user = userPayload; // Decoded token payload (e.g., { id, email, role, companyId })
    next();
  });
};

export default authenticateToken;
