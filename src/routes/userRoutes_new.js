const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authValidators = require('../validators/authValidators');
const authMiddleware = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management operations
 */

// Protected routes - User profile management

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     description: Retrieve the profile of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile',
  authMiddleware.authenticateToken,
  userController.getCurrentUserProfile
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     description: Update the profile of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile',
  authMiddleware.authenticateToken,
  authValidators.validateUpdateProfile,
  validationMiddleware.handleValidationErrors,
  userController.updateUserProfile
);

// Protected routes - Admin only user management

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin']),
  authValidators.validateUserId,
  validationMiddleware.handleValidationErrors,
  userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Deactivate user account
 *     description: Deactivate a user account (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/deactivate',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin']),
  authValidators.validateUserId,
  validationMiddleware.handleValidationErrors,
  userController.deactivateUser
);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     tags: [Users]
 *     summary: Activate user account
 *     description: Activate a user account (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/activate',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin']),
  authValidators.validateUserId,
  validationMiddleware.handleValidationErrors,
  userController.activateUser
);

module.exports = router;
