import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { ErrorCodes, createError } from '../utils/errorCodes.js';
import {
  validatePagination,
  validateFilters,
  validateSearchTerm,
  validateId,
  validateCatalogExists,
  validateGeographicConsistency
} from '../utils/encuestaValidators.js';

/**
 * Servicio optimizado para encuestas con manejo robusto de errores
 */
class EncuestaService {

  /**
   * Obtener encuestas con consulta optimizada y paginación cursor-based
   */
  static async obtenerEncuestasOptimizado(filtros = {}, paginacion = {}) {
    try {
      // Validar y sanitizar parámetros de entrada
      const validatedPagination = validatePagination(paginacion);
      const sanitizedFilters = validateFilters(filtros);

      const { page, limit, cursor } = validatedPagination;
      const { useCursor = false } = paginacion;
      const offset = (page - 1) * limit;

      // Construir filtros dinámicos
      let whereClause = '1=1';
      let replacements = { limit };
      let orderClause = 'ORDER BY f.fecha_ultima_encuesta DESC, f.id_familia DESC';
      let limitClause = 'LIMIT :limit';

      // Paginación cursor-based para mejor rendimiento
      if (useCursor && cursor) {
        const [fecha_cursor, id_cursor] = cursor.split('_');
        whereClause += ' AND (f.fecha_ultima_encuesta < :fecha_cursor OR (f.fecha_ultima_encuesta = :fecha_cursor AND f.id_familia < :id_cursor))';
        replacements.fecha_cursor = fecha_cursor;
        replacements.id_cursor = parseInt(id_cursor);
      } else if (!useCursor) {
        // Paginación tradicional solo si no se usa cursor
        replacements.offset = offset;
        limitClause += ' OFFSET :offset';
      }

      // Filtro de búsqueda general (q o buscar) - OR entre apellido_familiar, nombre_encuestador y parroquia
      if (sanitizedFilters.q || sanitizedFilters.buscar) {
        const searchTerm = sanitizedFilters.q || sanitizedFilters.buscar;
        whereClause += ` AND (
          f.apellido_familiar ILIKE :searchTerm OR 
          f.nombre_encuestador ILIKE :searchTerm OR 
          p.nombre ILIKE :searchTerm
        )`;
        replacements.searchTerm = `%${searchTerm}%`;
      }

      // Filtro específico por sector
      if (sanitizedFilters.sector) {
        whereClause += ' AND f.sector ILIKE :sector';
        replacements.sector = `%${sanitizedFilters.sector}%`;
      }

      // Filtro específico por encuestador_id
      if (sanitizedFilters.encuestador_id) {
        whereClause += ' AND (f.id_encuestador = :encuestador_id OR f.nombre_encuestador ILIKE :encuestador_nombre)';
        replacements.encuestador_id = sanitizedFilters.encuestador_id;
        replacements.encuestador_nombre = `%${sanitizedFilters.encuestador_id}%`;
      }

      if (sanitizedFilters.apellido_familiar) {
        whereClause += ' AND f.apellido_familiar ILIKE :apellido_familiar';
        replacements.apellido_familiar = `%${sanitizedFilters.apellido_familiar}%`;
      }

      if (sanitizedFilters.municipio) {
        whereClause += ' AND m.nombre_municipio ILIKE :municipio';
        replacements.municipio = `%${sanitizedFilters.municipio}%`;
      }

      // Consulta optimizada con JOINs
      const query = `
      WITH familia_stats AS (
        SELECT 
          f.id_familia,
          COUNT(DISTINCT p.id_personas) as total_personas,
          COUNT(DISTINCT df.id_difunto) as total_difuntos
        FROM familias f
        LEFT JOIN personas p ON f.id_familia = p.id_familia_familias 
          AND p.identificacion NOT LIKE 'FALLECIDO%'
        LEFT JOIN difuntos_familia df ON f.id_familia = df.id_familia_familias
        GROUP BY f.id_familia
      )
      SELECT 
        f.*,
        fs.total_personas,
        fs.total_difuntos,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        p.nombre as nombre_parroquia,
        corr.nombre as nombre_corregimiento,
        cp.nombre as nombre_centro_poblado,
        tv.nombre as nombre_tipo_vivienda,
        -- Agregación de personas vivas
        COALESCE(
          JSON_AGG(
            DISTINCT CASE 
              WHEN per.id_personas IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                  'id', per.id_personas,
                  'nombre_completo', CONCAT(per.primer_nombre, ' ', COALESCE(per.primer_apellido, '')),
                  'identificacion', per.identificacion,
                  'telefono', per.telefono
                )
              END
          ) FILTER (WHERE per.id_personas IS NOT NULL), 
          '[]'::json
        ) as personas_vivas,
        -- Agregación de difuntos
        COALESCE(
          JSON_AGG(
            DISTINCT CASE 
              WHEN df.id_difunto IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                  'id', df.id_difunto,
                  'nombre_completo', df.nombre_completo,
                  'fecha_fallecimiento', df.fecha_fallecimiento
                )
              END
          ) FILTER (WHERE df.id_difunto IS NOT NULL),
          '[]'::json
        ) as difuntos
      FROM familias f
      LEFT JOIN familia_stats fs ON f.id_familia = fs.id_familia
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
      LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      LEFT JOIN personas per ON f.id_familia = per.id_familia_familias 
        AND per.identificacion NOT LIKE 'FALLECIDO%'
      LEFT JOIN difuntos_familia df ON f.id_familia = df.id_familia_familias
      WHERE ${whereClause}
      GROUP BY f.id_familia, fs.total_personas, fs.total_difuntos, 
               m.nombre_municipio, v.nombre, s.nombre, p.nombre, corr.nombre, cp.nombre, tv.nombre
      ${orderClause}
      ${limitClause}
      `;

      const encuestas = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT
      });

      // Obtener total para paginación (solo si no se usa cursor)
      let total = null;
      let totalPages = null;
      let nextCursor = null;
      let hasNextPage = false;

      if (!useCursor) {
        const countReplacements = { ...replacements };
        delete countReplacements.limit;
        delete countReplacements.offset;

        const countQuery = `
          SELECT COUNT(*) as total 
          FROM familias f
          LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
          LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
          LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
          WHERE ${whereClause.replace(' LIMIT :limit', '').replace(' OFFSET :offset', '')}
        `;
        const [{ total: totalCount }] = await sequelize.query(countQuery, {
          replacements: countReplacements,
          type: QueryTypes.SELECT
        });
        total = parseInt(totalCount);
        totalPages = Math.ceil(total / limit);
      }

      // Generar cursor para siguiente página
      if (encuestas.length > 0) {
        const lastItem = encuestas[encuestas.length - 1];
        nextCursor = `${lastItem.fecha_ultima_encuesta}_${lastItem.id_familia}`;
        hasNextPage = encuestas.length === limit;
      }

      return {
        data: encuestas,
        pagination: useCursor ? {
          limit,
          cursor,
          nextCursor: hasNextPage ? nextCursor : null,
          hasNextPage
        } : {
          page,
          limit,
          total,
          totalPages,
          nextCursor: hasNextPage ? nextCursor : null
        }
      };
    } catch (error) {
      // Si es un AppError, propagarlo
      if (error.name === 'AppError') {
        throw error;
      }

      // Si es error de base de datos
      if (error.name === 'SequelizeDatabaseError') {
        throw createError(ErrorCodes.DATABASE.QUERY_ERROR, {
          operation: 'obtenerEncuestasOptimizado',
          originalError: error.message
        });
      }

      // Error no manejado
      throw createError(ErrorCodes.GENERIC.INTERNAL_SERVER_ERROR, {
        operation: 'obtenerEncuestasOptimizado',
        originalError: error.message
      });
    }
  }

  /**
   * Obtener encuesta por ID optimizada
   */
  static async obtenerEncuestaPorIdOptimizado(id) {
    try {
      // Validar ID
      const validatedId = validateId(id, 'encuesta');

      const query = `
        SELECT 
          f.*,
          m.nombre_municipio,
          v.nombre as nombre_vereda,
          s.nombre as nombre_sector,
          p.nombre as nombre_parroquia,
          corr.nombre as nombre_corregimiento,
          cp.nombre as nombre_centro_poblado,
          tv.nombre as nombre_tipo_vivienda,
          -- Personas vivas con detalles completos
          COALESCE(
            JSON_AGG(
              DISTINCT CASE 
                WHEN per.id_personas IS NOT NULL THEN
                  JSON_BUILD_OBJECT(
                    'id', per.id_personas,
                    'primer_nombre', per.primer_nombre,
                    'segundo_nombre', per.segundo_nombre,
                    'primer_apellido', per.primer_apellido,
                    'segundo_apellido', per.segundo_apellido,
                    'identificacion', per.identificacion,
                    'telefono', per.telefono,
                    'fecha_nacimiento', per.fecha_nacimiento,
                    'estudios', per.estudios,
                    'talla_camisa', per.talla_camisa,
                    'talla_pantalon', per.talla_pantalon,
                    'talla_zapato', per.talla_zapato,
                    'sexo', JSON_BUILD_OBJECT('id', sx.id_sexo, 'nombre', sx.descripcion),
                    'tipo_identificacion', JSON_BUILD_OBJECT('id', ti.id_tipo_identificacion, 'nombre', ti.nombre)
                  )
                END
            ) FILTER (WHERE per.id_personas IS NOT NULL), 
            '[]'::json
          ) as personas_vivas,
          -- Difuntos con detalles
          COALESCE(
            JSON_AGG(
              DISTINCT CASE 
                WHEN df.id_difunto IS NOT NULL THEN
                  JSON_BUILD_OBJECT(
                    'id', df.id_difunto,
                    'nombre_completo', df.nombre_completo,
                    'fecha_fallecimiento', df.fecha_fallecimiento,
                    'causa_fallecimiento', df.causa_fallecimiento,
                    'sexo', JSON_BUILD_OBJECT('id', dfsx.id_sexo, 'nombre', dfsx.descripcion),
                    'parentesco', JSON_BUILD_OBJECT('id', par.id_parentesco, 'nombre', par.nombre)
                  )
                END
            ) FILTER (WHERE df.id_difunto IS NOT NULL),
            '[]'::json
          ) as difuntos
        FROM familias f
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
        LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
        LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
        LEFT JOIN personas per ON f.id_familia = per.id_familia_familias 
          AND per.identificacion NOT LIKE 'FALLECIDO%'
        LEFT JOIN sexos sx ON per.id_sexo = sx.id_sexo
        LEFT JOIN tipos_identificacion ti ON per.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
        LEFT JOIN difuntos_familia df ON f.id_familia = df.id_familia_familias
        LEFT JOIN sexos dfsx ON df.id_sexo = dfsx.id_sexo
        LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
        WHERE f.id_familia = :id
        GROUP BY f.id_familia, m.nombre_municipio, v.nombre, s.nombre, p.nombre, corr.nombre, cp.nombre, tv.nombre
      `;

      const [encuesta] = await sequelize.query(query, {
        replacements: { id: validatedId },
        type: QueryTypes.SELECT
      });

      // Si no se encontró, lanzar error 404
      if (!encuesta) {
        throw createError(ErrorCodes.NOT_FOUND.ENCUESTA_NOT_FOUND, {
          id: validatedId,
          reason: `No existe ninguna encuesta con el ID ${validatedId}`
        });
      }

      return encuesta;
    } catch (error) {
      // Si es un AppError, propagarlo
      if (error.name === 'AppError') {
        throw error;
      }

      // Si es error de base de datos
      if (error.name === 'SequelizeDatabaseError') {
        throw createError(ErrorCodes.DATABASE.QUERY_ERROR, {
          operation: 'obtenerEncuestaPorIdOptimizado',
          id,
          originalError: error.message
        });
      }

      // Error no manejado
      throw createError(ErrorCodes.GENERIC.INTERNAL_SERVER_ERROR, {
        operation: 'obtenerEncuestaPorIdOptimizado',
        id,
        originalError: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de encuestas (con cache)
   */
  static async obtenerEstadisticas() {
    try {
      const cacheKey = 'encuestas_stats';

      // Intentar obtener del cache primero (si está disponible)
      try {
        const cached = global.encuestasCache?.get(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Cache no disponible, continuar con consulta
      }

      const query = `
        SELECT 
          COUNT(DISTINCT f.id_familia) as total_encuestas,
          COUNT(DISTINCT f.id_familia) as total_familias,
          COUNT(DISTINCT CASE WHEN f.estado_encuesta = 'completada' THEN f.id_familia END) as familias_completadas,
          COUNT(DISTINCT p.id_personas) as total_personas,
          COUNT(DISTINCT df.id_difunto) as total_difuntos,
          AVG(f.tamaño_familia) as promedio_tamaño_familia,
          COUNT(DISTINCT f.id_municipio) as municipios_cubiertos,
          MAX(f.fecha_ultima_encuesta) as ultima_encuesta_fecha
        FROM familias f
        LEFT JOIN personas p ON f.id_familia = p.id_familia_familias 
          AND p.identificacion NOT LIKE 'FALLECIDO%'
        LEFT JOIN difuntos_familia df ON f.id_familia = df.id_familia_familias
      `;

      const [stats] = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });

      // Guardar en cache por 5 minutos
      try {
        if (!global.encuestasCache) {
          const { LRUCache } = await import('lru-cache');
          global.encuestasCache = new LRUCache({
            max: 100,
            ttl: 1000 * 60 * 5 // 5 minutos
          });
        }
        global.encuestasCache.set(cacheKey, stats);
      } catch (error) {
        // Cache no disponible, continuar sin cache
      }

      return stats;
    } catch (error) {
      // Si es error de base de datos
      if (error.name === 'SequelizeDatabaseError') {
        throw createError(ErrorCodes.DATABASE.QUERY_ERROR, {
          operation: 'obtenerEstadisticas',
          originalError: error.message
        });
      }

      // Error no manejado
      throw createError(ErrorCodes.GENERIC.INTERNAL_SERVER_ERROR, {
        operation: 'obtenerEstadisticas',
        originalError: error.message
      });
    }
  }

  /**
   * Buscar encuestas con texto completo
   */
  static async buscarEncuestas(termino, opciones = {}) {
    try {
      // Validar y sanitizar término de búsqueda
      const sanitizedTermino = validateSearchTerm(termino);
      
      const { limit = 20, incluirPersonas = false } = opciones;

      // Validar limit
      if (limit < 1 || limit > 100) {
        throw createError(ErrorCodes.VALIDATION.INVALID_PAGINATION, {
          field: 'limit',
          value: limit,
          reason: 'El límite de búsqueda debe estar entre 1 y 100'
        });
      }

      const query = `
        SELECT DISTINCT
          f.id_familia,
          f.apellido_familiar,
          f.sector,
          f.direccion_familia,
          f.telefono,
          f.fecha_ultima_encuesta,
          m.nombre_municipio,
          ts_rank(
            to_tsvector('spanish', 
              COALESCE(f.apellido_familiar, '') || ' ' ||
              COALESCE(f.sector, '') || ' ' ||
              COALESCE(f.direccion_familia, '') || ' ' ||
              COALESCE(m.nombre_municipio, '')
            ),
            plainto_tsquery('spanish', :termino)
          ) as relevancia
          ${incluirPersonas ? `, 
          COALESCE(
            JSON_AGG(
              DISTINCT CASE 
                WHEN p.id_personas IS NOT NULL THEN
                  JSON_BUILD_OBJECT(
                    'nombre_completo', CONCAT(p.primer_nombre, ' ', COALESCE(p.primer_apellido, '')),
                    'identificacion', p.identificacion
                  )
                END
            ) FILTER (WHERE p.id_personas IS NOT NULL), 
            '[]'::json
          ) as personas` : ''}
        FROM familias f
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
        LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
        ${incluirPersonas ? 'LEFT JOIN personas p ON f.id_familia = p.id_familia_familias AND p.identificacion NOT LIKE \'FALLECIDO%\'' : ''}
        WHERE to_tsvector('spanish', 
          COALESCE(f.apellido_familiar, '') || ' ' ||
          COALESCE(f.sector, '') || ' ' ||
          COALESCE(f.direccion_familia, '') || ' ' ||
          COALESCE(m.nombre_municipio, '')
        ) @@ plainto_tsquery('spanish', :termino)
        ${incluirPersonas ? 'GROUP BY f.id_familia, f.apellido_familiar, f.sector, f.direccion_familia, f.telefono, f.fecha_ultima_encuesta, m.nombre_municipio' : ''}
        ORDER BY relevancia DESC, f.fecha_ultima_encuesta DESC
        LIMIT :limit
      `;

      const resultados = await sequelize.query(query, {
        replacements: { termino: sanitizedTermino, limit },
        type: QueryTypes.SELECT
      });

      return resultados;
    } catch (error) {
      // Si es un AppError, propagarlo
      if (error.name === 'AppError') {
        throw error;
      }

      // Si es error de base de datos
      if (error.name === 'SequelizeDatabaseError') {
        throw createError(ErrorCodes.DATABASE.QUERY_ERROR, {
          operation: 'buscarEncuestas',
          searchTerm: termino,
          originalError: error.message
        });
      }

      // Error no manejado
      throw createError(ErrorCodes.GENERIC.INTERNAL_SERVER_ERROR, {
        operation: 'buscarEncuestas',
        searchTerm: termino,
        originalError: error.message
      });
    }
  }

  /**
   * Validar integridad de datos antes de crear encuesta
   * MEJORADO: Ahora valida todos los catálogos y coherencia geográfica
   */
  static async validarIntegridadDatos(datosEncuesta) {
    try {
      const { informacionGeneral, vivienda } = datosEncuesta;

      // Validar catálogo de municipio
      if (informacionGeneral?.municipio?.id) {
        await validateCatalogExists(
          sequelize,
          'municipio',
          informacionGeneral.municipio.id,
          'id_municipio',
          'municipios'
        );
      }

      // Validar catálogo de parroquia
      if (informacionGeneral?.parroquia?.id) {
        await validateCatalogExists(
          sequelize,
          'parroquia',
          informacionGeneral.parroquia.id,
          'id_parroquia',
          'parroquia'
        );
      }

      // Validar catálogo de vereda
      if (informacionGeneral?.vereda?.id) {
        await validateCatalogExists(
          sequelize,
          'vereda',
          informacionGeneral.vereda.id,
          'id_vereda',
          'veredas'
        );
      }

      // Validar catálogo de sector
      if (informacionGeneral?.sector?.id) {
        await validateCatalogExists(
          sequelize,
          'sector',
          informacionGeneral.sector.id,
          'id_sector',
          'sectores'
        );
      }

      // Validar catálogo de corregimiento
      if (informacionGeneral?.corregimiento?.id) {
        await validateCatalogExists(
          sequelize,
          'corregimiento',
          informacionGeneral.corregimiento.id,
          'id_corregimiento',
          'corregimientos'
        );
      }

      // Validar catálogo de centro poblado
      if (informacionGeneral?.centro_poblado?.id) {
        await validateCatalogExists(
          sequelize,
          'centro_poblado',
          informacionGeneral.centro_poblado.id,
          'id_centro_poblado',
          'centros_poblados'
        );
      }

      // Validar catálogo de tipo de vivienda
      if (vivienda?.tipo_vivienda?.id) {
        await validateCatalogExists(
          sequelize,
          'tipo de vivienda',
          vivienda.tipo_vivienda.id,
          'id_tipo_vivienda',
          'tipos_vivienda'
        );
      }

      // Validar coherencia geográfica (vereda/sector/corregimiento deben pertenecer al municipio)
      if (informacionGeneral?.municipio?.id) {
        await validateGeographicConsistency(sequelize, {
          id_municipio: informacionGeneral.municipio.id,
          id_vereda: informacionGeneral.vereda?.id,
          id_sector: informacionGeneral.sector?.id,
          id_corregimiento: informacionGeneral.corregimiento?.id,
          id_centro_poblado: informacionGeneral.centro_poblado?.id
        });
      }

      // Si todo está bien, retornar array vacío
      return [];
    } catch (error) {
      // Si es un AppError de validación, retornar como array de errores
      if (error.name === 'AppError') {
        return [error.userMessage];
      }

      // Error no esperado
      throw createError(ErrorCodes.GENERIC.INTERNAL_SERVER_ERROR, {
        operation: 'validarIntegridadDatos',
        originalError: error.message
      });
    }
  }
}

export default EncuestaService;