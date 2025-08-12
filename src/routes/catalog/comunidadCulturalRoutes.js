import express from 'express';
import comunidadCulturalController from '../../controllers/catalog/comunidadCulturalController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     ComunidadCultural:
 *       type: object
 *       properties:
 *         id_comunidad_cultural:
 *           type: integer
 *           description: ID único de la comunidad cultural
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre de la comunidad cultural
 *           example: "Afrodescendiente"
 *         descripcion:
 *           type: string
 *           description: Descripción de la comunidad cultural
 *           example: "Comunidad de personas afrodescendientes"
 *         activo:
 *           type: boolean
 *           description: Estado de la comunidad cultural
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     ComunidadCulturalInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la comunidad cultural
 *           example: "Afrodescendiente"
 *           minLength: 2
 *           maxLength: 255
 *         descripcion:
 *           type: string
 *           description: Descripción de la comunidad cultural
 *           example: "Comunidad de personas afrodescendientes"
 *           maxLength: 1000
 *     ComunidadCulturalUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la comunidad cultural
 *           example: "Afrodescendiente"
 *           minLength: 2
 *           maxLength: 255
 *         descripcion:
 *           type: string
 *           description: Descripción de la comunidad cultural
 *           example: "Comunidad de personas afrodescendientes"
 *           maxLength: 1000
 *         activo:
 *           type: boolean
 *           description: Estado de la comunidad cultural
 *           example: true
 *     ComunidadCulturalSelect:
 *       type: object
 *       properties:
 *         value:
 *           type: integer
 *           description: ID de la comunidad cultural
 *           example: 1
 *         label:
 *           type: string
 *           description: Nombre de la comunidad cultural
 *           example: "Afrodescendiente"
 */

/**
 * @swagger
 * tags:
 *   name: Comunidades Culturales
 *   description: API para gestión de comunidades culturales
 */

/**
 * @swagger
 * /api/catalog/comunidades-culturales:
 *   post:
 *     summary: Crear una nueva comunidad cultural
 *     tags: [Comunidades Culturales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComunidadCulturalInput'
 *     responses:
 *       201:
 *         description: Comunidad cultural creada exitosamente
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
 *                         comunidadCultural:
 *                           $ref: '#/components/schemas/ComunidadCultural'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe una comunidad cultural con este nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', comunidadCulturalController.createComunidadCultural);

/**
 * @swagger
 * /api/catalog/comunidades-culturales:
 *   get:
 *     summary: Obtener todas las comunidades culturales
 *     tags: [Comunidades Culturales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: id_comunidad_cultural
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden de clasificación
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Comunidades culturales obtenidas exitosamente
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
 *                         comunidadesCulturales:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ComunidadCultural'
 *                         total:
 *                           type: integer
 *                           description: Total de comunidades culturales
 *                           example: 25
 *       500:
 *         description: Error del servidor
 */
router.get('/', comunidadCulturalController.getAllComunidadesCulturales);

/**
 * @swagger
 * /api/catalog/comunidades-culturales/select:
 *   get:
 *     summary: Obtener comunidades culturales para select dropdown
 *     tags: [Comunidades Culturales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comunidades culturales para select obtenidas exitosamente
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
 *                         comunidades:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ComunidadCulturalSelect'
 *       500:
 *         description: Error del servidor
 */
router.get('/select', comunidadCulturalController.getComunidadesCulturalesSelect);

/**
 * @swagger
 * /api/catalog/comunidades-culturales/stats:
 *   get:
 *     summary: Obtener estadísticas de comunidades culturales
 *     tags: [Comunidades Culturales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                         stats:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total de comunidades culturales
 *                               example: 10
 *                             activas:
 *                               type: integer
 *                               description: Comunidades culturales activas
 *                               example: 8
 *                             inactivas:
 *                               type: integer
 *                               description: Comunidades culturales inactivas
 *                               example: 2
 *       500:
 *         description: Error del servidor
 */
router.get('/stats', comunidadCulturalController.getStats);

/**
 * @swagger
 * /api/catalog/comunidades-culturales/{id}:
 *   get:
 *     summary: Obtener comunidad cultural por ID
 *     tags: [Comunidades Culturales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad cultural
 *     responses:
 *       200:
 *         description: Comunidad cultural obtenida exitosamente
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
 *                         comunidadCultural:
 *                           $ref: '#/components/schemas/ComunidadCultural'
 *       404:
 *         description: Comunidad cultural no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', comunidadCulturalController.getComunidadCulturalById);

/**
 * @swagger
 * /api/catalog/comunidades-culturales/{id}:
 *   put:
 *     summary: Actualizar comunidad cultural
 *     tags: [Comunidades Culturales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad cultural
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComunidadCulturalUpdate'
 *     responses:
 *       200:
 *         description: Comunidad cultural actualizada exitosamente
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
 *                         comunidadCultural:
 *                           $ref: '#/components/schemas/ComunidadCultural'
 *       404:
 *         description: Comunidad cultural no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe una comunidad cultural con este nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', comunidadCulturalController.updateComunidadCultural);

/**
 * @swagger
 * /api/catalog/comunidades-culturales/{id}:
 *   delete:
 *     summary: Eliminar comunidad cultural (eliminación suave)
 *     tags: [Comunidades Culturales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad cultural
 *     responses:
 *       200:
 *         description: Comunidad cultural eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Comunidad cultural no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', comunidadCulturalController.deleteComunidadCultural);

export default router;
