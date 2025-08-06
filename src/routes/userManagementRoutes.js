import express from 'express';
import UserController from '../controllers/userController.js';
import UserValidators from '../validators/userValidators.js';
import AuthMiddleware from '../middlewares/auth.js';
import validationMiddleware from '../middlewares/validation.js';

const router = express.Router();

/**
 * User management routes with proper authentication and authorization
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios activos
 *     description: Recupera una lista de todos los usuarios activos del sistema (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/users - Get all active users (Admin only)
router.get('/', 
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireRole(['admin']),
  UserController.getAllUsers
);

/**
 * @swagger
 * /api/users/deleted:
 *   get:
 *     summary: Obtener usuarios eliminados
 *     description: Recupera una lista de todos los usuarios eliminados (soft delete) del sistema (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios eliminados obtenida exitosamente
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/users/deleted - Get all soft-deleted users (Admin only)
router.get('/deleted',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireRole(['admin']),
  UserController.getDeletedUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Recupera un usuario específico por su ID (administrador o propietario)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario (UUID)
 *         example: "31cb8fe4-bb24-4ad8-af66-d8c900d13c2a"
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
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/users/:id - Get user by ID (Admin or owner)
router.get('/:id',
  UserValidators.validateUserId(),
  validationMiddleware.handleValidationErrors,
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireOwnershipOrAdmin,
  UserController.getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario existente (administrador o propietario)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario (UUID)
 *         example: "31cb8fe4-bb24-4ad8-af66-d8c900d13c2a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *           example:
 *             firstName: "Juan Carlos"
 *             lastName: "Pérez García"
 *             email: "juan.carlos@yopmail.com"
 *             role: "surveyor"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// PUT /api/users/:id - Update user (Admin or owner)
router.put('/:id',
  UserValidators.updateUser(),
  validationMiddleware.handleValidationErrors,
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireOwnershipOrAdmin,
  UserController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema (soft delete - solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario (UUID)
 *         example: "31cb8fe4-bb24-4ad8-af66-d8c900d13c2a"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       nullable: true
 *                       example: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// DELETE /api/users/:id - Soft delete user (Admin only)
router.delete('/:id',
  UserValidators.validateUserId(),
  validationMiddleware.handleValidationErrors,
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireRole(['admin']),
  UserController.deleteUser
);

export default router;
