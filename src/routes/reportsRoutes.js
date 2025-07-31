import express from 'express';
import { getAdvancedStatistics, getDashboardStats } from '../controllers/reportsController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports/statistics/advanced:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener estadísticas avanzadas
 *     description: Retorna estadísticas detalladas de las encuestas con métricas avanzadas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, in_progress, completed, cancelled]
 *         description: Filtrar por estado de la encuesta
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por encuestador
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Estadísticas avanzadas obtenidas exitosamente
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
 *                         totalSurveys:
 *                           type: integer
 *                           description: Total de encuestas
 *                           example: 150
 *                         completedSurveys:
 *                           type: integer
 *                           description: Encuestas completadas
 *                           example: 45
 *                         inProgressSurveys:
 *                           type: integer
 *                           description: Encuestas en progreso
 *                           example: 80
 *                         cancelledSurveys:
 *                           type: integer
 *                           description: Encuestas canceladas
 *                           example: 5
 *                         totalFamilies:
 *                           type: integer
 *                           description: Total de familias
 *                           example: 600
 *                         totalMembers:
 *                           type: integer
 *                           description: Total de miembros
 *                           example: 2400
 *                         averageFamilySize:
 *                           type: string
 *                           description: Tamaño promedio de familia
 *                           example: "4.2"
 *                         averageProgress:
 *                           type: string
 *                           description: Progreso promedio
 *                           example: "65.5"
 *                         completionRate:
 *                           type: string
 *                           description: Tasa de finalización
 *                           example: "30.0"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics/advanced',
  authMiddleware.authenticate,
  getAdvancedStatistics
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, in_progress, completed, cancelled]
 *         description: Filtrar por estado de la encuesta
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por encuestador
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
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
 *                             totalSurveys:
 *                               type: integer
 *                               example: 150
 *                             completedSurveys:
 *                               type: integer
 *                               example: 45
 *                             inProgressSurveys:
 *                               type: integer
 *                               example: 80
 *                             completionRate:
 *                               type: number
 *                               example: 30.0
 *                         family:
 *                           type: object
 *                           properties:
 *                             totalFamilies:
 *                               type: integer
 *                               example: 600
 *                             totalMembers:
 *                               type: integer
 *                               example: 2400
 *                             averageFamilySize:
 *                               type: number
 *                               example: 4.2
 *                         progress:
 *                           type: object
 *                           properties:
 *                             averageProgress:
 *                               type: number
 *                               example: 65.5
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
