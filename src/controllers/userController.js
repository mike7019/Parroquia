import UserService from '../services/userService.js';
import AuthService from '../services/authService.js';
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError,
  UnauthorizedError 
} from '../utils/errors.js';

/**
 * User controller handling user management operations with CRUD support
 */
class UserController {
  /**
   * Get all active users (Admin only)
   */
  static async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      
      res.status(200).json({
        status: 'success',
        message: 'Users retrieved successfully',
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      res.status(200).json({
        status: 'success',
        message: 'User retrieved successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user information (Admin can edit any user, users can edit themselves)
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUser = req.user;

      const updatedUser = await UserService.updateUser(id, updateData, currentUser);
      
      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete user (Admin only)
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      await UserService.deleteUser(id, currentUser);
      
      res.status(204).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all deleted users (Admin only)
   */
  static async getDeletedUsers(req, res, next) {
    try {
      const currentUser = req.user;
      const deletedUsers = await UserService.getDeletedUsers(currentUser);
      
      res.status(200).json({
        status: 'success',
        message: 'Deleted users retrieved successfully',
        data: { users: deletedUsers }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserById(userId);

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
