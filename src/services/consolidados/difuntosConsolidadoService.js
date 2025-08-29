import { DifuntosFamilia, Familias, Municipios, Veredas, Sector } from '../../models/index.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class DifuntosConsolidadoService {
  /**
   * Consulta consolidada de difuntos con filtros múltiples
   */
  async consultarDifuntos(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de difuntos...', filtros);
      
      // Usar consulta SQL directa para evitar problemas de asociaciones
      let whereConditions = [];
      let params = {};
      
      // Construir condiciones WHERE
      if (filtros.parentesco) {
        const parentescoLower = filtros.parentesco.toLowerCase();
        if (parentescoLower === 'madre') {
          whereConditions.push(`(df.nombre_completo ILIKE '%madre%' OR df.nombre_completo ILIKE '%mamá%' OR df.observaciones ILIKE '%madre%')`);
        } else if (parentescoLower === 'padre') {
          whereConditions.push(`(df.nombre_completo ILIKE '%padre%' OR df.nombre_completo ILIKE '%papá%' OR df.observaciones ILIKE '%padre%')`);
        }
      }
      
      if (filtros.fecha_aniversario) {
        whereConditions.push(`df.fecha_fallecimiento = :fecha_aniversario`);
        params.fecha_aniversario = filtros.fecha_aniversario;
      }
      
      if (filtros.mes_aniversario) {
        whereConditions.push(`EXTRACT(MONTH FROM df.fecha_fallecimiento) = :mes_aniversario`);
        params.mes_aniversario = filtros.mes_aniversario;
      }
      
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        whereConditions.push(`df.fecha_fallecimiento BETWEEN :fecha_inicio AND :fecha_fin`);
        params.fecha_inicio = filtros.fecha_inicio;
        params.fecha_fin = filtros.fecha_fin;
      }
      
      if (filtros.sector) {
        whereConditions.push(`s.nombre ILIKE :sector`);
        params.sector = `%${filtros.sector}%`;
      }
      
      if (filtros.municipio) {
        whereConditions.push(`m.nombre_municipio ILIKE :municipio`);
        params.municipio = `%${filtros.municipio}%`;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const limite = filtros.limite || 100;
      params.limite = limite;
      
      const query = `
        SELECT 
          df.id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento as fecha_aniversario,
          df.observaciones,
          f.apellido_familiar,
          f.sector,
          f.telefono,
          f.direccion_familia,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          CASE 
            WHEN df.nombre_completo ILIKE '%madre%' OR df.nombre_completo ILIKE '%mamá%' OR df.observaciones ILIKE '%madre%' THEN 'Madre'
            WHEN df.nombre_completo ILIKE '%padre%' OR df.nombre_completo ILIKE '%papá%' OR df.observaciones ILIKE '%padre%' THEN 'Padre'
            ELSE 'Familiar'
          END as parentesco_inferido
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        ${whereClause}
        ORDER BY df.fecha_fallecimiento DESC
        LIMIT :limite
      `;
      
      console.log('📋 Ejecutando consulta SQL:', query);
      console.log('📊 Parámetros:', params);
      
      const difuntos = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      // Consulta para obtener el total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        ${whereClause}
      `;
      
      const [countResult] = await sequelize.query(countQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      console.log('✅ Consulta exitosa:', {
        difuntos_encontrados: difuntos.length,
        total_en_db: countResult.total
      });
      
      return {
        difuntos,
        total: parseInt(countResult.total),
        filtros_aplicados: filtros
      };
      
    } catch (error) {
      console.error('❌ Error en consulta consolidada de difuntos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de difuntos por mes
   */
  async obtenerEstadisticasPorMes() {
    try {
      const query = `
        SELECT 
          EXTRACT(MONTH FROM fecha_fallecimiento) as mes,
          TO_CHAR(fecha_fallecimiento, 'Month') as nombre_mes,
          COUNT(*) as total_difuntos
        FROM difuntos_familia 
        WHERE fecha_fallecimiento IS NOT NULL
        GROUP BY EXTRACT(MONTH FROM fecha_fallecimiento), TO_CHAR(fecha_fallecimiento, 'Month')
        ORDER BY mes
      `;
      
      const resultado = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
      
      return resultado;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas por mes:', error);
      throw error;
    }
  }

  /**
   * Obtener difuntos próximos a cumplir aniversario
   */
  async obtenerProximosAniversarios(diasAdelante = 30) {
    try {
      const query = `
        SELECT 
          df.id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento as fecha_aniversario,
          df.observaciones,
          f.apellido_familiar,
          f.telefono,
          f.direccion_familia,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          DATE_PART('day', 
            (DATE_TRUNC('year', CURRENT_DATE) + 
             INTERVAL '1 year' * 
             CASE WHEN EXTRACT(DOY FROM fecha_fallecimiento) < EXTRACT(DOY FROM CURRENT_DATE) 
                  THEN 1 ELSE 0 END +
             INTERVAL '1 day' * (EXTRACT(DOY FROM fecha_fallecimiento) - 1)) - CURRENT_DATE
          ) as dias_hasta_aniversario
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        WHERE df.fecha_fallecimiento IS NOT NULL
          AND DATE_PART('day', 
            (DATE_TRUNC('year', CURRENT_DATE) + 
             INTERVAL '1 year' * 
             CASE WHEN EXTRACT(DOY FROM fecha_fallecimiento) < EXTRACT(DOY FROM CURRENT_DATE) 
                  THEN 1 ELSE 0 END +
             INTERVAL '1 day' * (EXTRACT(DOY FROM fecha_fallecimiento) - 1)) - CURRENT_DATE
          ) BETWEEN 0 AND :diasAdelante
        ORDER BY dias_hasta_aniversario ASC
      `;
      
      const resultado = await sequelize.query(query, {
        replacements: { diasAdelante },
        type: QueryTypes.SELECT
      });
      
      return resultado;
    } catch (error) {
      console.error('❌ Error obteniendo próximos aniversarios:', error);
      throw error;
    }
  }

  /**
   * Buscar difuntos por nombre
   */
  async buscarPorNombre(nombreBusqueda, limite = 50) {
    try {
      const query = `
        SELECT 
          df.id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento as fecha_aniversario,
          df.observaciones,
          f.apellido_familiar,
          f.telefono,
          f.direccion_familia,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        WHERE df.nombre_completo ILIKE :nombreBusqueda
        ORDER BY df.nombre_completo
        LIMIT :limite
      `;
      
      const resultado = await sequelize.query(query, {
        replacements: { 
          nombreBusqueda: `%${nombreBusqueda}%`,
          limite 
        },
        type: QueryTypes.SELECT
      });
      
      return resultado;
    } catch (error) {
      console.error('❌ Error buscando por nombre:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de difuntos por sector
   */
  async obtenerResumenPorSector() {
    try {
      const query = `
        SELECT 
          COALESCE(s.nombre, 'Sin sector') as sector,
          COUNT(df.id_difunto) as total_difuntos,
          COUNT(DISTINCT f.id_familia) as familias_con_difuntos
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        GROUP BY s.nombre
        ORDER BY total_difuntos DESC
      `;
      
      const resultado = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
      
      return resultado;
    } catch (error) {
      console.error('❌ Error obteniendo resumen por sector:', error);
      throw error;
    }
  }
}

export default new DifuntosConsolidadoService();
