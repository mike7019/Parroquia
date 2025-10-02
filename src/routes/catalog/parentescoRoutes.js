import express from 'express';
import parentescoController from '../../controllers/catalog/parentescoController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authenticateToken);

/**
 * @swagger
 * /api/catalog/parentescos:
 *   get:
 *     summary: Obtener todos los parentescos
 *     description: Recupera una lista de todos los parentescos
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de parentescos obtenida exitosamente
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
 *                   example: "Parentescos obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parentesco'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', parentescoController.getAllParentescos);

/**
 * @swagger
 * /api/catalog/parentescos:
 *   post:
 *     summary: Crear nuevo parentesco
 *     description: Crea un nuevo tipo de parentesco en el sistema
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateParentescoRequest'
 *           example:
 *             nombre: "Hermano"
 *             descripcion: "Hermano mayor o menor"
 *     responses:
 *       201:
 *         description: Parentesco creado exitosamente
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
 *                   example: "Parentesco creado exitosamente"
 *       400:
 *         description: Error de validación
 *       409:
 *         description: El parentesco ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', parentescoController.createParentesco);

/**
 * @swagger
 * /api/catalog/parentescos/{id}:
 *   get:
 *     summary: Obtener parentesco por ID
 *     description: Recupera un parentesco específico por su ID
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del parentesco
 *         example: 1
 *     responses:
 *       200:
 *         description: Parentesco obtenido exitosamente
 *       404:
 *         description: Parentesco no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', parentescoController.getParentescoById);

/**
 * @swagger
 * /api/catalog/parentescos/{id}:
 *   put:
 *     summary: Actualizar parentesco
 *     description: Actualiza un parentesco existente
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del parentesco
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateParentescoRequest'
 *           example:
 *             nombre: "Hermano actualizado"
 *             descripcion: "Descripción actualizada"
 *     responses:
 *       200:
 *         description: Parentesco actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Parentesco no encontrado
 *       409:
 *         description: Conflicto con el nombre del parentesco
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', parentescoController.updateParentesco);

/**
 * @swagger
 * /api/catalog/parentescos/{id}:
 *   delete:
 *     summary: Eliminar parentesco
 *     description: Elimina un parentesco del sistema
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del parentesco
 *         example: 1
 *     responses:
 *       200:
 *         description: Parentesco eliminado exitosamente
 *       404:
 *         description: Parentesco no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', parentescoController.deleteParentesco);

export default router;
