import { DifuntosFamilia, Familias, Municipios, Veredas, Sector } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class DifuntosConsolidadoService {
  /**
   * Consulta consolidada de difuntos con filtros múltiples
   */
  async consultarDifuntos(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de difuntos...', filtros);
      
      const whereClause = {};
      const includeClause = [
        {
          model: Familias,
          as: 'familia',
          required: false,
          attributes: ['apellido_familiar', 'sector', 'telefono', 'direccion_familia', 'id_municipio', 'id_vereda', 'id_sector'],
          include: [
            {
              model: Municipios,
              as: 'municipio',
              required: false,
              attributes: ['nombre']
            },
            {
              model: Veredas,
              as: 'vereda',
              required: false,
              attributes: ['nombre']
            },
            {
              model: Sector,
              as: 'sector_info',
              required: false,
              attributes: ['nombre']
            }
          ]
        }
      ];

      // Filtrar por parentesco
      if (filtros.parentesco) {
        const parentescoLower = filtros.parentesco.toLowerCase();
        if (parentescoLower === 'madre') {
          whereClause[Op.or] = [
            { nombre_completo: { [Op.iRegexp]: '(madre|mamá|doña)' } },
            { observaciones: { [Op.iRegexp]: '(madre|mamá|doña)' } }
          ];
        } else if (parentescoLower === 'padre') {
          whereClause[Op.or] = [
            { nombre_completo: { [Op.iRegexp]: '(padre|papá|don)' } },
            { observaciones: { [Op.iRegexp]: '(padre|papá|don)' } }
          ];
        }
      }

      // Filtrar por fecha específica de aniversario
      if (filtros.fecha_aniversario) {
        whereClause.fecha_fallecimiento = filtros.fecha_aniversario;
      }

      // Filtrar por rango de fechas
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        whereClause.fecha_fallecimiento = {
          [Op.between]: [filtros.fecha_inicio, filtros.fecha_fin]
        };
      } else if (filtros.fecha_inicio) {
        whereClause.fecha_fallecimiento = {
          [Op.gte]: filtros.fecha_inicio
        };
      } else if (filtros.fecha_fin) {
        whereClause.fecha_fallecimiento = {
          [Op.lte]: filtros.fecha_fin
        };
      }

      // Filtrar por mes de aniversario
      if (filtros.mes_aniversario) {
        const mes = parseInt(filtros.mes_aniversario);
        if (mes >= 1 && mes <= 12) {
          whereClause[Op.and] = [
            sequelize.where(
              sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento')), 
              mes
            )
          ];
        }
      }

      // Filtrar por sector (en la familia)
      if (filtros.sector) {
        includeClause[0].where = {
          ...includeClause[0].where,
          [Op.or]: [
            { sector: { [Op.iLike]: `%${filtros.sector}%` } },
            { '$familia.sector_info.nombre$': { [Op.iLike]: `%${filtros.sector}%` } }
          ]
        };
        includeClause[0].required = true;
      }

      // Filtrar por municipio
      if (filtros.municipio) {
        includeClause[0].include[0].where = {
          nombre_municipio: { [Op.iLike]: `%${filtros.municipio}%` }
        };
        includeClause[0].include[0].required = true;
        includeClause[0].required = true;
      }

      // Ejecutar consulta
      const difuntos = await DifuntosFamilia.findAll({
        where: whereClause,
        include: includeClause,
        order: [['fecha_fallecimiento', 'DESC']],
        limit: filtros.limite || 100
      });

      // Formatear resultados
      const resultado = difuntos.map(difunto => {
        const añosFallecido = this.calcularAñosDesde(difunto.fecha_fallecimiento);
        const parentesco = this.inferirParentesco(difunto.nombre_completo, difunto.observaciones);
        
        return {
          id_difunto: difunto.id_difunto,
          nombre: difunto.nombre_completo,
          apellido_familiar: difunto.familia?.apellido_familiar || 'No especificado',
          parentesco: parentesco,
          fecha_aniversario: difunto.fecha_fallecimiento,
          fecha_fallecimiento: difunto.fecha_fallecimiento,
          sector: difunto.familia?.sector || difunto.familia?.sector_info?.nombre || 'No especificado',
          municipio: difunto.familia?.municipio?.nombre || 'No especificado',
          vereda: difunto.familia?.vereda?.nombre || 'No especificado',
          direccion: difunto.familia?.direccion_familia || 'No especificado',
          telefono: difunto.familia?.telefono || 'No especificado',
          años_fallecido: añosFallecido,
          observaciones: difunto.observaciones || '',
          familia: {
            apellido_familiar: difunto.familia?.apellido_familiar || 'No especificado',
            direccion: difunto.familia?.direccion_familia || 'No especificado',
            telefono: difunto.familia?.telefono || 'No especificado'
          }
        };
      });

      // Generar estadísticas
      const estadisticas = this.generarEstadisticasDifuntos(resultado);

      return {
        exito: true,
        mensaje: "Consulta de difuntos exitosa",
        datos: resultado,
        total: resultado.length,
        estadisticas: estadisticas,
        filtros_aplicados: filtros
      };

    } catch (error) {
      console.error('❌ Error en consulta de difuntos:', error);
      throw new Error(`Error al consultar difuntos: ${error.message}`);
    }
  }

  /**
   * Inferir parentesco a partir del nombre y observaciones
   */
  inferirParentesco(nombreCompleto, observaciones) {
    const texto = `${nombreCompleto || ''} ${observaciones || ''}`.toLowerCase();
    
    if (texto.includes('madre') || texto.includes('mamá') || texto.includes('doña')) {
      return 'Madre';
    } else if (texto.includes('padre') || texto.includes('papá') || texto.includes('don')) {
      return 'Padre';
    } else if (texto.includes('hijo') || texto.includes('hija')) {
      return 'Hijo/a';
    } else if (texto.includes('abuelo') || texto.includes('abuela')) {
      return 'Abuelo/a';
    } else if (texto.includes('hermano') || texto.includes('hermana')) {
      return 'Hermano/a';
    } else {
      return 'Familiar';
    }
  }

  /**
   * Calcular años transcurridos desde una fecha
   */
  calcularAñosDesde(fecha) {
    if (!fecha) return 'No especificada';
    
    const hoy = new Date();
    const fechaReferencia = new Date(fecha);
    let años = hoy.getFullYear() - fechaReferencia.getFullYear();
    const mesActual = hoy.getMonth();
    const mesReferencia = fechaReferencia.getMonth();
    
    if (mesActual < mesReferencia || (mesActual === mesReferencia && hoy.getDate() < fechaReferencia.getDate())) {
      años--;
    }
    
    return años;
  }

  /**
   * Generar estadísticas de los difuntos
   */
  generarEstadisticasDifuntos(difuntos) {
    const estadisticas = {
      por_parentesco: {},
      por_mes: {},
      por_año: {},
      por_municipio: {},
      por_sector: {}
    };

    difuntos.forEach(difunto => {
      // Por parentesco
      const parentesco = difunto.parentesco;
      estadisticas.por_parentesco[parentesco] = (estadisticas.por_parentesco[parentesco] || 0) + 1;

      // Por mes
      if (difunto.fecha_fallecimiento) {
        const fecha = new Date(difunto.fecha_fallecimiento);
        const mes = fecha.toLocaleString('es-ES', { month: 'long' });
        estadisticas.por_mes[mes] = (estadisticas.por_mes[mes] || 0) + 1;

        // Por año
        const año = fecha.getFullYear();
        estadisticas.por_año[año] = (estadisticas.por_año[año] || 0) + 1;
      }

      // Por municipio
      const municipio = difunto.municipio;
      if (municipio !== 'No especificado') {
        estadisticas.por_municipio[municipio] = (estadisticas.por_municipio[municipio] || 0) + 1;
      }

      // Por sector
      const sector = difunto.sector;
      if (sector !== 'No especificado') {
        estadisticas.por_sector[sector] = (estadisticas.por_sector[sector] || 0) + 1;
      }
    });

    return estadisticas;
  }

  /**
   * Obtener difuntos por aniversario próximo (útil para notificaciones)
   */
  async obtenerAniversariosProximos(dias = 30) {
    try {
      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(hoy.getDate() + dias);

      // Crear consulta para encontrar aniversarios en el rango de fechas
      const query = `
        SELECT df.*, f.apellido_familiar, f.telefono
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        WHERE 
          EXTRACT(month FROM df.fecha_fallecimiento) = EXTRACT(month FROM CURRENT_DATE)
          AND EXTRACT(day FROM df.fecha_fallecimiento) >= EXTRACT(day FROM CURRENT_DATE)
          AND EXTRACT(day FROM df.fecha_fallecimiento) <= EXTRACT(day FROM DATE_ADD(CURRENT_DATE, INTERVAL ${dias} DAY))
        ORDER BY EXTRACT(day FROM df.fecha_fallecimiento) ASC
      `;

      const [resultados] = await sequelize.query(query);
      
      return resultados.map(difunto => ({
        nombre: difunto.nombre_completo,
        apellido_familiar: difunto.apellido_familiar,
        fecha_aniversario: difunto.fecha_fallecimiento,
        días_hasta_aniversario: Math.ceil((new Date(difunto.fecha_fallecimiento).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)),
        telefono_familia: difunto.telefono
      }));

    } catch (error) {
      throw new Error(`Error al obtener aniversarios próximos: ${error.message}`);
    }
  }
}

export default new DifuntosConsolidadoService();
