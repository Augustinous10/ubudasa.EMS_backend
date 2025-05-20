const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Middleware to authenticate using JWT
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user; // Attach the full user object to the request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ✅ Middleware to check if authenticated user is a Site Manager
const siteManagerAuth = async (req, res, next) => {
  await authenticate(req, res, async () => {
    console.log('Authenticated user role:', req.user.role); // Debug log

    if (req.user.role.toUpperCase() !== 'SITE_MANAGER') {
      return res.status(403).json({ success: false, message: 'Access denied: not a site manager' });
    }

    next();
  });
};

// ✅ Role-based access control middleware
const authorize = (roles = []) => {
  // Normalize all allowed roles to uppercase
  const allowedRoles = roles.map(role => role.toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userRole = req.user.role.toUpperCase();
    console.log('Authorized check - User Role:', userRole); // Debug

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  siteManagerAuth,
};
