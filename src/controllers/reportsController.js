import reportService from '../services/reportService.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Get basic user statistics
 */
export const getBasicStatistics = async (req, res, next) => {
  try {
    const filters = extractUserFilters(req.query);
    
    const statistics = await reportService.generateBasicStatistics(filters);
    
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
 * Get dashboard summary statistics for users
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const filters = extractUserFilters(req.query);
    
    const stats = await reportService.generateBasicStatistics(filters);
    
    // Format for dashboard display
    const dashboardData = {
      overview: {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        inactiveUsers: stats.inactiveUsers,
        activationRate: stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(2) : 0
      },
      roles: stats.roleDistribution
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
 * Extract and validate filters from query parameters for users
 * @param {Object} query - Request query parameters
 * @returns {Object} Validated filters
 */
function extractUserFilters(query) {
  const filters = {};

  // Active/inactive filter
  if (query.active !== undefined) {
    filters.active = query.active === 'true';
  }

  // Role filter
  if (query.role) {
    const validRoles = ['Administrador', 'Encuestador'];
    if (validRoles.includes(query.role)) {
      filters.role = query.role;
    } else {
      throw new ValidationError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
  }

  // Email filter
  if (query.email) {
    filters.email = query.email;
  }

  // Name filter
  if (query.name) {
    filters.name = query.name;
  }

  return filters;
}
