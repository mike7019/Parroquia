import { DifuntosFamilia } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class DifuntosConsolidadoService {
  /**
   * Consulta consolidada de difuntos con filtros múltiples - Versión SQL Directa
   */
  async consultarDifuntos(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de difuntos...', filtros);

      // Construir condiciones WHERE dinámicas
      let whereConditions = ['1=1'];
      
      if (filtros.parentesco) {
        // Inferir parentesco por nombre y observaciones
        if (filtros.parentesco.toLowerCase().includes('madre')) {
          whereConditions.push(`(df.nombre_completo ILIKE '%madre%' OR df.nombre_completo ILIKE '%mamá%' OR df.nombre_completo ILIKE '%doña%' OR df.observaciones ILIKE '%madre%')`);
        } else if (filtros.parentesco.toLowerCase().includes('padre')) {
          whereConditions.push(`(df.nombre_completo ILIKE '%padre%' OR df.nombre_completo ILIKE '%papá%' OR df.nombre_completo ILIKE '%don%' OR df.observaciones ILIKE '%padre%')`);
        }
      }

      if (filtros.fecha_aniversario) {
        whereConditions.push(`df.fecha_fallecimiento::date = '${filtros.fecha_aniversario}'`);
      }

      if (filtros.fecha_inicio && filtros.fecha_fin) {
        whereConditions.push(`df.fecha_fallecimiento BETWEEN '${filtros.fecha_inicio}' AND '${filtros.fecha_fin}'`);
      }

      if (filtros.mes_aniversario) {
        const mes = parseInt(filtros.mes_aniversario);
        if (mes >= 1 && mes <= 12) {
          whereConditions.push(`EXTRACT(month FROM df.fecha_fallecimiento) = ${mes}`);
        }
      }

      if (filtros.municipio) {
        whereConditions.push(`m.nombre_municipio ILIKE '%${filtros.municipio}%'`);
      }

      if (filtros.sector) {
        whereConditions.push(`(f.sector ILIKE '%${filtros.sector}%' OR v.nombre ILIKE '%${filtros.sector}%')`);
      }

      const limit = filtros.limite || 100;

      const query = `
        SELECT 
          df.id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento,
          df.observaciones,
          COALESCE(f.apellido_familiar, '') as apellido_familiar,
          COALESCE(m.nombre_municipio, '') as municipio,
          COALESCE(v.nombre, f.sector, '') as sector,
          EXTRACT(year FROM AGE(CURRENT_DATE, df.fecha_fallecimiento)) as años_fallecido,
          EXTRACT(month FROM df.fecha_fallecimiento) as mes_aniversario,
          EXTRACT(day FROM df.fecha_fallecimiento) as dia_aniversario
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY df.fecha_fallecimiento DESC, df.nombre_completo
        LIMIT ${limit}
      `;

      console.log('🔍 Ejecutando consulta difuntos:', query);
      const [difuntos] = await sequelize.query(query);

      // Formatear resultados
      const resultado = difuntos.map(difunto => ({
        id_difunto: difunto.id_difunto,
        nombre: difunto.nombre_completo,
        apellido_familiar: difunto.apellido_familiar,
        parentesco: this.inferirParentesco(difunto.nombre_completo, difunto.observaciones),
        fecha_aniversario: difunto.fecha_fallecimiento,
        años_fallecido: difunto.años_fallecido,
        municipio: difunto.municipio,
        sector: difunto.sector,
        observaciones: difunto.observaciones,
        mes_aniversario: difunto.mes_aniversario,
        dia_aniversario: difunto.dia_aniversario
      }));

      // Generar estadísticas
      const estadisticas = this.generarEstadisticasDifuntos(resultado);

      return {
        exito: true,
        mensaje: `Se encontraron ${resultado.length} difuntos`,
        datos: resultado,
        total: resultado.length,
        estadisticas,
        filtros_aplicados: filtros
      };

    } catch (error) {
      console.error('❌ Error en consulta de difuntos:', error);
      throw new Error(`Error al consultar difuntos: ${error.message}`);
    }
  }

  /**
   * Obtener aniversarios próximos
   */
  async obtenerAniversariosProximos(dias = 30) {
    try {
      const query = `
        SELECT 
          df.id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento,
          COALESCE(f.apellido_familiar, '') as apellido_familiar,
          COALESCE(m.nombre_municipio, '') as municipio,
          EXTRACT(year FROM AGE(CURRENT_DATE, df.fecha_fallecimiento)) as años_fallecido,
          -- Calcular días hasta el próximo aniversario
          CASE 
            WHEN EXTRACT(month FROM df.fecha_fallecimiento) = EXTRACT(month FROM CURRENT_DATE)
                 AND EXTRACT(day FROM df.fecha_fallecimiento) >= EXTRACT(day FROM CURRENT_DATE)
            THEN EXTRACT(day FROM df.fecha_fallecimiento) - EXTRACT(day FROM CURRENT_DATE)
            WHEN EXTRACT(month FROM df.fecha_fallecimiento) > EXTRACT(month FROM CURRENT_DATE)
            THEN DATE_PART('day', 
                   DATE(EXTRACT(year FROM CURRENT_DATE) || '-' || 
                        EXTRACT(month FROM df.fecha_fallecimiento) || '-' || 
                        EXTRACT(day FROM df.fecha_fallecimiento)) - CURRENT_DATE)
            ELSE DATE_PART('day', 
                   DATE((EXTRACT(year FROM CURRENT_DATE) + 1) || '-' || 
                        EXTRACT(month FROM df.fecha_fallecimiento) || '-' || 
                        EXTRACT(day FROM df.fecha_fallecimiento)) - CURRENT_DATE)
          END as dias_hasta_aniversario
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        ORDER BY dias_hasta_aniversario
        LIMIT 50
      `;

      const [aniversarios] = await sequelize.query(query);
      
      // Filtrar solo los que están dentro del rango de días
      const aniversariosFiltrados = aniversarios.filter(a => a.dias_hasta_aniversario <= dias);

      return aniversariosFiltrados.map(aniv => ({
        id_difunto: aniv.id_difunto,
        nombre: aniv.nombre_completo,
        apellido_familiar: aniv.apellido_familiar,
        fecha_aniversario: aniv.fecha_fallecimiento,
        días_hasta_aniversario: aniv.dias_hasta_aniversario,
        años_fallecido: aniv.años_fallecido,
        municipio: aniv.municipio
      }));

    } catch (error) {
      console.error('❌ Error en aniversarios próximos:', error);
      throw new Error(`Error al obtener aniversarios: ${error.message}`);
    }
  }

  /**
   * Inferir parentesco basado en nombre y observaciones
   */
  inferirParentesco(nombreCompleto, observaciones = '') {
    const texto = `${nombreCompleto} ${observaciones}`.toLowerCase();
    
    if (texto.includes('madre') || texto.includes('mamá') || texto.includes('doña')) {
      return 'Madre';
    }
    if (texto.includes('padre') || texto.includes('papá') || texto.includes('don')) {
      return 'Padre';
    }
    if (texto.includes('hijo') || texto.includes('hija')) {
      return 'Hijo/a';
    }
    if (texto.includes('abuelo') || texto.includes('abuela')) {
      return 'Abuelo/a';
    }
    if (texto.includes('hermano') || texto.includes('hermana')) {
      return 'Hermano/a';
    }
    
    return 'Familiar';
  }

  /**
   * Generar estadísticas de difuntos
   */
  generarEstadisticasDifuntos(difuntos) {
    const estadisticas = {
      total: difuntos.length,
      por_parentesco: {},
      por_mes: {},
      por_año: {},
      por_municipio: {},
      por_sector: {}
    };

    difuntos.forEach(difunto => {
      // Por parentesco
      const parentesco = difunto.parentesco || 'No especificado';
      estadisticas.por_parentesco[parentesco] = (estadisticas.por_parentesco[parentesco] || 0) + 1;

      // Por mes
      const mes = difunto.mes_aniversario || 'No especificado';
      estadisticas.por_mes[mes] = (estadisticas.por_mes[mes] || 0) + 1;

      // Por año
      const año = new Date(difunto.fecha_aniversario).getFullYear();
      estadisticas.por_año[año] = (estadisticas.por_año[año] || 0) + 1;

      // Por municipio
      const municipio = difunto.municipio || 'No especificado';
      estadisticas.por_municipio[municipio] = (estadisticas.por_municipio[municipio] || 0) + 1;

      // Por sector
      const sector = difunto.sector || 'No especificado';
      estadisticas.por_sector[sector] = (estadisticas.por_sector[sector] || 0) + 1;
    });

    return estadisticas;
  }
}

export default new DifuntosConsolidadoService();
