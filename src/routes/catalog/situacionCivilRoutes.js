/**
 * Rutas para Situaciones Civiles
 * Define todas las rutas del CRUD de situaciones civiles con documentación Swagger
 */

import express from 'express';
import SituacionCivilController from '../../controllers/situacionCivilController.js';
import AuthMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Situaciones Civiles
 *   description: API para gestión de situaciones civiles
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SituacionCivil:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la situación civil
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre de la situación civil
 *           minLength: 2
 *           maxLength: 100
 *           example: "Soltero(a)"
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la situación civil
 *           maxLength: 500
 *           example: "Persona que no ha contraído matrimonio"
 *         codigo:
 *           type: string
 *           description: Código único para la situación civil (opcional)
 *           maxLength: 10
 *           example: "SOL"
 *         orden:
 *           type: integer
 *           description: Orden de visualización
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
 *     SituacionCivilInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Casado(a)"
 *         descripcion:
 *           type: string
 *           maxLength: 500
 *           example: "Persona unida en matrimonio civil o religioso"
 *         codigo:
 *           type: string
 *           maxLength: 10
 *           example: "CAS"
 *         orden:
 *           type: integer
 *           minimum: 0
 *           example: 2
 *         activo:
 *           type: boolean
 *           example: true
 * 
 *     SituacionCivilStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de situaciones civiles
 *           example: 15
 *         activos:
 *           type: integer
 *           description: Situaciones civiles activas
 *           example: 12
 *         inactivos:
 *           type: integer
 *           description: Situaciones civiles inactivas
 *           example: 2
 *         eliminados:
 *           type: integer
 *           description: Situaciones civiles eliminadas
 *           example: 1
 *         porcentajeActivos:
 *           type: integer
 *           description: Porcentaje de situaciones civiles activas
 *           example: 80
 */

/**
 * @swagger
 * /api/catalog/situaciones-civiles/stats:
 *   get:
 *     summary: Obtener estadísticas de situaciones civiles
 *     description: Retorna estadísticas generales sobre las situaciones civiles del sistema
 *     tags: [Situaciones Civiles]
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
 *                   $ref: '#/components/schemas/SituacionCivilStats'
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/stats', AuthMiddleware.authenticateToken, SituacionCivilController.getStats);

/**
 * @swagger
 * /api/catalog/situaciones-civiles:
 *   get:
 *     summary: Listar situaciones civiles
 *     description: Obtiene una lista paginada de situaciones civiles con opciones de filtrado y búsqueda
 *     tags: [Situaciones Civiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, descripción, código)
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir situaciones civiles inactivas
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [orden, nombre, codigo, createdAt, updatedAt]
 *           default: orden
 *         description: Campo de ordenamiento
 *       - in: query
 *         name: orderDirection
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Dirección del ordenamiento
 *     responses:
 *       200:
 *         description: Lista de situaciones civiles obtenida exitosamente
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
 *                     $ref: '#/components/schemas/SituacionCivil'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 filters:
 *                   type: object
 *                   properties:
 *                     search:
 *                       type: string
 *                     includeInactive:
 *                       type: boolean
 *                     orderBy:
 *                       type: string
 *                     orderDirection:
 *                       type: string
 *                 total:
 *                   type: integer
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', AuthMiddleware.authenticateToken, SituacionCivilController.getAll);

/**
 * @swagger
 * /api/catalog/situaciones-civiles:
 *   post:
 *     summary: Crear situación civil
 *     description: Crea una nueva situación civil en el sistema
 *     tags: [Situaciones Civiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SituacionCivilInput'
 *           examples:
 *             soltero:
 *               summary: Crear situación civil "Soltero(a)"
 *               value:
 *                 nombre: "Soltero(a)"
 *                 descripcion: "Persona que no ha contraído matrimonio"
 *                 codigo: "SOL"
 *                 orden: 1
 *                 activo: true
 *             casado:
 *               summary: Crear situación civil "Casado(a)"
 *               value:
 *                 nombre: "Casado(a)"
 *                 descripcion: "Persona unida en matrimonio civil o religioso"
 *                 codigo: "CAS"
 *                 orden: 2
 *                 activo: true
 *     responses:
 *       201:
 *         description: Situación civil creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/SituacionCivil'
 *                 message:
 *                   type: string
 *                   example: "Situación civil creada exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', AuthMiddleware.authenticateToken, SituacionCivilController.create);

/**
 * @swagger
 * /api/catalog/situaciones-civiles/search:
 *   get:
 *     summary: Buscar situaciones civiles
 *     description: Busca situaciones civiles por término en nombre, descripción o código
 *     tags: [Situaciones Civiles]
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
 *         example: "soltero"
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
 *         description: Incluir situaciones civiles inactivas
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
 *                     $ref: '#/components/schemas/SituacionCivil'
 *                 total:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/search', AuthMiddleware.authenticateToken, SituacionCivilController.search);

/**
 * @swagger
 * /api/catalog/situaciones-civiles/{id}:
 *   get:
 *     summary: Obtener situación civil por ID
 *     description: Retorna una situación civil específica por su ID
 *     tags: [Situaciones Civiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la situación civil
 *         example: 1
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir si está inactiva
 *     responses:
 *       200:
 *         description: Situación civil encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/SituacionCivil'
 *                 message:
 *                   type: string
 *                   example: "Situación civil encontrada"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', AuthMiddleware.authenticateToken, SituacionCivilController.getById);

/**
 * @swagger
 * /api/catalog/situaciones-civiles/{id}:
 *   put:
 *     summary: Actualizar situación civil
 *     description: Actualiza una situación civil existente
 *     tags: [Situaciones Civiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la situación civil
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SituacionCivilInput'
 *           example:
 *             nombre: "Soltero(a)"
 *             descripcion: "Persona que nunca ha contraído matrimonio"
 *             codigo: "SOL"
 *             orden: 1
 *             activo: true
 *     responses:
 *       200:
 *         description: Situación civil actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/SituacionCivil'
 *                 message:
 *                   type: string
 *                   example: "Situación civil actualizada exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', AuthMiddleware.authenticateToken, SituacionCivilController.update);

/**
 * @swagger
 * /api/catalog/situaciones-civiles/{id}:
 *   delete:
 *     summary: Eliminar situación civil
 *     description: Elimina una situación civil (eliminación lógica/soft delete)
 *     tags: [Situaciones Civiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la situación civil
 *         example: 1
 *     responses:
 *       200:
 *         description: Situación civil eliminada exitosamente
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
 *                   example: "Situación civil eliminada exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', AuthMiddleware.authenticateToken, SituacionCivilController.delete);

/**
 * @swagger
 * /api/catalog/situaciones-civiles/{id}/restore:
 *   patch:
 *     summary: Restaurar situación civil
 *     description: Restaura una situación civil previamente eliminada
 *     tags: [Situaciones Civiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la situación civil eliminada
 *         example: 1
 *     responses:
 *       200:
 *         description: Situación civil restaurada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/SituacionCivil'
 *                 message:
 *                   type: string
 *                   example: "Situación civil restaurada exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/:id/restore', AuthMiddleware.authenticateToken, SituacionCivilController.restore);

export default router;
