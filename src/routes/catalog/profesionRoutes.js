import express from 'express';
import profesionController from '../../controllers/catalog/profesionController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Profesion:
 *       type: object
 *       properties:
 *         id_profesion:
 *           type: integer
 *           description: ID único de la profesión
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre de la profesión
 *           example: "Médico"
 *         descripcion:
 *           type: string
 *           description: Descripción de la profesión
 *           example: "Profesional de la salud especializado en diagnóstico y tratamiento"
 *         categoria:
 *           type: string
 *           description: Categoría o área de la profesión
 *           example: "Salud"
 *         nivel_educativo_requerido:
 *           type: string
 *           enum: [Primaria, Secundaria, Técnico, Tecnológico, Universitario, Especialización, Maestría, Doctorado, No requerido]
 *           description: Nivel educativo requerido para ejercer la profesión
 *           example: "Universitario"
 *         activo:
 *           type: boolean
 *           description: Estado de la profesión
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
 *     ProfesionInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la profesión
 *           example: "Ingeniero de Software"
 *         descripcion:
 *           type: string
 *           description: Descripción de la profesión
 *           example: "Profesional encargado del desarrollo y mantenimiento de software"
 *         categoria:
 *           type: string
 *           description: Categoría o área de la profesión
 *           example: "Tecnología"
 *         nivel_educativo_requerido:
 *           type: string
 *           enum: [Primaria, Secundaria, Técnico, Tecnológico, Universitario, Especialización, Maestría, Doctorado, No requerido]
 *           description: Nivel educativo requerido
 *           example: "Universitario"
 *         activo:
 *           type: boolean
 *           description: Estado de la profesión
 *           example: true
 *     
 *     ProfesionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Profesión obtenida exitosamente"
 *         data:
 *           type: object
 *           properties:
 *             profesion:
 *               $ref: '#/components/schemas/Profesion'
 *         timestamp:
 *           type: string
 *           format: date-time
 *     
 *     ProfesionesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Profesiones obtenidas exitosamente"
 *         data:
 *           type: object
 *           properties:
 *             profesiones:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profesion'
 *             total:
 *               type: integer
 *               description: Total de profesiones
 *               example: 50
 *         timestamp:
 *           type: string
 *           format: date-time
 *     
 *     EstadisticasProfesiones:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Estadísticas obtenidas exitosamente"
 *         data:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 150
 *             activas:
 *               type: integer
 *               example: 140
 *             inactivas:
 *               type: integer
 *               example: 10
 *             porCategoria:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   categoria:
 *                     type: string
 *                     example: "Salud"
 *                   cantidad:
 *                     type: integer
 *                     example: 25
 *             porNivelEducativo:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nivel:
 *                     type: string
 *                     example: "Universitario"
 *                   cantidad:
 *                     type: integer
 *                     example: 80
 */

/**
 * @swagger
 * /api/catalog/profesiones:
 *   get:
 *     summary: Obtener todas las profesiones
 *     description: Retorna una lista de todas las profesiones con opciones de filtrado y búsqueda
 *     tags: [Profesiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *         example: "médico"
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *         example: "Salud"
 *       - in: query
 *         name: nivelEducativo
 *         schema:
 *           type: string
 *           enum: [Primaria, Secundaria, Técnico, Tecnológico, Universitario, Especialización, Maestría, Doctorado, No requerido]
 *         description: Filtrar por nivel educativo requerido
 *         example: "Universitario"
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (true para activos, false para inactivos)
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de profesiones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfesionesListResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware.authenticateToken, profesionController.getAllProfesiones);

/**
 * @swagger
 * /api/catalog/profesiones/categorias:
 *   get:
 *     summary: Obtener categorías de profesiones
 *     description: Retorna una lista de todas las categorías de profesiones disponibles
 *     tags: [Profesiones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
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
 *                   example: "Categorías obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categorias:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Salud", "Educación", "Tecnología", "Ingeniería"]
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/categorias', authMiddleware.authenticateToken, profesionController.getCategorias);

/**
 * @swagger
 * /api/catalog/profesiones/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de profesiones
 *     description: Retorna estadísticas generales y distribución de profesiones por categoría y nivel educativo
 *     tags: [Profesiones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadisticasProfesiones'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas', authMiddleware.authenticateToken, profesionController.getEstadisticas);

/**
 * @swagger
 * /api/catalog/profesiones/{id}:
 *   get:
 *     summary: Obtener profesión por ID
 *     description: Retorna una profesión específica por su ID
 *     tags: [Profesiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la profesión
 *         example: 1
 *     responses:
 *       200:
 *         description: Profesión obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfesionResponse'
 *       404:
 *         description: Profesión no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware.authenticateToken, profesionController.getProfesionById);

/**
 * @swagger
 * /api/catalog/profesiones:
 *   post:
 *     summary: Crear nueva profesión
 *     description: Crea una nueva profesión en el sistema
 *     tags: [Profesiones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfesionInput'
 *           examples:
 *             medico:
 *               summary: Ejemplo de Médico
 *               value:
 *                 nombre: "Médico General"
 *                 descripcion: "Profesional de la salud especializado en medicina general"
 *                 categoria: "Salud"
 *                 nivel_educativo_requerido: "Universitario"
 *                 activo: true
 *             ingeniero:
 *               summary: Ejemplo de Ingeniero
 *               value:
 *                 nombre: "Ingeniero Civil"
 *                 descripcion: "Profesional encargado del diseño y construcción de infraestructuras"
 *                 categoria: "Ingeniería"
 *                 nivel_educativo_requerido: "Universitario"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Profesión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfesionResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: Ya existe una profesión con ese nombre
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware.authenticateToken, profesionController.createProfesion);

/**
 * @swagger
 * /api/catalog/profesiones/{id}:
 *   put:
 *     summary: Actualizar profesión
 *     description: Actualiza una profesión existente
 *     tags: [Profesiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la profesión a actualizar
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
 *                 example: "Médico Especialista"
 *               descripcion:
 *                 type: string
 *                 example: "Médico con especialización en área específica"
 *               categoria:
 *                 type: string
 *                 example: "Salud"
 *               nivel_educativo_requerido:
 *                 type: string
 *                 enum: [Primaria, Secundaria, Técnico, Tecnológico, Universitario, Especialización, Maestría, Doctorado, No requerido]
 *                 example: "Especialización"
 *               activo:
 *                 type: boolean
 *                 example: true
 *           examples:
 *             actualizacion_completa:
 *               summary: Actualización completa
 *               value:
 *                 nombre: "Médico Especialista"
 *                 descripcion: "Médico con especialización en área específica"
 *                 categoria: "Salud"
 *                 nivel_educativo_requerido: "Especialización"
 *                 activo: true
 *             actualizacion_parcial:
 *               summary: Actualización parcial
 *               value:
 *                 descripcion: "Nueva descripción actualizada"
 *                 categoria: "Salud Especializada"
 *     responses:
 *       200:
 *         description: Profesión actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfesionResponse'
 *       404:
 *         description: Profesión no encontrada
 *       409:
 *         description: Ya existe una profesión con ese nombre
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware.authenticateToken, profesionController.updateProfesion);

/**
 * @swagger
 * /api/catalog/profesiones/{id}:
 *   delete:
 *     summary: Eliminar profesión
 *     description: Elimina una profesión (soft delete - marca como inactiva)
 *     tags: [Profesiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la profesión a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Profesión eliminada exitosamente
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
 *                   example: "Profesión eliminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Profesión eliminada exitosamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Profesión no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware.authenticateToken, profesionController.deleteProfesion);

export default router;
