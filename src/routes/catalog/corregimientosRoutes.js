import express from 'express';
import corregimientosController from '../../controllers/catalog/corregimientosController.js';
import authMiddleware from '../../middlewares/auth.js';
import validationMiddleware from '../../middlewares/validation.js';
import corregimientosValidators from '../../validators/corregimientosValidators.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Corregimiento:
 *       type: object
 *       properties:
 *         id_corregimiento:
 *           type: integer
 *           description: ID único del corregimiento
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del corregimiento
 *           example: "Corregimiento El Centro"
 *         codigo_corregimiento:
 *           type: string
 *           description: Código único del corregimiento (generado automáticamente)
 *           example: "COR-0001"
 *           readOnly: true
 *         id_municipio_municipios:
 *           type: integer
 *           description: ID del municipio al que pertenece
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         municipio:
 *           type: object
 *           properties:
 *             id_municipio:
 *               type: integer
 *             nombre_municipio:
 *               type: string
 *             codigo_municipio:
 *               type: string
 *     
 *     CorregimientoInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nombre del corregimiento
 *           example: "Corregimiento La Esperanza"
 *         id_municipio_municipios:
 *           type: integer
 *           minimum: 1
 *           description: ID del municipio (opcional)
 *           example: 1
 *     
 *     CorregimientoUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nombre del corregimiento
 *           example: "Corregimiento Actualizado"
 *         id_municipio_municipios:
 *           type: integer
 *           minimum: 1
 *           description: ID del municipio
 *           example: 2
 */

/**
 * @swagger
 * /api/catalog/corregimientos:
 *   get:
 *     tags: [Corregimientos]
 *     summary: Obtener todos los corregimientos
 *     description: Lista paginada de corregimientos con opciones de búsqueda y filtrado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o código
 *         example: "Centro"
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: Filtrar por municipio
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Registros por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nombre, codigo_corregimiento, created_at, updated_at]
 *           default: nombre
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de corregimientos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Se encontraron 15 corregimiento(s)
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Corregimiento'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/',
  authMiddleware.authenticateToken,
  corregimientosValidators.validateQuery,
  validationMiddleware.handleValidationErrors,
  corregimientosController.getAllCorregimientos
);

/**
 * @swagger
 * /api/catalog/corregimientos/municipio/{id_municipio}:
 *   get:
 *     tags: [Corregimientos]
 *     summary: Obtener corregimientos por municipio
 *     description: Obtiene todos los corregimientos de un municipio específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_municipio
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del municipio
 *         example: 1
 *     responses:
 *       200:
 *         description: Corregimientos obtenidos exitosamente
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
 *                     $ref: '#/components/schemas/Corregimiento'
 *                 total:
 *                   type: integer
 *                   example: 3
 *                 municipio:
 *                   type: object
 *                   properties:
 *                     id_municipio:
 *                       type: integer
 *                     nombre_municipio:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: Se encontraron 3 corregimiento(s) en Medellín
 *       404:
 *         description: Municipio no encontrado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/municipio/:id_municipio',
  authMiddleware.authenticateToken,
  corregimientosController.getCorregimientosByMunicipio
);

/**
 * @swagger
 * /api/catalog/corregimientos/statistics:
 *   get:
 *     tags: [Corregimientos]
 *     summary: Obtener estadísticas de corregimientos
 *     description: Obtiene estadísticas de uso de corregimientos (familias por corregimiento)
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
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Estadísticas obtenidas exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_corregimiento:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       codigo:
 *                         type: string
 *                       municipio:
 *                         type: string
 *                       familias_usando:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics',
  authMiddleware.authenticateToken,
  corregimientosController.getEstadisticas
);

/**
 * @swagger
 * /api/catalog/corregimientos/{id}:
 *   get:
 *     tags: [Corregimientos]
 *     summary: Obtener un corregimiento por ID
 *     description: Obtiene los detalles de un corregimiento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del corregimiento
 *     responses:
 *       200:
 *         description: Corregimiento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Corregimiento obtenido exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Corregimiento'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Corregimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id',
  authMiddleware.authenticateToken,
  corregimientosValidators.validateId,
  validationMiddleware.handleValidationErrors,
  corregimientosController.getCorregimientoById
);

/**
 * @swagger
 * /api/catalog/corregimientos:
 *   post:
 *     tags: [Corregimientos]
 *     summary: Crear un nuevo corregimiento
 *     description: Crea un nuevo corregimiento en el catálogo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CorregimientoInput'
 *           example:
 *             nombre: "Corregimiento San Pedro"
 *             id_municipio_municipios: 1
 *     responses:
 *       201:
 *         description: Corregimiento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Corregimiento creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Corregimiento'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Ya existe un corregimiento con ese nombre o código
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  corregimientosValidators.validateCreate,
  validationMiddleware.handleValidationErrors,
  corregimientosController.createCorregimiento
);

/**
 * @swagger
 * /api/catalog/corregimientos/{id}:
 *   put:
 *     tags: [Corregimientos]
 *     summary: Actualizar un corregimiento
 *     description: Actualiza los datos de un corregimiento existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del corregimiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CorregimientoUpdate'
 *           example:
 *             nombre: "Corregimiento San Pedro Actualizado"
 *             id_municipio_municipios: 2
 *     responses:
 *       200:
 *         description: Corregimiento actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Corregimiento actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Corregimiento'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Corregimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe un corregimiento con ese nombre o código
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  corregimientosValidators.validateUpdate,
  validationMiddleware.handleValidationErrors,
  corregimientosController.updateCorregimiento
);

/**
 * @swagger
 * /api/catalog/corregimientos/{id}:
 *   delete:
 *     tags: [Corregimientos]
 *     summary: Eliminar un corregimiento
 *     description: Elimina un corregimiento del catálogo (solo si no está en uso)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del corregimiento
 *     responses:
 *       200:
 *         description: Corregimiento eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Corregimiento eliminado exitosamente
 *                 data:
 *                   type: null
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Corregimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Corregimiento en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: No se puede eliminar el corregimiento porque 5 familia(s) lo están usando
 *               code: CORREGIMIENTO_IN_USE
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  corregimientosValidators.validateId,
  validationMiddleware.handleValidationErrors,
  corregimientosController.deleteCorregimiento
);

export default router;
