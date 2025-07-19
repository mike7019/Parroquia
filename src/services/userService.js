const { User } = require('../models');
const { Op } = require('sequelize');

class UserService {
  async getAllUsers(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      const whereClause = search ? {
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      } : {};

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      await user.update(updateData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      await user.destroy();
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async deactivateUser(id) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      await user.update({ isActive: false });
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
