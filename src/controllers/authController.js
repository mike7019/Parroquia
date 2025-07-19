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
      const { email, password, firstName, lastName, role } = req.body;
      
      const result = await authService.registerUser({
        email,
        password,
        firstName,
        lastName,
        role
      });

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please check your email to verify your account.',
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
      const { email, password } = req.body;
      
      const result = await authService.loginUser(email, password);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
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
}

export default new AuthController();
