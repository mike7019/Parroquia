import express from 'express';
import enfermedadController from '../../controllers/catalog/enfermedadController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/enfermedades:
 *   post:
 *     summary: Create a new enfermedad
 *     tags: [Enfermedades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnfermedadInput'
 *     responses:
 *       201:
 *         description: Enfermedad created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Enfermedad'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Enfermedad already exists
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
router.post('/', enfermedadController.createEnfermedad);

/**
 * @swagger
 * /api/catalog/enfermedades:
 *   get:
 *     summary: Get all enfermedades with pagination and search
 *     tags: [Enfermedades]
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
 *         description: Search term for name or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: id_enfermedad
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
 *         description: Enfermedades retrieved successfully
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
 *                         enfermedades:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Enfermedad'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', enfermedadController.getAllEnfermedades);

/**
 * @swagger
 * /api/catalog/enfermedades/{id}:
 *   get:
 *     summary: Get enfermedad by ID
 *     tags: [Enfermedades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enfermedad ID
 *     responses:
 *       200:
 *         description: Enfermedad retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EnfermedadWithPersonas'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Enfermedad not found
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
router.get('/:id', enfermedadController.getEnfermedadById);

/**
 * @swagger
 * /api/catalog/enfermedades/{id}:
 *   put:
 *     summary: Update enfermedad
 *     tags: [Enfermedades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enfermedad ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnfermedadInput'
 *     responses:
 *       200:
 *         description: Enfermedad updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Enfermedad'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Enfermedad not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Enfermedad with this name already exists
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
router.put('/:id', enfermedadController.updateEnfermedad);

/**
 * @swagger
 * /api/catalog/enfermedades/{id}:
 *   delete:
 *     summary: Delete enfermedad
 *     tags: [Enfermedades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enfermedad ID
 *     responses:
 *       200:
 *         description: Enfermedad deleted successfully
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
 *                           example: 'Enfermedad deleted successfully'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Enfermedad not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Cannot delete enfermedad with associated personas
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
router.delete('/:id', enfermedadController.deleteEnfermedad);

/**
 * @swagger
 * /api/catalog/enfermedades/persona/{personaId}:
 *   get:
 *     summary: Get enfermedades by persona ID
 *     tags: [Enfermedades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Persona ID
 *     responses:
 *       200:
 *         description: Enfermedades for persona retrieved successfully
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
 *                         $ref: '#/components/schemas/Enfermedad'
 *       400:
 *         description: Invalid persona ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Persona not found
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
router.get('/persona/:personaId', enfermedadController.getEnfermedadesByPersona);

/**
 * @swagger
 * /api/catalog/enfermedades/{enfermedadId}/persona/{personaId}:
 *   post:
 *     summary: Associate enfermedad with persona
 *     tags: [Enfermedades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enfermedadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enfermedad ID
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Persona ID
 *     responses:
 *       200:
 *         description: Enfermedad associated with persona successfully
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
 *                           example: 'Enfermedad associated with persona successfully'
 *       400:
 *         description: Invalid IDs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Enfermedad or Persona not found
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
router.post('/:enfermedadId/persona/:personaId', enfermedadController.associateEnfermedadWithPersona);

/**
 * @swagger
 * /api/catalog/enfermedades/{enfermedadId}/persona/{personaId}:
 *   delete:
 *     summary: Remove association between enfermedad and persona
 *     tags: [Enfermedades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enfermedadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enfermedad ID
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Persona ID
 *     responses:
 *       200:
 *         description: Enfermedad removed from persona successfully
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
 *                           example: 'Enfermedad removed from persona successfully'
 *       400:
 *         description: Invalid IDs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Enfermedad or Persona not found
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
router.delete('/:enfermedadId/persona/:personaId', enfermedadController.removeEnfermedadFromPersona);

export default router;
