const jwt = require('jsonwebtoken');
const { runSingle } = require('../database/connection');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await runSingle('SELECT id, username, email, first_name, last_name, is_verified FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await runSingle('SELECT id, username, email, first_name, last_name, is_verified FROM users WHERE id = ?', [decoded.userId]);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
