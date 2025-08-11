import { Op } from 'sequelize';
import { Usuario } from '../models/index.js';
import sequelize from '../../config/sequelize.js';

/**
 * Service for generating reports and exports
 */
class ReportService {

  /**
   * Generate basic user statistics
   * @param {Object} filters - Filters to apply
   * @returns {Object} Statistics object
   */
  async generateBasicStatistics(filters = {}) {
    try {
      const whereConditions = this.buildUserWhereConditions(filters);

      // Basic user counts
      const totalUsers = await Usuario.count({ where: whereConditions });
      const activeUsers = await Usuario.count({ 
        where: { ...whereConditions, activo: true } 
      });
      const inactiveUsers = await Usuario.count({ 
        where: { ...whereConditions, activo: false } 
      });

      // Role distribution
      const roleStats = await Usuario.findAll({
        where: whereConditions,
        attributes: [
          'tipo_usuario',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['tipo_usuario']
      });

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleDistribution: roleStats.map(stat => ({
          role: stat.tipo_usuario,
          count: parseInt(stat.getDataValue('count'))
        }))
      };
    } catch (error) {
      console.error('Error generating basic statistics:', error);
      throw new Error('Failed to generate statistics');
    }
  }

  /**
   * Build where conditions from filters for users
   * @param {Object} filters - Filters object
   * @returns {Object} Sequelize where conditions
   */
  buildUserWhereConditions(filters) {
    const conditions = {};

    if (filters.active !== undefined) {
      conditions.activo = filters.active;
    }

    if (filters.role) {
      conditions.tipo_usuario = filters.role;
    }

    if (filters.email) {
      conditions.email = { [Op.iLike]: `%${filters.email}%` };
    }

    if (filters.name) {
      conditions.nombre = { [Op.iLike]: `%${filters.name}%` };
    }

    return conditions;
  }
}

const reportService = new ReportService();

export default reportService;
