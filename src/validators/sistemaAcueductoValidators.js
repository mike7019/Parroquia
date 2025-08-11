/**
 * Sistema de Acueducto Validators
 * Validation middleware for sistemas de acueducto operations
 */

import { body, param, query, validationResult } from 'express-validator';
import { createErrorResponse } from '../utils/responses.js';

/**
 * Handle validation result
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json(
      createErrorResponse(
        'Validation failed',
        errorMessages,
        'VALIDATION_ERROR'
      )
    );
  }
  next();
};

/**
 * Validate sistema creation data
 */
export const validateCreateSistema = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_.,()/]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  handleValidationErrors
];

/**
 * Validate sistema update data
 */
export const validateUpdateSistema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_.,()/]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  // At least one field must be provided for update
  body()
    .custom((value, { req }) => {
      if (!req.body.nombre && req.body.descripcion === undefined) {
        throw new Error('Al menos un campo (nombre, descripcion) es requerido para la actualización');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validate sistema ID parameter
 */
export const validateSistemaId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  handleValidationErrors
];

/**
 * Validate search query
 */
export const validateSearchQuery = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('El término de búsqueda es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),

  handleValidationErrors
];

/**
 * Validate get all sistemas query parameters
 */
export const validateGetAllQuery = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El término de búsqueda no puede exceder 100 caracteres'),

  query('sortBy')
    .optional()
    .isIn(['id_sistema_acueducto', 'nombre', 'descripcion', 'created_at', 'updated_at'])
    .withMessage('El campo de ordenamiento no es válido'),

  query('sortOrder')
    .optional()
    .toUpperCase()
    .isIn(['ASC', 'DESC'])
    .withMessage('El orden debe ser ASC o DESC'),

  handleValidationErrors
];

/**
 * Validate nombre parameter
 */
export const validateNombreParam = [
  param('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),

  handleValidationErrors
];

/**
 * Validate bulk create data
 */
export const validateBulkCreate = [
  body('sistemas')
    .isArray({ min: 1 })
    .withMessage('Se requiere un array de sistemas con al menos un elemento'),

  body('sistemas.*.nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido para cada sistema')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_.,()/]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),

  body('sistemas.*.descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  // Validate maximum number of items in bulk operation
  body('sistemas')
    .custom((sistemas) => {
      if (sistemas.length > 100) {
        throw new Error('No se pueden crear más de 100 sistemas a la vez');
      }
      return true;
    }),

  // Validate unique nombres within the array
  body('sistemas')
    .custom((sistemas) => {
      const nombres = sistemas.map(s => s.nombre?.toLowerCase().trim()).filter(Boolean);
      const uniqueNombres = [...new Set(nombres)];
      if (nombres.length !== uniqueNombres.length) {
        throw new Error('No se permiten nombres duplicados en la misma operación');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Common validation chains for reuse
 */
export const commonValidations = {
  sistemaId: param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  sistemaName: body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_.,()/]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),

  sistemaDescription: body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  searchTerm: query('query')
    .trim()
    .notEmpty()
    .withMessage('El término de búsqueda es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
};

export default {
  validateCreateSistema,
  validateUpdateSistema,
  validateSistemaId,
  validateSearchQuery,
  validateGetAllQuery,
  validateNombreParam,
  validateBulkCreate,
  handleValidationErrors,
  commonValidations
};
