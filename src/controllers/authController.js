import authService from '../services/authService.js';

/**
 * Authentication controller handling all auth-related endpoints using ES6 modules
 */
class AuthController {
  /**
   * Register a new user
   */
  async registerUser(req, res, next) {
    try {
      const { 
        correo_electronico, 
        contrasena, 
        primer_nombre, 
        segundo_nombre, 
        primer_apellido, 
        segundo_apellido, 
        telefono,
        rol 
      } = req.body;
      
      const result = await authService.registerUser({
        correo_electronico,
        contrasena,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        telefono,
        rol
      });

      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente. Por favor revisa tu email para verificar tu cuenta.',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login
   */
  async loginUser(req, res, next) {
    try {
      const { correo_electronico, contrasena } = req.body;
      
      const result = await authService.loginUser(correo_electronico, contrasena);

      res.status(200).json({
        status: 'success',
        message: 'Login exitoso',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User logout
   */
  async logoutUser(req, res, next) {
    try {
      const userId = req.user.id;
      
      await authService.logoutUser(userId);

      res.status(200).json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      const result = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      const result = await authService.initiatePasswordReset(email);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate reset password token (GET endpoint)
   */
  async validateResetToken(req, res, next) {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({
          status: 'error',
          message: 'Reset token is required',
          code: 'MISSING_TOKEN'
        });
      }
      
      const result = await authService.validatePasswordResetToken(token);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: {
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      
      const result = await authService.resetPassword(token, newPassword);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      
      const result = await authService.verifyEmail(token);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend email verification (when user is logged in)
   */
  async resendEmailVerification(req, res, next) {
    try {
      const userId = req.user.id;
      
      // Get user email from database
      const user = await authService.getUserProfile(userId);
      const result = await authService.resendEmailVerification(user.email);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend email verification (public endpoint)
   */
  async resendEmailVerificationPublic(req, res, next) {
    try {
      const { email } = req.body;
      
      const result = await authService.resendEmailVerification(email);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res, next) {
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
   * Get verification token for development (DEVELOPMENT ONLY)
   */
  async getVerificationTokenDev(req, res, next) {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
          status: 'error',
          message: 'This endpoint is only available in development mode'
        });
      }

      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is required'
        });
      }

      const result = await authService.getVerificationTokenForDev(email);

      res.status(200).json({
        status: 'success',
        message: 'Verification token retrieved (DEVELOPMENT ONLY)',
        data: {
          email: result.email,
          token: result.token,
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${result.token}`
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
