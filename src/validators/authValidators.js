import { body, query, param } from 'express-validator';

/**
 * Validation rules for authentication endpoints using ES6 modules
 */
const authValidators = {
  /**
   * Validation for user registration
   */
  validateRegister: [
    body('correo_electronico')
      .isEmail()
      .withMessage('Por favor proporciona una dirección de correo electrónico válida')
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage('El correo electrónico no debe exceder 100 caracteres'),
    
    body('contrasena')
      .isLength({ min: 8, max: 100 })
      .withMessage('La contraseña debe tener entre 8 y 100 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
    
    body('primer_nombre')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El primer nombre debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
      .withMessage('El primer nombre solo puede contener letras y espacios'),
    
    body('segundo_nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El segundo nombre debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
      .withMessage('El segundo nombre solo puede contener letras y espacios'),
    
    body('primer_apellido')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El primer apellido debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
      .withMessage('El primer apellido solo puede contener letras y espacios'),
    
    body('segundo_apellido')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El segundo apellido debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
      .withMessage('El segundo apellido solo puede contener letras y espacios'),
    
    body('telefono')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('El teléfono debe tener entre 10 y 20 caracteres')
      .matches(/^[\+]?[0-9\s\-\(\)]+$/)
      .withMessage('El teléfono debe contener solo números, espacios, guiones, paréntesis y signo más opcional'),
    
    body('rol')
      .notEmpty()
      .withMessage('El rol es requerido')
      .isIn(['Administrador', 'Encuestador'])
      .withMessage('El rol debe ser uno de: Administrador, Encuestador')
  ],

  /**
   * Validation for user login
   */
  validateLogin: [
    body('correo_electronico')
      .isEmail()
      .withMessage('Por favor proporciona una dirección de correo electrónico válida')
      .normalizeEmail(),
    
    body('contrasena')
      .notEmpty()
      .withMessage('La contraseña es requerida')
      .isLength({ min: 1, max: 100 })
      .withMessage('La contraseña no debe exceder 100 caracteres')
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
