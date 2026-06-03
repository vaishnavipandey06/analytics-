const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'churnvision_super_secret_jwt_key_2026_safe');

      // Get user from token (fallback to mock user if database is not active)
      if (global.dbConnected) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        // Fallback mock user matching token contents
        req.user = {
          id: decoded.id,
          name: decoded.name || 'System User',
          email: decoded.email || 'user@example.com',
          role: decoded.role || 'Analyst'
        };
      }

      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Not authorized, no token provided' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role '${req.user ? req.user.role : 'None'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
