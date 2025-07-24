import express from 'express';
import UserController from '../controllers/userController.js';
import UserValidators from '../validators/userValidators.js';
import AuthMiddleware from '../middlewares/auth.js';
import validationMiddleware from '../middlewares/validation.js';

const router = express.Router();

/**
 * User management routes with proper authentication and authorization
 */

// GET /api/users - Get all active users (Admin only)
router.get('/', 
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireRole(['admin']),
  UserController.getAllUsers
);

// GET /api/users/deleted - Get all soft-deleted users (Admin only)
router.get('/deleted',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireRole(['admin']),
  UserController.getDeletedUsers
);

// GET /api/users/:id - Get user by ID (Admin or owner)
router.get('/:id',
  UserValidators.validateUserId(),
  validationMiddleware.handleValidationErrors,
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireOwnershipOrAdmin,
  UserController.getUserById
);

// PUT /api/users/:id - Update user (Admin or owner)
router.put('/:id',
  UserValidators.updateUser(),
  validationMiddleware.handleValidationErrors,
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireOwnershipOrAdmin,
  UserController.updateUser
);

// DELETE /api/users/:id - Soft delete user (Admin only)
router.delete('/:id',
  UserValidators.validateUserId(),
  validationMiddleware.handleValidationErrors,
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireRole(['admin']),
  UserController.deleteUser
);

export default router;
