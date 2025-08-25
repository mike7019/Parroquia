import DifuntosFamilia from '../models/catalog/DifuntosFamilia.js';
import Familias from '../models/catalog/Familias.js';
import Veredas from '../models/catalog/Veredas.js';
import Municipios from '../models/catalog/Municipios.js';
import Sector from '../models/catalog/Sector.js';
import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class DifuntosService {
  /**
   * Obtener consulta de madres difuntas
   */
  async getMadresDifuntas(filters = {}) {
    try {
      const whereClause = {};
      
      // Consulta simple sin incluir asociaciones por ahora
      const difuntos = await DifuntosFamilia.findAll({
        where: whereClause,
        order: [['fecha_fallecimiento', 'DESC']],
        limit: 10
      });

      return {
        success: true,
        data: difuntos,
        total: difuntos.length,
        filters: filters
      };

      /*
      const includeClause = [
        {
          model: Familias,
          as: 'familia',
          required: true,
          include: [
            {
              model: Veredas,
              as: 'vereda',
              required: false
            },
            {
              model: Sector,
              as: 'sector_info',
              required: false
            }
          ]
        }
      ];

      // Filtros opcionales
      if (filters.sector) {
        includeClause[0].where = {
          sector: {
            [Op.iLike]: `%${filters.sector}%`
          }
        };
      }

      if (filters.apellido_familiar) {
        includeClause[0].where = {
          ...includeClause[0].where,
          apellido_familiar: {
            [Op.iLike]: `%${filters.apellido_familiar}%`
          }
        };
      }*/

      if (filters.nombre) {
        whereClause.nombre_completo = {
          [Op.iLike]: `%${filters.nombre}%`
        };
      }

      if (filters.fecha_aniversario) {
        const fecha = new Date(filters.fecha_aniversario);
        const mes = fecha.getMonth() + 1;
        const dia = fecha.getDate();
        
        whereClause[Op.and] = [
          sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento')), mes),
          sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('day FROM fecha_fallecimiento')), dia)
        ];
      }

      // Filtro específico para madres (basado en nombre o observaciones)
      whereClause[Op.or] = [
        { nombre_completo: { [Op.iRegexp]: '(madre|mamá|doña)' } },
        { observaciones: { [Op.iRegexp]: '(madre|mamá|doña)' } }
      ];

      const difuntas = await DifuntosFamilia.findAll({
        where: whereClause,
        include: includeClause,
        order: [['fecha_fallecimiento', 'DESC']],
        attributes: [
          'id_difunto',
          'nombre_completo',
          'fecha_fallecimiento',
          'observaciones'
        ]
      });

      // Formatear respuesta
      return difuntas.map(difunta => ({
        sector_vereda: difunta.familia?.vereda?.nombre || difunta.familia?.sector || 'No especificado',
        apellido_familiar: difunta.familia?.apellido_familiar || 'No especificado',
        parentesco: 'Madre',
        nombre: difunta.nombre_completo,
        fecha_aniversario: difunta.fecha_fallecimiento
      }));

    } catch (error) {
      throw new Error(`Error al obtener madres difuntas: ${error.message}`);
    }
  }

  /**
   * Obtener consulta de padres difuntos
   */
  async getPadresDifuntos(filters = {}) {
    try {
      const whereClause = {};
      const includeClause = [
        {
          model: Familias,
          as: 'familia',
          required: true,
          include: [
            {
              model: Veredas,
              as: 'vereda',
              required: false
            },
            {
              model: Sector,
              as: 'sector_info',
              required: false
            }
          ]
        }
      ];

      // Filtros opcionales
      if (filters.sector) {
        includeClause[0].where = {
          sector: {
            [Op.iLike]: `%${filters.sector}%`
          }
        };
      }

      if (filters.apellido_familiar) {
        includeClause[0].where = {
          ...includeClause[0].where,
          apellido_familiar: {
            [Op.iLike]: `%${filters.apellido_familiar}%`
          }
        };
      }

      if (filters.nombre) {
        whereClause.nombre_completo = {
          [Op.iLike]: `%${filters.nombre}%`
        };
      }

      if (filters.fecha_aniversario) {
        const fecha = new Date(filters.fecha_aniversario);
        const mes = fecha.getMonth() + 1;
        const dia = fecha.getDate();
        
        whereClause[Op.and] = [
          sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento')), mes),
          sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('day FROM fecha_fallecimiento')), dia)
        ];
      }

      // Filtro específico para padres (basado en nombre o observaciones)
      whereClause[Op.or] = [
        { nombre_completo: { [Op.iRegexp]: '(padre|papá|don)' } },
        { observaciones: { [Op.iRegexp]: '(padre|papá|don)' } }
      ];

      const difuntos = await DifuntosFamilia.findAll({
        where: whereClause,
        include: includeClause,
        order: [['fecha_fallecimiento', 'DESC']],
        attributes: [
          'id_difunto',
          'nombre_completo',
          'fecha_fallecimiento',
          'observaciones'
        ]
      });

      // Formatear respuesta
      return difuntos.map(difunto => ({
        sector_vereda: difunto.familia?.vereda?.nombre || difunto.familia?.sector || 'No especificado',
        apellido_familiar: difunto.familia?.apellido_familiar || 'No especificado',
        parentesco: 'Padre',
        nombre: difunto.nombre_completo,
        fecha_aniversario: difunto.fecha_fallecimiento
      }));

    } catch (error) {
      throw new Error(`Error al obtener padres difuntos: ${error.message}`);
    }
  }

  /**
   * Obtener consulta de todos los difuntos
   */
  async getTodosDifuntos(filters = {}) {
    try {
      const whereClause = {};
      const includeClause = [
        {
          model: Familias,
          as: 'familia',
          required: true,
          include: [
            {
              model: Veredas,
              as: 'vereda',
              required: false
            },
            {
              model: Sector,
              as: 'sector_info',
              required: false
            }
          ]
        }
      ];

      // Filtros opcionales
      if (filters.sector) {
        includeClause[0].where = {
          sector: {
            [Op.iLike]: `%${filters.sector}%`
          }
        };
      }

      if (filters.apellido_familiar) {
        includeClause[0].where = {
          ...includeClause[0].where,
          apellido_familiar: {
            [Op.iLike]: `%${filters.apellido_familiar}%`
          }
        };
      }

      if (filters.nombre) {
        whereClause.nombre_completo = {
          [Op.iLike]: `%${filters.nombre}%`
        };
      }

      if (filters.fecha_aniversario) {
        const fecha = new Date(filters.fecha_aniversario);
        const mes = fecha.getMonth() + 1;
        const dia = fecha.getDate();
        
        whereClause[Op.and] = [
          sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento')), mes),
          sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('day FROM fecha_fallecimiento')), dia)
        ];
      }

      const difuntos = await DifuntosFamilia.findAll({
        where: whereClause,
        include: includeClause,
        order: [['fecha_fallecimiento', 'DESC']],
        attributes: [
          'id_difunto',
          'nombre_completo',
          'fecha_fallecimiento',
          'observaciones'
        ]
      });

      // Formatear respuesta
      return difuntos.map(difunto => {
        // Determinar parentesco basado en el nombre o observaciones
        let parentesco = 'Familiar';
        const nombre = difunto.nombre_completo.toLowerCase();
        const obs = (difunto.observaciones || '').toLowerCase();
        
        if (nombre.includes('madre') || nombre.includes('mamá') || nombre.includes('doña') ||
            obs.includes('madre') || obs.includes('mamá') || obs.includes('doña')) {
          parentesco = 'Madre';
        } else if (nombre.includes('padre') || nombre.includes('papá') || nombre.includes('don') ||
                   obs.includes('padre') || obs.includes('papá') || obs.includes('don')) {
          parentesco = 'Padre';
        } else if (nombre.includes('hijo') || nombre.includes('hija') ||
                   obs.includes('hijo') || obs.includes('hija')) {
          parentesco = 'Hijo/a';
        } else if (nombre.includes('abuelo') || nombre.includes('abuela') ||
                   obs.includes('abuelo') || obs.includes('abuela')) {
          parentesco = 'Abuelo/a';
        }

        return {
          sector_vereda: difunto.familia?.vereda?.nombre || difunto.familia?.sector || 'No especificado',
          apellido_familiar: difunto.familia?.apellido_familiar || 'No especificado',
          parentesco: parentesco,
          nombre: difunto.nombre_completo,
          fecha_aniversario: difunto.fecha_fallecimiento
        };
      });

    } catch (error) {
      throw new Error(`Error al obtener todos los difuntos: ${error.message}`);
    }
  }

  /**
   * Obtener consulta de difuntos por rango de fechas
   */
  async getDifuntosPorRangoFechas(fechaInicio, fechaFin, filters = {}) {
    try {
      const whereClause = {};
      const includeClause = [
        {
          model: Familias,
          as: 'familia',
          required: true,
          include: [
            {
              model: Veredas,
              as: 'vereda',
              required: false
            },
            {
              model: Sector,
              as: 'sector_info',
              required: false
            }
          ]
        }
      ];

      // Filtro por rango de fechas
      if (fechaInicio && fechaFin) {
        whereClause.fecha_fallecimiento = {
          [Op.between]: [fechaInicio, fechaFin]
        };
      } else if (fechaInicio) {
        whereClause.fecha_fallecimiento = {
          [Op.gte]: fechaInicio
        };
      } else if (fechaFin) {
        whereClause.fecha_fallecimiento = {
          [Op.lte]: fechaFin
        };
      }

      // Filtros opcionales
      if (filters.sector) {
        includeClause[0].where = {
          sector: {
            [Op.iLike]: `%${filters.sector}%`
          }
        };
      }

      if (filters.apellido_familiar) {
        includeClause[0].where = {
          ...includeClause[0].where,
          apellido_familiar: {
            [Op.iLike]: `%${filters.apellido_familiar}%`
          }
        };
      }

      if (filters.nombre) {
        whereClause.nombre_completo = {
          [Op.iLike]: `%${filters.nombre}%`
        };
      }

      const difuntos = await DifuntosFamilia.findAll({
        where: whereClause,
        include: includeClause,
        order: [['fecha_fallecimiento', 'DESC']],
        attributes: [
          'id_difunto',
          'nombre_completo',
          'fecha_fallecimiento',
          'observaciones'
        ]
      });

      // Formatear respuesta
      return difuntos.map(difunto => {
        // Determinar parentesco basado en el nombre o observaciones
        let parentesco = 'Familiar';
        const nombre = difunto.nombre_completo.toLowerCase();
        const obs = (difunto.observaciones || '').toLowerCase();
        
        if (nombre.includes('madre') || nombre.includes('mamá') || nombre.includes('doña') ||
            obs.includes('madre') || obs.includes('mamá') || obs.includes('doña')) {
          parentesco = 'Madre';
        } else if (nombre.includes('padre') || nombre.includes('papá') || nombre.includes('don') ||
                   obs.includes('padre') || obs.includes('papá') || obs.includes('don')) {
          parentesco = 'Padre';
        } else if (nombre.includes('hijo') || nombre.includes('hija') ||
                   obs.includes('hijo') || obs.includes('hija')) {
          parentesco = 'Hijo/a';
        } else if (nombre.includes('abuelo') || nombre.includes('abuela') ||
                   obs.includes('abuelo') || obs.includes('abuela')) {
          parentesco = 'Abuelo/a';
        }

        return {
          sector_vereda: difunto.familia?.vereda?.nombre || difunto.familia?.sector || 'No especificado',
          apellido_familiar: difunto.familia?.apellido_familiar || 'No especificado',
          parentesco: parentesco,
          nombre: difunto.nombre_completo,
          fecha_aniversario: difunto.fecha_fallecimiento
        };
      });

    } catch (error) {
      throw new Error(`Error al obtener difuntos por rango de fechas: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de difuntos
   */
  async getEstadisticasDifuntos() {
    try {
      const total = await DifuntosFamilia.count();
      
      const difuntosPorMes = await DifuntosFamilia.findAll({
        attributes: [
          [sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento')), 'mes'],
          [sequelize.fn('COUNT', sequelize.col('id_difunto')), 'cantidad']
        ],
        group: [sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento'))],
        order: [[sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento')), 'ASC']]
      });

      const difuntosPorAño = await DifuntosFamilia.findAll({
        attributes: [
          [sequelize.fn('EXTRACT', sequelize.literal('year FROM fecha_fallecimiento')), 'año'],
          [sequelize.fn('COUNT', sequelize.col('id_difunto')), 'cantidad']
        ],
        group: [sequelize.fn('EXTRACT', sequelize.literal('year FROM fecha_fallecimiento'))],
        order: [[sequelize.fn('EXTRACT', sequelize.literal('year FROM fecha_fallecimiento')), 'DESC']]
      });

      return {
        total,
        por_mes: difuntosPorMes,
        por_año: difuntosPorAño
      };

    } catch (error) {
      throw new Error(`Error al obtener estadísticas de difuntos: ${error.message}`);
    }
  }
}

export default new DifuntosService();
