import sequelize from '../../../config/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * Servicio para consultas consolidadas de personas, capacidades y análisis geográfico
 * 
 * Consolida las siguientes consultas:
 * 1. Personas por destrezas/habilidades
 * 2. Análisis geográfico por sectores/veredas
 * 3. Consultas por profesiones
 * 4. Comunidades culturales
 * 5. Necesidades específicas (vestuario, transporte, escolar)
 * 6. Análisis demográfico avanzado
 */
class PersonasCapacidadesService {

  /**
   * Consultar personas por destrezas/habilidades
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Object>} Resultado de la consulta
   */
  async consultarPersonasPorDestrezas(filtros = {}) {
    try {
      const {
        destreza_id,
        municipio,
        sector,
        vereda,
        sexo,
        edad_min,
        edad_max,
        incluir_estadisticas = true,
        pagina = 1,
        limite = 50
      } = filtros;

      console.log('🔍 Consultando personas por destrezas con filtros:', filtros);

      const offset = (pagina - 1) * limite;
      const whereConditions = [];
      const params = {};

      // Construir condiciones WHERE
      if (destreza_id) {
        whereConditions.push('d.id_destreza = :destreza_id');
        params.destreza_id = destreza_id;
      }

      if (municipio) {
        whereConditions.push('m.nombre_municipio ILIKE :municipio');
        params.municipio = `%${municipio}%`;
      }

      if (sector) {
        whereConditions.push('s.nombre ILIKE :sector');
        params.sector = `%${sector}%`;
      }

      if (vereda) {
        whereConditions.push('v.nombre ILIKE :vereda');
        params.vereda = `%${vereda}%`;
      }

      if (sexo) {
        whereConditions.push('sx.descripcion = :sexo');
        params.sexo = sexo;
      }

      if (edad_min) {
        whereConditions.push('EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) >= :edad_min');
        params.edad_min = edad_min;
      }

      if (edad_max) {
        whereConditions.push('EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) <= :edad_max');
        params.edad_max = edad_max;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT DISTINCT
          p.id_personas,
          p.primer_nombre,
          p.segundo_nombre,
          p.primer_apellido,
          p.segundo_apellido,
          p.identificacion as numero_identificacion,
          p.fecha_nacimiento,
          EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad,
          sx.descripcion as sexo,
          d.nombre as nombre_destreza,
          d.nombre as destreza_descripcion,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          f.apellido_familiar as codigo_familia
        FROM personas p
        LEFT JOIN persona_destreza pd ON p.id_personas = pd.id_personas_personas
        LEFT JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        ${whereClause}
        ORDER BY p.primer_apellido, p.primer_nombre
        LIMIT :limite OFFSET :offset
      `;

      params.limite = limite;
      params.offset = offset;

      const personas = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      // Contar total
      const countQuery = `
        SELECT COUNT(DISTINCT p.id_personas) as total
        FROM personas p
        LEFT JOIN persona_destreza pd ON p.id_personas = pd.id_personas_personas
        LEFT JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        ${whereClause}
      `;

      const [countResult] = await sequelize.query(countQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      const resultado = {
        personas,
        total: parseInt(countResult.total),
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(countResult.total / limite)
      };

      if (incluir_estadisticas) {
        resultado.estadisticas = await this._obtenerEstadisticasDestrezas(filtros);
      }

      return resultado;

    } catch (error) {
      console.error('❌ Error en consultarPersonasPorDestrezas:', error);
      throw new Error(`Error al consultar personas por destrezas: ${error.message}`);
    }
  }

  /**
   * Análisis geográfico por sectores y veredas
   * @param {Object} filtros - Filtros de análisis
   * @returns {Promise<Object>} Análisis geográfico
   */
  async analizarPorGeografia(filtros = {}) {
    try {
      const { municipio, incluir_detalles = true } = filtros;

      console.log('🗺️ Analizando distribución geográfica:', filtros);

      let whereClause = '';
      const params = {};

      if (municipio) {
        whereClause = 'WHERE m.nombre_municipio ILIKE :municipio';
        params.municipio = `%${municipio}%`;
      }

      // Análisis por sectores
      const sectoresQuery = `
        SELECT 
          s.id_sector,
          s.nombre as nombre_sector,
          m.nombre_municipio,
          COUNT(DISTINCT f.id_familia) as total_familias,
          COUNT(DISTINCT p.id_personas) as total_personas,
          COUNT(DISTINCT CASE WHEN sx.descripcion = 'Masculino' THEN p.id_personas END) as hombres,
          COUNT(DISTINCT CASE WHEN sx.descripcion = 'Femenino' THEN p.id_personas END) as mujeres,
          ROUND(AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))), 1) as edad_promedio
        FROM sectores s
        INNER JOIN municipios m ON s.id_municipio = m.id_municipio
        LEFT JOIN familias f ON s.id_sector = f.id_sector
        LEFT JOIN personas p ON f.id_familia = p.id_familia_familias
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        ${whereClause}
        GROUP BY s.id_sector, s.nombre, m.nombre_municipio
        ORDER BY total_personas DESC
      `;

      const sectores = await sequelize.query(sectoresQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      // Análisis por veredas
      const veredasQuery = `
        SELECT 
          v.id_vereda,
          v.nombre as nombre_vereda,
          s.nombre as nombre_sector,
          m.nombre_municipio,
          COUNT(DISTINCT f.id_familia) as total_familias,
          COUNT(DISTINCT p.id_personas) as total_personas,
          COUNT(DISTINCT CASE WHEN sx.descripcion = 'Masculino' THEN p.id_personas END) as hombres,
          COUNT(DISTINCT CASE WHEN sx.descripcion = 'Femenino' THEN p.id_personas END) as mujeres
        FROM veredas v
        INNER JOIN sectores s ON v.id_sector = s.id_sector
        INNER JOIN municipios m ON s.id_municipio = m.id_municipio
        LEFT JOIN familias f ON v.id_vereda = f.id_vereda
        LEFT JOIN personas p ON f.id_familia = p.id_familia_familias
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        ${whereClause}
        GROUP BY v.id_vereda, v.nombre, s.nombre, m.nombre_municipio
        ORDER BY total_personas DESC
      `;

      const veredas = await sequelize.query(veredasQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      const resultado = {
        analisis_sectores: sectores,
        analisis_veredas: veredas,
        resumen: {
          total_sectores: sectores.length,
          total_veredas: veredas.length,
          sector_mas_poblado: sectores[0]?.nombre_sector || 'N/A',
          vereda_mas_poblada: veredas[0]?.nombre_vereda || 'N/A'
        }
      };

      return resultado;

    } catch (error) {
      console.error('❌ Error en analizarPorGeografia:', error);
      throw new Error(`Error en análisis geográfico: ${error.message}`);
    }
  }

  /**
   * Consultar personas por profesiones
   * @param {Object} filtros - Filtros de consulta
   * @returns {Promise<Object>} Personas por profesión
   */
  async consultarPorProfesiones(filtros = {}) {
    try {
      const {
        profesion_id,
        profesion_nombre,
        municipio,
        sexo,
        pagina = 1,
        limite = 50
      } = filtros;

      console.log('💼 Consultando por profesiones:', filtros);

      const offset = (pagina - 1) * limite;
      const whereConditions = [];
      const params = {};

      if (profesion_id) {
        whereConditions.push('pr.id_profesion = :profesion_id');
        params.profesion_id = profesion_id;
      }

      if (profesion_nombre) {
        whereConditions.push('pr.nombre ILIKE :profesion_nombre');
        params.profesion_nombre = `%${profesion_nombre}%`;
      }

      if (municipio) {
        whereConditions.push('m.nombre_municipio ILIKE :municipio');
        params.municipio = `%${municipio}%`;
      }

      if (sexo) {
        whereConditions.push('sx.descripcion = :sexo');
        params.sexo = sexo;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT 
          p.id_personas,
          p.primer_nombre,
          p.segundo_nombre,
          p.primer_apellido,
          p.segundo_apellido,
          p.identificacion as numero_identificacion,
          EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad,
          sx.descripcion as sexo,
          pr.nombre as nombre_profesion,
          pr.descripcion as profesion_descripcion,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda
        FROM personas p
        LEFT JOIN profesiones pr ON p.id_profesion = pr.id_profesion
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        ${whereClause}
        ORDER BY pr.nombre, p.primer_apellido, p.primer_nombre
        LIMIT :limite OFFSET :offset
      `;

      params.limite = limite;
      params.offset = offset;

      const personas = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      // Estadísticas por profesión
      const statsQuery = `
        SELECT 
          pr.nombre as nombre_profesion,
          COUNT(*) as total_personas,
          COUNT(CASE WHEN sx.descripcion = 'Masculino' THEN 1 END) as hombres,
          COUNT(CASE WHEN sx.descripcion = 'Femenino' THEN 1 END) as mujeres,
          ROUND(AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))), 1) as edad_promedio
        FROM personas p
        LEFT JOIN profesiones pr ON p.id_profesion = pr.id_profesion
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        ${whereClause}
        GROUP BY pr.nombre
        ORDER BY total_personas DESC
      `;

      const estadisticas = await sequelize.query(statsQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      return {
        personas,
        estadisticas_profesiones: estadisticas,
        total: personas.length,
        pagina: parseInt(pagina),
        limite: parseInt(limite)
      };

    } catch (error) {
      console.error('❌ Error en consultarPorProfesiones:', error);
      throw new Error(`Error al consultar por profesiones: ${error.message}`);
    }
  }

  /**
   * Consultar comunidades culturales
   * @param {Object} filtros - Filtros de consulta
   * @returns {Promise<Object>} Análisis de comunidades culturales
   */
  async consultarComunidadesCulturales(filtros = {}) {
    try {
      const { comunidad_id, municipio, incluir_personas = true } = filtros;

      console.log('🎭 Consultando comunidades culturales:', filtros);

      // Como la relación persona-comunidad_cultural no está implementada en BD
      // devolvemos las comunidades culturales disponibles
      const query = `
        SELECT 
          cc.id_comunidad_cultural,
          cc.nombre as nombre_comunidad,
          cc.descripcion,
          cc.activo
        FROM comunidades_culturales cc
        WHERE cc.activo = true
        ORDER BY cc.nombre
      `;

      const comunidades = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });

      return {
        estadisticas_comunidades: comunidades.map(cc => ({
          id_comunidad_cultural: cc.id_comunidad_cultural,
          nombre_comunidad: cc.nombre_comunidad,
          descripcion: cc.descripcion,
          total_personas: 0, // Placeholder - relación no implementada
          total_familias: 0,  // Placeholder - relación no implementada
          hombres: 0,         // Placeholder - relación no implementada
          mujeres: 0,         // Placeholder - relación no implementada
          edad_promedio: null // Placeholder - relación no implementada
        })),
        personas: incluir_personas ? [] : null, // Placeholder - relación no implementada
        total: comunidades.length
      };

    } catch (error) {
      console.error('❌ Error en consultarComunidadesCulturales:', error);
      throw new Error(`Error al consultar comunidades culturales: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de destrezas
   * @param {Object} filtros - Filtros aplicados
   * @returns {Promise<Object>} Estadísticas
   */
  async _obtenerEstadisticasDestrezas(filtros = {}) {
    try {
      // Distribución por destrezas
      const destrezasQuery = `
        SELECT 
          d.nombre as nombre_destreza,
          d.nombre as descripcion,
          COUNT(pd.id_personas_personas) as total_personas,
          COUNT(CASE WHEN sx.descripcion = 'Masculino' THEN 1 END) as hombres,
          COUNT(CASE WHEN sx.descripcion = 'Femenino' THEN 1 END) as mujeres,
          ROUND(AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))), 1) as edad_promedio
        FROM destrezas d
        LEFT JOIN persona_destreza pd ON d.id_destreza = pd.id_destrezas_destrezas
        LEFT JOIN personas p ON pd.id_personas_personas = p.id_personas
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        GROUP BY d.id_destreza, d.nombre
        ORDER BY total_personas DESC
      `;

      const distribucionDestrezas = await sequelize.query(destrezasQuery, {
        type: QueryTypes.SELECT
      });

      return {
        distribucion_destrezas: distribucionDestrezas,
        total_destrezas_disponibles: distribucionDestrezas.length,
        fecha_consulta: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de destrezas:', error);
      throw error;
    }
  }

  /**
   * Obtener filtros disponibles para capacidades
          INNER JOIN comunidades_culturales cc ON p.id_comunidad_cultural = cc.id_comunidad_cultural
          LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
          LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
          LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
          WHERE cc.id_comunidad_cultural = :comunidad_id
          ORDER BY p.primer_apellido, p.primer_nombre
        `;

        const personas = await sequelize.query(personasQuery, {
          replacements: { comunidad_id },
          type: QueryTypes.SELECT
        });

        resultado.personas = personas;
      }

      return resultado;

    } catch (error) {
      console.error('❌ Error en consultarComunidadesCulturales:', error);
      throw new Error(`Error al consultar comunidades culturales: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de destrezas
   * @param {Object} filtros - Filtros aplicados
   * @returns {Promise<Object>} Estadísticas
   */
  async _obtenerEstadisticasDestrezas(filtros = {}) {
    try {
      // Distribución por destrezas
      const destrezasQuery = `
        SELECT 
          d.nombre as nombre_destreza,
          d.nombre as descripcion,
          COUNT(pd.id_personas_personas) as total_personas,
          COUNT(CASE WHEN sx.descripcion = 'Masculino' THEN 1 END) as hombres,
          COUNT(CASE WHEN sx.descripcion = 'Femenino' THEN 1 END) as mujeres,
          ROUND(AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))), 1) as edad_promedio
        FROM destrezas d
        LEFT JOIN persona_destreza pd ON d.id_destreza = pd.id_destrezas_destrezas
        LEFT JOIN personas p ON pd.id_personas_personas = p.id_personas
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        GROUP BY d.id_destreza, d.nombre
        ORDER BY total_personas DESC
      `;

      const distribucionDestrezas = await sequelize.query(destrezasQuery, {
        type: QueryTypes.SELECT
      });

      return {
        distribucion_destrezas: distribucionDestrezas,
        total_destrezas_disponibles: distribucionDestrezas.length,
        fecha_consulta: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de destrezas:', error);
      throw error;
    }
  }

  /**
   * Obtener filtros disponibles para capacidades
   * @returns {Promise<Object>} Filtros disponibles
   */
  async obtenerFiltrosDisponibles() {
    try {
      // Destrezas disponibles
      const destrezas = await sequelize.query(`
        SELECT id_destreza, nombre as nombre_destreza, nombre as descripcion
        FROM destrezas
        ORDER BY nombre
      `, { type: QueryTypes.SELECT });

      // Profesiones disponibles
      const profesiones = await sequelize.query(`
        SELECT id_profesion, nombre as nombre_profesion, descripcion
        FROM profesiones
        ORDER BY nombre
      `, { type: QueryTypes.SELECT });

      // Comunidades culturales disponibles
      const comunidades = await sequelize.query(`
        SELECT id_comunidad_cultural, nombre as nombre_comunidad, descripcion
        FROM comunidades_culturales
        WHERE activo = true
        ORDER BY nombre
      `, { type: QueryTypes.SELECT });

      // Sectores disponibles
      const sectores = await sequelize.query(`
        SELECT s.id_sector, s.nombre as nombre_sector, m.nombre_municipio
        FROM sectores s
        INNER JOIN municipios m ON s.id_municipio = m.id_municipio
        ORDER BY m.nombre_municipio, s.nombre
      `, { type: QueryTypes.SELECT });

      // Veredas disponibles
      const veredas = await sequelize.query(`
        SELECT v.id_vereda, v.nombre as nombre_vereda, s.nombre as nombre_sector, m.nombre_municipio
        FROM veredas v
        INNER JOIN sectores s ON v.id_sector = s.id_sector
        INNER JOIN municipios m ON s.id_municipio = m.id_municipio
        ORDER BY m.nombre_municipio, s.nombre, v.nombre
      `, { type: QueryTypes.SELECT });

      return {
        destrezas,
        profesiones,
        comunidades_culturales: comunidades,
        sectores,
        veredas
      };

    } catch (error) {
      console.error('❌ Error obteniendo filtros disponibles:', error);
      throw new Error(`Error al obtener filtros disponibles: ${error.message}`);
    }
  }
}

export default new PersonasCapacidadesService();
