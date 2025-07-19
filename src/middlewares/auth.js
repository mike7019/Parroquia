import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware using ES6 modules
 */
const authMiddleware = {
  /**
   * Authenticate JWT token
   */
  async authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'Access token required'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check token type
      if (decoded.type !== 'access') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token type'
        });
      }
      
      // Find user and attach to request
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token or user not active'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  },

  /**
   * Authorize user roles
   * @param {Array} roles - Array of allowed roles
   */
  requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions. Required roles: ' + roles.join(', '),
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    };
  },

  /**
   * Check if user owns the resource or is admin
   * @param {string} userIdParam - Parameter name containing user ID
   */
  requireOwnershipOrAdmin(userIdParam = 'id') {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const resourceUserId = parseInt(req.params[userIdParam]);
      const currentUserId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isAdmin && resourceUserId !== currentUserId) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only access your own resources',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    };
  },

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return next(); // Continue without authentication
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type === 'access') {
        const user = await User.findByPk(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
        }
      }

      next();
    } catch (error) {
      // Continue without authentication if token is invalid
      next();
    }
  },

  /**
   * Check if user email is verified
   */
  requireEmailVerification(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!req.user.emailVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    next();
  },

  /**
   * Rate limiting middleware (basic implementation)
   */
  rateLimitByUser(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
      const userId = req.user?.id || req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!requests.has(userId)) {
        requests.set(userId, []);
      }

      const userRequests = requests.get(userId);
      
      // Remove old requests
      const recentRequests = userRequests.filter(time => time > windowStart);
      requests.set(userId, recentRequests);

      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
          status: 'error',
          message: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      recentRequests.push(now);
      next();
    };
  }
};

export default authMiddleware;
