import authService from '../services/authService.js';

/**
 * User controller handling user management operations using ES6 modules
 */
class UserController {
  /**
   * Get current user profile
   */
  async getCurrentUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.getUserProfile(userId);

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with pagination (admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, role, isActive } = req.query;
      
      const filters = {};
      if (search) filters.search = search;
      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await authService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        ...filters
      });

      res.status(200).json({
        status: 'success',
        message: 'Usuarios obtenidos exitosamente',
        data: {
          users: result.users,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedUser = await authService.updateUserProfile(userId, updateData);

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await authService.getUserProfile(parseInt(id));

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate user account (admin only)
   */
  async deactivateUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await authService.deactivateUser(parseInt(id));

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate user account (admin only)
   */
  async activateUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await authService.activateUser(parseInt(id));

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
