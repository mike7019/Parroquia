import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * Servicio optimizado para encuestas
 */
class EncuestaService {

  /**
   * Obtener encuestas con consulta optimizada y paginación cursor-based
   */
  static async obtenerEncuestasOptimizado(filtros = {}, paginacion = {}) {
    const { page = 1, limit = 10, cursor = null, useCursor = false } = paginacion;
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

    if (filtros.sector) {
      whereClause += ' AND f.sector ILIKE :sector';
      replacements.sector = `%${filtros.sector}%`;
    }

    if (filtros.apellido_familiar) {
      whereClause += ' AND f.apellido_familiar ILIKE :apellido_familiar';
      replacements.apellido_familiar = `%${filtros.apellido_familiar}%`;
    }

    if (filtros.municipio) {
      whereClause += ' AND m.nombre_municipio ILIKE :municipio';
      replacements.municipio = `%${filtros.municipio}%`;
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
      LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      LEFT JOIN personas per ON f.id_familia = per.id_familia_familias 
        AND per.identificacion NOT LIKE 'FALLECIDO%'
      LEFT JOIN difuntos_familia df ON f.id_familia = df.id_familia_familias
      WHERE ${whereClause}
      GROUP BY f.id_familia, fs.total_personas, fs.total_difuntos, 
               m.nombre_municipio, v.nombre, s.nombre, p.nombre, tv.nombre
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
  }

  /**
   * Obtener encuesta por ID optimizada
   */
  static async obtenerEncuestaPorIdOptimizado(id) {
    const query = `
      SELECT 
        f.*,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        p.nombre as nombre_parroquia,
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
      LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      LEFT JOIN personas per ON f.id_familia = per.id_familia_familias 
        AND per.identificacion NOT LIKE 'FALLECIDO%'
      LEFT JOIN sexos sx ON per.id_sexo = sx.id_sexo
      LEFT JOIN tipos_identificacion ti ON per.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
      LEFT JOIN difuntos_familia df ON f.id_familia = df.id_familia_familias
      LEFT JOIN sexos dfsx ON df.id_sexo = dfsx.id_sexo
      LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
      WHERE f.id_familia = :id
      GROUP BY f.id_familia, m.nombre_municipio, v.nombre, s.nombre, p.nombre, tv.nombre
    `;

    const [encuesta] = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    return encuesta;
  }

  /**
   * Obtener estadísticas de encuestas (con cache)
   */
  static async obtenerEstadisticas() {
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
        COUNT(*) as total_familias,
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
  }

  /**
   * Buscar encuestas con texto completo
   */
  static async buscarEncuestas(termino, opciones = {}) {
    const { limit = 20, incluirPersonas = false } = opciones;

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

    return await sequelize.query(query, {
      replacements: { termino, limit },
      type: QueryTypes.SELECT
    });
  }

  /**
   * Validar integridad de datos antes de crear encuesta
   */
  static async validarIntegridadDatos(datosEncuesta) {
    const errores = [];

    // Validar que existan los catálogos referenciados
    const validaciones = [
      {
        tabla: 'municipios',
        campo: 'id_municipio',
        valor: datosEncuesta.informacionGeneral?.municipio?.id,
        mensaje: 'Municipio no válido'
      },
      {
        tabla: 'parroquias',
        campo: 'id_parroquia',
        valor: datosEncuesta.informacionGeneral?.parroquia?.id,
        mensaje: 'Parroquia no válida'
      },
      {
        tabla: 'tipos_vivienda',
        campo: 'id_tipo_vivienda',
        valor: datosEncuesta.vivienda?.tipo_vivienda?.id,
        mensaje: 'Tipo de vivienda no válido'
      }
    ];

    for (const validacion of validaciones) {
      if (validacion.valor) {
        const existe = await sequelize.query(
          `SELECT 1 FROM ${validacion.tabla} WHERE ${validacion.campo} = :valor LIMIT 1`,
          {
            replacements: { valor: validacion.valor },
            type: QueryTypes.SELECT
          }
        );

        if (existe.length === 0) {
          errores.push(validacion.mensaje);
        }
      }
    }

    return errores;
  }
}

export default EncuestaService;