import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';
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
      const users = await Usuario.findAll({
        attributes: { exclude: ['contrasena', 'token_recuperacion', 'token_verificacion_email', 'token_expiracion'] },
        order: [['created_at', 'DESC']]
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
      const user = await Usuario.findByPk(userId, {
        attributes: { exclude: ['contrasena', 'token_recuperacion', 'token_verificacion_email', 'token_expiracion'] }
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
      if (currentUser.role !== 'Administrador' && currentUser.id !== userId) {
        throw new UnauthorizedError('You can only edit your own profile');
      }

      // Find user to update
      const user = await Usuario.scope('withDeleted').findByPk(userId, { transaction });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if user is trying to update to deleted status (not allowed via this method)
      if (updateData.status === 'deleted' || updateData.activo === false) {
        throw new ValidationError('Use delete endpoint to remove users');
      }

      // Validate allowed fields for update and map to Spanish field names
      const allowedFields = ['firstName', 'lastName', 'email', 'role', 'phone'];
      const updateFields = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          // Only admin can change role
          if (field === 'role' && currentUser.role !== 'Administrador') {
            throw new UnauthorizedError('Only administrators can modify user roles');
          }
          
          // Map English field names to Spanish model field names
          switch (field) {
            case 'firstName':
              updateFields.primer_nombre = updateData[field];
              break;
            case 'lastName':
              updateFields.primer_apellido = updateData[field];
              break;
            case 'email':
              updateFields.correo_electronico = updateData[field];
              break;
            case 'phone':
              updateFields.telefono = updateData[field];
              break;
            case 'role':
              // Role will be handled through associations, not as a direct field
              // For now, we'll store it to handle later if needed
              updateFields._role = updateData[field];
              break;
          }
        }
      }

      // If email is being changed, check for conflicts
      if (updateFields.correo_electronico && updateFields.correo_electronico !== user.correo_electronico) {
        const existingUser = await Usuario.scope('withDeleted').findOne({
          where: {
            correo_electronico: updateFields.correo_electronico.toLowerCase().trim(),
            id: { [Op.ne]: userId }
          }
        }, { transaction });

        if (existingUser) {
          throw new ConflictError('Email already in use by another user');
        }
        
        // If email changes, mark as unverified
        updateFields.email_verificado = false;
        updateFields.correo_electronico = updateFields.correo_electronico.toLowerCase().trim();
      }

      // Remove the role field from update fields as it needs special handling
      delete updateFields._role;

      // Update user
      await user.update(updateFields, { transaction });

      // Commit transaction
      await transaction.commit();

      // Return updated user without sensitive data
      const updatedUser = await Usuario.findByPk(userId, {
        attributes: { exclude: ['contrasena', 'token_recuperacion', 'token_verificacion_email', 'token_expiracion'] }
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
      if (currentUser.role !== 'Administrador') {
        throw new UnauthorizedError('Only administrators can delete users');
      }

      // Prevent admin from deleting themselves
      if (currentUser.id === userId) {
        throw new ValidationError('You cannot delete your own account');
      }

      // Find user to delete
      const user = await Usuario.scope('withDeleted').findByPk(userId, { transaction });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (!user.activo) {
        throw new ValidationError('User is already deleted');
      }

      // Soft delete: change activo to false
      await user.update({
        activo: false,
        // Clear sensitive data
        token_recuperacion: null,
        token_verificacion_email: null,
        token_expiracion: null
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
      if (currentUser.role !== 'Administrador') {
        throw new UnauthorizedError('Only administrators can view deleted users');
      }

      const deletedUsers = await Usuario.scope('deleted').findAll({
        attributes: { exclude: ['contrasena', 'token_recuperacion', 'token_verificacion_email', 'token_expiracion'] },
        order: [['updated_at', 'DESC']]
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
