import { AppError } from '../utils/errors.js';

/**
 * Error handling middleware using ES6 modules
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error details:', err);

  // Handle custom application errors
  if (err instanceof AppError) {
    const response = {
      status: err.status,
      message: err.message
    };
    
    if (err.code) {
      response.code = err.code;
    }
    
    if (err.details) {
      response.details = err.details;
    }

    if (err.retryAfter) {
      response.retryAfter = err.retryAfter;
    }

    return res.status(err.statusCode).json(response);
  }

  // Default error response
  let error = {
    status: 'error',
    message: 'Internal server error'
  };

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    error.message = 'Validation error';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json(error);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Duplicate entry';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
    return res.status(409).json(error);
  }

  // JSON parsing errors
  if (err.type === 'entity.parse.failed' || err.name === 'SyntaxError') {
    error.message = 'Invalid JSON format';
    error.details = {
      issue: 'Request body contains malformed JSON',
      hint: 'Check for trailing commas, unquoted keys, or invalid syntax',
      body: err.body ? err.body.substring(0, 200) + (err.body.length > 200 ? '...' : '') : 'No body received'
    };
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json(error);
  }

  // Development environment - show stack trace
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(500).json(error);
};

export default errorHandler;
