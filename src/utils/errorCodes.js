/**
 * Códigos de error centralizados para el sistema de encuestas
 * Cada código tiene un mensaje user-friendly y técnico
 */

export const ErrorCodes = {
  // ============================================================================
  // ERRORES DE VALIDACIÓN (400)
  // ============================================================================
  VALIDATION: {
    INVALID_STRUCTURE: {
      code: 'INVALID_STRUCTURE',
      httpStatus: 400,
      userMessage: 'La estructura de la encuesta no es válida',
      technicalMessage: 'Faltan secciones obligatorias en la encuesta',
      suggestion: 'Verifique que incluya todas las secciones requeridas: informacionGeneral, vivienda, servicios_agua, observaciones'
    },
    MISSING_REQUIRED_FIELD: {
      code: 'MISSING_REQUIRED_FIELD',
      httpStatus: 400,
      userMessage: 'Falta información obligatoria',
      technicalMessage: 'Campos requeridos no proporcionados',
      suggestion: 'Complete todos los campos marcados como obligatorios'
    },
    INVALID_FIELD_TYPE: {
      code: 'INVALID_FIELD_TYPE',
      httpStatus: 400,
      userMessage: 'El tipo de dato proporcionado no es válido',
      technicalMessage: 'Tipo de dato incorrecto en campo',
      suggestion: 'Verifique que los datos tengan el formato correcto'
    },
    INVALID_DATE: {
      code: 'INVALID_DATE',
      httpStatus: 400,
      userMessage: 'La fecha proporcionada no es válida',
      technicalMessage: 'Formato de fecha incorrecto o fecha fuera de rango',
      suggestion: 'Use formato YYYY-MM-DD y verifique que la fecha sea válida'
    },
    FUTURE_DATE_NOT_ALLOWED: {
      code: 'FUTURE_DATE_NOT_ALLOWED',
      httpStatus: 400,
      userMessage: 'La fecha no puede ser posterior a hoy',
      technicalMessage: 'Fecha futura no permitida en este campo',
      suggestion: 'Ingrese una fecha que no sea posterior a la fecha actual'
    },
    INVALID_ID_FORMAT: {
      code: 'INVALID_ID_FORMAT',
      httpStatus: 400,
      userMessage: 'El identificador proporcionado no tiene un formato válido',
      technicalMessage: 'ID debe ser numérico y positivo',
      suggestion: 'Proporcione un ID numérico válido'
    },
    INVALID_PAGINATION: {
      code: 'INVALID_PAGINATION',
      httpStatus: 400,
      userMessage: 'Los parámetros de paginación no son válidos',
      technicalMessage: 'Page o limit fuera de rango permitido',
      suggestion: 'Use valores positivos para page y limit entre 1-100'
    },
    INVALID_FILTER: {
      code: 'INVALID_FILTER',
      httpStatus: 400,
      userMessage: 'Los filtros de búsqueda no son válidos',
      technicalMessage: 'Parámetros de filtro incorrectos',
      suggestion: 'Verifique la sintaxis de los filtros aplicados'
    },
    EMPTY_SEARCH_TERM: {
      code: 'EMPTY_SEARCH_TERM',
      httpStatus: 400,
      userMessage: 'Debe proporcionar un término de búsqueda',
      technicalMessage: 'Término de búsqueda vacío o solo espacios',
      suggestion: 'Ingrese al menos 3 caracteres para buscar'
    },
    INVALID_FIELD_LENGTH: {
      code: 'INVALID_FIELD_LENGTH',
      httpStatus: 400,
      userMessage: 'El texto ingresado es demasiado largo o muy corto',
      technicalMessage: 'Longitud de campo fuera de rango permitido',
      suggestion: 'Verifique los límites de caracteres para este campo'
    },
    NO_VALID_FIELDS: {
      code: 'NO_VALID_FIELDS',
      httpStatus: 400,
      userMessage: 'No se proporcionaron campos válidos para actualizar',
      technicalMessage: 'Ningún campo en la solicitud es actualizable',
      suggestion: 'Incluya al menos un campo válido para actualizar'
    }
  },

  // ============================================================================
  // ERRORES DE DUPLICADOS (409 - Conflict)
  // ============================================================================
  DUPLICATES: {
    DUPLICATE_FAMILY: {
      code: 'DUPLICATE_FAMILY',
      httpStatus: 409,
      userMessage: 'Esta familia ya está registrada en el sistema',
      technicalMessage: 'Familia con mismo apellido, teléfono y dirección ya existe',
      suggestion: 'Si desea actualizar la información, use el endpoint de actualización'
    },
    DUPLICATE_MEMBER: {
      code: 'DUPLICATE_MEMBER',
      httpStatus: 409,
      userMessage: 'Algunos miembros ya pertenecen a otra familia',
      technicalMessage: 'Identificaciones ya registradas en otra familia',
      suggestion: 'Verifique los números de identificación de los miembros'
    },
    DUPLICATE_IDENTIFICATION_IN_FAMILY: {
      code: 'DUPLICATE_IDENTIFICATION_IN_FAMILY',
      httpStatus: 400,
      userMessage: 'Hay números de identificación duplicados dentro de la misma familia',
      technicalMessage: 'Identificaciones duplicadas entre miembros vivos y/o fallecidos',
      suggestion: 'Cada miembro debe tener un número de identificación único'
    },
    FORMULATION_ERROR_DETECTED: {
      code: 'FORMULATION_ERROR_DETECTED',
      httpStatus: 409,
      userMessage: 'Posible error de digitación detectado',
      technicalMessage: 'Familia existente con miembros diferentes a los proporcionados',
      suggestion: 'Verifique que no haya cambiado incorrectamente las cédulas de miembros existentes'
    }
  },

  // ============================================================================
  // ERRORES DE NO ENCONTRADO (404)
  // ============================================================================
  NOT_FOUND: {
    ENCUESTA_NOT_FOUND: {
      code: 'ENCUESTA_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'La encuesta solicitada no existe',
      technicalMessage: 'No se encontró familia con el ID proporcionado',
      suggestion: 'Verifique que el ID de la encuesta sea correcto'
    },
    MUNICIPIO_NOT_FOUND: {
      code: 'MUNICIPIO_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'El municipio seleccionado no existe',
      technicalMessage: 'ID de municipio no encontrado en catálogo',
      suggestion: 'Seleccione un municipio válido de la lista'
    },
    PARROQUIA_NOT_FOUND: {
      code: 'PARROQUIA_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'La parroquia seleccionada no existe',
      technicalMessage: 'ID de parroquia no encontrado en catálogo',
      suggestion: 'Seleccione una parroquia válida de la lista'
    },
    TIPO_VIVIENDA_NOT_FOUND: {
      code: 'TIPO_VIVIENDA_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'El tipo de vivienda seleccionado no existe',
      technicalMessage: 'ID de tipo de vivienda no encontrado en catálogo',
      suggestion: 'Seleccione un tipo de vivienda válido de la lista'
    },
    SECTOR_NOT_FOUND: {
      code: 'SECTOR_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'El sector seleccionado no existe',
      technicalMessage: 'ID de sector no encontrado en catálogo',
      suggestion: 'Seleccione un sector válido de la lista'
    },
    VEREDA_NOT_FOUND: {
      code: 'VEREDA_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'La vereda seleccionada no existe',
      technicalMessage: 'ID de vereda no encontrado en catálogo',
      suggestion: 'Seleccione una vereda válida de la lista'
    },
    CORREGIMIENTO_NOT_FOUND: {
      code: 'CORREGIMIENTO_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'El corregimiento seleccionado no existe',
      technicalMessage: 'ID de corregimiento no encontrado en catálogo',
      suggestion: 'Seleccione un corregimiento válido de la lista'
    },
    CENTRO_POBLADO_NOT_FOUND: {
      code: 'CENTRO_POBLADO_NOT_FOUND',
      httpStatus: 404,
      userMessage: 'El centro poblado seleccionado no existe',
      technicalMessage: 'ID de centro poblado no encontrado en catálogo',
      suggestion: 'Seleccione un centro poblado válido de la lista'
    },
    NO_RESULTS_FOUND: {
      code: 'NO_RESULTS_FOUND',
      httpStatus: 404,
      userMessage: 'No se encontraron resultados',
      technicalMessage: 'La consulta no retornó registros',
      suggestion: 'Intente con otros criterios de búsqueda'
    }
  },

  // ============================================================================
  // ERRORES DE BASE DE DATOS (500)
  // ============================================================================
  DATABASE: {
    CONNECTION_ERROR: {
      code: 'DB_CONNECTION_ERROR',
      httpStatus: 500,
      userMessage: 'Error de conexión con la base de datos',
      technicalMessage: 'No se pudo establecer conexión con PostgreSQL',
      suggestion: 'Intente nuevamente en unos momentos. Si persiste, contacte soporte'
    },
    QUERY_ERROR: {
      code: 'DB_QUERY_ERROR',
      httpStatus: 500,
      userMessage: 'Error al consultar la información',
      technicalMessage: 'Error ejecutando consulta SQL',
      suggestion: 'Intente nuevamente. Si persiste, contacte soporte'
    },
    TRANSACTION_ERROR: {
      code: 'DB_TRANSACTION_ERROR',
      httpStatus: 500,
      userMessage: 'Error al procesar la transacción',
      technicalMessage: 'Fallo en transacción de base de datos',
      suggestion: 'La operación fue cancelada. Intente nuevamente'
    },
    CONSTRAINT_VIOLATION: {
      code: 'DB_CONSTRAINT_VIOLATION',
      httpStatus: 500,
      userMessage: 'La operación viola reglas de integridad de datos',
      technicalMessage: 'Violación de constraint de base de datos',
      suggestion: 'Verifique que los datos cumplan todas las reglas de validación'
    },
    INSERT_ERROR: {
      code: 'DB_INSERT_ERROR',
      httpStatus: 500,
      userMessage: 'Error al guardar la información',
      technicalMessage: 'Fallo en operación INSERT',
      suggestion: 'No se pudo guardar. Verifique los datos e intente nuevamente'
    },
    UPDATE_ERROR: {
      code: 'DB_UPDATE_ERROR',
      httpStatus: 500,
      userMessage: 'Error al actualizar la información',
      technicalMessage: 'Fallo en operación UPDATE',
      suggestion: 'No se pudo actualizar. Intente nuevamente'
    },
    DELETE_ERROR: {
      code: 'DB_DELETE_ERROR',
      httpStatus: 500,
      userMessage: 'Error al eliminar la información',
      technicalMessage: 'Fallo en operación DELETE',
      suggestion: 'No se pudo eliminar. Intente nuevamente'
    }
  },

  // ============================================================================
  // ERRORES DE LÓGICA DE NEGOCIO (422 - Unprocessable Entity)
  // ============================================================================
  BUSINESS_LOGIC: {
    INCOMPLETE_DATA: {
      code: 'INCOMPLETE_DATA',
      httpStatus: 422,
      userMessage: 'La información proporcionada está incompleta',
      technicalMessage: 'Datos insuficientes para completar operación',
      suggestion: 'Complete todos los campos requeridos antes de continuar'
    },
    INCONSISTENT_DATA: {
      code: 'INCONSISTENT_DATA',
      httpStatus: 422,
      userMessage: 'Los datos proporcionados no son coherentes',
      technicalMessage: 'Inconsistencia detectada en datos relacionados',
      suggestion: 'Verifique que todos los datos sean consistentes entre sí'
    },
    GEOGRAPHIC_INCONSISTENCY: {
      code: 'GEOGRAPHIC_INCONSISTENCY',
      httpStatus: 422,
      userMessage: 'La ubicación geográfica no es coherente',
      technicalMessage: 'Vereda/sector no pertenece al municipio seleccionado',
      suggestion: 'Verifique que la vereda y sector correspondan al municipio elegido'
    },
    INVALID_FAMILY_SIZE: {
      code: 'INVALID_FAMILY_SIZE',
      httpStatus: 422,
      userMessage: 'El tamaño de familia no coincide con los miembros registrados',
      technicalMessage: 'Discrepancia entre tamaño_familia y cantidad de miembros',
      suggestion: 'El número de miembros debe coincidir con el tamaño declarado'
    },
    NO_MEMBERS_PROVIDED: {
      code: 'NO_MEMBERS_PROVIDED',
      httpStatus: 422,
      userMessage: 'Debe registrar al menos un miembro en la familia',
      technicalMessage: 'Array de miembros vacío',
      suggestion: 'Agregue al menos un miembro a la familia'
    },
    SERVICE_REGISTRATION_FAILED: {
      code: 'SERVICE_REGISTRATION_FAILED',
      httpStatus: 422,
      userMessage: 'Error al registrar servicios de la vivienda',
      technicalMessage: 'Fallo al insertar registros de servicios públicos',
      suggestion: 'Verifique la información de servicios e intente nuevamente'
    }
  },

  // ============================================================================
  // ERRORES GENÉRICOS (500)
  // ============================================================================
  GENERIC: {
    INTERNAL_SERVER_ERROR: {
      code: 'INTERNAL_SERVER_ERROR',
      httpStatus: 500,
      userMessage: 'Ocurrió un error inesperado en el servidor',
      technicalMessage: 'Error interno no categorizado',
      suggestion: 'Intente nuevamente. Si persiste, contacte al administrador'
    },
    UNKNOWN_ERROR: {
      code: 'UNKNOWN_ERROR',
      httpStatus: 500,
      userMessage: 'Error desconocido',
      technicalMessage: 'Error no manejado por el sistema',
      suggestion: 'Contacte al administrador del sistema'
    }
  }
};

/**
 * Clase para crear errores personalizados con información estructurada
 */
export class AppError extends Error {
  constructor(errorDefinition, additionalInfo = {}) {
    super(errorDefinition.userMessage);
    
    this.name = 'AppError';
    this.code = errorDefinition.code;
    this.httpStatus = errorDefinition.httpStatus;
    this.userMessage = errorDefinition.userMessage;
    this.technicalMessage = errorDefinition.technicalMessage;
    this.suggestion = errorDefinition.suggestion;
    this.additionalInfo = additionalInfo;
    
    // Capturar stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convertir a formato de respuesta JSON
   */
  toJSON() {
    return {
      status: 'error',
      code: this.code,
      message: this.userMessage,
      details: this.technicalMessage,
      suggestion: this.suggestion,
      ...this.additionalInfo
    };
  }
}

/**
 * Helper para crear errores rápidamente
 */
export const createError = (errorDefinition, additionalInfo = {}) => {
  return new AppError(errorDefinition, additionalInfo);
};

export default {
  ErrorCodes,
  AppError,
  createError
};
