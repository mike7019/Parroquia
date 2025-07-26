import express from 'express';
import authController from '../controllers/authController.js';
import authValidators from '../validators/authValidators.js';
import authMiddleware from '../middlewares/auth.js';
import validationMiddleware from '../middlewares/validation.js';

const router = express.Router();

// Public routes (no authentication required)

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registrar un nuevo usuario
 *     description: Crear una nueva cuenta de usuario con verificación por email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *           example:
 *             firstName: "Juan"
 *             lastName: "Pérez"
 *             email: "juan.perez@example.com"
 *             password: "MiPassword123!"
 *             role: "user"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         emailSent:
 *                           type: boolean
 *                           description: Si se envió el email de verificación
 *             example:
 *               status: "success"
 *               message: "Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta."
 *               data:
 *                 user:
 *                   id: 1
 *                   firstName: "Juan"
 *                   lastName: "Pérez"
 *                   email: "juan.perez@example.com"
 *                   role: "user"
 *                   isActive: true
 *                   emailVerified: false
 *                 emailSent: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "El email ya está registrado"
 *               code: "EMAIL_ALREADY_EXISTS"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/register', 
  authValidators.validateRegister,
  validationMiddleware.handleValidationErrors,
  authController.registerUser
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Iniciar sesión
 *     description: Autenticar usuario y devolver tokens JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: "juan.perez@example.com"
 *             password: "MiPassword123!"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TokenResponse'
 *             example:
 *               status: "success"
 *               message: "Login exitoso"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn: 900
 *                 user:
 *                   id: 1
 *                   firstName: "Juan"
 *                   lastName: "Pérez"
 *                   email: "juan.perez@example.com"
 *                   role: "user"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Email o contraseña incorrectos"
 *               code: "INVALID_CREDENTIALS"
 *       403:
 *         description: Cuenta inactiva o email no verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Cuenta inactiva. Contacta al administrador."
 *               code: "ACCOUNT_INACTIVE"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/login', 
  authValidators.validateLogin,
  validationMiddleware.handleValidationErrors,
  authController.loginUser
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Renovar token de acceso
 *     description: Obtener un nuevo token de acceso usando el refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de renovación válido
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         expiresIn:
 *                           type: integer
 *             example:
 *               status: "success"
 *               message: "Token renovado exitosamente"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn: 900
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Refresh token inválido o expirado"
 *               code: "INVALID_REFRESH_TOKEN"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/refresh-token',
  authValidators.validateRefreshToken,
  validationMiddleware.handleValidationErrors,
  authController.refreshAccessToken
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Solicitar recuperación de contraseña
 *     description: Iniciar proceso de recuperación de contraseña enviando email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario registrado
 *           example:
 *             email: "juan.perez@example.com"
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/forgot-password',
  authValidators.validateForgotPassword,
  validationMiddleware.handleValidationErrors,
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Restablecer contraseña
 *     description: Restablecer contraseña usando token de recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetInput'
 *           example:
 *             token: "abc123def456ghi789"
 *             newPassword: "NuevaPassword123!"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Contraseña restablecida exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Token de recuperación inválido o expirado"
 *               code: "INVALID_RESET_TOKEN"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// GET endpoint to validate reset token
router.get('/reset-password', authController.validateResetToken);

// POST endpoint to reset password
router.post('/reset-password',
  authValidators.validateResetPassword,
  validationMiddleware.handleValidationErrors,
  authController.resetPassword
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     tags: [Authentication]
 *     summary: Verificar dirección de email
 *     description: Verificar email del usuario usando token de verificación
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación de email
 *         example: "abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Email verificado exitosamente"
 *       400:
 *         description: Token requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Token de verificación requerido"
 *               code: "TOKEN_REQUIRED"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Token de verificación inválido"
 *               code: "INVALID_VERIFICATION_TOKEN"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/verify-email',
  authValidators.validateEmailVerification,
  validationMiddleware.handleValidationErrors,
  authController.verifyEmail
);

/**
 * @swagger
 * /api/auth/resend-verification-public:
 *   post:
 *     tags: [Authentication]
 *     summary: Reenviar email de verificación (público)
 *     description: Reenvía el email de verificación para usuarios que no han verificado su email. No requiere autenticación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Email de verificación reenviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Verification email sent successfully. Please check your email"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Validation failed"
 *               errors:
 *                 - field: "email"
 *                   message: "Please provide a valid email address"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "User not found"
 *               code: "NOT_FOUND"
 *       409:
 *         description: Email ya está verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Email is already verified"
 *               code: "CONFLICT"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/resend-verification-public',
  authValidators.validateResendVerificationPublic,
  validationMiddleware.handleValidationErrors,
  authController.resendEmailVerificationPublic
);

// Protected routes (authentication required)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Cerrar sesión
 *     description: Cerrar sesión del usuario e invalidar refresh token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Logout exitoso"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/logout',
  authMiddleware.authenticateToken,
  authController.logoutUser
);

/**
 * @swagger
 * /api/auth/change-password:
 *   patch:
 *     tags: [Authentication]
 *     summary: Cambiar contraseña
 *     description: Cambiar contraseña para usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *           example:
 *             currentPassword: "MiPasswordActual123!"
 *             newPassword: "MiNuevaPassword456!"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Contraseña cambiada exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Contraseña actual incorrecta o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Contraseña actual incorrecta"
 *               code: "INVALID_CURRENT_PASSWORD"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/change-password',
  authMiddleware.authenticateToken,
  authValidators.validateChangePassword,
  validationMiddleware.handleValidationErrors,
  authController.changePassword
);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     tags: [Authentication]
 *     summary: Reenviar verificación de email
 *     description: Reenviar enlace de verificación de email
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email de verificación reenviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Email de verificación reenviado"
 *       400:
 *         description: Email ya verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "El email ya está verificado"
 *               code: "EMAIL_ALREADY_VERIFIED"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/resend-verification',
  authMiddleware.authenticateToken,
  authController.resendEmailVerification
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener perfil de usuario actual
 *     description: Obtener el perfil del usuario actualmente autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               status: "success"
 *               message: "Perfil obtenido exitosamente"
 *               data:
 *                 user:
 *                   id: 1
 *                   firstName: "Juan"
 *                   lastName: "Pérez"
 *                   email: "juan.perez@example.com"
 *                   role: "user"
 *                   isActive: true
 *                   emailVerified: true
 *                   lastLogin: "2025-07-16T10:30:00.000Z"
 *                   createdAt: "2025-07-16T08:00:00.000Z"
 *                   updatedAt: "2025-07-16T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/profile',
  authMiddleware.authenticateToken,
  authController.getProfile
);

// Development only routes
if (process.env.NODE_ENV === 'development') {
  /**
   * @swagger
   * /api/auth/dev/get-verification-token:
   *   get:
   *     tags: [Development]
   *     summary: Obtener token de verificación (SOLO DESARROLLO)
   *     description: Endpoint para obtener el token de verificación de email en modo desarrollo
   *     parameters:
   *       - in: query
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *           format: email
   *         description: Email del usuario
   *     responses:
   *       200:
   *         description: Token de verificación obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         email:
   *                           type: string
   *                         token:
   *                           type: string
   *                         verificationUrl:
   *                           type: string
   *       400:
   *         $ref: '#/components/responses/BadRequestError'
   *       403:
   *         description: No disponible en producción
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   */
  router.get('/dev/get-verification-token',
    authController.getVerificationTokenDev
  );
}

export default router;
