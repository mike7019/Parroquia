import { body, param, query } from 'express-validator';

/**
 * User validation rules for CRUD operations
 */
class UserValidators {
  /**
   * Validation rules for user update
   */
  static updateUser() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),
      
      body('firstName')
        .optional()
        .isString()
        .withMessage('First name must be a string')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .trim(),
      
      body('lastName')
        .optional()
        .isString()
        .withMessage('Last name must be a string')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .trim(),
      
      body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),
      
      body('role')
        .optional()
        .isIn(['user', 'moderator', 'admin'])
        .withMessage('Role must be one of: user, moderator, admin'),
      
      body('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('Status must be either active or inactive')
    ];
  }

  /**
   * Validation rules for user ID parameter
   */
  static validateUserId() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for user creation (if needed for admin user creation)
   */
  static createUser() {
    return [
      body('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .isString()
        .withMessage('First name must be a string')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .trim(),
      
      body('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .isString()
        .withMessage('Last name must be a string')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .trim(),
      
      body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),
      
      body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
      
      body('role')
        .optional()
        .isIn(['user', 'moderator', 'admin'])
        .withMessage('Role must be one of: user, moderator, admin'),
      
      body('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('Status must be either active or inactive')
    ];
  }
}

export default UserValidators;
