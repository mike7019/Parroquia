import express from 'express';
import personasReporteController from '../../controllers/consolidados/personasReporteController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Personas y Capacidades
 *   description: Generación de reportes de personas con filtros avanzados
 */

/**
 * @swagger
 * /api/personas/capacidades/reporte:
 *   get:
 *     summary: Generar reporte de personas en formato JSON
 *     description: Obtiene un reporte detallado de personas con múltiples filtros (geográficos, tallas, profesión, destrezas)
 *     tags: [Personas y Capacidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_persona
 *         schema:
 *           type: integer
 *         description: ID de persona específica
 *         example: 1
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID del municipio
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
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID de la parroquia
 *         example: 1
 *       - in: query
 *         name: talla_camisa
 *         schema:
 *           type: string
 *         description: Talla de camisa (S, M, L, XL, XXL)
 *         example: "M"
 *       - in: query
 *         name: talla_pantalon
 *         schema:
 *           type: string
 *         description: Talla de pantalón (28, 30, 32, 34, 36, etc.)
 *         example: "32"
 *       - in: query
 *         name: talla_zapatos
 *         schema:
 *           type: string
 *         description: Talla de zapatos (36, 37, 38, 39, 40, etc.)
 *         example: "40"
 *       - in: query
 *         name: id_profesion
 *         schema:
 *           type: integer
 *         description: ID de la profesión
 *         example: 1
 *       - in: query
 *         name: id_destreza
 *         schema:
 *           type: integer
 *         description: ID de la destreza/habilidad (filtra personas que tienen esta destreza)
 *         example: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 1000
 *         description: Límite de resultados a retornar
 *         example: 100
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Reporte de personas generado exitosamente"
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_personas:
 *                         type: integer
 *                       identificacion:
 *                         type: string
 *                       nombre_completo:
 *                         type: string
 *                       edad:
 *                         type: integer
 *                       sexo:
 *                         type: string
 *                       telefono:
 *                         type: string
 *                       email:
 *                         type: string
 *                       nombre_municipio:
 *                         type: string
 *                       nombre_sector:
 *                         type: string
 *                       nombre_vereda:
 *                         type: string
 *                       nombre_parroquia:
 *                         type: string
 *                       talla_camisa:
 *                         type: string
 *                       talla_pantalon:
 *                         type: string
 *                       talla_zapatos:
 *                         type: string
 *                       profesion:
 *                         type: string
 *                       destrezas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id_destreza:
 *                               type: integer
 *                             nombre:
 *                               type: string
 *                       total_destrezas:
 *                         type: integer
 *                 total:
 *                   type: integer
 *                   description: Total de personas que cumplen los filtros
 *                 total_retornado:
 *                   type: integer
 *                   description: Total de personas retornadas (con límite aplicado)
 *                 filtros_aplicados:
 *                   type: object
 *       500:
 *         description: Error del servidor
 */
router.get('/', authMiddleware.authenticateToken, personasReporteController.generarReporteJSON);

/**
 * @swagger
 * /api/personas/capacidades/reporte/excel:
 *   get:
 *     summary: Generar reporte de personas en formato Excel
 *     description: Genera un archivo Excel con 5 hojas (Personal, Geográfica, Capacidades, Tallas, Salud) con información detallada de personas
 *     tags: [Personas y Capacidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_persona
 *         schema:
 *           type: integer
 *         description: ID de persona específica
 *         example: 1
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID del municipio
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
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID de la parroquia
 *         example: 1
 *       - in: query
 *         name: talla_camisa
 *         schema:
 *           type: string
 *         description: Talla de camisa (S, M, L, XL, XXL)
 *         example: "M"
 *       - in: query
 *         name: talla_pantalon
 *         schema:
 *           type: string
 *         description: Talla de pantalón
 *         example: "32"
 *       - in: query
 *         name: talla_zapatos
 *         schema:
 *           type: string
 *         description: Talla de zapatos
 *         example: "40"
 *       - in: query
 *         name: id_profesion
 *         schema:
 *           type: integer
 *         description: ID de la profesión
 *         example: 1
 *       - in: query
 *         name: id_destreza
 *         schema:
 *           type: integer
 *         description: ID de la destreza/habilidad
 *         example: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 1000
 *         description: Límite de resultados
 *         example: 100
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Error del servidor
 */
router.get('/excel', authMiddleware.authenticateToken, personasReporteController.generarReporteExcel);

export default router;
