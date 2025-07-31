import { Parroquia } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class ParroquiaService {
  /**
   * Create a new parroquia
   */
  async createParroquia(parroquiaData) {
    try {
      const parroquia = await Parroquia.create({
        nombre: parroquiaData.nombre
      });

      return parroquia;
    } catch (error) {
      throw new Error(`Error creating parroquia: ${error.message}`);
    }
  }

  /**
   * Get all parroquias with pagination and search
   */
  async getAllParroquias(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = null,
        sortBy = 'id_parroquia',
        sortOrder = 'ASC'
      } = options;

      const where = {};
      
      if (search) {
        where.nombre = { [Op.iLike]: `%${search}%` };
      }

      const offset = (page - 1) * limit;

      const result = await Parroquia.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        parroquias: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching parroquias: ${error.message}`);
    }
  }

  /**
   * Get parroquia by ID
   */
  async getParroquiaById(id) {
    try {
      const parroquia = await Parroquia.findByPk(id);

      if (!parroquia) {
        throw new Error('Parroquia not found');
      }

      return parroquia;
    } catch (error) {
      throw new Error(`Error fetching parroquia: ${error.message}`);
    }
  }

  /**
   * Update parroquia
   */
  async updateParroquia(id, updateData) {
    try {
      const parroquia = await Parroquia.findByPk(id);
      
      if (!parroquia) {
        throw new Error('Parroquia not found');
      }

      await parroquia.update({
        nombre: updateData.nombre || parroquia.nombre
      });

      return parroquia;
    } catch (error) {
      throw new Error(`Error updating parroquia: ${error.message}`);
    }
  }

  /**
   * Delete parroquia
   */
  async deleteParroquia(id) {
    try {
      const parroquia = await Parroquia.findByPk(id);
      
      if (!parroquia) {
        throw new Error('Parroquia not found');
      }

      // Check if parroquia has associated personas
      const personasCount = await Parroquia.count({
        include: [{
          association: 'personas',
          required: true
        }],
        where: { id_parroquia: id }
      });

      if (personasCount > 0) {
        throw new Error('Cannot delete parroquia: it has associated personas');
      }

      await parroquia.destroy();
      return { message: 'Parroquia deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting parroquia: ${error.message}`);
    }
  }

  /**
   * Get parroquia statistics
   */
  async getParroquiaStatistics() {
    try {
      const [
        totalParroquias,
        parroquiasWithPersonas,
        totalPersonas
      ] = await Promise.all([
        Parroquia.count(),
        Parroquia.count({
          include: [{
            association: 'personas',
            required: true
          }]
        }),
        Parroquia.findAll({
          attributes: [
            'id_parroquia',
            'nombre',
            [sequelize.fn('COUNT', sequelize.col('personas.id')), 'personasCount']
          ],
          include: [{
            association: 'personas',
            attributes: [],
            required: false
          }],
          group: ['Parroquia.id_parroquia', 'Parroquia.nombre'],
          raw: true
        })
      ]);

      return {
        totalParroquias,
        parroquiasWithPersonas,
        parroquiasWithoutPersonas: totalParroquias - parroquiasWithPersonas,
        detailedStats: totalPersonas
      };
    } catch (error) {
      throw new Error(`Error calculating parroquia statistics: ${error.message}`);
    }
  }

  /**
   * Search parroquias by name
   */
  async searchParroquias(searchTerm) {
    try {
      const parroquias = await Parroquia.findAll({
        where: {
          nombre: { [Op.iLike]: `%${searchTerm}%` }
        },
        order: [['nombre', 'ASC']],
        limit: 20
      });

      return parroquias;
    } catch (error) {
      throw new Error(`Error searching parroquias: ${error.message}`);
    }
  }
}

export default new ParroquiaService();
