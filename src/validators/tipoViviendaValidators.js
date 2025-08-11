import { body, param, query } from 'express-validator';

const tipoViviendaValidators = {
  /**
   * Validaciones para crear un tipo de vivienda
   */
  validateCreateTipo: [
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 255 })
      .withMessage('El nombre debe tener entre 2 y 255 caracteres')
      .trim()
      .escape(),
    
    body('descripcion')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La descripción no puede exceder 255 caracteres')
      .trim()
      .escape(),

    body('activo')
      .optional()
      .isBoolean()
      .withMessage('El campo activo debe ser un valor booleano')
  ],

  /**
   * Validaciones para actualizar un tipo de vivienda
   */
  validateUpdateTipo: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('El ID debe ser un número entero positivo'),
    
    body('nombre')
      .optional()
      .notEmpty()
      .withMessage('El nombre no puede estar vacío')
      .isLength({ min: 2, max: 255 })
      .withMessage('El nombre debe tener entre 2 y 255 caracteres')
      .trim()
      .escape(),
    
    body('descripcion')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La descripción no puede exceder 255 caracteres')
      .trim()
      .escape(),

    body('activo')
      .optional()
      .isBoolean()
      .withMessage('El campo activo debe ser un valor booleano')
  ],

  /**
   * Validaciones para operaciones que requieren ID
   */
  validateId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('El ID debe ser un número entero positivo')
  ],

  /**
   * Validaciones para parámetros de consulta
   */
  validateQuery: [
    query('search')
      .optional()
      .isLength({ max: 255 })
      .withMessage('El término de búsqueda no puede exceder 255 caracteres')
      .trim()
      .escape(),
    
    query('sortBy')
      .optional()
      .isIn(['id_tipo_vivienda', 'nombre', 'descripcion', 'activo', 'created_at', 'updated_at'])
      .withMessage('El campo de ordenamiento no es válido'),
    
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('El orden debe ser ASC o DESC')
  ]
};

export default tipoViviendaValidators;
