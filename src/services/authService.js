import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import User from '../models/User.js';
import emailService from './emailService.js';
import { 
  AuthenticationError, 
  NotFoundError, 
  ConflictError, 
  ValidationError 
} from '../utils/errors.js';

/**
 * Authentication service handling all auth-related operations with transactions
 */
class AuthService {
  /**
   * Registers a new user with transaction handling
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User and token data
   */
  async registerUser(userData) {
    const { email, password, firstName, lastName, role = 'surveyor', phone } = userData;
    
    const transaction = await sequelize.transaction();
    
    try {
      // Check if user already exists (including soft-deleted users)
      const existingUser = await User.scope('withDeleted').findOne({ 
        where: { email } 
      });
      
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create user with transaction - password will be hashed automatically by model hook
      const user = await User.create({
        email: email.toLowerCase().trim(),
        password, // Will be hashed by beforeCreate hook
        firstName,
        lastName,
        role,
        phone,
        status: 'active',
        emailVerificationToken,
        isActive: true,
        emailVerified: false
      }, { transaction });

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Save refresh token
      await user.update({ refreshToken }, { transaction });

      // Commit transaction before attempting to send email
      await transaction.commit();

      // Send verification email (outside transaction to avoid rollback on email failure)
      try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
        console.log('🚀 Attempting to send verification email to:', user.email);
        const emailResult = await emailService.sendEmailVerificationEmail(user.email, `${user.firstName} ${user.lastName}`, verificationUrl);
        console.log('✅ Email sent successfully:', emailResult);
      } catch (emailError) {
        console.warn('⚠️ Email service warning:', emailError.message);
        console.warn('Error details:', emailError);
        // Don't throw - continue with successful registration
      }

      // Return user data without password
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return {
        user: userResponse,
        accessToken,
        refreshToken
      };

    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();
      
      if (error instanceof ConflictError) {
        throw error;
      }
      
      throw new ValidationError('Registration failed: ' + error.message);
    }
  }

  /**
   * Authenticates user login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and token data
   */
  async loginUser(email, password) {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated. Please contact administrator', 'ACCOUNT_DEACTIVATED');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new AuthenticationError('Email verification required. Please check your email and verify your account', 'EMAIL_NOT_VERIFIED');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Update last login and refresh token
    await user.update({
      lastLoginAt: new Date(),
      refreshToken
    });

    // Remove sensitive data from response
    const userResponse = this.sanitizeUserData(user);

    return {
      user: userResponse,
      accessToken,
      refreshToken
    };
  }

  /**
   * Logs out user by invalidating refresh token
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async logoutUser(userId) {
    await User.update(
      { refreshToken: null },
      { where: { id: userId } }
    );
    return true;
  }

  /**
   * Refreshes access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find user and verify refresh token
      const user = await User.findOne({
        where: {
          id: decoded.userId,
          refreshToken,
          isActive: true
        }
      });

      if (!user) {
        throw new AuthenticationError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user.id);

      return {
        accessToken: newAccessToken
      };
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Initiates password reset process
   * @param {string} email - User email
   * @returns {Promise<Object>} Success message
   */
  async initiatePasswordReset(email) {
    const user = await User.unscoped().findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpiry
    });

    // Send reset email
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      console.log('🔑 Attempting to send password reset email to:', user.email);
      const emailResult = await emailService.sendPasswordResetEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        resetUrl
      );
      console.log('✅ Password reset email sent successfully:', emailResult);
    } catch (emailError) {
      console.warn('⚠️ Password reset email service warning:', emailError.message);
      console.warn('Error details:', emailError);
      // Don't throw - continue with success message for security
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  /**
   * Validates password reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object>} Validation result
   */
  async validatePasswordResetToken(token) {
    const user = await User.unscoped().findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
    }

    return { 
      message: 'Token is valid', 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
  }

  /**
   * Resets user password using reset token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  async resetPassword(token, newPassword) {
    const user = await User.unscoped().findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
    }

    // Update password and clear reset token
    // The password will be automatically hashed by the beforeUpdate hook
    await user.update({
      password: newPassword, // Let the model hook handle the hashing
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null // Invalidate all sessions
    });

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Changes user password (authenticated)
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect', 'INCORRECT_PASSWORD');
    }

    // Update password and invalidate all sessions
    // The password will be automatically hashed by the beforeUpdate hook
    await user.update({
      password: newPassword, // Let the model hook handle the hashing
      refreshToken: null
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Verifies user email
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Success message
   */
  async verifyEmail(token) {
    const user = await User.unscoped().findOne({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      throw new AuthenticationError('Invalid verification token', 'INVALID_VERIFICATION_TOKEN');
    }

    await user.update({
      emailVerified: true,
      emailVerificationToken: null
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(
      user.email,
      `${user.firstName} ${user.lastName}`
    );

    return { message: 'Email verified successfully' };
  }

  /**
   * Gets user profile by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUserData(user);
  }

  /**
   * Updates user profile
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserProfile(userId, updateData) {
    const { firstName, lastName, email } = updateData;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictError('Email is already in use');
      }
    }

    const updatedUser = await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      // If email is changed, require re-verification
      emailVerified: email && email !== user.email ? false : user.emailVerified,
      emailVerificationToken: email && email !== user.email ? 
        crypto.randomBytes(32).toString('hex') : user.emailVerificationToken
    });

    // Send verification email if email was changed
    if (email && email !== user.email) {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${updatedUser.emailVerificationToken}`;
      await emailService.sendEmailVerificationEmail(
        updatedUser.email,
        `${updatedUser.firstName} ${updatedUser.lastName}`,
        verificationUrl
      );
    }

    return this.sanitizeUserData(updatedUser);
  }

  /**
   * Deactivates user account
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Success message
   */
  async deactivateUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({
      isActive: false,
      refreshToken: null
    });

    return { message: 'Account deactivated successfully' };
  }

  /**
   * Activates user account (admin only)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Success message
   */
  async activateUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({ isActive: true });

    return { message: 'Account activated successfully' };
  }

  /**
   * Generates access token
   * @param {number} userId - User ID
   * @returns {string} JWT access token
   */
  generateAccessToken(userId) {
    return jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  /**
   * Generates refresh token
   * @param {number} userId - User ID
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Gets all users with pagination and filters (admin only)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users list with pagination
   */
  async getAllUsers(options = {}) {
    const { page = 1, limit = 10, search, role, isActive } = options;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'emailVerificationToken'] }
    });

    const totalPages = Math.ceil(count / limit);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Removes sensitive data from user object
   * @param {Object} user - User object
   * @returns {Object} Sanitized user data
   */
  sanitizeUserData(user) {
    const userData = user.toJSON ? user.toJSON() : user;
    const {
      password,
      refreshToken,
      passwordResetToken,
      passwordResetExpires,
      emailVerificationToken,
      ...sanitizedUser
    } = userData;
    
    return sanitizedUser;
  }

  /**
   * Resends email verification
   * @param {string} email - User email
   * @returns {Promise<Object>} Success message
   */
  async resendEmailVerification(email) {
    const user = await User.unscoped().findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ConflictError('Email is already verified');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated. Please contact administrator', 'ACCOUNT_DEACTIVATED');
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    await user.update({ emailVerificationToken });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    await emailService.sendEmailVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationUrl
    );

    return { message: 'Verification email sent successfully. Please check your email' };
  }

  /**
   * Get verification token for development (DEVELOPMENT ONLY)
   * @param {string} email - User email
   * @returns {Promise<Object>} Token data
   */
  async getVerificationTokenForDev(email) {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('This method is only available in development mode');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email is already verified');
    }

    if (!user.emailVerificationToken) {
      throw new ValidationError('No verification token found for this user. Try requesting a new verification email.');
    }

    return {
      email: user.email,
      token: user.emailVerificationToken
    };
  }
}

export default new AuthService();
