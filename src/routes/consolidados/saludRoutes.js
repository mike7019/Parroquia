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
 *             enfermedades_registradas:
 *               type: array
 *               description: Enfermedades desde tabla enfermedades
 *               items:
 *                 type: object
 *                 properties:
 *                   id_enfermedad:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *             total_enfermedades:
 *               type: integer
 *               description: Cantidad de enfermedades registradas
 *             enfermedades_texto:
 *               type: array
 *               description: Enfermedades como texto (campo necesidad_enfermo)
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
 *         description: Filtrar por ID de enfermedad específica (tabla enfermedades)
 *         example: 1
 *       - in: query
 *         name: enfermedad
 *         schema:
 *           type: string
 *         description: Filtrar por texto en necesidades médicas (búsqueda parcial)
 *         example: "diabetes"
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
 *         name: id_corregimiento
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de corregimiento
 *         example: 1
 *       - in: query
 *         name: id_centro_poblado
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de centro poblado
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
 * /api/personas/salud/reporte/excel:
 *   get:
 *     summary: Generar reporte de salud en Excel
 *     description: Genera y descarga un archivo Excel con el reporte completo de salud de personas. Incluye todos los filtros disponibles.
 *     tags: [Salud Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_enfermedad
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de enfermedad específica
 *         example: 1
 *       - in: query
 *         name: enfermedad
 *         schema:
 *           type: string
 *         description: Filtrar por texto en necesidades médicas
 *         example: "diabetes"
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
 *         description: Filtrar por ID de sexo
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de municipio
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de sector
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 5000
 *         description: Límite de resultados (máximo para Excel)
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error generando el reporte
 */
router.get('/reporte/excel', authMiddleware.authenticateToken, saludConsolidadoController.generarReporteExcel);

/**
 * @swagger
 * /api/personas/salud/reporte/json:
 *   get:
 *     summary: Generar reporte de salud en formato JSON
 *     description: Genera un reporte completo de salud de personas en formato JSON con todos los campos disponibles
 *     tags: [Salud Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: enfermedad
 *         schema:
 *           type: string
 *         description: Filtrar por enfermedad (búsqueda parcial en necesidad_enfermo)
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
 *         description: ID del sexo
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID del municipio
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID del sector
 *       - in: query
 *         name: id_enfermedad
 *         schema:
 *           type: integer
 *         description: ID de enfermedad específica de catálogo
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 5000
 *         description: Límite de registros
 *     responses:
 *       200:
 *         description: Reporte JSON generado exitosamente
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
 *                     type: object
 *                 total:
 *                   type: integer
 *                 filtros_aplicados:
 *                   type: object
 *                 fecha_generacion:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error generando el reporte
 */
router.get('/reporte/json', authMiddleware.authenticateToken, saludConsolidadoController.generarReporteJSON);

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
