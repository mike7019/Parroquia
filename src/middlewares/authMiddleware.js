import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UnauthorizedError, AuthenticationError } from '../utils/errors.js';

/**
 * Authentication and authorization middleware
 */
class AuthMiddleware {
  /**
   * Verify JWT token and authenticate user
   */
  static async authenticateToken(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        throw new AuthenticationError('Access token required');
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new AuthenticationError('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
          throw new AuthenticationError('Invalid token');
        } else {
          throw new AuthenticationError('Token verification failed');
        }
      }

      // Get user from database and verify status
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive || user.status !== 'active') {
        throw new AuthenticationError('User not found or inactive');
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      next(error);
    }
  }

  /**
   * Require admin role
   */
  static requireAdmin(req, res, next) {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (req.user.role !== 'admin') {
        throw new UnauthorizedError('Administrator access required');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Require admin or moderator role
   */
  static requireModerator(req, res, next) {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!['admin', 'moderator'].includes(req.user.role)) {
        throw new UnauthorizedError('Moderator or Administrator access required');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Allow user to access own resources or admin to access any
   */
  static requireOwnershipOrAdmin(req, res, next) {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const targetUserId = parseInt(req.params.id);
      const currentUserId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isAdmin && targetUserId !== currentUserId) {
        throw new UnauthorizedError('You can only access your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}

export default AuthMiddleware;