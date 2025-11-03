import { ErrorCodes, createError } from './errorCodes.js';

/**
 * Validadores específicos para encuestas
 */

/**
 * Validar parámetros de paginación
 */
export const validatePagination = (paginacion = {}) => {
  const { page = 1, limit = 10, cursor = null } = paginacion;

  // Validar page
  if (page < 1) {
    throw createError(ErrorCodes.VALIDATION.INVALID_PAGINATION, {
      field: 'page',
      value: page,
      reason: 'El número de página debe ser mayor o igual a 1'
    });
  }

  // Validar limit
  if (limit < 1 || limit > 100) {
    throw createError(ErrorCodes.VALIDATION.INVALID_PAGINATION, {
      field: 'limit',
      value: limit,
      reason: 'El límite debe estar entre 1 y 100'
    });
  }

  // Validar cursor si existe
  if (cursor && typeof cursor !== 'string') {
    throw createError(ErrorCodes.VALIDATION.INVALID_PAGINATION, {
      field: 'cursor',
      value: cursor,
      reason: 'El cursor debe ser una cadena de texto'
    });
  }

  return { page: parseInt(page), limit: parseInt(limit), cursor };
};

/**
 * Validar filtros de búsqueda
 */
export const validateFilters = (filtros = {}) => {
  const validFilters = ['sector', 'municipio', 'apellido_familiar', 'parroquia', 'vereda', 'corregimiento', 'centro_poblado'];
  const invalidFilters = Object.keys(filtros).filter(key => !validFilters.includes(key));

  if (invalidFilters.length > 0) {
    throw createError(ErrorCodes.VALIDATION.INVALID_FILTER, {
      invalid_filters: invalidFilters,
      valid_filters: validFilters,
      reason: `Los siguientes filtros no son válidos: ${invalidFilters.join(', ')}`
    });
  }

  // Sanitizar filtros (remover espacios extras, validar longitud)
  const sanitizedFilters = {};
  for (const [key, value] of Object.entries(filtros)) {
    if (value && typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 200) {
        throw createError(ErrorCodes.VALIDATION.INVALID_FIELD_LENGTH, {
          field: key,
          maxLength: 200,
          actualLength: trimmed.length,
          reason: `El filtro ${key} excede la longitud máxima permitida`
        });
      }
      sanitizedFilters[key] = trimmed;
    }
  }

  return sanitizedFilters;
};

/**
 * Validar término de búsqueda
 */
export const validateSearchTerm = (termino) => {
  if (!termino || typeof termino !== 'string') {
    throw createError(ErrorCodes.VALIDATION.EMPTY_SEARCH_TERM, {
      reason: 'El término de búsqueda es requerido y debe ser texto'
    });
  }

  const trimmed = termino.trim();
  if (trimmed.length < 3) {
    throw createError(ErrorCodes.VALIDATION.EMPTY_SEARCH_TERM, {
      minLength: 3,
      actualLength: trimmed.length,
      reason: 'El término de búsqueda debe tener al menos 3 caracteres'
    });
  }

  if (trimmed.length > 200) {
    throw createError(ErrorCodes.VALIDATION.INVALID_FIELD_LENGTH, {
      field: 'termino',
      maxLength: 200,
      actualLength: trimmed.length,
      reason: 'El término de búsqueda excede la longitud máxima'
    });
  }

  // Sanitizar caracteres peligrosos para SQL (prevenir injection)
  const sanitized = trimmed.replace(/[;'"\\]/g, '');
  
  return sanitized;
};

/**
 * Validar ID numérico
 */
export const validateId = (id, entityName = 'registro') => {
  if (!id) {
    throw createError(ErrorCodes.VALIDATION.INVALID_ID_FORMAT, {
      entity: entityName,
      reason: `El ID de ${entityName} es requerido`
    });
  }

  const numericId = parseInt(id);
  
  if (isNaN(numericId) || numericId < 1) {
    throw createError(ErrorCodes.VALIDATION.INVALID_ID_FORMAT, {
      entity: entityName,
      value: id,
      reason: `El ID de ${entityName} debe ser un número positivo`
    });
  }

  return numericId;
};

/**
 * Validar fecha
 */
export const validateDate = (fecha, fieldName = 'fecha', allowFuture = false) => {
  if (!fecha) {
    return null; // Permitir null para campos opcionales
  }

  const date = new Date(fecha);
  
  if (isNaN(date.getTime())) {
    throw createError(ErrorCodes.VALIDATION.INVALID_DATE, {
      field: fieldName,
      value: fecha,
      reason: `El campo ${fieldName} no tiene un formato de fecha válido`
    });
  }

  if (!allowFuture && date > new Date()) {
    throw createError(ErrorCodes.VALIDATION.FUTURE_DATE_NOT_ALLOWED, {
      field: fieldName,
      value: fecha,
      reason: `El campo ${fieldName} no puede ser una fecha futura`
    });
  }

  return date;
};

/**
 * Validar existencia en catálogo
 */
export const validateCatalogExists = async (sequelize, catalogName, id, idFieldName, tableName) => {
  if (!id) {
    return true; // Permitir null para campos opcionales
  }

  const numericId = validateId(id, catalogName);

  const [result] = await sequelize.query(
    `SELECT 1 FROM ${tableName} WHERE ${idFieldName} = :id LIMIT 1`,
    {
      replacements: { id: numericId },
      type: sequelize.QueryTypes.SELECT
    }
  );

  if (!result) {
    // Mapear a código de error específico
    const errorMap = {
      'municipios': ErrorCodes.NOT_FOUND.MUNICIPIO_NOT_FOUND,
      'parroquias': ErrorCodes.NOT_FOUND.PARROQUIA_NOT_FOUND,
      'tipos_vivienda': ErrorCodes.NOT_FOUND.TIPO_VIVIENDA_NOT_FOUND,
      'sectores': ErrorCodes.NOT_FOUND.SECTOR_NOT_FOUND,
      'veredas': ErrorCodes.NOT_FOUND.VEREDA_NOT_FOUND,
      'corregimientos': ErrorCodes.NOT_FOUND.CORREGIMIENTO_NOT_FOUND,
      'centros_poblados': ErrorCodes.NOT_FOUND.CENTRO_POBLADO_NOT_FOUND
    };

    const errorCode = errorMap[tableName] || ErrorCodes.NOT_FOUND.NO_RESULTS_FOUND;
    
    throw createError(errorCode, {
      catalog: catalogName,
      id: numericId,
      table: tableName,
      reason: `El ${catalogName} con ID ${numericId} no existe en el sistema`
    });
  }

  return true;
};

/**
 * Validar coherencia geográfica
 */
export const validateGeographicConsistency = async (sequelize, datosUbicacion) => {
  const { id_municipio, id_vereda, id_sector, id_corregimiento, id_centro_poblado } = datosUbicacion;

  // Si hay vereda, debe pertenecer al municipio
  if (id_vereda && id_municipio) {
    const [result] = await sequelize.query(
      `SELECT 1 FROM veredas WHERE id_vereda = :id_vereda AND id_municipio_municipios = :id_municipio LIMIT 1`,
      {
        replacements: { id_vereda, id_municipio },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!result) {
      throw createError(ErrorCodes.BUSINESS_LOGIC.GEOGRAPHIC_INCONSISTENCY, {
        field: 'vereda',
        reason: `La vereda con ID ${id_vereda} no pertenece al municipio con ID ${id_municipio}`,
        suggestion: 'Seleccione una vereda que pertenezca al municipio elegido'
      });
    }
  }

  // Si hay sector, debe pertenecer al municipio
  if (id_sector && id_municipio) {
    const [result] = await sequelize.query(
      `SELECT 1 FROM sectores WHERE id_sector = :id_sector AND id_municipio = :id_municipio LIMIT 1`,
      {
        replacements: { id_sector, id_municipio },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!result) {
      throw createError(ErrorCodes.BUSINESS_LOGIC.GEOGRAPHIC_INCONSISTENCY, {
        field: 'sector',
        reason: `El sector con ID ${id_sector} no pertenece al municipio con ID ${id_municipio}`,
        suggestion: 'Seleccione un sector que pertenezca al municipio elegido'
      });
    }
  }

  // Si hay corregimiento, debe pertenecer al municipio (verificar nombre de columna en DB)
  if (id_corregimiento && id_municipio) {
    const [result] = await sequelize.query(
      `SELECT 1 FROM corregimientos WHERE id_corregimiento = :id_corregimiento AND id_municipio_municipios = :id_municipio LIMIT 1`,
      {
        replacements: { id_corregimiento, id_municipio },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!result) {
      throw createError(ErrorCodes.BUSINESS_LOGIC.GEOGRAPHIC_INCONSISTENCY, {
        field: 'corregimiento',
        reason: `El corregimiento con ID ${id_corregimiento} no pertenece al municipio con ID ${id_municipio}`,
        suggestion: 'Seleccione un corregimiento que pertenezca al municipio elegido'
      });
    }
  }

  // Si hay centro poblado, debe pertenecer al municipio
  if (id_centro_poblado && id_municipio) {
    const [result] = await sequelize.query(
      `SELECT 1 FROM centros_poblados WHERE id_centro_poblado = :id_centro_poblado AND id_municipio = :id_municipio LIMIT 1`,
      {
        replacements: { id_centro_poblado, id_municipio },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!result) {
      throw createError(ErrorCodes.BUSINESS_LOGIC.GEOGRAPHIC_INCONSISTENCY, {
        field: 'centro_poblado',
        reason: `El centro poblado con ID ${id_centro_poblado} no pertenece al municipio con ID ${id_municipio}`,
        suggestion: 'Seleccione un centro poblado que pertenezca al municipio elegido'
      });
    }
  }

  return true;
};

/**
 * Validar tamaño de familia
 */
export const validateFamilySize = (tamanioDeclarado, familyMembers = [], deceasedMembers = []) => {
  const totalMiembros = familyMembers.length + deceasedMembers.length;

  if (totalMiembros === 0) {
    throw createError(ErrorCodes.BUSINESS_LOGIC.NO_MEMBERS_PROVIDED, {
      reason: 'Debe registrar al menos un miembro en la familia (vivo o fallecido)'
    });
  }

  if (tamanioDeclarado && tamanioDeclarado !== totalMiembros) {
    throw createError(ErrorCodes.BUSINESS_LOGIC.INVALID_FAMILY_SIZE, {
      declared_size: tamanioDeclarado,
      actual_size: totalMiembros,
      reason: `El tamaño declarado (${tamanioDeclarado}) no coincide con el número de miembros (${totalMiembros})`,
      suggestion: 'El tamaño de familia debe ser igual al número total de miembros registrados'
    });
  }

  return totalMiembros;
};

export default {
  validatePagination,
  validateFilters,
  validateSearchTerm,
  validateId,
  validateDate,
  validateCatalogExists,
  validateGeographicConsistency,
  validateFamilySize
};
