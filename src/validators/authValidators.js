import { body, query, param } from 'express-validator';

/**
 * Validation rules for authentication endpoints using ES6 modules
 */
const authValidators = {
  /**
   * Validation for user registration
   */
  validateRegister: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage('Email must not exceed 100 characters'),
    
    body('password')
      .isLength({ min: 8, max: 100 })
      .withMessage('Password must be between 8 and 100 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
      .withMessage('Last name can only contain letters and spaces'),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Phone must be between 10 and 20 characters')
      .matches(/^[\+]?[0-9\s\-\(\)]+$/)
      .withMessage('Phone must contain only numbers, spaces, hyphens, parentheses, and optional plus sign'),
    
    body('role')
      .optional()
      .isIn(['admin', 'coordinator', 'surveyor'])
      .withMessage('Role must be one of: admin, coordinator, surveyor')
  ],

  /**
   * Validation for user login
   */
  validateLogin: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Password must not exceed 100 characters')
  ],

  /**
   * Validation for refresh token
   */
  validateRefreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
      .isJWT()
      .withMessage('Invalid refresh token format')
  ],

  /**
   * Validation for forgot password
   */
  validateForgotPassword: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ],

  /**
   * Validation for reset password
   */
  validateResetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 32, max: 64 })
      .withMessage('Invalid reset token format')
      .isAlphanumeric()
      .withMessage('Invalid reset token format'),
    
    body('newPassword')
      .isLength({ min: 8, max: 100 })
      .withMessage('Password must be between 8 and 100 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
  ],

  /**
   * Validation for change password
   */
  validateChangePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Current password must not exceed 100 characters'),
    
    body('newPassword')
      .isLength({ min: 8, max: 100 })
      .withMessage('New password must be between 8 and 100 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('New password must be different from current password');
        }
        return true;
      })
  ],

  /**
   * Validation for email verification
   */
  validateEmailVerification: [
    query('token')
      .notEmpty()
      .withMessage('Verification token is required')
      .isLength({ min: 32, max: 64 })
      .withMessage('Invalid verification token format')
      .isAlphanumeric()
      .withMessage('Invalid verification token format')
  ],

  /**
   * Validation for updating user profile
   */
  validateUpdateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
      .withMessage('Last name can only contain letters and spaces'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage('Email must not exceed 100 characters')
  ],

  /**
   * Validation for user ID parameter
   */
  validateUserId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer')
  ],

  /**
   * Validation for resending email verification (public endpoint)
   */
  validateResendVerificationPublic: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ]
};

// Legacy exports for backward compatibility
export const registerValidation = authValidators.validateRegister;
export const loginValidation = authValidators.validateLogin;

export default authValidators;
