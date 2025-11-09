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
  // Intentar detectar dinámicamente el nombre real de la columna ID en la tabla
  const detectIdField = async (sequelizeInstance, tblName, preferred) => {
    // Si el nombre preferido existe, úsalo
    if (preferred) {
      const existing = await sequelizeInstance.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = :table AND column_name = :col LIMIT 1`,
        { replacements: { table: tblName, col: preferred }, type: sequelizeInstance.QueryTypes.SELECT }
      );
      if (existing && existing.length > 0) return preferred;
    }

    // Buscar columnas que empiecen por id_
    const candidates = await sequelizeInstance.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = :table AND column_name LIKE 'id_%'`,
      { replacements: { table: tblName }, type: sequelizeInstance.QueryTypes.SELECT }
    );

    if (!candidates || candidates.length === 0) return null;

    if (candidates.length === 1) return candidates[0].column_name;

    // Si hay varias, intentar seleccionar la que contenga el nombre de la tabla (sin plural)
    const base = tblName.replace(/s$/, '');
    for (const c of candidates) {
      if (c.column_name.includes(base)) return c.column_name;
    }

    // Fallback: devolver la primera candidata
    return candidates[0].column_name;
  };

  const realIdField = await detectIdField(sequelize, tableName, idFieldName);

  if (!realIdField) {
    // No se encontró columna identificadora en la tabla solicitada
    throw createError(ErrorCodes.NOT_FOUND.NO_RESULTS_FOUND, {
      catalog: catalogName,
      id: numericId,
      table: tableName,
      reason: `No se pudo determinar la columna ID para la tabla ${tableName}`
    });
  }

  const results = await sequelize.query(
    `SELECT 1 FROM ${tableName} WHERE ${realIdField} = :id LIMIT 1`,
    {
      replacements: { id: numericId },
      type: sequelize.QueryTypes.SELECT
    }
  );

  if (!results || results.length === 0) {
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
  // Helper para detectar columnas ID o FK en una tabla
  const detectColumns = async (tblName, preferredId) => {
    // Detectar columna ID (candidatas id_*)
    const idCandidates = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = :table AND column_name LIKE 'id_%'`,
      { replacements: { table: tblName }, type: sequelize.QueryTypes.SELECT }
    );

    const idCol = (idCandidates && idCandidates.length > 0)
      ? (idCandidates.length === 1 ? idCandidates[0].column_name : (idCandidates.find(c => c.column_name === preferredId)?.column_name || idCandidates[0].column_name))
      : null;

    // Detectar FK a municipio (columnas que contengan 'municipio')
    const fkCandidates = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = :table AND column_name ILIKE '%municipio%'`,
      { replacements: { table: tblName }, type: sequelize.QueryTypes.SELECT }
    );

    const fkCol = (fkCandidates && fkCandidates.length > 0) ? fkCandidates[0].column_name : null;

    return { idCol, fkCol };
  };

  if (id_vereda && id_municipio) {
    const { idCol: veredaIdCol, fkCol: veredaMunicipioFk } = await detectColumns('veredas');
    const idCol = veredaIdCol || 'id_vereda';
    const fkCol = veredaMunicipioFk || 'id_municipio_municipios';

    const res = await sequelize.query(
      `SELECT 1 FROM veredas WHERE ${idCol} = :id_vereda AND ${fkCol} = :id_municipio LIMIT 1`,
      { replacements: { id_vereda, id_municipio }, type: sequelize.QueryTypes.SELECT }
    );

    if (!res || res.length === 0) {
      throw createError(ErrorCodes.BUSINESS_LOGIC.GEOGRAPHIC_INCONSISTENCY, {
        field: 'vereda',
        reason: `La vereda con ID ${id_vereda} no pertenece al municipio con ID ${id_municipio}`,
        suggestion: 'Seleccione una vereda que pertenezca al municipio elegido'
      });
    }
  }

  if (id_sector && id_municipio) {
    const { idCol: sectorIdCol, fkCol: sectorMunicipioFk } = await detectColumns('sectores');
    const idCol = sectorIdCol || 'id_sector';
    const fkCol = sectorMunicipioFk || 'id_municipio';

    const res = await sequelize.query(
      `SELECT 1 FROM sectores WHERE ${idCol} = :id_sector AND ${fkCol} = :id_municipio LIMIT 1`,
      { replacements: { id_sector, id_municipio }, type: sequelize.QueryTypes.SELECT }
    );

    if (!res || res.length === 0) {
      throw createError(ErrorCodes.BUSINESS_LOGIC.GEOGRAPHIC_INCONSISTENCY, {
        field: 'sector',
        reason: `El sector con ID ${id_sector} no pertenece al municipio con ID ${id_municipio}`,
        suggestion: 'Seleccione un sector que pertenezca al municipio elegido'
      });
    }
  }

  if (id_corregimiento && id_municipio) {
    const { idCol: corrIdCol, fkCol: corrMunicipioFk } = await detectColumns('corregimientos');
    const idCol = corrIdCol || 'id_corregimiento';
    const fkCol = corrMunicipioFk || 'id_municipio_municipios';

    const res = await sequelize.query(
      `SELECT 1 FROM corregimientos WHERE ${idCol} = :id_corregimiento AND ${fkCol} = :id_municipio LIMIT 1`,
      { replacements: { id_corregimiento, id_municipio }, type: sequelize.QueryTypes.SELECT }
    );

    if (!res || res.length === 0) {
      throw createError(ErrorCodes.BUSINESS_LOGIC.GEOGRAPHIC_INCONSISTENCY, {
        field: 'corregimiento',
        reason: `El corregimiento con ID ${id_corregimiento} no pertenece al municipio con ID ${id_municipio}`,
        suggestion: 'Seleccione un corregimiento que pertenezca al municipio elegido'
      });
    }
  }

  if (id_centro_poblado && id_municipio) {
    const { idCol: cpIdCol, fkCol: cpMunicipioFk } = await detectColumns('centros_poblados');
    const idCol = cpIdCol || 'id_centro_poblado';
    const fkCol = cpMunicipioFk || 'id_municipio';

    const res = await sequelize.query(
      `SELECT 1 FROM centros_poblados WHERE ${idCol} = :id_centro_poblado AND ${fkCol} = :id_municipio LIMIT 1`,
      { replacements: { id_centro_poblado, id_municipio }, type: sequelize.QueryTypes.SELECT }
    );

    if (!res || res.length === 0) {
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
