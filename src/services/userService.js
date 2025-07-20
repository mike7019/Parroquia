import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import User from '../models/User.js';
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError,
  UnauthorizedError 
} from '../utils/errors.js';

/**
 * User management service with CRUD operations and soft delete support
 */
class UserService {
  /**
   * Get all active users
   * @returns {Promise<Array>} Array of users
   */
  static async getAllUsers() {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password', 'refreshToken', 'emailVerificationToken', 'passwordResetToken'] },
        order: [['createdAt', 'DESC']]
      });
      
      return users;
    } catch (error) {
      throw new ValidationError('Failed to retrieve users: ' + error.message);
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  static async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'refreshToken', 'emailVerificationToken', 'passwordResetToken'] }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ValidationError('Failed to retrieve user: ' + error.message);
    }
  }

  /**
   * Update user information with transaction handling
   * @param {number} userId - User ID to update
   * @param {Object} updateData - Data to update
   * @param {Object} currentUser - User making the request (for authorization)
   * @returns {Promise<Object>} Updated user
   */
  static async updateUser(userId, updateData, currentUser) {
    const transaction = await sequelize.transaction();
    
    try {
      // Authorization: Only admin can edit any user, users can only edit themselves
      if (currentUser.role !== 'admin' && currentUser.id !== parseInt(userId)) {
        throw new UnauthorizedError('You can only edit your own profile');
      }

      // Find user to update
      const user = await User.scope('withDeleted').findByPk(userId, { transaction });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if user is trying to update to deleted status (not allowed via this method)
      if (updateData.status === 'deleted') {
        throw new ValidationError('Use delete endpoint to remove users');
      }

      // Validate allowed fields for update
      const allowedFields = ['firstName', 'lastName', 'email', 'role', 'status'];
      const updateFields = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          // Only admin can change role and status
          if ((field === 'role' || field === 'status') && currentUser.role !== 'admin') {
            throw new UnauthorizedError('Only administrators can modify user roles or status');
          }
          updateFields[field] = updateData[field];
        }
      }

      // If email is being changed, check for conflicts
      if (updateFields.email && updateFields.email !== user.email) {
        const existingUser = await User.scope('withDeleted').findOne({
          where: {
            email: updateFields.email.toLowerCase().trim(),
            id: { [Op.ne]: userId }
          }
        }, { transaction });

        if (existingUser) {
          throw new ConflictError('Email already in use by another user');
        }
        
        // If email changes, mark as unverified
        updateFields.emailVerified = false;
        updateFields.email = updateFields.email.toLowerCase().trim();
      }

      // Update user
      await user.update(updateFields, { transaction });

      // Commit transaction
      await transaction.commit();

      // Return updated user without sensitive data
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'refreshToken', 'emailVerificationToken', 'passwordResetToken'] }
      });

      return updatedUser;

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      
      if (error instanceof NotFoundError || 
          error instanceof ConflictError || 
          error instanceof UnauthorizedError) {
        throw error;
      }
      
      throw new ValidationError('Failed to update user: ' + error.message);
    }
  }

  /**
   * Soft delete user (change status to 'deleted')
   * @param {number} userId - User ID to delete
   * @param {Object} currentUser - User making the request (for authorization)
   * @returns {Promise<void>}
   */
  static async deleteUser(userId, currentUser) {
    const transaction = await sequelize.transaction();
    
    try {
      // Authorization: Only admin can delete users
      if (currentUser.role !== 'admin') {
        throw new UnauthorizedError('Only administrators can delete users');
      }

      // Prevent admin from deleting themselves
      if (currentUser.id === parseInt(userId)) {
        throw new ValidationError('You cannot delete your own account');
      }

      // Find user to delete
      const user = await User.scope('withDeleted').findByPk(userId, { transaction });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.status === 'deleted') {
        throw new ValidationError('User is already deleted');
      }

      // Soft delete: change status to 'deleted'
      await user.update({
        status: 'deleted',
        isActive: false,
        // Clear sensitive data
        refreshToken: null,
        emailVerificationToken: null,
        passwordResetToken: null
      }, { transaction });

      // Commit transaction
      await transaction.commit();

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      
      if (error instanceof NotFoundError || 
          error instanceof UnauthorizedError || 
          error instanceof ValidationError) {
        throw error;
      }
      
      throw new ValidationError('Failed to delete user: ' + error.message);
    }
  }

  /**
   * Get all deleted users (Admin only)
   * @param {Object} currentUser - User making the request
   * @returns {Promise<Array>} Array of deleted users
   */
  static async getDeletedUsers(currentUser) {
    try {
      // Authorization: Only admin can view deleted users
      if (currentUser.role !== 'admin') {
        throw new UnauthorizedError('Only administrators can view deleted users');
      }

      const deletedUsers = await User.scope('deleted').findAll({
        attributes: { exclude: ['password', 'refreshToken', 'emailVerificationToken', 'passwordResetToken'] },
        order: [['updatedAt', 'DESC']]
      });
      
      return deletedUsers;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new ValidationError('Failed to retrieve deleted users: ' + error.message);
    }
  }
}

export default UserService;
