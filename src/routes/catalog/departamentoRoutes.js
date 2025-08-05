import express from 'express';
import departamentoController from '../../controllers/catalog/departamentoController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
// router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/departamentos:
 *   post:
 *     summary: Create a new departamento
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartamentoInput'
 *     responses:
 *       201:
 *         description: Departamento created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', departamentoController.createDepartamento);

/**
 * @swagger
 * /api/catalog/departamentos:
 *   get:
 *     summary: Get all departamentos with pagination
 *     tags: [Departamentos]
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
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, codigo DANE, or region
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: nombre
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
 *         description: Departamentos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartamentosListResponse'
 *       500:
 *         description: Server error
 */
router.get('/', departamentoController.getAllDepartamentos);

/**
 * @swagger
 * /api/catalog/departamentos/{id}:
 *   get:
 *     summary: Get departamento by ID
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Departamento ID
 *     responses:
 *       200:
 *         description: Departamento retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Departamento not found
 *       500:
 *         description: Server error
 */
router.get('/:id', departamentoController.getDepartamentoById);

/**
 * @swagger
 * /api/catalog/departamentos/codigo-dane/{codigo_dane}:
 *   get:
 *     summary: Get departamento by codigo DANE
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo_dane
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo DANE (2 digits)
 *     responses:
 *       200:
 *         description: Departamento retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Departamento not found
 *       500:
 *         description: Server error
 */
router.get('/codigo-dane/:codigo_dane', departamentoController.getDepartamentoByCodigoDane);

/**
 * @swagger
 * /api/catalog/departamentos/region/{region}:
 *   get:
 *     summary: Get departamentos by region
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Region name
 *     responses:
 *       200:
 *         description: Departamentos by region retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 */
router.get('/region/:region', departamentoController.getDepartamentosByRegion);

/**
 * @swagger
 * /api/catalog/departamentos/{id}:
 *   put:
 *     summary: Update departamento
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Departamento ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartamentoInput'
 *     responses:
 *       200:
 *         description: Departamento updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Departamento not found
 *       500:
 *         description: Server error
 */
router.put('/:id', departamentoController.updateDepartamento);

/**
 * @swagger
 * /api/catalog/departamentos/{id}:
 *   delete:
 *     summary: Delete departamento
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Departamento ID
 *     responses:
 *       200:
 *         description: Departamento deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Departamento not found
 *       409:
 *         description: Cannot delete departamento with associated municipios
 *       500:
 *         description: Server error
 */
router.delete('/:id', departamentoController.deleteDepartamento);

export default router;
