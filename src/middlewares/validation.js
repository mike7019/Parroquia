import { validationResult } from 'express-validator';

/**
 * Validation middleware using ES6 modules
 */
const validationMiddleware = {
  /**
   * Handle validation errors from express-validator
   */
  handleValidationErrors(req, res, next) {
    console.log('🔍 DEBUG handleValidationErrors: Iniciando validación');
    console.log('- URL:', req.url);
    console.log('- Params:', req.params);
    
    const errors = validationResult(req);
    console.log('- Errores encontrados:', errors.isEmpty() ? 'Ninguno' : errors.array().length);
    
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
        location: error.location
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: formattedErrors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    console.log('✅ Validación exitosa, llamando next()');
    next();
  },

  /**
   * Sanitize request body by removing undefined and null values
   */
  sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        if (req.body[key] === undefined || req.body[key] === null || req.body[key] === '') {
          delete req.body[key];
        }
      });
    }
    next();
  },

  /**
   * Validate file upload
   */
  validateFileUpload(allowedMimeTypes = [], maxSize = 5 * 1024 * 1024) {
    return (req, res, next) => {
      if (!req.file) {
        return next();
      }

      // Check file size
      if (req.file.size > maxSize) {
        return res.status(400).json({
          status: 'error',
          message: `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`,
          code: 'FILE_TOO_LARGE'
        });
      }

      // Check MIME type
      if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
          code: 'INVALID_FILE_TYPE'
        });
      }

      next();
    };
  },

  /**
   * Validate pagination parameters
   */
  validatePagination(req, res, next) {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Page must be a positive integer',
        code: 'INVALID_PAGINATION'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be a positive integer between 1 and 100',
        code: 'INVALID_PAGINATION'
      });
    }

    req.pagination = {
      page: pageNum,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum
    };

    next();
  }
};

export default validationMiddleware;
