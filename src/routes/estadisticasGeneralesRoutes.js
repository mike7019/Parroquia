/**
 * Rutas de Estadísticas Generales del Sistema
 */

import express from 'express';
const router = express.Router();
import estadisticasGeneralesController from '../controllers/estadisticasGeneralesController.js';
import authMiddleware from '../middlewares/auth.js';

// Todas las rutas requieren autenticación
router.use(authMiddleware.authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Estadísticas Generales
 *   description: Estadísticas completas del sistema de gestión parroquial
 */

/**
 * @swagger
 * /api/estadisticas/completas:
 *   get:
 *     summary: Obtener estadísticas completas del sistema
 *     description: Retorna todas las estadísticas del sistema incluyendo geografía, población, familias, salud, educación, vivienda, catálogos y usuarios
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas completas obtenidas exitosamente
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
 *                   example: Estadísticas completas obtenidas exitosamente
 *                 datos:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     resumen:
 *                       type: object
 *                     geografia:
 *                       type: object
 *                     poblacion:
 *                       type: object
 *                     familias:
 *                       type: object
 *                     salud:
 *                       type: object
 *                     educacion:
 *                       type: object
 *                     vivienda:
 *                       type: object
 *                     catalogos:
 *                       type: object
 *                     usuarios:
 *                       type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/completas', estadisticasGeneralesController.getEstadisticasCompletas);

/**
 * @swagger
 * /api/estadisticas/resumen:
 *   get:
 *     summary: Obtener resumen general del sistema
 *     description: Retorna un resumen con los totales principales del sistema
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen general obtenido exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     totalPersonas:
 *                       type: integer
 *                       example: 1500
 *                     totalPersonasVivas:
 *                       type: integer
 *                       example: 1450
 *                     totalDifuntos:
 *                       type: integer
 *                       example: 50
 *                     totalFamilias:
 *                       type: integer
 *                       example: 400
 *                     totalUsuarios:
 *                       type: integer
 *                       example: 10
 *                     totalDepartamentos:
 *                       type: integer
 *                       example: 3
 *                     totalMunicipios:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/resumen', estadisticasGeneralesController.getResumenGeneral);

/**
 * @swagger
 * /api/estadisticas/categoria/{categoria}:
 *   get:
 *     summary: Obtener estadísticas por categoría específica
 *     description: Retorna estadísticas de una categoría específica del sistema
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *           enum: [geografia, poblacion, familias, salud, educacion, vivienda, catalogos, usuarios, resumen]
 *         description: Categoría de estadísticas a consultar
 *     responses:
 *       200:
 *         description: Estadísticas de la categoría obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *       400:
 *         description: Categoría inválida
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/categoria/:categoria', estadisticasGeneralesController.getEstadisticasPorCategoria);

/**
 * @swagger
 * /api/estadisticas/geografia:
 *   get:
 *     summary: Obtener estadísticas geográficas
 *     description: Retorna estadísticas de departamentos, municipios, parroquias, sectores y veredas
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas geográficas obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: object
 *                       properties:
 *                         departamentos:
 *                           type: integer
 *                         municipios:
 *                           type: integer
 *                         parroquias:
 *                           type: integer
 *                         sectores:
 *                           type: integer
 *                         veredas:
 *                           type: integer
 *                     distribucion:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/geografia', estadisticasGeneralesController.getEstadisticasGeografia);

/**
 * @swagger
 * /api/estadisticas/poblacion:
 *   get:
 *     summary: Obtener estadísticas de población
 *     description: Retorna estadísticas demográficas incluyendo distribución por sexo, edad, estado civil y tipo de identificación
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de población obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     distribucionSexo:
 *                       type: array
 *                       items:
 *                         type: object
 *                     distribucionEstadoCivil:
 *                       type: array
 *                     distribucionEdad:
 *                       type: array
 *                     distribucionTipoIdentificacion:
 *                       type: array
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/poblacion', estadisticasGeneralesController.getEstadisticasPoblacion);

/**
 * @swagger
 * /api/estadisticas/familias:
 *   get:
 *     summary: Obtener estadísticas de familias
 *     description: Retorna estadísticas de familias incluyendo promedio de miembros y distribución geográfica
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de familias obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     promedioMiembrosPorFamilia:
 *                       type: number
 *                     maxMiembrosPorFamilia:
 *                       type: integer
 *                     minMiembrosPorFamilia:
 *                       type: integer
 *                     familiasConDifuntos:
 *                       type: integer
 *                     distribucionPorParroquia:
 *                       type: array
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/familias', estadisticasGeneralesController.getEstadisticasFamilias);

/**
 * @swagger
 * /api/estadisticas/salud:
 *   get:
 *     summary: Obtener estadísticas de salud
 *     description: Retorna estadísticas de enfermedades y distribución por talla
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de salud obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     totalEnfermedadesCatalogo:
 *                       type: integer
 *                     personasConEnfermedades:
 *                       type: integer
 *                     enfermedadesMasComunes:
 *                       type: array
 *                     distribucionPorTalla:
 *                       type: array
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/salud', estadisticasGeneralesController.getEstadisticasSalud);

/**
 * @swagger
 * /api/estadisticas/educacion:
 *   get:
 *     summary: Obtener estadísticas de educación
 *     description: Retorna estadísticas de nivel educativo, profesiones y habilidades
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de educación obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     totalProfesionesCatalogo:
 *                       type: integer
 *                     totalHabilidadesCatalogo:
 *                       type: integer
 *                     totalEstudiosCatalogo:
 *                       type: integer
 *                     distribucionPorNivelEstudios:
 *                       type: array
 *                     profesionesMasComunes:
 *                       type: array
 *                     habilidadesMasReportadas:
 *                       type: array
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/educacion', estadisticasGeneralesController.getEstadisticasEducacion);

/**
 * @swagger
 * /api/estadisticas/vivienda:
 *   get:
 *     summary: Obtener estadísticas de vivienda
 *     description: Retorna estadísticas de tipos de vivienda, servicios públicos y saneamiento
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de vivienda obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     distribucionPorTipoVivienda:
 *                       type: array
 *                     distribucionPorAcueducto:
 *                       type: array
 *                     distribucionPorDisposicionBasura:
 *                       type: array
 *                     distribucionPorAguasResiduales:
 *                       type: array
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/vivienda', estadisticasGeneralesController.getEstadisticasVivienda);

/**
 * @swagger
 * /api/estadisticas/catalogos:
 *   get:
 *     summary: Obtener estadísticas de catálogos
 *     description: Retorna el total de registros en cada catálogo del sistema
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de catálogos obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     sexos:
 *                       type: integer
 *                     situacionesCiviles:
 *                       type: integer
 *                     tiposIdentificacion:
 *                       type: integer
 *                     tallas:
 *                       type: integer
 *                     estudios:
 *                       type: integer
 *                     profesiones:
 *                       type: integer
 *                     habilidades:
 *                       type: integer
 *                     enfermedades:
 *                       type: integer
 *                     comunidadesCulturales:
 *                       type: integer
 *                     parentescos:
 *                       type: integer
 *                     tiposVivienda:
 *                       type: integer
 *                     sistemasAcueducto:
 *                       type: integer
 *                     tiposAguasResiduales:
 *                       type: integer
 *                     tiposDisposicionBasura:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/catalogos', estadisticasGeneralesController.getEstadisticasCatalogos);

/**
 * @swagger
 * /api/estadisticas/usuarios:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     description: Retorna estadísticas de usuarios del sistema incluyendo distribución por roles y estado
 *     tags: [Estadísticas Generales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de usuarios obtenidas exitosamente
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
 *                 datos:
 *                   type: object
 *                   properties:
 *                     totalUsuarios:
 *                       type: integer
 *                     totalRoles:
 *                       type: integer
 *                     distribucionPorRol:
 *                       type: array
 *                     distribucionPorEstado:
 *                       type: array
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/usuarios', estadisticasGeneralesController.getEstadisticasUsuarios);

export default router;
