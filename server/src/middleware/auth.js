const jwt = require('jsonwebtoken');

function authRequired(roles = []) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ')
        ? header.slice('Bearer '.length)
        : null;
      if (!token) return res.status(401).json({ error: 'Missing token' });
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

module.exports = { authRequired };



