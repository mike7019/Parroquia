import express from 'express';
import userController from '../controllers/userController.js';
import authValidators from '../validators/authValidators.js';
import authMiddleware from '../middlewares/auth.js';
import validationMiddleware from '../middlewares/validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operaciones de gestión de usuarios
 */

// Protected routes - User profile management

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/profile',
  authMiddleware.authenticateToken,
  userController.getCurrentUserProfile
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar perfil de usuario actual
 *     description: Actualizar el perfil del usuario actualmente autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Primer nombre del usuario
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Apellido del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico (debe ser único)
 *           example:
 *             firstName: "Juan Carlos"
 *             lastName: "Pérez González"
 *             email: "juan.carlos@example.com"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
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
 *               message: "Perfil actualizado exitosamente"
 *               data:
 *                 user:
 *                   id: 1
 *                   firstName: "Juan Carlos"
 *                   lastName: "Pérez González"
 *                   email: "juan.carlos@example.com"
 *                   role: "user"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Email ya registrado por otro usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "El email ya está registrado por otro usuario"
 *               code: "EMAIL_ALREADY_EXISTS"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/profile',
  authMiddleware.authenticateToken,
  authValidators.validateUpdateProfile,
  validationMiddleware.handleValidationErrors,
  userController.updateUserProfile
);

// Protected routes - Admin only user management

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar todos los usuarios
 *     description: Obtener lista paginada de todos los usuarios (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user, moderator]
 *         description: Filtrar por rol
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *                             totalItems:
 *                               type: integer
 *                             itemsPerPage:
 *                               type: integer
 *             example:
 *               status: "success"
 *               message: "Usuarios obtenidos exitosamente"
 *               data:
 *                 users:
 *                   - id: 1
 *                     firstName: "Juan"
 *                     lastName: "Pérez"
 *                     email: "juan.perez@example.com"
 *                     role: "user"
 *                     isActive: true
 *                     emailVerified: true
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 5
 *                   totalItems: 47
 *                   itemsPerPage: 10
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin']),
  userController.getAllUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     description: Obtener un usuario específico por su ID (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
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
 *               message: "Usuario obtenido exitosamente"
 *               data:
 *                 user:
 *                   id: 1
 *                   firstName: "Juan"
 *                   lastName: "Pérez"
 *                   email: "juan.perez@example.com"
 *                   role: "user"
 *                   isActive: true
 *                   emailVerified: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin']),
  authValidators.validateUserId,
  validationMiddleware.handleValidationErrors,
  userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Desactivar cuenta de usuario
 *     description: Desactivar una cuenta de usuario (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a desactivar
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario desactivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Usuario desactivado exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Usuario ya está desactivado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "El usuario ya está desactivado"
 *               code: "USER_ALREADY_INACTIVE"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/deactivate',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin']),
  authValidators.validateUserId,
  validationMiddleware.handleValidationErrors,
  userController.deactivateUser
);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     tags: [Users]
 *     summary: Activar cuenta de usuario
 *     description: Activar una cuenta de usuario (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a activar
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario activado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "success"
 *               message: "Usuario activado exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Usuario ya está activado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "El usuario ya está activado"
 *               code: "USER_ALREADY_ACTIVE"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/activate',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['admin']),
  authValidators.validateUserId,
  validationMiddleware.handleValidationErrors,
  userController.activateUser
);

export default router;
