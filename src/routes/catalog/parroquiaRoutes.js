import express from 'express';
import parroquiaController from '../../controllers/catalog/parroquiaController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/parroquias:
 *   post:
 *     summary: Create a new parroquia
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Name of the parroquia
 *     responses:
 *       201:
 *         description: Parroquia created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParroquiaResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', parroquiaController.createParroquia);

/**
 * @swagger
 * /api/catalog/parroquias:
 *   get:
 *     summary: Get all parroquias with pagination
 *     tags: [Parroquias]
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
 *           default: id_parroquia
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
 *         description: Parroquias retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParroquiasListResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', parroquiaController.getAllParroquias);

/**
 * @swagger
 * /api/catalog/parroquias/search:
 *   get:
 *     summary: Search parroquias
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (minimum 2 characters)
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search term too short
 *       500:
 *         description: Server error
 */
router.get('/search', parroquiaController.searchParroquias);

/**
 * @swagger
 * /api/catalog/parroquias/statistics:
 *   get:
 *     summary: Get parroquia statistics
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/statistics', parroquiaController.getParroquiaStatistics);

/**
 * @swagger
 * /api/catalog/parroquias/{id}:
 *   get:
 *     summary: Get parroquia by ID
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parroquia ID
 *     responses:
 *       200:
 *         description: Parroquia retrieved successfully
 *       404:
 *         description: Parroquia not found
 *       500:
 *         description: Server error
 */
router.get('/:id', parroquiaController.getParroquiaById);

/**
 * @swagger
 * /api/catalog/parroquias/{id}:
 *   put:
 *     summary: Update parroquia
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parroquia ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Name of the parroquia
 *     responses:
 *       200:
 *         description: Parroquia updated successfully
 *       404:
 *         description: Parroquia not found
 *       500:
 *         description: Server error
 */
router.put('/:id', parroquiaController.updateParroquia);

/**
 * @swagger
 * /api/catalog/parroquias/{id}:
 *   delete:
 *     summary: Delete parroquia
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parroquia ID
 *     responses:
 *       200:
 *         description: Parroquia deleted successfully
 *       404:
 *         description: Parroquia not found
 *       409:
 *         description: Cannot delete - has associated records
 *       500:
 *         description: Server error
 */
router.delete('/:id', parroquiaController.deleteParroquia);

export default router;
