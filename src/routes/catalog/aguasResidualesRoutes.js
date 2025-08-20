import express from 'express';
import aguasResidualesController from '../../controllers/catalog/aguasResidualesController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoAguasResiduales:
 *       type: object
 *       properties:
 *         id_tipo_aguas_residuales:
 *           type: integer
 *           description: ID único del tipo de aguas residuales
 *           example: 1
 *         nombre:
 *           type: string
 *           maxLength: 255
 *           description: Nombre del tipo de aguas residuales
 *           example: "Alcantarillado Público"
 *         descripcion:
 *           type: string
 *           description: Descripción del tipo de aguas residuales
 *           example: "Sistema de alcantarillado municipal"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     TipoAguasResidualesInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 255
 *           description: Nombre del tipo de aguas residuales
 *           example: "Alcantarillado Público"
 *         descripcion:
 *           type: string
 *           description: Descripción del tipo de aguas residuales
 *           example: "Sistema de alcantarillado municipal"
 */

/**
 * @swagger
 * /api/catalog/aguas-residuales:
 *   post:
 *     summary: Create a new tipo de aguas residuales
 *     tags: [Aguas Residuales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoAguasResidualesInput'
 *     responses:
 *       201:
 *         description: Tipo de aguas residuales created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoAguasResiduales'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Tipo de aguas residuales already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', aguasResidualesController.createTipoAguasResiduales);

/**
 * @swagger
 * /api/catalog/aguas-residuales/search:
 *   get:
 *     summary: Search tipos de aguas residuales
 *     tags: [Aguas Residuales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term (minimum 2 characters)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoAguasResiduales'
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/search', aguasResidualesController.searchTiposAguasResiduales);

/**
 * @swagger
 * /api/catalog/aguas-residuales/stats:
 *   get:
 *     summary: Get statistics for tipos de aguas residuales
 *     tags: [Aguas Residuales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                         totalTipos:
 *                           type: integer
 *                           description: Total number of tipos de aguas residuales
 *                           example: 5
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats', aguasResidualesController.getStatistics);

/**
 * @swagger
 * /api/catalog/aguas-residuales:
 *   get:
 *     summary: Get all tipos de aguas residuales
 *     tags: [Aguas Residuales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id_tipo_aguas_residuales, nombre, created_at]
 *           default: id_tipo_aguas_residuales
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Tipos de aguas residuales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoAguasResiduales'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', aguasResidualesController.getAllTiposAguasResiduales);

/**
 * @swagger
 * /api/catalog/aguas-residuales/{id}:
 *   get:
 *     summary: Get tipo de aguas residuales by ID
 *     tags: [Aguas Residuales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tipo de aguas residuales ID
 *     responses:
 *       200:
 *         description: Tipo de aguas residuales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoAguasResiduales'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Tipo de aguas residuales not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:id', aguasResidualesController.getTipoAguasResidualesById);

/**
 * @swagger
 * /api/catalog/aguas-residuales/{id}:
 *   put:
 *     summary: Update tipo de aguas residuales
 *     tags: [Aguas Residuales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tipo de aguas residuales ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoAguasResidualesInput'
 *     responses:
 *       200:
 *         description: Tipo de aguas residuales updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoAguasResiduales'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Tipo de aguas residuales not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Tipo de aguas residuales with this name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id', aguasResidualesController.updateTipoAguasResiduales);

/**
 * @swagger
 * /api/catalog/aguas-residuales/{id}:
 *   delete:
 *     summary: Delete tipo de aguas residuales
 *     tags: [Aguas Residuales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tipo de aguas residuales ID
 *     responses:
 *       200:
 *         description: Tipo de aguas residuales deleted successfully
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
 *                         message:
 *                           type: string
 *                           example: "Tipo de aguas residuales deleted successfully"
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Tipo de aguas residuales not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Cannot delete tipo de aguas residuales with associated familias
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', aguasResidualesController.deleteTipoAguasResiduales);

export default router;
