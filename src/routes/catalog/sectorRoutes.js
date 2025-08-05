import express from 'express';
import sectorController from '../../controllers/catalog/sectorController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/sectors:
 *   post:
 *     summary: Create a new sector
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSectorRequest'
 *     responses:
 *       201:
 *         description: Sector created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sector created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Sector'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Sector name already exists
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
router.post('/', sectorController.createSector);

/**
 * @swagger
 * /api/catalog/sectors:
 *   get:
 *     summary: Get all sectors with pagination
 *     tags: [Sectors]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: coordinatorId
 *         schema:
 *           type: string
 *         description: Filter by coordinator
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Sectors retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', sectorController.getAllSectors);

/**
 * @swagger
 * /api/catalog/sectors/search:
 *   get:
 *     summary: Search sectors
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (minimum 2 characters)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum results
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search term too short
 *       500:
 *         description: Server error
 */
router.get('/search', sectorController.getAllSectors);

/**
 * @swagger
 * /api/catalog/sectors/statistics:
 *   get:
 *     summary: Get sector statistics
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sectorId
 *         schema:
 *           type: string
 *         description: Get statistics for specific sector
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/statistics', sectorController.getSectorsStats);

/**
 * @swagger
 * /api/catalog/sectors/coordinator/{coordinatorId}:
 *   get:
 *     summary: Get sectors by coordinator
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coordinatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Coordinator user ID
 *     responses:
 *       200:
 *         description: Coordinator sectors retrieved successfully
 *       500:
 *         description: Server error
 */
// router.get('/coordinator/:coordinatorId', sectorController.getSectorsByCoordinator);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   get:
 *     summary: Get sector by ID
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector ID
 *     responses:
 *       200:
 *         description: Sector retrieved successfully
 *       404:
 *         description: Sector not found
 *       500:
 *         description: Server error
 */
router.get('/:id', sectorController.getSectorById);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   put:
 *     summary: Update sector
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sector San José"
 *               description:
 *                 type: string
 *                 example: "Descripción del sector"
 *               coordinator:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *               code:
 *                 type: string
 *                 example: "SEC001"
 *               municipioId:
 *                 type: integer
 *                 example: 1
 *               veredaId:
 *                 type: integer
 *                 example: 1
 *             required: [name]
 *             example:
 *               name: "Sector San José"
 *               description: "Sector ubicado en el centro"
 *               coordinator: 2
 *               status: "active"
 *               code: "SJ001"
 *               municipioId: 1
 *               veredaId: 1
 *     responses:
 *       200:
 *         description: Sector updated successfully
 *       404:
 *         description: Sector not found
 *       409:
 *         description: Sector name already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', sectorController.updateSector);

/**
 * @swagger
 * /api/catalog/sectors/{id}/assign-coordinator:
 *   put:
 *     summary: Assign coordinator to sector
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coordinatorId
 *             properties:
 *               coordinatorId:
 *                 type: string
 *                 description: Coordinator user ID
 *     responses:
 *       200:
 *         description: Coordinator assigned successfully
 *       400:
 *         description: Validation error or user is not a coordinator
 *       404:
 *         description: Sector or coordinator not found
 *       500:
 *         description: Server error
 */
// router.put('/:id/assign-coordinator', sectorController.assignCoordinator);

/**
 * @swagger
 * /api/catalog/sectors/{sectorName}/update-stats:
 *   put:
 *     summary: Update sector survey statistics
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector name
 *     responses:
 *       200:
 *         description: Statistics updated successfully
 *       404:
 *         description: Sector not found
 *       500:
 *         description: Server error
 */
// router.put('/:sectorName/update-stats', sectorController.updateSectorSurveyStats);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   delete:
 *     summary: Delete sector
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector ID
 *     responses:
 *       200:
 *         description: Sector deleted successfully
 *       404:
 *         description: Sector not found
 *       409:
 *         description: Cannot delete - has associated records
 *       500:
 *         description: Server error
 */
router.delete('/:id', sectorController.deleteSector);

/**
 * @swagger
 * /api/catalog/sectors/bulk:
 *   post:
 *     summary: Bulk create sectors
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectors:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateSectorRequest'
 *             required: [sectors]
 *     responses:
 *       201:
 *         description: Sectors created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/bulk', sectorController.bulkCreateSectors);

export default router;
