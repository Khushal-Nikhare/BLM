import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 🛡️ Sentinel: Dynamically read JWT_SECRET to ensure it's loaded after dotenv
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET is not configured.');
    return res.status(500).json({ error: 'Internal server error: Authentication configuration missing.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ error: 'Require Admin Role' });
  }
};
