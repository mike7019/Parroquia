import { body, param, query } from 'express-validator';

const disposicionBasuraValidators = {
  /**
   * Validaciones para crear un tipo de disposición de basura
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
      .isLength({ max: 500 })
      .withMessage('La descripción no puede exceder 500 caracteres')
      .trim()
      .escape()
  ],

  /**
   * Validaciones para actualizar un tipo de disposición de basura
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
      .isLength({ max: 500 })
      .withMessage('La descripción no puede exceder 500 caracteres')
      .trim()
      .escape()
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
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entero entre 1 y 100'),
    
    query('search')
      .optional()
      .isLength({ max: 255 })
      .withMessage('El término de búsqueda no puede exceder 255 caracteres')
      .trim()
      .escape(),
    
    query('sortBy')
      .optional()
      .isIn(['id_tipo_disposicion_basura', 'nombre', 'descripcion', 'created_at', 'updated_at'])
      .withMessage('Campo de ordenamiento inválido'),
    
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc'])
      .withMessage('Orden de clasificación debe ser ASC o DESC')
  ],

  /**
   * Validaciones para asignar tipo a familia
   */
  validateAsignacion: [
    body('id_familia')
      .isInt({ min: 1 })
      .withMessage('El ID de familia debe ser un número entero positivo'),
    
    body('id_tipo_disposicion_basura')
      .isInt({ min: 1 })
      .withMessage('El ID de tipo de disposición debe ser un número entero positivo')
  ],

  /**
   * Validaciones para remover asignación
   */
  validateRemoveAsignacion: [
    param('idFamilia')
      .isInt({ min: 1 })
      .withMessage('El ID de familia debe ser un número entero positivo'),
    
    param('idTipo')
      .isInt({ min: 1 })
      .withMessage('El ID de tipo de disposición debe ser un número entero positivo')
  ],

  /**
   * Validaciones para consulta por familia
   */
  validateFamiliaId: [
    param('idFamilia')
      .isInt({ min: 1 })
      .withMessage('El ID de familia debe ser un número entero positivo')
  ]
};

export default disposicionBasuraValidators;
