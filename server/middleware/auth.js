import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // For business users, validate companyId is present
    if (userPayload.accountType === 'business' && !userPayload.companyId) {
        console.error('JWT token is missing companyId for business user:', userPayload);
        return res.status(403).json({ error: 'Token is missing company association.' });
    }
    
    req.user = userPayload;
    next();
  });
}; 