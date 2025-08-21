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
 *     description: Crea un nuevo sector en el sistema.
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSectorRequest'
 *           example:
 *             nombre: "Sector San José"
 *             id_municipio: 1
 *             descripcion: "Sector ubicado en la zona central de la parroquia"
 *             codigo: "SEC001"
 *             estado: "activo"
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
 *                   example: "Sector creado exitosamente"
 *       400:
 *         description: Error de validación - campos obligatorios faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "El municipio es obligatorio"
 *                 code:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *             examples:
 *               missing_name:
 *                 summary: "Nombre faltante"
 *                 value:
 *                   success: false
 *                   message: "El nombre del sector es obligatorio"
 *                   code: "VALIDATION_ERROR"
 *               missing_municipio:
 *                 summary: "Municipio faltante"
 *                 value:
 *                   success: false
 *                   message: "El municipio es obligatorio"
 *                   code: "VALIDATION_ERROR"
 *               invalid_municipio:
 *                 summary: "ID municipio inválido"
 *                 value:
 *                   success: false
 *                   message: "El ID del municipio debe ser un número válido"
 *                   code: "VALIDATION_ERROR"
 *       404:
 *         description: Municipio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Municipio no encontrado"
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       409:
 *         description: Sector con ese nombre ya existe
 *       500:
 *         description: Server error
 */
router.post('/', sectorController.createSector);

/**
 * @swagger
 * /api/catalog/sectors:
 *   get:
 *     summary: Get all sectors
 *     description: Obtiene todos los sectores
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sectores obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sector'
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 message:
 *                   type: string
 *                   example: Se encontraron 15 sectores
 *       500:
 *         description: Error del servidor
 */
router.get('/', sectorController.getAllSectors);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   get:
 *     summary: Get sector by ID
 *     description: Obtiene un sector específico por su ID.
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del sector
 *         example: 1
 *     responses:
 *       200:
 *         description: Sector obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sector'
 *       404:
 *         description: Sector no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', sectorController.getSectorById);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   put:
 *     summary: Update sector
 *     description: Actualiza un sector existente.
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sector a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSectorRequest'
 *           example:
 *             nombre: "Sector San José Actualizado"
 *     responses:
 *       200:
 *         description: Sector actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Sector no encontrado
 *       409:
 *         description: Ya existe un sector con ese nombre
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', sectorController.updateSector);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   delete:
 *     summary: Delete sector
 *     description: Elimina un sector del sistema.
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sector a eliminar
 *     responses:
 *       200:
 *         description: Sector eliminado exitosamente
 *       404:
 *         description: Sector no encontrado
 *       409:
 *         description: No se puede eliminar - tiene registros asociados
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', sectorController.deleteSector);

/**
 * @swagger
 * /api/catalog/sectors/municipios:
 *   get:
 *     summary: Get available municipios for sector creation
 *     description: Obtiene la lista de municipios disponibles para asignar a un sector.
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Municipios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MunicipiosDisponiblesResponse'
 *       500:
 *         description: Error del servidor
 */
router.get('/municipios', sectorController.getAvailableMunicipios);

export default router;
