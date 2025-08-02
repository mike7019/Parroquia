import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Middleware de validación con reglas reutilizables
 */
class ValidationMiddleware {
  /**
   * Procesa los resultados de validación y lanza errores si existen
   */
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
        location: error.location
      }));
      
      throw new ValidationError(
        'Datos de entrada inválidos',
        formattedErrors
      );
    }
    next();
  }

  /**
   * Validaciones comunes reutilizables
   */
  static validators = {
    // UUID validation
    uuid: (field = 'id') => 
      param(field)
        .isUUID(4)
        .withMessage(`${field} debe ser un UUID válido`)
        .notEmpty()
        .withMessage(`${field} es requerido`),

    // Email validation
    email: (field = 'correo_electronico') =>
      body(field)
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email no puede exceder 255 caracteres'),

    // Password validation
    password: (field = 'contrasena') =>
      body(field)
        .isLength({ min: 8, max: 128 })
        .withMessage('Contraseña debe tener entre 8 y 128 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage('Contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),

    // Name validation
    name: (field, isRequired = true) => {
      const validator = body(field)
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage(`${field} debe tener entre 1 y 255 caracteres`)
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage(`${field} solo puede contener letras y espacios`);
      
      return isRequired ? validator.notEmpty().withMessage(`${field} es requerido`) : validator.optional();
    },

    // Phone validation
    phone: (field = 'telefono') =>
      body(field)
        .optional()
        .isMobilePhone('es-CO')
        .withMessage('Debe ser un número de teléfono válido para Colombia')
        .isLength({ max: 20 })
        .withMessage('Teléfono no puede exceder 20 caracteres'),

    // Date validation
    date: (field) =>
      body(field)
        .isISO8601()
        .withMessage(`${field} debe ser una fecha válida (YYYY-MM-DD)`)
        .toDate(),

    // Pagination validation
    pagination: () => [
      query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('page debe ser un número entre 1 y 1000')
        .toInt(),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit debe ser un número entre 1 y 100')
        .toInt(),
      query('sort')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('sort debe ser "asc" o "desc"')
    ],

    // Search validation
    search: (field = 'q') =>
      query(field)
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Búsqueda debe tener entre 1 y 100 caracteres')
        .trim()
        .escape()
  };

  /**
   * Validaciones específicas para entidades
   */
  static userValidation = {
    create: [
      ValidationMiddleware.validators.email(),
      ValidationMiddleware.validators.password(),
      ValidationMiddleware.validators.name('primer_nombre'),
      ValidationMiddleware.validators.name('segundo_nombre', false),
      ValidationMiddleware.validators.name('primer_apellido'),
      ValidationMiddleware.validators.name('segundo_apellido', false),
      ValidationMiddleware.validators.phone(),
      body('rol')
        .notEmpty()
        .withMessage('Rol es requerido')
        .isIn(['admin', 'encuestador', 'usuario'])
        .withMessage('Rol debe ser: admin, encuestador o usuario'),
      ValidationMiddleware.handleValidationErrors
    ],

    update: [
      ValidationMiddleware.validators.uuid(),
      ValidationMiddleware.validators.email(),
      ValidationMiddleware.validators.name('primer_nombre', false),
      ValidationMiddleware.validators.name('segundo_nombre', false),
      ValidationMiddleware.validators.name('primer_apellido', false),
      ValidationMiddleware.validators.name('segundo_apellido', false),
      ValidationMiddleware.validators.phone(),
      ValidationMiddleware.handleValidationErrors
    ],

    getById: [
      ValidationMiddleware.validators.uuid(),
      ValidationMiddleware.handleValidationErrors
    ],

    changePassword: [
      ValidationMiddleware.validators.uuid(),
      body('currentPassword')
        .notEmpty()
        .withMessage('Contraseña actual es requerida'),
      ValidationMiddleware.validators.password('newPassword'),
      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('Confirmación de contraseña no coincide');
          }
          return true;
        }),
      ValidationMiddleware.handleValidationErrors
    ]
  };

  static authValidation = {
    login: [
      ValidationMiddleware.validators.email(),
      body('contrasena')
        .notEmpty()
        .withMessage('Contraseña es requerida'),
      ValidationMiddleware.handleValidationErrors
    ],

    register: ValidationMiddleware.userValidation.create,

    refreshToken: [
      body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token es requerido')
        .isJWT()
        .withMessage('Refresh token debe ser un JWT válido'),
      ValidationMiddleware.handleValidationErrors
    ],

    forgotPassword: [
      ValidationMiddleware.validators.email(),
      ValidationMiddleware.handleValidationErrors
    ],

    resetPassword: [
      body('token')
        .notEmpty()
        .withMessage('Token es requerido')
        .isLength({ min: 64, max: 64 })
        .withMessage('Token debe tener 64 caracteres'),
      ValidationMiddleware.validators.password('newPassword'),
      ValidationMiddleware.handleValidationErrors
    ]
  };

  static familyValidation = {
    create: [
      body('nombre_familia')
        .notEmpty()
        .withMessage('Nombre de familia es requerido')
        .isLength({ min: 1, max: 255 })
        .withMessage('Nombre debe tener entre 1 y 255 caracteres'),
      body('direccion_familia')
        .notEmpty()
        .withMessage('Dirección es requerida')
        .isLength({ min: 1, max: 255 })
        .withMessage('Dirección debe tener entre 1 y 255 caracteres'),
      body('numero_contrato_epm')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Número de contrato no puede exceder 50 caracteres'),
      body('telefono_familiar')
        .optional()
        .isMobilePhone('es-CO')
        .withMessage('Teléfono familiar debe ser válido'),
      body('tratamiento_datos')
        .isBoolean()
        .withMessage('Tratamiento de datos debe ser true o false'),
      ValidationMiddleware.handleValidationErrors
    ]
  };

  static personValidation = {
    create: [
      ValidationMiddleware.validators.name('primer_nombre'),
      ValidationMiddleware.validators.name('segundo_nombre', false),
      ValidationMiddleware.validators.name('primer_apellido'),
      ValidationMiddleware.validators.name('segundo_apellido', false),
      body('identificacion')
        .notEmpty()
        .withMessage('Identificación es requerida')
        .isLength({ min: 6, max: 20 })
        .withMessage('Identificación debe tener entre 6 y 20 caracteres')
        .isAlphanumeric()
        .withMessage('Identificación solo puede contener letras y números'),
      ValidationMiddleware.validators.phone('telefono'),
      ValidationMiddleware.validators.email('correo_electronico'),
      ValidationMiddleware.validators.date('fecha_nacimiento'),
      body('direccion')
        .notEmpty()
        .withMessage('Dirección es requerida')
        .isLength({ min: 1, max: 255 })
        .withMessage('Dirección debe tener entre 1 y 255 caracteres'),
      ValidationMiddleware.handleValidationErrors
    ]
  };
}

export default ValidationMiddleware;
