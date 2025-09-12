import { DifuntosFamilia, Familias, Municipios, Veredas, Sector } from '../../models/index.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class DifuntosConsolidadoService {
  /**
   * Consulta consolidada de difuntos con filtros múltiples
   * Consulta tanto difuntos_familia como personas fallecidas
   */
  async consultarDifuntos(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de difuntos...', filtros);
      
      // PASO 1: Consultar difuntos de la tabla difuntos_familia
      const difuntosFamilia = await sequelize.query(`
        SELECT 
          'difuntos_familia' as fuente,
          df.id_difunto::text as id_difunto,
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
          p.nombre as nombre_parroquia,
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
        LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
      `, { type: QueryTypes.SELECT });

      console.log(`📊 Difuntos en tabla difuntos_familia: ${difuntosFamilia.length}`);

      // PASO 2: Consultar personas fallecidas
      const personasFallecidas = await sequelize.query(`
        SELECT 
          'personas' as fuente,
          pe.id_personas::text as id_difunto,
          TRIM(CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, ''))) as nombre_completo,
          (pe.estudios::json->>'fecha_aniversario')::date as fecha_aniversario,
          pe.estudios::json->>'causa_fallecimiento' as observaciones,
          f.apellido_familiar,
          f.sector,
          f.telefono,
          f.direccion_familia,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          p.nombre as nombre_parroquia,
          CASE 
            WHEN (pe.estudios::json->>'era_madre')::boolean = true THEN 'Madre'
            WHEN (pe.estudios::json->>'era_padre')::boolean = true THEN 'Padre'
            ELSE 'Familiar'
          END as parentesco_inferido
        FROM personas pe
        LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
        WHERE pe.estudios IS NOT NULL 
          AND pe.estudios LIKE '%es_fallecido%'
          AND pe.estudios::json->>'es_fallecido' = 'true'
      `, { type: QueryTypes.SELECT });

      console.log(`� Personas fallecidas en tabla personas: ${personasFallecidas.length}`);

      // PASO 3: Combinar resultados
      const todosLosDifuntos = [...difuntosFamilia, ...personasFallecidas];
      
      // PASO 4: Aplicar filtros si los hay
      let difuntosFiltrados = todosLosDifuntos;
      
      if (filtros.parentesco) {
        const parentescoLower = filtros.parentesco.toLowerCase();
        difuntosFiltrados = difuntosFiltrados.filter(difunto => {
          if (parentescoLower === 'madre') {
            return difunto.parentesco_inferido === 'Madre' || 
                   difunto.nombre_completo.toLowerCase().includes('madre') ||
                   difunto.nombre_completo.toLowerCase().includes('mamá');
          } else if (parentescoLower === 'padre') {
            return difunto.parentesco_inferido === 'Padre' ||
                   difunto.nombre_completo.toLowerCase().includes('padre') ||
                   difunto.nombre_completo.toLowerCase().includes('papá');
          }
          return true;
        });
      }

      if (filtros.mes_aniversario) {
        difuntosFiltrados = difuntosFiltrados.filter(difunto => {
          if (!difunto.fecha_aniversario) return false;
          const fecha = new Date(difunto.fecha_aniversario);
          return fecha.getMonth() + 1 === parseInt(filtros.mes_aniversario);
        });
      }

      if (filtros.fecha_inicio && filtros.fecha_fin) {
        difuntosFiltrados = difuntosFiltrados.filter(difunto => {
          if (!difunto.fecha_aniversario) return false;
          const fecha = new Date(difunto.fecha_aniversario);
          const inicio = new Date(filtros.fecha_inicio);
          const fin = new Date(filtros.fecha_fin);
          return fecha >= inicio && fecha <= fin;
        });
      }

      // Ordenar por fecha de aniversario descendente
      difuntosFiltrados.sort((a, b) => {
        if (!a.fecha_aniversario && !b.fecha_aniversario) return 0;
        if (!a.fecha_aniversario) return 1;
        if (!b.fecha_aniversario) return -1;
        return new Date(b.fecha_aniversario) - new Date(a.fecha_aniversario);
      });
      
      console.log('✅ Consulta consolidada exitosa:', {
        difuntos_familia: difuntosFamilia.length,
        personas_fallecidas: personasFallecidas.length,
        total_encontrados: todosLosDifuntos.length,
        despues_filtros: difuntosFiltrados.length
      });
      
      return {
        difuntos: difuntosFiltrados,
        total: todosLosDifuntos.length,
        filtros_aplicados: filtros
      };
      
    } catch (error) {
      console.error('❌ Error en consulta consolidada de difuntos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de difuntos por mes
   * Consulta ambas fuentes de datos
   */
  async obtenerEstadisticasPorMes() {
    try {
      const query = `
        WITH difuntos_consolidados AS (
          -- Difuntos de la tabla difuntos_familia
          SELECT fecha_fallecimiento as fecha_aniversario
          FROM difuntos_familia 
          WHERE fecha_fallecimiento IS NOT NULL
          
          UNION ALL
          
          -- Difuntos de la tabla personas
          SELECT (estudios::json->>'fecha_aniversario')::date as fecha_aniversario
          FROM personas 
          WHERE estudios IS NOT NULL 
            AND estudios::json->>'es_fallecido' = 'true'
            AND estudios::json->>'fecha_aniversario' IS NOT NULL
        )
        SELECT 
          EXTRACT(MONTH FROM fecha_aniversario) as mes,
          TO_CHAR(fecha_aniversario, 'Month') as nombre_mes,
          COUNT(*) as total_difuntos
        FROM difuntos_consolidados
        GROUP BY EXTRACT(MONTH FROM fecha_aniversario), TO_CHAR(fecha_aniversario, 'Month')
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
   * Consulta ambas fuentes de datos
   */
  async obtenerProximosAniversarios(diasAdelante = 30) {
    try {
      const query = `
        WITH difuntos_consolidados AS (
          -- Difuntos de la tabla difuntos_familia
          SELECT 
            'difuntos_familia' as fuente,
            df.id_difunto::text as id_difunto,
            df.nombre_completo,
            df.fecha_fallecimiento as fecha_aniversario,
            df.observaciones,
            f.apellido_familiar,
            f.telefono,
            f.direccion_familia,
            m.nombre_municipio,
            s.nombre as nombre_sector,
            p.nombre as nombre_parroquia
          FROM difuntos_familia df
          LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
          LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
          WHERE df.fecha_fallecimiento IS NOT NULL
          
          UNION ALL
          
          -- Difuntos de la tabla personas
          SELECT 
            'personas' as fuente,
            pe.id_personas::text as id_difunto,
            CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, '')) as nombre_completo,
            (pe.estudios::json->>'fecha_aniversario')::date as fecha_aniversario,
            pe.estudios::json->>'causa_fallecimiento' as observaciones,
            f.apellido_familiar,
            f.telefono,
            f.direccion_familia,
            m.nombre_municipio,
            s.nombre as nombre_sector,
            p.nombre as nombre_parroquia
          FROM personas pe
          LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
          LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
          WHERE pe.estudios IS NOT NULL 
            AND pe.estudios::json->>'es_fallecido' = 'true'
            AND pe.estudios::json->>'fecha_aniversario' IS NOT NULL
        )
        SELECT *,
          DATE_PART('day', 
            (DATE_TRUNC('year', CURRENT_DATE) + 
             INTERVAL '1 year' * 
             CASE WHEN EXTRACT(DOY FROM fecha_aniversario) < EXTRACT(DOY FROM CURRENT_DATE) 
                  THEN 1 ELSE 0 END +
             INTERVAL '1 day' * (EXTRACT(DOY FROM fecha_aniversario) - 1)) - CURRENT_DATE
          ) as dias_hasta_aniversario
        FROM difuntos_consolidados
        WHERE DATE_PART('day', 
          (DATE_TRUNC('year', CURRENT_DATE) + 
           INTERVAL '1 year' * 
           CASE WHEN EXTRACT(DOY FROM fecha_aniversario) < EXTRACT(DOY FROM CURRENT_DATE) 
                THEN 1 ELSE 0 END +
           INTERVAL '1 day' * (EXTRACT(DOY FROM fecha_aniversario) - 1)) - CURRENT_DATE
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
   * Consulta ambas fuentes de datos
   */
  async buscarPorNombre(nombreBusqueda, limite = 50) {
    try {
      // PASO 1: Buscar en difuntos_familia
      const difuntosFamilia = await sequelize.query(`
        SELECT 
          'difuntos_familia' as fuente,
          df.id_difunto::text as id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento as fecha_aniversario,
          df.observaciones,
          f.apellido_familiar,
          f.telefono,
          f.direccion_familia,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          p.nombre as nombre_parroquia
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
        WHERE df.nombre_completo ILIKE :nombreBusqueda
      `, {
        replacements: { nombreBusqueda: `%${nombreBusqueda}%` },
        type: QueryTypes.SELECT
      });

      // PASO 2: Buscar en personas fallecidas
      const personasFallecidas = await sequelize.query(`
        SELECT 
          'personas' as fuente,
          pe.id_personas::text as id_difunto,
          TRIM(CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, ''))) as nombre_completo,
          (pe.estudios::json->>'fecha_aniversario')::date as fecha_aniversario,
          pe.estudios::json->>'causa_fallecimiento' as observaciones,
          f.apellido_familiar,
          f.telefono,
          f.direccion_familia,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          p.nombre as nombre_parroquia
        FROM personas pe
        LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
        WHERE pe.estudios IS NOT NULL 
          AND pe.estudios LIKE '%es_fallecido%'
          AND pe.estudios::json->>'es_fallecido' = 'true'
          AND TRIM(CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, ''))) ILIKE :nombreBusqueda
      `, {
        replacements: { nombreBusqueda: `%${nombreBusqueda}%` },
        type: QueryTypes.SELECT
      });

      // Combinar y limitar resultados
      const todosLosResultados = [...difuntosFamilia, ...personasFallecidas];
      
      // Ordenar por nombre y aplicar límite
      todosLosResultados.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
      
      return todosLosResultados.slice(0, limite);
      
    } catch (error) {
      console.error('❌ Error buscando por nombre:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de difuntos por sector
   * Consulta ambas fuentes de datos
   */
  async obtenerResumenPorSector() {
    try {
      const query = `
        WITH difuntos_consolidados AS (
          -- Difuntos de la tabla difuntos_familia
          SELECT 
            df.id_difunto,
            f.id_familia,
            s.nombre as nombre_sector
          FROM difuntos_familia df
          LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          
          UNION ALL
          
          -- Difuntos de la tabla personas
          SELECT 
            pe.id_personas,
            f.id_familia,
            s.nombre as nombre_sector
          FROM personas pe
          LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          WHERE pe.estudios IS NOT NULL 
            AND pe.estudios::json->>'es_fallecido' = 'true'
        )
        SELECT 
          COALESCE(nombre_sector, 'Sin sector') as sector,
          COUNT(id_difunto) as total_difuntos,
          COUNT(DISTINCT id_familia) as familias_con_difuntos
        FROM difuntos_consolidados
        GROUP BY nombre_sector
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
