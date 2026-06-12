import express from 'express';
import necesidadEnfermoController from '../../controllers/catalog/necesidadEnfermoController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

// ─── CATÁLOGO: tipos de necesidad del enfermo ─────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: NecesidadEnfermo
 *   description: Gestión del catálogo de necesidades del enfermo y asignación a personas
 */

/**
 * @swagger
 * /api/catalog/necesidad-enfermo:
 *   get:
 *     summary: Listar tipos de necesidad del enfermo
 *     description: Retorna todos los tipos de necesidad del enfermo con soporte para búsqueda, filtros y paginación.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Texto para filtrar por nombre
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: nombre }
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [ASC, DESC], default: ASC }
 *         description: Dirección del ordenamiento
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de tipos de necesidad del enfermo
 *       401:
 *         description: No autorizado
 */
router.get('/', authMiddleware.authenticateToken, (req, res) => necesidadEnfermoController.getAllTiposNecesidad(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/select:
 *   get:
 *     summary: Tipos de necesidad del enfermo para dropdown/select
 *     description: Retorna la lista de tipos de necesidad activos en formato simplificado para uso en formularios.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista simplificada de tipos de necesidad del enfermo
 */
router.get('/select', authMiddleware.authenticateToken, (req, res) => necesidadEnfermoController.getTiposNecesidadSelect(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/stats:
 *   get:
 *     summary: Estadísticas de necesidades del enfermo
 *     description: Retorna estadísticas generales y distribución de personas por tipo de necesidad.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de necesidades del enfermo
 */
router.get('/stats', authMiddleware.authenticateToken, (req, res) => necesidadEnfermoController.getStats(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/persona/{idPersona}:
 *   get:
 *     summary: Necesidades del enfermo de una persona
 *     description: Retorna todos los tipos de necesidad asignados a una persona específica.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPersona
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Necesidades del enfermo de la persona
 *       404:
 *         description: Persona no encontrada
 */
router.get('/persona/:idPersona', authMiddleware.authenticateToken, (req, res) => necesidadEnfermoController.getNecesidadesByPersona(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/persona/{idPersona}:
 *   post:
 *     summary: Asignar tipo de necesidad del enfermo a una persona
 *     description: Asocia un tipo de necesidad del enfermo a una persona. Si la asociación ya existía pero estaba inactiva, la reactiva.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPersona
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_tipo_necesidad_enfermo]
 *             properties:
 *               id_tipo_necesidad_enfermo:
 *                 type: integer
 *                 description: ID del tipo de necesidad del enfermo a asignar
 *               descripcion:
 *                 type: string
 *                 description: Descripción específica de la necesidad (opcional)
 *     responses:
 *       201:
 *         description: Necesidad del enfermo asignada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Persona o tipo de necesidad no encontrado
 */
router.post('/persona/:idPersona', authMiddleware.authenticateToken, authMiddleware.requireRole(['Administrador']), (req, res) => necesidadEnfermoController.asociarPersonaNecesidad(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/persona/{idPersona}/{idTipoNecesidad}:
 *   delete:
 *     summary: Quitar tipo de necesidad del enfermo de una persona
 *     description: Desactiva la asociación entre una persona y un tipo de necesidad del enfermo.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPersona
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la persona
 *       - in: path
 *         name: idTipoNecesidad
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo
 *     responses:
 *       200:
 *         description: Necesidad del enfermo desasociada exitosamente
 *       404:
 *         description: Asociación no encontrada
 */
router.delete('/persona/:idPersona/:idTipoNecesidad', authMiddleware.authenticateToken, authMiddleware.requireRole(['Administrador']), (req, res) => necesidadEnfermoController.desasociarPersonaNecesidad(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/{id}:
 *   get:
 *     summary: Obtener tipo de necesidad del enfermo por ID
 *     description: Retorna un tipo de necesidad del enfermo por su ID. Opcionalmente incluye la lista de personas asociadas.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo
 *       - in: query
 *         name: incluirPersonas
 *         schema: { type: boolean, default: false }
 *         description: Si se incluyen las personas asociadas
 *     responses:
 *       200:
 *         description: Tipo de necesidad del enfermo encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/:id', authMiddleware.authenticateToken, (req, res) => necesidadEnfermoController.getTipoNecesidadById(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo:
 *   post:
 *     summary: Crear tipo de necesidad del enfermo
 *     description: Crea un nuevo tipo de necesidad del enfermo en el catálogo. Requiere rol Administrador.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Medicamentos
 *                 description: Nombre único del tipo de necesidad del enfermo
 *               descripcion:
 *                 type: string
 *                 example: Necesidad de medicamentos para tratamiento médico
 *                 description: Descripción del tipo de necesidad (opcional)
 *     responses:
 *       201:
 *         description: Tipo de necesidad del enfermo creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Ya existe un tipo de necesidad con ese nombre
 */
router.post('/', authMiddleware.authenticateToken, authMiddleware.requireRole(['Administrador']), (req, res) => necesidadEnfermoController.createTipoNecesidad(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/{id}:
 *   put:
 *     summary: Actualizar tipo de necesidad del enfermo
 *     description: Actualiza los datos de un tipo de necesidad del enfermo existente. Requiere rol Administrador.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del tipo de necesidad
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción
 *               activo:
 *                 type: boolean
 *                 description: Estado activo/inactivo
 *     responses:
 *       200:
 *         description: Tipo de necesidad del enfermo actualizado exitosamente
 *       404:
 *         description: No encontrado
 *       409:
 *         description: Nombre duplicado
 */
router.put('/:id', authMiddleware.authenticateToken, authMiddleware.requireRole(['Administrador']), (req, res) => necesidadEnfermoController.updateTipoNecesidad(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/{id}:
 *   delete:
 *     summary: Desactivar tipo de necesidad del enfermo
 *     description: Desactiva un tipo de necesidad del enfermo del catálogo. No se puede desactivar si tiene personas asociadas. Requiere rol Administrador.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo
 *     responses:
 *       200:
 *         description: Tipo de necesidad del enfermo desactivado exitosamente
 *       404:
 *         description: No encontrado
 *       409:
 *         description: No se puede eliminar, tiene personas activas asociadas
 */
router.delete('/:id', authMiddleware.authenticateToken, authMiddleware.requireRole(['Administrador']), (req, res) => necesidadEnfermoController.deleteTipoNecesidad(req, res));

/**
 * @swagger
 * /api/catalog/necesidad-enfermo/{id}/personas:
 *   get:
 *     summary: Personas de un tipo de necesidad del enfermo
 *     description: Retorna todas las personas activas asociadas a un tipo de necesidad del enfermo específico.
 *     tags: [NecesidadEnfermo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo
 *     responses:
 *       200:
 *         description: Personas del tipo de necesidad del enfermo
 *       404:
 *         description: Tipo de necesidad del enfermo no encontrado
 */
router.get('/:id/personas', authMiddleware.authenticateToken, (req, res) => necesidadEnfermoController.getPersonasByTipoNecesidad(req, res));

export default router;
