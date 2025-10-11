/**
 * Rutas para Estudios (Niveles Educativos)
 * Define todas las rutas del CRUD de estudios con documentación Swagger
 */

import express from 'express';
import estudioController from '../../controllers/catalog/estudioController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Estudios
 *   description: API para gestión de estudios y niveles educativos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Estudio:
 *       type: object
 *       required:
 *         - nivel
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del estudio
 *           example: 1
 *         nivel:
 *           type: string
 *           description: Nombre del nivel educativo
 *           minLength: 2
 *           maxLength: 255
 *           example: "Educación Primaria"
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del nivel educativo
 *           maxLength: 1000
 *           example: "Nivel básico de educación formal que comprende los primeros años de formación académica"
 *         ordenNivel:
 *           type: integer
 *           description: Orden de visualización del nivel educativo
 *           minimum: 0
 *           example: 1
 *         activo:
 *           type: boolean
 *           description: Estado activo/inactivo
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 * 
 *     EstudioInput:
 *       type: object
 *       required:
 *         - nivel
 *       properties:
 *         nivel:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           example: "Educación Secundaria"
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *           example: "Educación media que prepara para estudios superiores o técnicos"
 *         ordenNivel:
 *           type: integer
 *           minimum: 0
 *           example: 2
 *         activo:
 *           type: boolean
 *           example: true
 * 
 *     EstudioStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de estudios
 *           example: 15
 *         activos:
 *           type: integer
 *           description: Estudios activos
 *           example: 12
 *         inactivos:
 *           type: integer
 *           description: Estudios inactivos
 *           example: 2
 *         eliminados:
 *           type: integer
 *           description: Estudios eliminados
 *           example: 1
 *         porcentajeActivos:
 *           type: integer
 *           description: Porcentaje de estudios activos
 *           example: 80
 */

/**
 * @swagger
 * /api/catalog/estudios/stats:
 *   get:
 *     summary: Obtener estadísticas de estudios
 *     description: Retorna estadísticas generales sobre los niveles educativos del sistema
 *     tags: [Estudios]
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
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/EstudioStats'
 *                 message:
 *                   type: string
 *                   example: "Estadísticas de estudios obtenidas exitosamente"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', authMiddleware.authenticateToken, estudioController.getEstadisticas);

/**
 * @swagger
 * /api/catalog/estudios:
 *   get:
 *     summary: Listar todos los estudios
 *     description: Obtiene una lista completa de estudios
 *     tags: [Estudios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estudios obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Estudio'
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 message:
 *                   type: string
 *                   example: Se encontraron 15 estudios
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/parentescos - Obtener todos los parentescos
router.get('/',
  authMiddleware.authenticateToken,
  estudioController.getAllEstudios
);

/**
 * @swagger
 * /api/catalog/estudios:
 *   post:
 *     summary: Crear estudio
 *     description: Crea un nuevo nivel educativo en el sistema
 *     tags: [Estudios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstudioInput'
 *           examples:
 *             primaria:
 *               summary: Crear nivel "Educación Primaria"
 *               value:
 *                 nivel: "Educación Primaria"
 *                 descripcion: "Nivel básico de educación formal"
 *                 ordenNivel: 1
 *                 activo: true
 *             secundaria:
 *               summary: Crear nivel "Educación Secundaria"
 *               value:
 *                 nivel: "Educación Secundaria"
 *                 descripcion: "Educación media que prepara para estudios superiores"
 *                 ordenNivel: 2
 *                 activo: true
 *     responses:
 *       201:
 *         description: Estudio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Estudio'
 *                 message:
 *                   type: string
 *                   example: "Estudio creado exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware.authenticateToken, estudioController.createEstudio);

/**
 * @swagger
 * /api/catalog/estudios/search:
 *   get:
 *     summary: Buscar estudios
 *     description: Busca estudios por término en nivel o descripción
 *     tags: [Estudios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Término de búsqueda
 *         example: "primaria"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Máximo número de resultados
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir estudios inactivos
 *     responses:
 *       200:
 *         description: Búsqueda realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Estudio'
 *                 total:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/search', authMiddleware.authenticateToken, estudioController.getAllEstudios);

/**
 * @swagger
 * /api/catalog/estudios/{id}:
 *   get:
 *     summary: Obtener estudio por ID
 *     description: Retorna un estudio específico por su ID
 *     tags: [Estudios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudio
 *         example: 1
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir si está inactivo
 *     responses:
 *       200:
 *         description: Estudio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Estudio'
 *                 message:
 *                   type: string
 *                   example: "Estudio encontrado"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authMiddleware.authenticateToken, estudioController.getEstudioById);

/**
 * @swagger
 * /api/catalog/estudios/{id}:
 *   put:
 *     summary: Actualizar estudio
 *     description: Actualiza un nivel educativo existente
 *     tags: [Estudios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudio
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstudioInput'
 *           example:
 *             nivel: "Educación Primaria Completa"
 *             descripcion: "Nivel básico de educación formal completado satisfactoriamente"
 *             ordenNivel: 1
 *             activo: true
 *     responses:
 *       200:
 *         description: Estudio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Estudio'
 *                 message:
 *                   type: string
 *                   example: "Estudio actualizado exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authMiddleware.authenticateToken, estudioController.updateEstudio);

/**
 * @swagger
 * /api/catalog/estudios/{id}:
 *   delete:
 *     summary: Eliminar estudio
 *     description: Elimina un estudio (eliminación lógica/soft delete)
 *     tags: [Estudios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudio
 *         example: 1
 *     responses:
 *       200:
 *         description: Estudio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Estudio eliminado exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware.authenticateToken, estudioController.deleteEstudio);

/**
 * @swagger
 * /api/catalog/estudios/{id}/restore:
 *   patch:
 *     summary: Restaurar estudio
 *     description: Restaura un estudio previamente eliminado
 *     tags: [Estudios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudio eliminado
 *         example: 1
 *     responses:
 *       200:
 *         description: Estudio restaurado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Estudio'
 *                 message:
 *                   type: string
 *                   example: "Estudio restaurado exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/restore', authMiddleware.authenticateToken, estudioController.deleteEstudio);

export default router;
