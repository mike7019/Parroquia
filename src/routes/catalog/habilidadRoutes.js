import express from 'express';
import habilidadController from '../../controllers/catalog/habilidadController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Habilidad:
 *       type: object
 *       properties:
 *         id_habilidad:
 *           type: integer
 *           description: ID único de la habilidad (generado automáticamente)
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre de la habilidad
 *           example: "Liderazgo"
 *         descripcion:
 *           type: string
 *           description: Descripción de la habilidad
 *           example: "Capacidad para dirigir y motivar equipos de trabajo"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     
 *     HabilidadInput:
 *       type: object
 *       required:
 *         - nombre
 *         - descripcion
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la habilidad (requerido)
 *           example: "Trabajo en equipo"
 *         descripcion:
 *           type: string
 *           description: Descripción de la habilidad (requerido)
 *           example: "Capacidad de colaborar efectivamente con otros"
 *     
 *     HabilidadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Habilidad obtenida exitosamente"
 *         data:
 *           type: object
 *           properties:
 *             habilidad:
 *               $ref: '#/components/schemas/Habilidad'
 *         timestamp:
 *           type: string
 *           format: date-time
 *     
 *     HabilidadesListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, error]
 *           example: success
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Habilidad'
 *         total:
 *           type: integer
 *           description: Total de habilidades
 *           example: 45
 *         message:
 *           type: string
 *           example: "Se encontraron 45 habilidades"
 */

/**
 * @swagger
 * /api/catalog/habilidades:
 *   get:
 *     summary: Obtener todas las habilidades
 *     description: Retorna una lista de todas las habilidades
 *     tags: [Habilidades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de habilidades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HabilidadesListResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware.authenticateToken, habilidadController.getAllHabilidades);

/**
 * @swagger
 * /api/catalog/habilidades/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de habilidades
 *     description: Retorna el total de habilidades registradas
 *     tags: [Habilidades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                   example: "Estadísticas de habilidades obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas', authMiddleware.authenticateToken, habilidadController.getEstadisticas);

/**
 * @swagger
 * /api/catalog/habilidades/{id}:
 *   get:
 *     summary: Obtener habilidad por ID
 *     description: Retorna una habilidad específica por su ID
 *     tags: [Habilidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la habilidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Habilidad obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HabilidadResponse'
 *       404:
 *         description: Habilidad no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware.authenticateToken, habilidadController.getHabilidadById);

/**
 * @swagger
 * /api/catalog/habilidades:
 *   post:
 *     summary: Crear nueva habilidad
 *     description: Crea una nueva habilidad en el sistema
 *     tags: [Habilidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HabilidadInput'
 *           examples:
 *             comunicacion:
 *               summary: Ejemplo de Comunicación
 *               value:
 *                 nombre: "Comunicación efectiva"
 *                 descripcion: "Capacidad de transmitir ideas claramente"
 *             tecnica:
 *               summary: Ejemplo de Habilidad Técnica
 *               value:
 *                 nombre: "Programación en Python"
 *                 descripcion: "Conocimiento de lenguaje Python para desarrollo de software"
 *             minimo:
 *               summary: Ejemplo básico
 *               value:
 *                 nombre: "Carpintería"
 *                 descripcion: "Habilidad para trabajar con madera y crear muebles"
 *     responses:
 *       201:
 *         description: Habilidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HabilidadResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: Ya existe una habilidad con ese nombre
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware.authenticateToken, 
  authMiddleware.requireRole(['Administrador']),
  habilidadController.createHabilidad);

/**
 * @swagger
 * /api/catalog/habilidades/{id}:
 *   put:
 *     summary: Actualizar habilidad
 *     description: Actualiza una habilidad existente
 *     tags: [Habilidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la habilidad a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Liderazgo de equipos"
 *               descripcion:
 *                 type: string
 *                 example: "Capacidad mejorada de dirigir equipos"
 *               categoria:
 *                 type: string
 *                 example: "Soft Skills"
 *               activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Habilidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HabilidadResponse'
 *       404:
 *         description: Habilidad no encontrada
 *       409:
 *         description: Ya existe una habilidad con ese nombre
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware.authenticateToken, 
  authMiddleware.requireRole(['Administrador']),
  habilidadController.updateHabilidad);

/**
 * @swagger
 * /api/catalog/habilidades/{id}:
 *   delete:
 *     summary: Eliminar habilidad
 *     description: Elimina una habilidad (soft delete - marca como inactiva)
 *     tags: [Habilidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la habilidad a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Habilidad desactivada exitosamente
 *       404:
 *         description: Habilidad no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware.authenticateToken, 
  authMiddleware.requireRole(['Administrador']),
  habilidadController.deleteHabilidad);

export default router;
