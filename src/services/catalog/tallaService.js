/**
 * Servicio para Tallas - CRUD completo
 * Maneja tallas de zapatos, camisas y pantalones
 */
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class TallaService {
  constructor() {
    this.model = null;
  }

  // Método para obtener el modelo de forma lazy
  getModel() {
    if (!this.model) {
      this.model = sequelize.models.Talla;
      if (!this.model) {
        throw new Error('Modelo Talla no encontrado en sequelize.models');
      }
    }
    return this.model;
  }

  async getAllTallas(filters = {}) {
    try {
      const { search, tipo_prenda, genero, activo, page = 1, limit = 50 } = filters;
      const Talla = this.getModel();
      
      const whereClause = {};
      
      // Filtro por búsqueda en talla y descripción
      if (search) {
        whereClause[Op.or] = [
          { talla: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Filtro por tipo de prenda
      if (tipo_prenda) {
        whereClause.tipo_prenda = tipo_prenda;
      }
      
      // Filtro por género
      if (genero) {
        whereClause.genero = genero;
      }
      
      // Filtro por estado activo
      if (activo !== undefined) {
        whereClause.activo = activo === 'true' || activo === true;
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await Talla.findAndCountAll({
        where: whereClause,
        order: [
          ['tipo_prenda', 'ASC'],
          ['genero', 'ASC'],
          ['equivalencia_numerica', 'ASC'],
          ['talla', 'ASC']
        ],
        limit: parseInt(limit),
        offset: offset
      });

      return {
        tallas: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error en getAllTallas:', error);
      throw new Error(`Error al obtener las tallas: ${error.message}`);
    }
  }

  async getTallaById(id) {
    try {
      const Talla = this.getModel();
      const talla = await Talla.findByPk(id);
      
      if (!talla) {
        throw new Error('Talla no encontrada');
      }
      
      return talla;
    } catch (error) {
      console.error('Error en getTallaById:', error);
      throw error;
    }
  }

  async createTalla(tallaData) {
    try {
      const Talla = this.getModel();
      
      // Validaciones básicas
      if (!tallaData.tipo_prenda || !tallaData.talla) {
        throw new Error('Tipo de prenda y talla son campos obligatorios');
      }

      // Verificar si ya existe una talla igual
      const tallaExistente = await Talla.findOne({
        where: {
          tipo_prenda: tallaData.tipo_prenda,
          talla: tallaData.talla,
          genero: tallaData.genero || 'unisex'
        }
      });

      if (tallaExistente) {
        throw new Error('Ya existe una talla con esas características');
      }

      const nuevaTalla = await Talla.create({
        tipo_prenda: tallaData.tipo_prenda,
        talla: tallaData.talla,
        descripcion: tallaData.descripcion || null,
        genero: tallaData.genero || 'unisex',
        equivalencia_numerica: tallaData.equivalencia_numerica || null,
        activo: tallaData.activo !== undefined ? tallaData.activo : true
      });

      return nuevaTalla;
    } catch (error) {
      console.error('Error en createTalla:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe una talla con esas características');
      }
      throw error;
    }
  }

  async updateTalla(id, tallaData) {
    try {
      const Talla = this.getModel();
      const talla = await Talla.findByPk(id);
      
      if (!talla) {
        throw new Error('Talla no encontrada');
      }

      // Si se está actualizando tipo_prenda, talla o genero, verificar unicidad
      if (tallaData.tipo_prenda || tallaData.talla || tallaData.genero) {
        const whereClause = {
          tipo_prenda: tallaData.tipo_prenda || talla.tipo_prenda,
          talla: tallaData.talla || talla.talla,
          genero: tallaData.genero || talla.genero,
          id_talla: { [Op.ne]: id }
        };

        const tallaExistente = await Talla.findOne({ where: whereClause });
        if (tallaExistente) {
          throw new Error('Ya existe una talla con esas características');
        }
      }

      await talla.update(tallaData);
      return talla;
    } catch (error) {
      console.error('Error en updateTalla:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe una talla con esas características');
      }
      throw error;
    }
  }

  async deleteTalla(id) {
    try {
      const Talla = this.getModel();
      const talla = await Talla.findByPk(id);
      
      if (!talla) {
        throw new Error('Talla no encontrada');
      }

      // Soft delete - marcar como inactiva
      await talla.update({ activo: false });
      return { message: 'Talla eliminada exitosamente' };
    } catch (error) {
      console.error('Error en deleteTalla:', error);
      throw error;
    }
  }

  async getTallasByTipo(tipo_prenda, genero = null) {
    try {
      const Talla = this.getModel();
      const whereClause = {
        tipo_prenda: tipo_prenda,
        activo: true
      };

      if (genero) {
        whereClause[Op.or] = [
          { genero: genero },
          { genero: 'unisex' }
        ];
      }

      const tallas = await Talla.findAll({
        where: whereClause,
        order: [
          ['equivalencia_numerica', 'ASC'],
          ['talla', 'ASC']
        ]
      });

      return tallas;
    } catch (error) {
      console.error('Error en getTallasByTipo:', error);
      throw error;
    }
  }

  async getEstadisticas() {
    try {
      const Talla = this.getModel();
      
      const totalTallas = await Talla.count();
      const tallasActivas = await Talla.count({ where: { activo: true } });
      const tallasInactivas = totalTallas - tallasActivas;

      // Estadísticas por tipo de prenda
      const porTipoPrenda = await Talla.findAll({
        attributes: [
          'tipo_prenda',
          [sequelize.fn('COUNT', sequelize.col('id_talla')), 'cantidad']
        ],
        where: { activo: true },
        group: ['tipo_prenda'],
        raw: true
      });

      // Estadísticas por género
      const porGenero = await Talla.findAll({
        attributes: [
          'genero',
          [sequelize.fn('COUNT', sequelize.col('id_talla')), 'cantidad']
        ],
        where: { activo: true },
        group: ['genero'],
        raw: true
      });

      return {
        totalTallas,
        tallasActivas,
        tallasInactivas,
        porTipoPrenda,
        porGenero
      };
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      throw error;
    }
  }
}

// Crear instancia del servicio
const tallaService = new TallaService();

export default tallaService;
