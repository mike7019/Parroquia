import express from 'express';
import personasController from '../../controllers/consolidados/personasController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonaConsolidada:
 *       type: object
 *       properties:
 *         id_personas:
 *           type: integer
 *         nombre_completo:
 *           type: string
 *         documento:
 *           type: string
 *         edad:
 *           type: integer
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *         sexo:
 *           type: string
 *         telefono:
 *           type: string
 *         correo_electronico:
 *           type: string
 *         municipio:
 *           type: string
 *         parroquia:
 *           type: string
 *         sector:
 *           type: string
 *         vereda:
 *           type: string
 *         direccion:
 *           type: string
 *         apellido_familiar:
 *           type: string
 *         parentesco:
 *           type: string
 *         estado_civil:
 *           type: string
 *         profesion:
 *           type: string
 *         nivel_estudios:
 *           type: string
 *         estudios:
 *           type: string
 *         comunidad_cultural:
 *           type: string
 *         destrezas:
 *           type: array
 *           items:
 *             type: string
 *         liderazgo:
 *           type: string
 *         talla_camisa:
 *           type: string
 *         talla_pantalon:
 *           type: string
 *         talla_zapato:
 *           type: string
 *         tipo_vivienda:
 *           type: string
 *         fecha_registro:
 *           type: string
 *           format: date-time
 *
 *     PersonasResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PersonaConsolidada'
 */

/**
 * @swagger
 * /api/personas/consolidado/geografico:
 *   get:
 *     summary: Consultar personas por ubicación geográfica
 *     description: Filtrar personas por IDs de municipio, parroquia, sector o vereda
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID del municipio
 *         example: 1
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID de la parroquia
 *         example: 1
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID del sector
 *         example: 1
 *       - in: query
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: ID de la vereda
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
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, excel]
 *           default: json
 *         description: Formato de respuesta (json o excel)
 *     responses:
 *       200:
 *         description: Lista de personas filtradas por ubicación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonasResponse'
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/geografico', authMiddleware.authenticateToken, personasController.consultarPorGeografia);

/**
 * @swagger
 * /api/personas/consolidado/familia:
 *   get:
 *     summary: Consultar personas por familia y vivienda
 *     description: Filtrar personas por apellido familiar, tipo de vivienda o parentesco
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Apellido familiar (búsqueda parcial)
 *         example: García
 *       - in: query
 *         name: id_tipo_vivienda
 *         schema:
 *           type: integer
 *         description: ID del tipo de vivienda
 *         example: 1
 *       - in: query
 *         name: id_parentesco
 *         schema:
 *           type: integer
 *         description: ID del parentesco
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
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, excel]
 *           default: json
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas por familia
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonasResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/familia', authMiddleware.authenticateToken, personasController.consultarPorFamilia);

/**
 * @swagger
 * /api/personas/consolidado/personal:
 *   get:
 *     summary: Consultar personas por datos personales
 *     description: Filtrar personas por estado civil, profesión, nivel educativo, comunidad cultural, liderazgo o destrezas
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_estado_civil
 *         schema:
 *           type: integer
 *         description: ID del estado civil
 *         example: 1
 *       - in: query
 *         name: id_profesion
 *         schema:
 *           type: integer
 *         description: ID de la profesión
 *         example: 5
 *       - in: query
 *         name: id_nivel_educativo
 *         schema:
 *           type: integer
 *         description: ID del nivel educativo
 *         example: 3
 *       - in: query
 *         name: id_comunidad_cultural
 *         schema:
 *           type: integer
 *         description: ID de la comunidad cultural
 *         example: 2
 *       - in: query
 *         name: liderazgo
 *         schema:
 *           type: boolean
 *         description: Filtrar solo personas con liderazgo
 *         example: true
 *       - in: query
 *         name: id_destreza
 *         schema:
 *           type: integer
 *         description: ID de la destreza
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
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, excel]
 *           default: json
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas por datos personales
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonasResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/personal', authMiddleware.authenticateToken, personasController.consultarPorDatosPersonales);

/**
 * @swagger
 * /api/personas/consolidado/tallas:
 *   get:
 *     summary: Consultar personas por tallas con filtros de edad y sexo
 *     description: Filtrar personas por talla de camisa, pantalón o zapato, con opciones adicionales de edad y sexo
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: talla_camisa
 *         schema:
 *           type: string
 *         description: Talla de camisa
 *         example: M
 *       - in: query
 *         name: talla_pantalon
 *         schema:
 *           type: string
 *         description: Talla de pantalón
 *         example: 32
 *       - in: query
 *         name: talla_zapato
 *         schema:
 *           type: string
 *         description: Talla de zapato
 *         example: 42
 *       - in: query
 *         name: edad_min
 *         schema:
 *           type: integer
 *         description: Edad mínima (filtro opcional)
 *         example: 18
 *       - in: query
 *         name: edad_max
 *         schema:
 *           type: integer
 *         description: Edad máxima (filtro opcional)
 *         example: 65
 *       - in: query
 *         name: id_sexo
 *         schema:
 *           type: integer
 *         description: ID del sexo (1=Masculino, 2=Femenino)
 *         example: 1
 *       - in: query
 *         name: sexo
 *         schema:
 *           type: string
 *         description: Nombre del sexo (alternativa a id_sexo)
 *         example: Masculino
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
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, excel]
 *           default: json
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas por tallas, edad y sexo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonasResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/tallas', authMiddleware.authenticateToken, personasController.consultarPorTallas);

/**
 * @swagger
 * /api/personas/consolidado/edad:
 *   get:
 *     summary: Consultar personas por rango de edad
 *     description: Filtrar personas por edad mínima y/o máxima
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: edad_min
 *         schema:
 *           type: integer
 *         description: Edad mínima
 *         example: 18
 *       - in: query
 *         name: edad_max
 *         schema:
 *           type: integer
 *         description: Edad máxima
 *         example: 65
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
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, excel]
 *           default: json
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas por edad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonasResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/edad', authMiddleware.authenticateToken, personasController.consultarPorEdad);

/**
 * @swagger
 * /api/personas/consolidado/reporte:
 *   get:
 *     summary: Generar reporte general con todos los filtros
 *     description: Permite combinar todos los filtros disponibles para generar un reporte personalizado
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID del municipio
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID del sector
 *       - in: query
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: ID de la vereda
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Apellido familiar
 *       - in: query
 *         name: id_tipo_vivienda
 *         schema:
 *           type: integer
 *         description: ID del tipo de vivienda
 *       - in: query
 *         name: id_parentesco
 *         schema:
 *           type: integer
 *         description: ID del parentesco
 *       - in: query
 *         name: id_estado_civil
 *         schema:
 *           type: integer
 *         description: ID del estado civil
 *       - in: query
 *         name: id_profesion
 *         schema:
 *           type: integer
 *         description: ID de la profesión
 *       - in: query
 *         name: id_nivel_educativo
 *         schema:
 *           type: integer
 *         description: ID del nivel educativo
 *       - in: query
 *         name: id_comunidad_cultural
 *         schema:
 *           type: integer
 *         description: ID de la comunidad cultural
 *       - in: query
 *         name: liderazgo
 *         schema:
 *           type: boolean
 *         description: Filtrar solo líderes
 *       - in: query
 *         name: id_destreza
 *         schema:
 *           type: integer
 *         description: ID de la destreza
 *       - in: query
 *         name: talla_camisa
 *         schema:
 *           type: string
 *         description: Talla de camisa
 *       - in: query
 *         name: talla_pantalon
 *         schema:
 *           type: string
 *         description: Talla de pantalón
 *       - in: query
 *         name: talla_zapato
 *         schema:
 *           type: string
 *         description: Talla de zapato
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
 *         name: fecha_registro_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de registro desde
 *       - in: query
 *         name: fecha_registro_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de registro hasta
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
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, excel]
 *           default: json
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Reporte general de personas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonasResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/reporte', authMiddleware.authenticateToken, personasController.generarReporteGeneral);

export default router;
