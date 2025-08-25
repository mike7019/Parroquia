import express from 'express';
import difuntosController from '../controllers/difuntosController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DifuntoConsulta:
 *       type: object
 *       properties:
 *         sector_vereda:
 *           type: string
 *           description: Sector o Vereda del difunto
 *           example: "Vereda La Esperanza"
 *         apellido_familiar:
 *           type: string
 *           description: Apellido familiar
 *           example: "García"
 *         parentesco:
 *           type: string
 *           description: Parentesco del difunto
 *           example: "Madre"
 *         nombre:
 *           type: string
 *           description: Nombre completo del difunto
 *           example: "María García Sánchez"
 *         fecha_aniversario:
 *           type: string
 *           format: date
 *           description: Fecha de fallecimiento
 *           example: "2020-03-15"
 *     
 *     DifuntosConsultaResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 consultas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DifuntoConsulta'
 *                 total:
 *                   type: integer
 *                   description: Total de registros encontrados
 *                   example: 15
 *                 filtros_aplicados:
 *                   type: object
 *                   description: Filtros aplicados en la consulta
 */

/**
 * @swagger
 * /api/difuntos/consultas/madres:
 *   get:
 *     summary: Consulta por madres difuntas
 *     description: Obtiene una lista de madres difuntas con información de sector, familia y fecha de aniversario
 *     tags: [Difuntos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector o vereda
 *         example: "La Esperanza"
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "García"
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del difunto
 *         example: "María"
 *       - in: query
 *         name: fecha_aniversario
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha específica de aniversario
 *         example: "2020-03-15"
 *     responses:
 *       200:
 *         description: Consulta de madres difuntas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DifuntosConsultaResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/consultas/madres',
  authMiddleware.authenticateToken,
  difuntosController.getMadresDifuntas
);

/**
 * @swagger
 * /api/difuntos/consultas/padres:
 *   get:
 *     summary: Consulta por padres difuntos
 *     description: Obtiene una lista de padres difuntos con información de sector, familia y fecha de aniversario
 *     tags: [Difuntos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector o vereda
 *         example: "El Centro"
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "Rodríguez"
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del difunto
 *         example: "José"
 *       - in: query
 *         name: fecha_aniversario
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha específica de aniversario
 *         example: "2019-07-20"
 *     responses:
 *       200:
 *         description: Consulta de padres difuntos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DifuntosConsultaResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/consultas/padres',
  authMiddleware.authenticateToken,
  difuntosController.getPadresDifuntos
);

/**
 * @swagger
 * /api/difuntos/consultas/todos:
 *   get:
 *     summary: Consulta por todos los difuntos
 *     description: Obtiene una lista de todos los difuntos con información de sector, familia, parentesco y fecha de aniversario
 *     tags: [Difuntos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector o vereda
 *         example: "San José"
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "López"
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del difunto
 *         example: "Ana"
 *       - in: query
 *         name: fecha_aniversario
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha específica de aniversario
 *         example: "2021-12-10"
 *     responses:
 *       200:
 *         description: Consulta de todos los difuntos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DifuntosConsultaResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/consultas/todos',
  authMiddleware.authenticateToken,
  difuntosController.getTodosDifuntos
);

/**
 * @swagger
 * /api/difuntos/consultas/rango-fechas:
 *   get:
 *     summary: Consulta difuntos por rango de fechas
 *     description: Obtiene una lista de difuntos que fallecieron en un rango específico de fechas
 *     tags: [Difuntos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango (YYYY-MM-DD)
 *         example: "2020-01-01"
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango (YYYY-MM-DD)
 *         example: "2020-12-31"
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector o vereda
 *         example: "La Paz"
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "Martínez"
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del difunto
 *         example: "Pedro"
 *     responses:
 *       200:
 *         description: Consulta de difuntos por rango de fechas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/DifuntosConsultaResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         rango_fechas:
 *                           type: object
 *                           properties:
 *                             fecha_inicio:
 *                               type: string
 *                               format: date
 *                               example: "2020-01-01"
 *                             fecha_fin:
 *                               type: string
 *                               format: date
 *                               example: "2020-12-31"
 *       400:
 *         description: Error de validación - Se requiere al menos una fecha
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/consultas/rango-fechas',
  authMiddleware.authenticateToken,
  difuntosController.getDifuntosPorRangoFechas
);

/**
 * @swagger
 * /api/difuntos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de difuntos
 *     description: Obtiene estadísticas generales sobre los difuntos registrados en el sistema
 *     tags: [Difuntos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de difuntos obtenidas exitosamente
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
 *                         total:
 *                           type: integer
 *                           description: Total de difuntos registrados
 *                           example: 150
 *                         por_mes:
 *                           type: array
 *                           description: Cantidad de difuntos por mes
 *                           items:
 *                             type: object
 *                             properties:
 *                               mes:
 *                                 type: integer
 *                                 example: 3
 *                               cantidad:
 *                                 type: integer
 *                                 example: 12
 *                         por_año:
 *                           type: array
 *                           description: Cantidad de difuntos por año
 *                           items:
 *                             type: object
 *                             properties:
 *                               año:
 *                                 type: integer
 *                                 example: 2020
 *                               cantidad:
 *                                 type: integer
 *                                 example: 45
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/estadisticas',
  authMiddleware.authenticateToken,
  difuntosController.getEstadisticasDifuntos
);

export default router;
