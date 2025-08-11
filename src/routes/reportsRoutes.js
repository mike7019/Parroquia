import express from 'express';
import { getBasicStatistics, getDashboardStats } from '../controllers/reportsController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports/statistics/basic:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener estadísticas básicas de usuarios
 *     description: Retorna estadísticas básicas de los usuarios del sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por usuarios activos/inactivos
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Administrador, Encuestador]
 *         description: Filtrar por rol de usuario
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrar por email (búsqueda parcial)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nombre (búsqueda parcial)
 *     responses:
 *       200:
 *         description: Estadísticas básicas obtenidas exitosamente
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
 *                         totalUsers:
 *                           type: integer
 *                           description: Total de usuarios
 *                           example: 25
 *                         activeUsers:
 *                           type: integer
 *                           description: Usuarios activos
 *                           example: 20
 *                         inactiveUsers:
 *                           type: integer
 *                           description: Usuarios inactivos
 *                           example: 5
 *                         roleDistribution:
 *                           type: array
 *                           description: Distribución por roles
 *                           items:
 *                             type: object
 *                             properties:
 *                               role:
 *                                 type: string
 *                                 example: "Administrador"
 *                               count:
 *                                 type: integer
 *                                 example: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics/basic',
  authMiddleware.authenticate,
  getBasicStatistics
);

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener estadísticas para dashboard
 *     description: Retorna estadísticas formateadas para mostrar en el dashboard principal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por usuarios activos/inactivos
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Administrador, Encuestador]
 *         description: Filtrar por rol de usuario
 *     responses:
 *       200:
 *         description: Estadísticas del dashboard obtenidas exitosamente
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
 *                         overview:
 *                           type: object
 *                           properties:
 *                             totalUsers:
 *                               type: integer
 *                               example: 25
 *                             activeUsers:
 *                               type: integer
 *                               example: 20
 *                             inactiveUsers:
 *                               type: integer
 *                               example: 5
 *                             activationRate:
 *                               type: string
 *                               example: "80.00"
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               role:
 *                                 type: string
 *                                 example: "Administrador"
 *                               count:
 *                                 type: integer
 *                                 example: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard',
  authMiddleware.authenticate,
  getDashboardStats
);

export default router;
