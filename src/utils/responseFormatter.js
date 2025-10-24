/**
 * Utilidades para formatear respuestas HTTP de manera consistente
 */

/**
 * Formatear respuesta exitosa
 */
export const successResponse = (res, { statusCode = 200, message, data, metadata = {} }) => {
  const response = {
    status: 'success',
    message
  };

  // Solo agregar 'data' si existe
  if (data !== undefined) {
    response.data = data;
  }

  // Agregar metadata si existe
  if (Object.keys(metadata).length > 0) {
    response.metadata = metadata;
  }

  return res.status(statusCode).json(response);
};

/**
 * Formatear respuesta con paginación
 */
export const paginatedResponse = (res, { message, data, pagination, metadata = {} }) => {
  return res.status(200).json({
    status: 'success',
    message,
    data,
    pagination,
    ...(Object.keys(metadata).length > 0 && { metadata })
  });
};

/**
 * Formatear respuesta de error desde AppError
 */
export const errorResponse = (res, error) => {
  // Si es AppError, usar su estructura
  if (error.name === 'AppError') {
    return res.status(error.httpStatus).json(error.toJSON());
  }

  // Si es error de Sequelize
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Error de validación en los datos',
      details: error.errors?.map(e => e.message).join(', ') || error.message,
      suggestion: 'Verifique los datos ingresados'
    });
  }

  if (error.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      status: 'error',
      code: 'DB_ERROR',
      message: 'Error en la base de datos',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error al procesar los datos',
      suggestion: 'Intente nuevamente. Si persiste, contacte soporte'
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(422).json({
      status: 'error',
      code: 'FOREIGN_KEY_VIOLATION',
      message: 'El registro referenciado no existe',
      details: 'Uno o más IDs proporcionados no son válidos',
      suggestion: 'Verifique que todos los IDs seleccionados sean correctos'
    });
  }

  // Error genérico
  console.error('Error no manejado:', error);
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Error inesperado',
    suggestion: 'Intente nuevamente. Si persiste, contacte al administrador'
  });
};

/**
 * Formatear respuesta de validación de express-validator
 */
export const validationErrorResponse = (res, errors) => {
  const formattedErrors = errors.array().map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value
  }));

  return res.status(400).json({
    status: 'error',
    code: 'VALIDATION_ERROR',
    message: 'Errores de validación en los datos proporcionados',
    errors: formattedErrors,
    total_errors: formattedErrors.length,
    suggestion: 'Corrija los campos indicados y vuelva a intentar'
  });
};

export default {
  successResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse
};
