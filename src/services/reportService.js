import { Op } from 'sequelize';
// Temporarily disabled English models - using only User for auth
import { User } from '../models/index.js';
// import { Survey, FamilyMember, User } from '../models/index.js';
import sequelize from '../../config/sequelize.js';

/**
 * Service for generating reports and exports
 */
class ReportService {

  /**
   * Generate advanced statistics
   * @param {Object} filters - Filters to apply
   * @returns {Object} Statistics object
   */
  async generateAdvancedStatistics(filters = {}) {
    try {
      const whereConditions = this.buildWhereConditions(filters);

      // Basic counts
      const totalSurveys = await Survey.count({ where: whereConditions });
      const completedSurveys = await Survey.count({ 
        where: { ...whereConditions, status: 'completed' } 
      });
      const inProgressSurveys = await Survey.count({ 
        where: { ...whereConditions, status: 'in_progress' } 
      });
      const cancelledSurveys = await Survey.count({ 
        where: { ...whereConditions, status: 'cancelled' } 
      });

      // Family and members stats
      const familySizeResult = await Survey.findAll({
        where: whereConditions,
        attributes: [
          [sequelize.fn('SUM', sequelize.col('familySize')), 'totalFamilies'],
          [sequelize.fn('AVG', sequelize.col('familySize')), 'averageSize'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'surveyCount']
        ]
      });

      const totalMembers = await FamilyMember.count({
        include: [{
          model: Survey,
          where: whereConditions,
          attributes: []
        }]
      });

      // Progress statistics
      const progressResult = await Survey.findAll({
        where: whereConditions,
        attributes: [
          [sequelize.fn('AVG', sequelize.col('progress')), 'averageProgress']
        ]
      });

      return {
        totalSurveys,
        completedSurveys,
        inProgressSurveys,
        cancelledSurveys,
        draftSurveys: totalSurveys - completedSurveys - inProgressSurveys - cancelledSurveys,
        totalFamilies: familySizeResult[0]?.getDataValue('totalFamilies') || 0,
        totalMembers,
        averageFamilySize: parseFloat(familySizeResult[0]?.getDataValue('averageSize') || 0).toFixed(2),
        averageProgress: parseFloat(progressResult[0]?.getDataValue('averageProgress') || 0).toFixed(2),
        completionRate: totalSurveys > 0 ? ((completedSurveys / totalSurveys) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error generating advanced statistics:', error);
      throw new Error('Failed to generate statistics');
    }
  }

  /**
   * Build where conditions from filters
   * @param {Object} filters - Filters object
   * @returns {Object} Sequelize where conditions
   */
  buildWhereConditions(filters) {
    const conditions = {};

    if (filters.status) {
      conditions.status = filters.status;
    }

    if (filters.sector) {
      conditions.sector = { [Op.iLike]: `%${filters.sector}%` };
    }

    if (filters.userId) {
      conditions.userId = filters.userId;
    }

    if (filters.dateFrom) {
      conditions.createdAt = conditions.createdAt || {};
      conditions.createdAt[Op.gte] = new Date(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.createdAt = conditions.createdAt || {};
      conditions.createdAt[Op.lte] = new Date(filters.dateTo);
    }

    if (filters.familyHead) {
      conditions.familyHead = { [Op.iLike]: `%${filters.familyHead}%` };
    }

    return conditions;
  }
}

const reportService = new ReportService();

export default reportService;
