import express from 'express';
import sexoController from '../../controllers/catalog/sexoController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/sexos:
 *   post:
 *     summary: Create a new sexo
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SexoInput'
 *     responses:
 *       201:
 *         description: Sexo created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', sexoController.createSexo);

/**
 * @swagger
 * /api/catalog/sexos/bulk:
 *   post:
 *     summary: Bulk create sexos (for initial setup)
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sexos
 *             properties:
 *               sexos:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: string
 *                     - type: object
 *                       properties:
 *                         sexo:
 *                           type: string
 *                         name:
 *                           type: string
 *                 description: Array of sexos to create
 *     responses:
 *       201:
 *         description: Sexos created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/bulk', sexoController.bulkCreateSexos);

/**
 * @swagger
 * /api/catalog/sexos:
 *   get:
 *     summary: Get all sexos with pagination
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: id_sexo
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
 *         description: Sexos retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', sexoController.getAllSexos);

/**
 * @swagger
 * /api/catalog/sexos/select:
 *   get:
 *     summary: Get sexos formatted for select/dropdown
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sexos for select retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/select', sexoController.getSexosForSelect);

/**
 * @swagger
 * /api/catalog/sexos/search:
 *   get:
 *     summary: Search sexos
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search term is required
 *       500:
 *         description: Server error
 */
router.get('/search', sexoController.searchSexos);

/**
 * @swagger
 * /api/catalog/sexos/statistics:
 *   get:
 *     summary: Get sexo statistics
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/statistics', sexoController.getSexoStatistics);

/**
 * @swagger
 * /api/catalog/sexos/name/{name}:
 *   get:
 *     summary: Get sexo by name
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Sexo name
 *     responses:
 *       200:
 *         description: Sexo retrieved successfully
 *       404:
 *         description: Sexo not found
 *       500:
 *         description: Server error
 */
router.get('/name/:name', sexoController.getSexoByName);

/**
 * @swagger
 * /api/catalog/sexos/{id}:
 *   get:
 *     summary: Get sexo by ID
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sexo ID
 *     responses:
 *       200:
 *         description: Sexo retrieved successfully
 *       404:
 *         description: Sexo not found
 *       500:
 *         description: Server error
 */
router.get('/:id', sexoController.getSexoById);

/**
 * @swagger
 * /api/catalog/sexos/{id}/details:
 *   get:
 *     summary: Get sexo with details including persona counts
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sexo ID
 *     responses:
 *       200:
 *         description: Sexo details retrieved successfully
 *       404:
 *         description: Sexo not found
 *       500:
 *         description: Server error
 */
router.get('/:id/details', sexoController.getSexoDetails);

/**
 * @swagger
 * /api/catalog/sexos/{id}:
 *   put:
 *     summary: Update sexo
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sexo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SexoInput'
 *     responses:
 *       200:
 *         description: Sexo updated successfully
 *       404:
 *         description: Sexo not found
 *       500:
 *         description: Server error
 */
router.put('/:id', sexoController.updateSexo);

/**
 * @swagger
 * /api/catalog/sexos/{id}:
 *   delete:
 *     summary: Delete sexo
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sexo ID
 *     responses:
 *       200:
 *         description: Sexo deleted successfully
 *       404:
 *         description: Sexo not found
 *       409:
 *         description: Cannot delete - has associated records
 *       500:
 *         description: Server error
 */
router.delete('/:id', sexoController.deleteSexo);

export default router;
