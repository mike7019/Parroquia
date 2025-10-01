import sequelize from '../../../config/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * Servicio para consultas consolidadas de parroquias e infraestructura
 * 
 * Consolida las siguientes consultas:
 * 1. Lista de parroquias con estadísticas
 * 2. Tipos de vivienda por parroquia
 * 3. Sistemas de acueducto
 * 4. Tratamiento de aguas residuales
 * 5. Manejo de disposición de basura
 * 
 * Creado: 2025-08-28
 * Fase: 2 - Media prioridad
 */

class ParroquiasConsolidadoService {

  /**
   * Consulta principal para parroquias con filtros avanzados
   * @param {Object} filtros - Filtros de búsqueda
   * @param {string} filtros.municipio - Filtro por municipio
   * @param {string} filtros.parroquia - Filtro por parroquia específica
   * @param {string} filtros.tipo_vivienda - Filtro por tipo de vivienda
   * @param {string} filtros.sistema_acueducto - Filtro por sistema de acueducto
   * @param {string} filtros.tipo_aguas_residuales - Filtro por tratamiento aguas residuales
   * @param {string} filtros.disposicion_basura - Filtro por disposición de basura
   * @param {boolean} filtros.incluir_estadisticas - Incluir estadísticas detalladas
   * @param {number} filtros.pagina - Página actual (default: 1)
   * @param {number} filtros.limite - Límite por página (default: 50)
   * @returns {Promise<Object>} Resultado con datos de parroquias y estadísticas
   */
  async consultarParroquias(filtros = {}) {
    try {
      const {
        municipio,
        parroquia,
        tipo_vivienda,
        sistema_acueducto,
        tipo_aguas_residuales,
        disposicion_basura,
        incluir_estadisticas = true,
        pagina = 1,
        limite = 50
      } = filtros;

      const offset = (pagina - 1) * limite;

      // Construir consulta base con filtros
      let whereConditions = [];
      let joinConditions = [];
      let params = {};

      // Filtros geográficos
      if (municipio) {
        whereConditions.push("m.nombre ILIKE :municipio");
        params.municipio = `%${municipio}%`;
      }

      if (parroquia) {
        whereConditions.push("p.nombre ILIKE :parroquia");
        params.parroquia = `%${parroquia}%`;
      }

      // Filtros de infraestructura
      if (tipo_vivienda) {
        joinConditions.push(`
          INNER JOIN familia_tipo_vivienda ftv ON f.id_familia = ftv.id_familia
          INNER JOIN tipos_vivienda tv ON ftv.id_tipo_vivienda = tv.id_tipo_vivienda
        `);
        whereConditions.push("tv.nombre ILIKE :tipo_vivienda");
        params.tipo_vivienda = `%${tipo_vivienda}%`;
      }

      if (sistema_acueducto) {
        joinConditions.push(`
          INNER JOIN familia_sistema_acueducto fsa ON f.id_familia = fsa.id_familia
          INNER JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto
        `);
        whereConditions.push("sa.nombre ILIKE :sistema_acueducto");
        params.sistema_acueducto = `%${sistema_acueducto}%`;
      }

      if (tipo_aguas_residuales) {
        joinConditions.push(`
          INNER JOIN familia_sistema_aguas_residuales fsar ON f.id_familia = fsar.id_familia
          INNER JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales
        `);
        whereConditions.push("tar.nombre ILIKE :tipo_aguas_residuales");
        params.tipo_aguas_residuales = `%${tipo_aguas_residuales}%`;
      }

      if (disposicion_basura) {
        joinConditions.push(`
          INNER JOIN familia_disposicion_basura fdb ON f.id_familia = fdb.id_familia
          INNER JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura
        `);
        whereConditions.push("tdb.nombre ILIKE :disposicion_basura");
        params.disposicion_basura = `%${disposicion_basura}%`;
      }

      const whereClause = whereConditions.length > 0 ? 
        `WHERE ${whereConditions.join(' AND ')}` : '';

      const joinsClause = joinConditions.join(' ');

      // Consulta principal de parroquias
      const consultaParroquias = `
        SELECT DISTINCT
          p.id_parroquia,
          p.nombre as nombre_parroquia,
          m.nombre as nombre_municipio,
          d.nombre as nombre_departamento,
          COUNT(DISTINCT f.id_familia) as total_familias,
          COUNT(DISTINCT per.id_persona) as total_personas
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        INNER JOIN departamentos d ON m.id_departamento = d.id_departamento
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        LEFT JOIN personas per ON per.id_familia = f.id_familia
        ${joinsClause}
        ${whereClause}
        GROUP BY p.id_parroquia, p.nombre, m.nombre, d.nombre
        ORDER BY p.nombre
        LIMIT :limite OFFSET :offset
      `;

      params.limite = limite;
      params.offset = offset;

      const parroquias = await sequelize.query(consultaParroquias, {
        type: QueryTypes.SELECT,
        replacements: params
      });

      // Obtener estadísticas detalladas si se solicita
      let estadisticas = {};
      if (incluir_estadisticas && parroquias.length > 0) {
        estadisticas = await this._obtenerEstadisticasDetalladas(parroquias.map(p => p.id_parroquia));
      }

      // Enriquecer cada parroquia con sus estadísticas específicas
      const parroquiasEnriquecidas = await Promise.all(
        parroquias.map(async (parroquia) => {
          const estadisticasParroquia = incluir_estadisticas ? 
            await this._obtenerEstadisticasParroquia(parroquia.id_parroquia) : null;
          
          return {
            ...parroquia,
            estadisticas: estadisticasParroquia
          };
        })
      );

      // Obtener total para paginación
      const consultaTotal = `
        SELECT COUNT(DISTINCT p.id_parroquia) as total
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        ${joinsClause}
        ${whereClause}
      `;

      const [{ total }] = await sequelize.query(consultaTotal, {
        type: QueryTypes.SELECT,
        replacements: params
      });

      return {
        datos: parroquiasEnriquecidas,
        total: parseInt(total),
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(total / limite),
        filtros_aplicados: filtros,
        estadisticas_generales: estadisticas
      };

    } catch (error) {
      console.error('❌ Error en consultarParroquias:', error);
      throw new Error(`Error al consultar parroquias: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas detalladas de infraestructura para un conjunto de parroquias
   * @param {Array} idParroquias - Array de IDs de parroquias
   * @returns {Promise<Object>} Estadísticas consolidadas
   */
  async _obtenerEstadisticasDetalladas(idParroquias) {
    try {
      const idsString = idParroquias.join(',');

      // Estadísticas de tipos de vivienda
      const tiposVivienda = await sequelize.query(`
        SELECT 
          tv.nombre as tipo_vivienda,
          COUNT(DISTINCT f.id_familia) as total_familias
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        INNER JOIN familia_tipo_vivienda ftv ON f.id_familia = ftv.id_familia
        INNER JOIN tipos_vivienda tv ON ftv.id_tipo_vivienda = tv.id_tipo_vivienda
        WHERE p.id_parroquia IN (${idsString})
        GROUP BY tv.nombre
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      // Estadísticas de sistemas de acueducto
      const sistemasAcueducto = await sequelize.query(`
        SELECT 
          sa.nombre as sistema_acueducto,
          COUNT(DISTINCT f.id_familia) as total_familias
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        INNER JOIN familia_sistema_acueducto fsa ON f.id_familia = fsa.id_familia
        INNER JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto
        WHERE p.id_parroquia IN (${idsString})
        GROUP BY sa.nombre
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      // Estadísticas de aguas residuales
      const aguasResiduales = await sequelize.query(`
        SELECT 
          tar.nombre as tipo_aguas_residuales,
          COUNT(DISTINCT f.id_familia) as total_familias
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        INNER JOIN familia_sistema_aguas_residuales fsar ON f.id_familia = fsar.id_familia
        INNER JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales
        WHERE p.id_parroquia IN (${idsString})
        GROUP BY tar.nombre
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      // Estadísticas de disposición de basura
      const disposicionBasura = await sequelize.query(`
        SELECT 
          tdb.nombre as tipo_disposicion_basura,
          COUNT(DISTINCT f.id_familia) as total_familias
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        INNER JOIN familia_disposicion_basura fdb ON f.id_familia = fdb.id_familia
        INNER JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura
        WHERE p.id_parroquia IN (${idsString})
        GROUP BY tdb.nombre
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      return {
        tipos_vivienda: tiposVivienda,
        sistemas_acueducto: sistemasAcueducto,
        aguas_residuales: aguasResiduales,
        disposicion_basura: disposicionBasura
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas detalladas:', error);
      return {};
    }
  }

  /**
   * Obtener estadísticas específicas de una parroquia
   * @param {number} idParroquia - ID de la parroquia
   * @returns {Promise<Object>} Estadísticas de la parroquia
   */
  async _obtenerEstadisticasParroquia(idParroquia) {
    try {
      // Estadísticas básicas de la parroquia
      const [estadisticasBasicas] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT f.id_familia) as total_familias,
          COUNT(DISTINCT per.id_personas) as total_personas,
          ROUND(AVG(f.tamaño_familia), 2) as promedio_miembros_familia
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        LEFT JOIN personas per ON per.id_familia_familias = f.id_familia
        WHERE p.id_parroquia = :idParroquia
      `, {
        type: QueryTypes.SELECT,
        replacements: { idParroquia }
      });

      // Top 3 tipos de vivienda más comunes
      const tiposViviendaTop = await sequelize.query(`
        SELECT 
          tv.nombre,
          COUNT(DISTINCT f.id_familia) as total
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        INNER JOIN familia_tipo_vivienda ftv ON f.id_familia = ftv.id_familia
        INNER JOIN tipos_vivienda tv ON ftv.id_tipo_vivienda = tv.id_tipo_vivienda
        WHERE p.id_parroquia = :idParroquia
        GROUP BY tv.nombre
        ORDER BY total DESC
        LIMIT 3
      `, {
        type: QueryTypes.SELECT,
        replacements: { idParroquia }
      });

      return {
        ...estadisticasBasicas,
        tipos_vivienda_principales: tiposViviendaTop
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de parroquia:', error);
      return {};
    }
  }

  /**
   * Obtener parroquia específica por ID con estadísticas completas
   * @param {number} idParroquia - ID de la parroquia
   * @returns {Promise<Object>} Información completa de la parroquia
   */
  async obtenerParroquiaPorId(idParroquia) {
    try {
      const [parroquia] = await sequelize.query(`
        SELECT 
          p.id_parroquia,
          p.nombre as nombre_parroquia,
          m.id_municipio,
          m.nombre as nombre_municipio,
          d.id_departamento,
          d.nombre as nombre_departamento
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        INNER JOIN departamentos d ON m.id_departamento = d.id_departamento
        WHERE p.id_parroquia = :idParroquia
      `, {
        type: QueryTypes.SELECT,
        replacements: { idParroquia }
      });

      if (!parroquia) {
        throw new Error(`Parroquia con ID ${idParroquia} no encontrada`);
      }

      // Obtener estadísticas completas
      const estadisticas = await this._obtenerEstadisticasParroquia(idParroquia);
      const estadisticasDetalladas = await this._obtenerEstadisticasDetalladas([idParroquia]);

      return {
        ...parroquia,
        estadisticas: {
          ...estadisticas,
          infraestructura: estadisticasDetalladas
        }
      };

    } catch (error) {
      console.error('❌ Error obteniendo parroquia por ID:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas consolidadas de todas las parroquias
   * @returns {Promise<Object>} Estadísticas generales del sistema
   */
  async obtenerEstadisticasConsolidadas() {
    try {
      // Estadísticas generales
      const [estadisticasGenerales] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT p.id_parroquia) as total_parroquias,
          COUNT(DISTINCT m.id_municipio) as total_municipios,
          COUNT(DISTINCT d.id_departamento) as total_departamentos,
          COUNT(DISTINCT f.id_familia) as total_familias,
          COUNT(DISTINCT per.id_personas) as total_personas
        FROM parroquia p
        LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        LEFT JOIN personas per ON per.id_familia_familias = f.id_familia
      `, { type: QueryTypes.SELECT });

      // Top parroquias por número de familias
      const topParroquias = await sequelize.query(`
        SELECT 
          p.nombre as parroquia,
          m.nombre as municipio,
          COUNT(DISTINCT f.id_familia) as total_familias
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        LEFT JOIN familias f ON f.id_municipio = m.id_municipio
        GROUP BY p.id_parroquia, p.nombre, m.nombre
        ORDER BY total_familias DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });

      // Distribución por tipos de vivienda
      const distribucionVivienda = await sequelize.query(`
        SELECT 
          tv.nombre as tipo_vivienda,
          COUNT(DISTINCT f.id_familia) as total_familias,
          ROUND(COUNT(DISTINCT f.id_familia) * 100.0 / SUM(COUNT(DISTINCT f.id_familia)) OVER(), 2) as porcentaje
        FROM tipos_vivienda tv
        LEFT JOIN familia_tipo_vivienda ftv ON tv.id_tipo_vivienda = ftv.id_tipo_vivienda
        LEFT JOIN familias f ON ftv.id_familia = f.id_familia
        GROUP BY tv.id_tipo_vivienda, tv.nombre
        ORDER BY total_familias DESC
      `, { type: QueryTypes.SELECT });

      return {
        resumen_general: estadisticasGenerales,
        top_parroquias: topParroquias,
        distribucion_tipos_vivienda: distribucionVivienda,
        fecha_consulta: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas consolidadas:', error);
      throw error;
    }
  }

  /**
   * Obtener opciones de filtrado disponibles
   * @returns {Promise<Object>} Opciones de filtrado
   */
  async obtenerFiltrosDisponibles() {
    try {
      // Tipos de vivienda disponibles
      const tiposVivienda = await sequelize.query(`
        SELECT id_tipo_vivienda, nombre
        FROM tipos_vivienda
        WHERE activo = true
        ORDER BY nombre
      `, { type: QueryTypes.SELECT });

      // Sistemas de acueducto disponibles
      const sistemasAcueducto = await sequelize.query(`
        SELECT id_sistema_acueducto, nombre
        FROM sistemas_acueducto
        ORDER BY nombre
      `, { type: QueryTypes.SELECT });

      // Tipos de aguas residuales disponibles
      const tiposAguasResiduales = await sequelize.query(`
        SELECT id_tipo_aguas_residuales, nombre
        FROM tipos_aguas_residuales
        ORDER BY nombre
      `, { type: QueryTypes.SELECT });

      // Tipos de disposición de basura disponibles
      const tiposDisposicionBasura = await sequelize.query(`
        SELECT id_tipo_disposicion_basura, nombre
        FROM tipos_disposicion_basura
        ORDER BY nombre
      `, { type: QueryTypes.SELECT });

      // Parroquias disponibles
      const parroquias = await sequelize.query(`
        SELECT p.id_parroquia, p.nombre as nombre_parroquia,
               m.nombre as nombre_municipio, d.nombre as nombre_departamento
        FROM parroquia p
        INNER JOIN municipios m ON p.id_municipio = m.id_municipio
        INNER JOIN departamentos d ON m.id_departamento = d.id_departamento
        ORDER BY p.nombre
      `, { type: QueryTypes.SELECT });

      // Municipios disponibles
      const municipios = await sequelize.query(`
        SELECT m.id_municipio, m.nombre as nombre_municipio,
               d.nombre as nombre_departamento
        FROM municipios m
        INNER JOIN departamentos d ON m.id_departamento = d.id_departamento
        ORDER BY m.nombre
      `, { type: QueryTypes.SELECT });

      return {
        tipos_vivienda: tiposVivienda,
        sistemas_acueducto: sistemasAcueducto,
        tipos_aguas_residuales: tiposAguasResiduales,
        tipos_disposicion_basura: tiposDisposicionBasura,
        parroquias: parroquias,
        municipios: municipios
      };

    } catch (error) {
      console.error('❌ Error obteniendo filtros disponibles:', error);
      throw new Error(`Error al obtener filtros disponibles: ${error.message}`);
    }
  }
}

export default new ParroquiasConsolidadoService();
