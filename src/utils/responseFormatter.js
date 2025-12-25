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
    let mensajeUsuario = 'Error en la base de datos';
    let detallesError = 'Error al procesar los datos';
    let codigoError = 'DB_ERROR';
    
    // Obtener el error original de PostgreSQL
    const dbError = error.original || error.parent;
    
    if (dbError) {
      // NOT NULL constraint violation
      if (dbError.code === '23502') {
        const campo = dbError.column || 'desconocido';
        const tabla = dbError.table || 'desconocida';
        mensajeUsuario = 'Falta información requerida';
        detallesError = `El campo "${campo}" en la tabla "${tabla}" es obligatorio`;
        codigoError = 'MISSING_REQUIRED_FIELD';
      }
      // FOREIGN KEY constraint violation
      else if (dbError.code === '23503') {
        const detalle = dbError.detail || '';
        mensajeUsuario = 'Referencia inválida';
        detallesError = 'El ID proporcionado no existe en el catálogo. Verifique los valores de municipio, sector, vereda, etc.';
        codigoError = 'INVALID_REFERENCE';
        
        // Intentar extraer qué tabla falla
        if (detalle.includes('municipios')) detallesError = 'El municipio seleccionado no existe';
        else if (detalle.includes('sectores')) detallesError = 'El sector seleccionado no existe';
        else if (detalle.includes('veredas')) detallesError = 'La vereda seleccionada no existe';
        else if (detalle.includes('parroquias')) detallesError = 'La parroquia seleccionada no existe';
        else if (detalle.includes('corregimientos')) detallesError = 'El corregimiento seleccionado no existe';
        else if (detalle.includes('centros_poblados')) detallesError = 'El centro poblado seleccionado no existe';
      }
      // UNIQUE constraint violation
      else if (dbError.code === '23505') {
        mensajeUsuario = 'Registro duplicado';
        detallesError = 'Ya existe un registro con estos datos. Verifique la información e intente nuevamente';
        codigoError = 'DUPLICATE_ENTRY';
      }
      // Invalid text representation (tipo de dato incorrecto)
      else if (dbError.code === '22P02') {
        mensajeUsuario = 'Formato de dato incorrecto';
        detallesError = 'Uno de los valores tiene un formato inválido (ejemplo: texto donde se espera número)';
        codigoError = 'INVALID_DATA_FORMAT';
      }
      // Numeric value out of range
      else if (dbError.code === '22003') {
        mensajeUsuario = 'Valor numérico fuera de rango';
        detallesError = 'Uno de los números proporcionados es demasiado grande o pequeño';
        codigoError = 'NUMBER_OUT_OF_RANGE';
      }
      // String data right truncation (texto demasiado largo)
      else if (dbError.code === '22001') {
        mensajeUsuario = 'Texto demasiado largo';
        detallesError = 'Uno de los campos de texto excede el tamaño máximo permitido';
        codigoError = 'TEXT_TOO_LONG';
      }
      // En desarrollo, mostrar el mensaje original
      else if (process.env.NODE_ENV === 'development') {
        detallesError = dbError.message || error.message;
      }
    } else if (process.env.NODE_ENV === 'development') {
      detallesError = error.message;
    }
    
    return res.status(400).json({
      status: 'error',
      code: codigoError,
      message: mensajeUsuario,
      details: detallesError,
      suggestion: 'Revise los datos enviados y vuelva a intentar. Si el problema persiste, contacte soporte técnico'
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
 * Formatear respuesta de validación de express-validator o array de errores
 */
export const validationErrorResponse = (res, errors) => {
  // Si errors ya es un array (desde middlewares), usarlo directamente
  // Si errors tiene el método .array() (desde express-validator), convertirlo
  const errorsArray = Array.isArray(errors) ? errors : errors.array();
  
  const formattedErrors = errorsArray.map(error => ({
    field: error.path || error.param || error.field,
    message: error.msg || error.message,
    value: error.value,
    location: error.location || 'body'
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
