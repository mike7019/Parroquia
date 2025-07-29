import reportService from '../services/reportService.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Get advanced statistics
 */
export const getAdvancedStatistics = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    
    const statistics = await reportService.generateAdvancedStatistics(filters);
    
    res.json({
      status: 'success',
      message: 'Estadísticas generadas exitosamente',
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard summary statistics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    
    const stats = await reportService.generateAdvancedStatistics(filters);
    
    // Format for dashboard display
    const dashboardData = {
      overview: {
        totalSurveys: stats.totalSurveys,
        completedSurveys: stats.completedSurveys,
        inProgressSurveys: stats.inProgressSurveys,
        completionRate: parseFloat(stats.completionRate)
      },
      family: {
        totalFamilies: stats.totalFamilies,
        totalMembers: stats.totalMembers,
        averageFamilySize: parseFloat(stats.averageFamilySize)
      },
      progress: {
        averageProgress: parseFloat(stats.averageProgress)
      }
    };
    
    res.json({
      status: 'success',
      message: 'Estadísticas del dashboard obtenidas exitosamente',
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Extract and validate filters from query parameters
 * @param {Object} query - Request query parameters
 * @returns {Object} Validated filters
 */
function extractFilters(query) {
  const filters = {};

  // Status filter
  if (query.status) {
    const validStatuses = ['draft', 'in_progress', 'completed', 'cancelled'];
    if (validStatuses.includes(query.status)) {
      filters.status = query.status;
    } else {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Sector filter
  if (query.sector) {
    filters.sector = query.sector;
  }

  // User ID filter
  if (query.userId) {
    const userId = parseInt(query.userId);
    if (isNaN(userId)) {
      throw new ValidationError('Invalid userId. Must be a number.');
    }
    filters.userId = userId;
  }

  // Date range filters
  if (query.dateFrom) {
    const dateFrom = new Date(query.dateFrom);
    if (isNaN(dateFrom.getTime())) {
      throw new ValidationError('Invalid dateFrom. Must be a valid date.');
    }
    filters.dateFrom = dateFrom;
  }

  if (query.dateTo) {
    const dateTo = new Date(query.dateTo);
    if (isNaN(dateTo.getTime())) {
      throw new ValidationError('Invalid dateTo. Must be a valid date.');
    }
    filters.dateTo = dateTo;
  }

  // Family head filter
  if (query.familyHead) {
    filters.familyHead = query.familyHead;
  }

  return filters;
}
