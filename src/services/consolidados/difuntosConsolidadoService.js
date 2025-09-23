import { DifuntosFamilia, Familias, Municipios, Veredas, Sector } from '../../models/index.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class DifuntosConsolidadoService {
  /**
   * Consulta consolidada de difuntos con filtros múltiples
   * Consulta tanto difuntos_familia como personas fallecidas
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} filtros.id_parroquia - ID de la parroquia
   * @param {number} filtros.id_municipio - ID del municipio
   * @param {number} filtros.id_sector - ID del sector
   * @param {string} filtros.parentesco - Tipo de parentesco (Madre, Padre, etc.)
   * @param {string} filtros.fecha_inicio - Fecha de inicio del rango (YYYY-MM-DD)
   * @param {string} filtros.fecha_fin - Fecha de fin del rango (YYYY-MM-DD)
   */
  async consultarDifuntos(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de difuntos...', filtros);
      
      // Construir condiciones WHERE para filtros por ID
      const whereConditions = [];
      const replacements = {};
      
      if (filtros.id_parroquia) {
        whereConditions.push('p.id_parroquia = :id_parroquia');
        replacements.id_parroquia = filtros.id_parroquia;
      }
      
      if (filtros.id_municipio) {
        whereConditions.push('m.id_municipio = :id_municipio');
        replacements.id_municipio = filtros.id_municipio;
      }
      
      if (filtros.id_sector) {
        whereConditions.push('s.id_sector = :id_sector');
        replacements.id_sector = filtros.id_sector;
      }
      
      // Filtro de rango de fechas
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        whereConditions.push('df.fecha_fallecimiento BETWEEN :fecha_inicio AND :fecha_fin');
        replacements.fecha_inicio = filtros.fecha_inicio;
        replacements.fecha_fin = filtros.fecha_fin;
      } else if (filtros.fecha_inicio) {
        whereConditions.push('df.fecha_fallecimiento >= :fecha_inicio');
        replacements.fecha_inicio = filtros.fecha_inicio;
      } else if (filtros.fecha_fin) {
        whereConditions.push('df.fecha_fallecimiento <= :fecha_fin');
        replacements.fecha_fin = filtros.fecha_fin;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
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
          m.id_municipio,
          m.nombre_municipio,
          s.id_sector,
          s.nombre as nombre_sector,
          v.id_vereda,
          v.nombre as nombre_vereda,
          p.id_parroquia,
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
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        ${whereClause}
      `, { 
        type: QueryTypes.SELECT,
        replacements 
      });

      console.log(`📊 Difuntos en tabla difuntos_familia: ${difuntosFamilia.length}`);

      // Construir condiciones WHERE para personas fallecidas (mismos filtros)
      const whereConditionsPersonas = ['pe.estudios IS NOT NULL', 
                                      'pe.estudios LIKE \'%es_fallecido%\'',
                                      'pe.estudios::json->>\'es_fallecido\' = \'true\''];
      
      if (filtros.id_parroquia) {
        whereConditionsPersonas.push('p.id_parroquia = :id_parroquia');
      }
      
      if (filtros.id_municipio) {
        whereConditionsPersonas.push('m.id_municipio = :id_municipio');
      }
      
      if (filtros.id_sector) {
        whereConditionsPersonas.push('s.id_sector = :id_sector');
      }
      
      // Filtro de rango de fechas para personas
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        whereConditionsPersonas.push('(pe.estudios::json->>\'fecha_aniversario\')::date BETWEEN :fecha_inicio AND :fecha_fin');
      } else if (filtros.fecha_inicio) {
        whereConditionsPersonas.push('(pe.estudios::json->>\'fecha_aniversario\')::date >= :fecha_inicio');
      } else if (filtros.fecha_fin) {
        whereConditionsPersonas.push('(pe.estudios::json->>\'fecha_aniversario\')::date <= :fecha_fin');
      }
      
      const whereClausePersonas = `WHERE ${whereConditionsPersonas.join(' AND ')}`;

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
          m.id_municipio,
          m.nombre_municipio,
          s.id_sector,
          s.nombre as nombre_sector,
          v.id_vereda,
          v.nombre as nombre_vereda,
          p.id_parroquia,
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
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        ${whereClausePersonas}
      `, { 
        type: QueryTypes.SELECT,
        replacements 
      });

      console.log(`� Personas fallecidas en tabla personas: ${personasFallecidas.length}`);

      // PASO 3: Combinar resultados
      const todosLosDifuntos = [...difuntosFamilia, ...personasFallecidas];
      
      // PASO 4: Aplicar filtro de parentesco si se proporciona (filtro post-consulta para mayor precisión)
      let difuntosFiltrados = todosLosDifuntos;
      
      if (filtros.parentesco) {
        const parentescoNormalizado = filtros.parentesco.toLowerCase().trim();
        difuntosFiltrados = difuntosFiltrados.filter(difunto => {
          const parentescoInferido = difunto.parentesco_inferido.toLowerCase();
          const nombreCompleto = difunto.nombre_completo.toLowerCase();
          const observaciones = (difunto.observaciones || '').toLowerCase();
          
          switch (parentescoNormalizado) {
            case 'madre':
            case 'madres':
              return parentescoInferido === 'madre' || 
                     nombreCompleto.includes('madre') ||
                     nombreCompleto.includes('mamá') ||
                     observaciones.includes('madre');
                     
            case 'padre':
            case 'padres':
              return parentescoInferido === 'padre' ||
                     nombreCompleto.includes('padre') ||
                     nombreCompleto.includes('papá') ||
                     observaciones.includes('padre');
                     
            case 'familiar':
            case 'familiares':
              return parentescoInferido === 'familiar';
              
            default:
              // Si no coincide con tipos conocidos, buscar en el parentesco inferido
              return parentescoInferido.includes(parentescoNormalizado);
          }
        });
        
        console.log(`🔍 Filtro parentesco '${filtros.parentesco}': ${difuntosFiltrados.length} de ${todosLosDifuntos.length} difuntos`);
      }

      // Ordenar por fecha de aniversario descendente (más recientes primero)
      difuntosFiltrados.sort((a, b) => {
        if (!a.fecha_aniversario && !b.fecha_aniversario) return 0;
        if (!a.fecha_aniversario) return 1;
        if (!b.fecha_aniversario) return -1;
        return new Date(b.fecha_aniversario) - new Date(a.fecha_aniversario);
      });
      
      console.log('✅ Consulta consolidada de difuntos exitosa:', {
        difuntos_familia: difuntosFamilia.length,
        personas_fallecidas: personasFallecidas.length,
        total_encontrados: todosLosDifuntos.length,
        despues_filtros: difuntosFiltrados.length,
        filtros_aplicados: {
          id_parroquia: filtros.id_parroquia || 'todos',
          id_municipio: filtros.id_municipio || 'todos',
          id_sector: filtros.id_sector || 'todos',
          parentesco: filtros.parentesco || 'todos',
          rango_fechas: filtros.fecha_inicio && filtros.fecha_fin ? 
            `${filtros.fecha_inicio} a ${filtros.fecha_fin}` : 'sin rango'
        }
      });
      
      return {
        exito: true,
        mensaje: `Consulta de difuntos completada exitosamente. ${difuntosFiltrados.length} registros encontrados.`,
        datos: difuntosFiltrados,
        total: difuntosFiltrados.length,
        total_sin_filtros: todosLosDifuntos.length,
        estadisticas: {
          difuntos_familia: difuntosFamilia.length,
          personas_fallecidas: personasFallecidas.length,
          filtros_aplicados: filtros
        }
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
          LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
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
          LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
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
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
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
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
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
