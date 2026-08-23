import express from 'express';
import familiasConsolidadoController from '../../controllers/consolidados/familiasConsolidadoController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonaFamilia:
 *       type: object
 *       properties:
 *         id_persona:
 *           type: integer
 *           description: ID único de la persona
 *         documento:
 *           type: string
 *           description: Número de documento de identificación
 *         nombre:
 *           type: string
 *           description: Nombre completo de la persona
 *         sexo:
 *           type: string
 *           description: Sexo de la persona
 *         edad:
 *           type: integer
 *           description: Edad calculada
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *         telefono:
 *           type: string
 *           description: Número de teléfono
 *         parentesco:
 *           type: string
 *           description: Parentesco inferido
 *         apellido_familiar:
 *           type: string
 *           description: Apellido de la familia
 *         direccion:
 *           type: string
 *           description: Dirección de residencia
 *         parroquia:
 *           type: string
 *           description: Parroquia de pertenencia
 *         municipio:
 *           type: string
 *           description: Municipio de residencia
 *         sector:
 *           type: string
 *           description: Sector o vereda
 *         familia:
 *           type: object
 *           properties:
 *             id_familia:
 *               type: integer
 *             apellido_familiar:
 *               type: string
 *             tipo_vivienda:
 *               type: string
 *             tamaño_familia:
 *               type: integer
 *     
 *     RespuestaFamilias:
 *       type: object
 *       properties:
 *         exito:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PersonaFamilia'
 *         total:
 *           type: integer
 *         estadisticas:
 *           type: object
 *         filtros_aplicados:
 *           type: object
 */

/**
 * @swagger
 * /api/familias:
 *   get:
 *     summary: Consulta consolidada de familias y personas
 *     description: Obtiene información completa de familias y sus integrantes con filtros por ID
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector
 *       - in: query
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: ID específico de la vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema:
 *           type: integer
 *         description: ID específico del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema:
 *           type: integer
 *         description: ID específico del centro poblado
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaFamilias'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware.authenticateToken, familiasConsolidadoController.consultarFamilias);

/**
 * @swagger
 * /api/familias/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de familias
 *     description: Estadísticas generales de todas las familias y personas
 *     tags: [Familias Consolidado]
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
 *                     total_personas:
 *                       type: integer
 *                     por_sexo:
 *                       type: object
 *                     por_parentesco:
 *                       type: object
 *                     por_municipio:
 *                       type: object
 *                     distribucion_edades:
 *                       type: object
 *                 total_personas:
 *                   type: integer
 */
router.get('/estadisticas', authMiddleware.authenticateToken, familiasConsolidadoController.obtenerEstadisticas);

/**
 * @swagger
 * /api/familias/madres:
 *   get:
 *     summary: Consultar madres específicamente
 *     description: Lista de todas las madres registradas en el sistema
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector
 *       - in: query
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: ID específico de la vereda
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Madres encontradas
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
 *                     $ref: '#/components/schemas/PersonaFamilia'
 *                 total:
 *                   type: integer
 */
router.get('/madres', authMiddleware.authenticateToken, familiasConsolidadoController.consultarMadres);

/**
 * @swagger
 * /api/familias/padres:
 *   get:
 *     summary: Consultar padres específicamente
 *     description: Lista de todos los padres registrados en el sistema
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector
 *       - in: query
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: ID específico de la vereda
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Padres encontrados
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
 *                     $ref: '#/components/schemas/PersonaFamilia'
 *                 total:
 *                   type: integer
 */
router.get('/padres', authMiddleware.authenticateToken, familiasConsolidadoController.consultarPadres);

/**
 * @swagger
 * /api/familias/sin-padre:
 *   get:
 *     summary: Consultar familias sin padre
 *     description: Lista de familias que no tienen una figura paterna
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector
 *       - in: query
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: ID específico de la vereda
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Familias sin padre encontradas
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
 *                 total:
 *                   type: integer
 */
router.get('/sin-padre', authMiddleware.authenticateToken, familiasConsolidadoController.consultarFamiliasSinPadre);

/**
 * @swagger
 * /api/familias/sin-madre:
 *   get:
 *     summary: Consultar familias sin madre
 *     description: Lista de familias que no tienen una figura materna
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector
 *       - in: query
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: ID específico de la vereda
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Familias sin madre encontradas
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
 *                 total:
 *                   type: integer
 */
router.get('/sin-madre', authMiddleware.authenticateToken, familiasConsolidadoController.consultarFamiliasSinMadre);

/**
 * @swagger
 * /api/familias/excel-completo:
 *   get:
 *     summary: Generar reporte Excel completo de familias
 *     description: >
 *       Genera un archivo Excel con información completa de familias agrupadas en 4 hojas:
 *       "Información General", "Miembros de Familias", "Difuntos" y "Estadísticas" (esta
 *       última siempre completa, no admite selección de columnas). Las primeras 3 hojas
 *       aceptan selección de columnas **independiente por hoja** vía los parámetros
 *       `campos_informacion_general`, `campos_miembros_familias` y `campos_difuntos` —
 *       así el frontend puede dejar que el usuario elija, pestaña por pestaña, qué
 *       columnas exportar en cada una, sin que la selección de una hoja afecte a las demás.
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio (acepta ID numérico o nombre)
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector
 *       - in: query
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: ID específico de la vereda
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados por página
 *       - in: query
 *         name: campos_informacion_general
 *         schema: { type: string }
 *         description: >
 *           Columnas para la hoja "Información General", separadas por comas. Disponibles:
 *           codigo, apellido, direccion, telefono, parroquia, municipio, departamento,
 *           sector, vereda, corregimiento, centro_poblado, tipo_vivienda, acueducto,
 *           basura, aguas, num_miembros, num_difuntos. Si se omite, cae a `campos`
 *           (o todas las columnas si tampoco se envió `campos`).
 *         example: apellido,direccion,telefono,parroquia,municipio,sector
 *       - in: query
 *         name: campos_miembros_familias
 *         schema: { type: string }
 *         description: >
 *           Columnas para la hoja "Miembros de Familias", separadas por comas. Disponibles:
 *           id_familia, familia, nombre, tipo_id, num_id, parentesco, sexo, edad, fecha_nac,
 *           telefono, email, situacion_civil, estudios, profesion, comunidad, destrezas,
 *           liderazgo, talla_camisa, talla_pantalon, talla_calzado, celebraciones,
 *           enfermedades, necesidades_enfermo. Si se omite, cae a `campos` (o todas las
 *           columnas si tampoco se envió `campos`).
 *         example: nombre,parentesco,sexo,edad,telefono
 *       - in: query
 *         name: campos_difuntos
 *         schema: { type: string }
 *         description: >
 *           Columnas para la hoja "Difuntos", separadas por comas. Disponibles: id_familia,
 *           familia, nombre, parentesco, sexo, fecha, causa. Si se omite, cae a `campos`
 *           (o todas las columnas si tampoco se envió `campos`).
 *         example: nombre,parentesco,fecha
 *       - in: query
 *         name: campos
 *         schema: { type: string }
 *         description: >
 *           Selección de columnas genérica aplicada a cualquier hoja que no tenga su
 *           propio parámetro `campos_*` en la misma request (compatibilidad con
 *           integraciones existentes que solo mandan una lista para todas las hojas).
 *           Si una hoja no coincide con ninguna de sus columnas disponibles, esa hoja
 *           se exporta completa en vez de vacía.
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Valor de filtro inválido (ej. id_sector no numérico)
 *       404:
 *         description: No hay datos para generar el Excel
 *       500:
 *         description: Error interno del servidor
 */
router.get('/excel-completo', authMiddleware.authenticateToken, familiasConsolidadoController.generarReporteExcelCompleto);

/**
 * @swagger
 * /api/familias/reporte/excel:
 *   get:
 *     summary: Generar reporte Excel completo de familias (alias de /excel-completo)
 *     description: >
 *       Alias de `/api/familias/excel-completo` — mismo controlador, mismos parámetros
 *       (incluida la selección de columnas por hoja vía `campos_informacion_general`,
 *       `campos_miembros_familias`, `campos_difuntos` y el `campos` genérico de respaldo).
 *       Se documenta por separado únicamente porque es una ruta distinta.
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema: { type: integer }
 *         description: ID específico de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema: { type: integer }
 *         description: ID específico del municipio (acepta ID numérico o nombre)
 *       - in: query
 *         name: id_sector
 *         schema: { type: integer }
 *         description: ID específico del sector
 *       - in: query
 *         name: id_vereda
 *         schema: { type: integer }
 *         description: ID específico de la vereda
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 100 }
 *         description: Límite de resultados por página
 *       - in: query
 *         name: campos_informacion_general
 *         schema: { type: string }
 *         description: Columnas para la hoja "Información General" (ver /excel-completo para el detalle de columnas disponibles).
 *         example: apellido,direccion,telefono,parroquia,municipio,sector
 *       - in: query
 *         name: campos_miembros_familias
 *         schema: { type: string }
 *         description: Columnas para la hoja "Miembros de Familias" (ver /excel-completo para el detalle de columnas disponibles).
 *         example: nombre,parentesco,sexo,edad,telefono
 *       - in: query
 *         name: campos_difuntos
 *         schema: { type: string }
 *         description: Columnas para la hoja "Difuntos" (ver /excel-completo para el detalle de columnas disponibles).
 *         example: nombre,parentesco,fecha
 *       - in: query
 *         name: campos
 *         schema: { type: string }
 *         description: Selección de columnas genérica de respaldo para cualquier hoja sin su propio `campos_*`.
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Valor de filtro inválido (ej. id_sector no numérico)
 *       404:
 *         description: No hay datos para generar el Excel
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reporte/excel', authMiddleware.authenticateToken, familiasConsolidadoController.generarReporteExcelCompleto);

export default router;
