import express from 'express';
import liderazgoController from '../../controllers/catalog/liderazgoController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';

const router = express.Router();

// ─── CATÁLOGO: tipos de liderazgo ─────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Liderazgo
 *   description: Gestión del catálogo de tipos de liderazgo y asignación a personas
 */

/**
 * @swagger
 * /api/catalog/liderazgo:
 *   get:
 *     summary: Listar tipos de liderazgo
 *     description: Retorna todos los tipos de liderazgo con soporte para búsqueda, filtros y paginación.
 *     tags: [Liderazgo]
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
 *         description: Lista de tipos de liderazgo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito: { type: boolean, example: true }
 *                 mensaje: { type: string }
 *                 datos:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/TipoLiderazgo' }
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     totalPages: { type: integer }
 *       401:
 *         description: No autorizado
 */
router.get('/', authMiddleware.authenticateToken, (req, res) => liderazgoController.getAllTiposLiderazgo(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/select:
 *   get:
 *     summary: Tipos de liderazgo para dropdown/select
 *     description: Retorna la lista de tipos de liderazgo activos en formato simplificado para uso en formularios.
 *     tags: [Liderazgo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista simplificada de tipos de liderazgo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito: { type: boolean, example: true }
 *                 datos:
 *                   type: object
 *                   properties:
 *                     tipos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value: { type: integer }
 *                           label: { type: string }
 *                           descripcion: { type: string }
 */
router.get('/select', authMiddleware.authenticateToken, (req, res) => liderazgoController.getTiposLiderazgoSelect(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/stats:
 *   get:
 *     summary: Estadísticas de tipos de liderazgo
 *     description: Retorna estadísticas generales y distribución de personas por tipo de liderazgo.
 *     tags: [Liderazgo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de liderazgo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito: { type: boolean, example: true }
 *                 datos:
 *                   type: object
 *                   properties:
 *                     resumen:
 *                       type: object
 *                       properties:
 *                         activos: { type: integer }
 *                         inactivos: { type: integer }
 *                         total: { type: integer }
 *                     distribucion_por_tipo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_tipo_liderazgo: { type: integer }
 *                           nombre: { type: string }
 *                           total_personas: { type: integer }
 *                           personas_activas: { type: integer }
 */
router.get('/stats', authMiddleware.authenticateToken, (req, res) => liderazgoController.getStats(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/persona/{idPersona}:
 *   get:
 *     summary: Liderazgos de una persona
 *     description: Retorna todos los tipos de liderazgo asignados a una persona específica.
 *     tags: [Liderazgo]
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
 *         description: Liderazgos de la persona
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito: { type: boolean, example: true }
 *                 datos:
 *                   type: object
 *                   properties:
 *                     id_persona: { type: integer }
 *                     liderazgos:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/PersonaLiderazgo' }
 *                     total: { type: integer }
 *       404:
 *         description: Persona no encontrada
 */
router.get('/persona/:idPersona', authMiddleware.authenticateToken, (req, res) => liderazgoController.getLiderazgosByPersona(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/persona/{idPersona}:
 *   post:
 *     summary: Asignar tipo de liderazgo a una persona
 *     description: Asocia un tipo de liderazgo a una persona. Si la asociación ya existía pero estaba inactiva, la reactiva.
 *     tags: [Liderazgo]
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
 *             required: [id_tipo_liderazgo]
 *             properties:
 *               id_tipo_liderazgo:
 *                 type: integer
 *                 description: ID del tipo de liderazgo a asignar
 *               descripcion:
 *                 type: string
 *                 description: Descripción específica del rol de liderazgo (opcional)
 *     responses:
 *       201:
 *         description: Liderazgo asignado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Persona o tipo de liderazgo no encontrado
 */
router.post('/persona/:idPersona', authMiddleware.authenticateToken, requireRole(['Administrador']), (req, res) => liderazgoController.asociarPersonaLiderazgo(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/persona/{idPersona}/{idTipoLiderazgo}:
 *   delete:
 *     summary: Quitar tipo de liderazgo de una persona
 *     description: Desactiva la asociación entre una persona y un tipo de liderazgo.
 *     tags: [Liderazgo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPersona
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la persona
 *       - in: path
 *         name: idTipoLiderazgo
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *     responses:
 *       200:
 *         description: Liderazgo desasociado exitosamente
 *       404:
 *         description: Asociación no encontrada
 */
router.delete('/persona/:idPersona/:idTipoLiderazgo', authMiddleware.authenticateToken, requireRole(['Administrador']), (req, res) => liderazgoController.desasociarPersonaLiderazgo(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/{id}:
 *   get:
 *     summary: Obtener tipo de liderazgo por ID
 *     description: Retorna un tipo de liderazgo por su ID. Opcionalmente incluye la lista de personas asociadas.
 *     tags: [Liderazgo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *       - in: query
 *         name: incluirPersonas
 *         schema: { type: boolean, default: false }
 *         description: Si se incluyen las personas asociadas
 *     responses:
 *       200:
 *         description: Tipo de liderazgo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito: { type: boolean, example: true }
 *                 datos:
 *                   type: object
 *                   properties:
 *                     tipoLiderazgo: { $ref: '#/components/schemas/TipoLiderazgo' }
 *       404:
 *         description: No encontrado
 */
router.get('/:id', authMiddleware.authenticateToken, (req, res) => liderazgoController.getTipoLiderazgoById(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo:
 *   post:
 *     summary: Crear tipo de liderazgo
 *     description: Crea un nuevo tipo de liderazgo en el catálogo. Requiere rol Administrador.
 *     tags: [Liderazgo]
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
 *                 example: Líder Juvenil
 *                 description: Nombre único del tipo de liderazgo
 *               descripcion:
 *                 type: string
 *                 example: Liderazgo en grupos y movimientos juveniles
 *                 description: Descripción del tipo de liderazgo (opcional)
 *     responses:
 *       201:
 *         description: Tipo de liderazgo creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Ya existe un tipo de liderazgo con ese nombre
 */
router.post('/', authMiddleware.authenticateToken, requireRole(['Administrador']), (req, res) => liderazgoController.createTipoLiderazgo(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/{id}:
 *   put:
 *     summary: Actualizar tipo de liderazgo
 *     description: Actualiza los datos de un tipo de liderazgo existente. Requiere rol Administrador.
 *     tags: [Liderazgo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del tipo de liderazgo
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción
 *               activo:
 *                 type: boolean
 *                 description: Estado activo/inactivo
 *     responses:
 *       200:
 *         description: Tipo de liderazgo actualizado exitosamente
 *       404:
 *         description: No encontrado
 *       409:
 *         description: Nombre duplicado
 */
router.put('/:id', authMiddleware.authenticateToken, requireRole(['Administrador']), (req, res) => liderazgoController.updateTipoLiderazgo(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/{id}:
 *   delete:
 *     summary: Desactivar tipo de liderazgo
 *     description: Desactiva un tipo de liderazgo del catálogo. No se puede desactivar si tiene personas asociadas. Requiere rol Administrador.
 *     tags: [Liderazgo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *     responses:
 *       200:
 *         description: Tipo de liderazgo desactivado exitosamente
 *       404:
 *         description: No encontrado
 *       409:
 *         description: No se puede eliminar, tiene personas activas asociadas
 */
router.delete('/:id', authMiddleware.authenticateToken, requireRole(['Administrador']), (req, res) => liderazgoController.deleteTipoLiderazgo(req, res));

/**
 * @swagger
 * /api/catalog/liderazgo/{id}/personas:
 *   get:
 *     summary: Personas de un tipo de liderazgo
 *     description: Retorna todas las personas activas asociadas a un tipo de liderazgo específico.
 *     tags: [Liderazgo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *     responses:
 *       200:
 *         description: Personas del tipo de liderazgo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito: { type: boolean, example: true }
 *                 datos:
 *                   type: object
 *                   properties:
 *                     tipo_liderazgo: { type: string }
 *                     personas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_personas: { type: integer }
 *                           nombre_completo: { type: string }
 *                           identificacion: { type: string }
 *                           descripcion_liderazgo: { type: string }
 *                           fecha_asignacion: { type: string, format: date-time }
 *                     total: { type: integer }
 *       404:
 *         description: Tipo de liderazgo no encontrado
 */
router.get('/:id/personas', authMiddleware.authenticateToken, (req, res) => liderazgoController.getPersonasByTipoLiderazgo(req, res));

export default router;
