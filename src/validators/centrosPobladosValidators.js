import { body, param, query } from 'express-validator';

const centrosPobladosValidators = {
  /**
   * Validación para crear un centro poblado
   */
  validateCreate: [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    
    body('id_municipio_municipios')
      .optional()
      .isInt({ min: 1 }).withMessage('El ID del municipio debe ser un número entero positivo')
  ],

  /**
   * Validación para actualizar un centro poblado
   */
  validateUpdate: [
    param('id')
      .isInt({ min: 1 }).withMessage('El ID del centro poblado debe ser un número entero positivo'),
    
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    
    body('id_municipio_municipios')
      .optional()
      .isInt({ min: 1 }).withMessage('El ID del municipio debe ser un número entero positivo')
  ],

  /**
   * Validación para obtener por ID
   */
  validateId: [
    param('id')
      .isInt({ min: 1 }).withMessage('El ID del centro poblado debe ser un número entero positivo')
  ],

  /**
   * Validación para query parameters
   */
  validateQuery: [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 }).withMessage('La búsqueda debe tener entre 1 y 255 caracteres'),
    
    query('id_municipio')
      .optional()
      .isInt({ min: 1 }).withMessage('El ID del municipio debe ser un número entero positivo'),
    
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
    
    query('sortBy')
      .optional()
      .isIn(['id_centro_poblado', 'nombre', 'codigo_centro_poblado', 'created_at', 'updated_at'])
      .withMessage('El campo de ordenamiento no es válido'),
    
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('El orden debe ser ASC o DESC')
  ]
};

export default centrosPobladosValidators;
