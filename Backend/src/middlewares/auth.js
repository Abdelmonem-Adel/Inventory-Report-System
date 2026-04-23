import jwt from 'jsonwebtoken';

// Auth Middleware: Verifies JWT or Session
const authMiddleware = (req, res, next) => {
  // First, check if there's an active session via Passport
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // If not session, check for JWT token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'you are not authenticated.' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Role Middleware: Restricts access by role
const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
};

export { authMiddleware, roleMiddleware };
