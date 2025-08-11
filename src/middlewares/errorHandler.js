import { AppError, ConflictError, ValidationError, NotFoundError, AuthenticationError, AuthorizationError } from '../utils/errors.js';
import DatabaseErrorHandler from '../utils/databaseErrorHandler.js';
import logger from '../utils/logger.js';

/**
 * Error handling middleware with enhanced database error handling
 */
const errorHandler = (err, req, res, next) => {
  // Crear contexto del request para logging
  const requestContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || null,
    userAgent: req.get('user-agent'),
    params: req.params,
    query: req.query
  };

  // Log del error con contexto completo
  logger.error('Request error occurred', err, requestContext);

  // Handle all custom application errors first (including ConflictError, ValidationError, etc.)
  if (err instanceof AppError || 
      err instanceof ConflictError || 
      err instanceof ValidationError || 
      err instanceof NotFoundError || 
      err instanceof AuthenticationError || 
      err instanceof AuthorizationError) {
    return handleAppError(err, res);
  }

  // Handle Sequelize database errors
  if (err.name?.startsWith('Sequelize')) {
    const databaseError = DatabaseErrorHandler.handleSequelizeError(err, requestContext);
    return handleAppError(databaseError, res);
  }

  function handleAppError(appError, response) {
    const errorResponse = {
      status: appError.status,
      message: appError.message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    };
    
    if (appError.code) {
      errorResponse.code = appError.code;
    }
    
    if (appError.details) {
      errorResponse.details = appError.details;
    }

    if (appError.retryAfter) {
      errorResponse.retryAfter = appError.retryAfter;
    }

    // Solo incluir requestId en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {
      errorResponse.requestId = req.id || 'unknown';
    }

    return response.status(appError.statusCode).json(errorResponse);
  }

  // Default error response
  let error = {
    status: 'error',
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // JSON parsing errors
  if (err.type === 'entity.parse.failed' || err.name === 'SyntaxError') {
    logger.warn('JSON parsing error', {
      body: err.body ? err.body.substring(0, 200) : 'No body',
      contentType: req.get('content-type'),
      ...requestContext
    });

    error.message = 'Formato JSON inválido';
    error.code = 'INVALID_JSON';
    error.details = {
      issue: 'El cuerpo de la petición contiene JSON malformado',
      hint: 'Verifica comas adicionales, claves sin comillas o sintaxis inválida',
      body: err.body ? err.body.substring(0, 200) + (err.body.length > 200 ? '...' : '') : 'No se recibió contenido'
    };
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.warn('JWT validation error', {
      token: req.headers.authorization?.substring(0, 20) + '...' || 'no token',
      ...requestContext
    });
    error.message = 'Token inválido';
    error.code = 'INVALID_TOKEN';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('JWT token expired', {
      expiredAt: err.expiredAt,
      ...requestContext
    });
    error.message = 'Token expirado';
    error.code = 'TOKEN_EXPIRED';
    error.details = {
      expiredAt: err.expiredAt
    };
    return res.status(401).json(error);
  }

  // Rate limiting errors
  if (err.status === 429) {
    logger.warn('Rate limit exceeded', {
      limit: err.limit,
      remaining: err.remaining,
      resetTime: err.resetTime,
      ...requestContext
    });
    error.message = 'Demasiadas peticiones';
    error.code = 'RATE_LIMIT_EXCEEDED';
    error.details = {
      retryAfter: err.retryAfter || 60
    };
    return res.status(429).json(error);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    logger.warn('File size limit exceeded', {
      fieldname: err.field,
      limit: err.limit,
      ...requestContext
    });
    error.message = 'Archivo demasiado grande';
    error.code = 'FILE_TOO_LARGE';
    return res.status(413).json(error);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    logger.warn('Unexpected file field', {
      fieldname: err.field,
      ...requestContext
    });
    error.message = 'Campo de archivo inesperado';
    error.code = 'UNEXPECTED_FILE';
    return res.status(400).json(error);
  }

  // Express validator errors (if not handled by middleware)
  if (err.type === 'validation') {
    logger.warn('Validation error not handled by middleware', {
      errors: err.errors,
      ...requestContext
    });
    error.message = 'Errores de validación';
    error.code = 'VALIDATION_ERROR';
    error.details = err.errors;
    return res.status(400).json(error);
  }

  // Development environment - show stack trace and more details
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = {
      name: err.name,
      code: err.code,
      syscall: err.syscall,
      errno: err.errno
    };
  }

  // Log unhandled errors for monitoring
  logger.error('Unhandled error occurred', err, {
    category: 'unhandled_error',
    ...requestContext
  });

  res.status(500).json(error);
};

export default errorHandler;
