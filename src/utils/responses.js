/**
 * Create a standardized success response
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {any} meta - Additional metadata
 * @returns {object} Standardized success response
 */
export function createSuccessResponse(message, data = null, meta = null) {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {any} details - Error details
 * @param {string} code - Error code
 * @returns {object} Standardized error response
 */
export function createErrorResponse(message, details = null, code = 'INTERNAL_ERROR') {
  const response = {
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString()
    }
  };

  if (details) {
    response.error.details = details;
  }

  return response;
}

/**
 * Create a paginated response
 * @param {any} data - Response data
 * @param {object} pagination - Pagination info
 * @param {string} message - Success message
 * @returns {object} Paginated response
 */
export function createPaginatedResponse(data, pagination, message = 'Data retrieved successfully') {
  return createSuccessResponse(message, data, { pagination });
}

/**
 * Create a validation error response
 * @param {string} message - Error message
 * @param {array} errors - Validation errors
 * @returns {object} Validation error response
 */
export function createValidationErrorResponse(message, errors = []) {
  return createErrorResponse(message, { validationErrors: errors }, 'VALIDATION_ERROR');
}
