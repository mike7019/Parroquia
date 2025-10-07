import express from 'express';
import saludConsolidadoController from '../../controllers/consolidados/saludConsolidadoController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonaSalud:
 *       type: object
 *       properties:
 *         documento:
 *           type: string
 *           description: Número de documento de identificación
 *         nombre:
 *           type: string
 *           description: Nombre completo de la persona
 *         apellido_familiar:
 *           type: string
 *           description: Apellido de la familia
 *         sexo:
 *           type: string
 *           description: Sexo de la persona
 *         edad:
 *           type: integer
 *           description: Edad calculada
 *         telefono:
 *           type: string
 *           description: Número de teléfono
 *         parentesco:
 *           type: string
 *           description: Parentesco inferido
 *         parroquia:
 *           type: string
 *           description: Parroquia de pertenencia
 *         municipio:
 *           type: string
 *           description: Municipio de residencia
 *         sector:
 *           type: string
 *           description: Sector o vereda
 *         salud:
 *           type: object
 *           properties:
 *             enfermedades:
 *               type: array
 *               items:
 *                 type: string
 *             necesidades_medicas:
 *               type: string
 *             tiene_enfermedades:
 *               type: boolean
 *     
 *     RespuestaSalud:
 *       type: object
 *       properties:
 *         exito:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PersonaSalud'
 *         total:
 *           type: integer
 *         estadisticas:
 *           type: object
 *         filtros_aplicados:
 *           type: object
 */

/**
 * @swagger
 * /api/personas/salud:
 *   get:
 *     summary: Consulta consolidada de salud de personas
 *     description: Obtiene información de salud de personas con filtros múltiples
 *     tags: [Salud Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_enfermedad
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de enfermedad
 *         example: 1
 *       - in: query
 *         name: rango_edad
 *         schema:
 *           type: string
 *         description: Rango de edades (formato "min-max")
 *         example: "18-65"
 *       - in: query
 *         name: edad_min
 *         schema:
 *           type: integer
 *         description: Edad mínima
 *       - in: query
 *         name: edad_max
 *         schema:
 *           type: integer
 *         description: Edad máxima
 *       - in: query
 *         name: id_sexo
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de sexo (1=Masculino, 2=Femenino)
 *         example: 1
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de parroquia
 *         example: 1
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de municipio
 *         example: 1
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de sector
 *         example: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaSalud'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware.authenticateToken, saludConsolidadoController.consultarSalud);

/**
 * @swagger
 * /api/personas/salud/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de salud
 *     description: Estadísticas generales de salud de todas las personas
 *     tags: [Salud Consolidado]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: object
 *                   properties:
 *                     enfermedades_mas_comunes:
 *                       type: object
 *                     distribucion_edades:
 *                       type: object
 *                     por_sexo:
 *                       type: object
 *                     por_municipio:
 *                       type: object
 *                     con_enfermedades:
 *                       type: integer
 *                     sin_enfermedades:
 *                       type: integer
 *                 total_personas:
 *                   type: integer
 */
router.get('/estadisticas', authMiddleware.authenticateToken, saludConsolidadoController.obtenerEstadisticas);

/**
 * @swagger
 * /api/personas/salud/parroquia/{id}:
 *   get:
 *     summary: Obtener resumen de salud por parroquia
 *     description: Resumen de estadísticas de salud para una parroquia específica
 *     tags: [Salud Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la parroquia
 *     responses:
 *       200:
 *         description: Resumen obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: object
 *                 total_personas:
 *                   type: integer
 */
router.get('/parroquia/:id', authMiddleware.authenticateToken, saludConsolidadoController.obtenerResumenPorParroquia);

/**
 * @swagger
 * /api/personas/salud/enfermedades/{enfermedad}:
 *   get:
 *     summary: Buscar personas con enfermedad específica
 *     description: Lista de personas que padecen una enfermedad particular
 *     tags: [Salud Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enfermedad
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la enfermedad
 *         example: diabetes
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Personas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonaSalud'
 *                 total:
 *                   type: integer
 */
router.get('/enfermedades/:enfermedad', authMiddleware.authenticateToken, saludConsolidadoController.buscarPorEnfermedad);

export default router;
