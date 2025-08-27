import express from 'express';
import FamiliasConsultasController from '../controllers/familiasConsultasController.js';
import AuthMiddleware from '../middlewares/auth.js';

const router = express.Router();

/**
 * Rutas para consultas de familias, madres y padres
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ConsultaMadres:
 *       type: object
 *       properties:
 *         tipo_parentesco:
 *           type: string
 *           example: "Madre"
 *         apellido_familiar:
 *           type: string
 *           example: "García"
 *         parentesco:
 *           type: string
 *           example: "Madre"
 *         documento:
 *           type: string
 *           example: "12345678"
 *         nombre:
 *           type: string
 *           example: "María Elena García López"
 *         sexo:
 *           type: string
 *           example: "Femenino"
 *         edad:
 *           type: number
 *           example: 45
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "1978-03-15"
 *         telefono:
 *           type: string
 *           example: "3001234567"
 *     
 *     ConsultaPadres:
 *       type: object
 *       properties:
 *         tipo_parentesco:
 *           type: string
 *           example: "Padre"
 *         apellido_familiar:
 *           type: string
 *           example: "García"
 *         parentesco:
 *           type: string
 *           example: "Padre"
 *         documento:
 *           type: string
 *           example: "87654321"
 *         nombre:
 *           type: string
 *           example: "Juan Carlos García Pérez"
 *         sexo:
 *           type: string
 *           example: "Masculino"
 *         edad:
 *           type: number
 *           example: 48
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "1975-08-22"
 *         telefono:
 *           type: string
 *           example: "3009876543"
 *
 *     EstadisticasFamilias:
 *       type: object
 *       properties:
 *         total_madres:
 *           type: number
 *           example: 125
 *         total_padres:
 *           type: number
 *           example: 118
 *         total_familias:
 *           type: number
 *           example: 95
 *         total_personas:
 *           type: number
 *           example: 243
 */

/**
 * @swagger
 * /api/consultas/madres:
 *   get:
 *     summary: Consultar por Madres
 *     description: |
 *       Obtiene una lista de todas las madres registradas en el sistema parroquial.
 *       
 *       **Columnas incluidas en la respuesta:**
 *       - Tipo Parentesco: "Madre"
 *       - Apellido Familiar: Apellido de la familia
 *       - Parentesco: Relación familiar
 *       - Documento: Número de identificación
 *       - Nombre: Nombre completo de la madre
 *       - Sexo: Femenino
 *       - Edad: Edad calculada
 *       - Fecha de nacimiento: Fecha de nacimiento
 *       - Teléfono: Número de contacto
 *       
 *       **Filtros disponibles:**
 *       - Por nombre (búsqueda parcial)
 *       - Por apellido familiar
 *       - Por documento de identidad
 *       - Por teléfono
 *     tags: [Consultas Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre de la madre (búsqueda parcial)
 *         example: "María"
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "García"
 *       - in: query
 *         name: documento
 *         schema:
 *           type: string
 *         description: Buscar por número de documento
 *         example: "12345678"
 *       - in: query
 *         name: telefono
 *         schema:
 *           type: string
 *         description: Buscar por teléfono
 *         example: "300"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Consulta de madres realizada exitosamente
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
 *                   example: "Consulta de madres realizada exitosamente"
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConsultaMadres'
 *                 total:
 *                   type: number
 *                   example: 25
 *                 filtros_aplicados:
 *                   type: object
 *                 columnas:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Tipo Parentesco", "Apellido Familiar", "Parentesco", "Documento", "Nombre", "Sexo", "Edad", "Fecha de nacimiento", "Telefono"]
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/madres',
  AuthMiddleware.authenticateToken,
  FamiliasConsultasController.consultarMadres
);

/**
 * @swagger
 * /api/consultas/padres:
 *   get:
 *     summary: Consultar por Padres
 *     description: |
 *       Obtiene una lista de todos los padres registrados en el sistema parroquial.
 *       
 *       **Columnas incluidas en la respuesta:**
 *       - Tipo Parentesco: "Padre"
 *       - Apellido Familiar: Apellido de la familia
 *       - Parentesco: Relación familiar
 *       - Documento: Número de identificación
 *       - Nombre: Nombre completo del padre
 *       - Sexo: Masculino
 *       - Edad: Edad calculada
 *       - Fecha de nacimiento: Fecha de nacimiento
 *       - Teléfono: Número de contacto
 *       
 *       **Filtros disponibles:**
 *       - Por nombre (búsqueda parcial)
 *       - Por apellido familiar
 *       - Por documento de identidad
 *       - Por teléfono
 *     tags: [Consultas Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre del padre (búsqueda parcial)
 *         example: "Juan"
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "García"
 *       - in: query
 *         name: documento
 *         schema:
 *           type: string
 *         description: Buscar por número de documento
 *         example: "87654321"
 *       - in: query
 *         name: telefono
 *         schema:
 *           type: string
 *         description: Buscar por teléfono
 *         example: "300"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Consulta de padres realizada exitosamente
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
 *                   example: "Consulta de padres realizada exitosamente"
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConsultaPadres'
 *                 total:
 *                   type: number
 *                   example: 20
 *                 filtros_aplicados:
 *                   type: object
 *                 columnas:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Tipo Parentesco", "Apellido Familiar", "Parentesco", "Documento", "Nombre", "Sexo", "Edad", "Fecha de nacimiento", "Telefono"]
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/padres',
  AuthMiddleware.authenticateToken,
  FamiliasConsultasController.consultarPadres
);

/**
 * @swagger
 * /api/consultas/madres-fallecidas:
 *   get:
 *     summary: Consultar madres fallecidas
 *     description: |
 *       Obtiene una lista de todas las madres que han fallecido registradas en el sistema.
 *       
 *       **Columnas adicionales para fallecidas:**
 *       - Estado: "Fallecida"
 *       - Fecha de fallecimiento: Fecha cuando falleció
 *       - Años fallecida: Años transcurridos desde el fallecimiento
 *       - Observaciones: Información adicional sobre la persona fallecida
 *       
 *       **Filtros disponibles:**
 *       - Por nombre completo
 *       - Por apellido familiar
 *       - Por fecha de fallecimiento (desde)
 *     tags: [Consultas Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre completo de la madre fallecida
 *         example: "María"
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "García"
 *       - in: query
 *         name: fecha_fallecimiento
 *         schema:
 *           type: string
 *           format: date
 *         description: Buscar desde una fecha de fallecimiento específica
 *         example: "2020-01-01"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Consulta de madres fallecidas realizada exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/madres-fallecidas',
  AuthMiddleware.authenticateToken,
  FamiliasConsultasController.consultarMadresFallecidas
);

/**
 * @swagger
 * /api/consultas/padres-fallecidos:
 *   get:
 *     summary: Consultar padres fallecidos
 *     description: |
 *       Obtiene una lista de todos los padres que han fallecido registrados en el sistema.
 *       
 *       **Columnas adicionales para fallecidos:**
 *       - Estado: "Fallecido"
 *       - Fecha de fallecimiento: Fecha cuando falleció
 *       - Años fallecido: Años transcurridos desde el fallecimiento
 *       - Observaciones: Información adicional sobre la persona fallecida
 *       
 *       **Filtros disponibles:**
 *       - Por nombre completo
 *       - Por apellido familiar
 *       - Por fecha de fallecimiento (desde)
 *     tags: [Consultas Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre completo del padre fallecido
 *         example: "Juan"
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "García"
 *       - in: query
 *         name: fecha_fallecimiento
 *         schema:
 *           type: string
 *           format: date
 *         description: Buscar desde una fecha de fallecimiento específica
 *         example: "2020-01-01"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Consulta de padres fallecidos realizada exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/padres-fallecidos',
  AuthMiddleware.authenticateToken,
  FamiliasConsultasController.consultarPadresFallecidos
);

/**
 * @swagger
 * /api/consultas/familias-padres-madres:
 *   get:
 *     summary: Consultar familias con información de padres y madres
 *     description: |
 *       Obtiene una lista de familias con información detallada de padres y madres.
 *       Útil para tener una vista consolidada de la estructura familiar.
 *     tags: [Consultas Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *         example: "García"
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector
 *         example: "Centro"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 30
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Consulta de familias realizada exitosamente
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
 *                   example: "Consulta de familias con padres y madres realizada exitosamente"
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       apellido_familiar:
 *                         type: string
 *                         example: "García"
 *                       sector:
 *                         type: string
 *                         example: "Centro"
 *                       telefono:
 *                         type: string
 *                         example: "3001234567"
 *                       padres:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             nombre:
 *                               type: string
 *                               example: "Juan García"
 *                             documento:
 *                               type: string
 *                               example: "87654321"
 *                             edad:
 *                               type: number
 *                               example: 48
 *                       madres:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             nombre:
 *                               type: string
 *                               example: "María García"
 *                             documento:
 *                               type: string
 *                               example: "12345678"
 *                             edad:
 *                               type: number
 *                               example: 45
 *                       total_personas:
 *                         type: number
 *                         example: 4
 *                 total:
 *                   type: number
 *                   example: 15
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/familias-padres-madres',
  AuthMiddleware.authenticateToken,
  FamiliasConsultasController.consultarFamiliasConPadresMadres
);

/**
 * @swagger
 * /api/consultas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de padres y madres
 *     description: |
 *       Obtiene estadísticas generales del sistema sobre padres, madres y familias registradas.
 *       Información útil para reportes y análisis demográfico de la parroquia.
 *     tags: [Consultas Familias]
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
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 datos:
 *                   $ref: '#/components/schemas/EstadisticasFamilias'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas',
  AuthMiddleware.authenticateToken,
  FamiliasConsultasController.obtenerEstadisticas
);

/**
 * @swagger
 * /api/consultas/persona/{documento}:
 *   get:
 *     summary: Buscar persona por documento
 *     description: |
 *       Busca una persona específica por su número de documento de identidad.
 *       La búsqueda se realiza tanto en madres como en padres.
 *     tags: [Consultas Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento de identidad
 *         example: "12345678"
 *     responses:
 *       200:
 *         description: Persona encontrada exitosamente
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
 *                   example: "Persona encontrada exitosamente"
 *                 datos:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/ConsultaMadres'
 *                     - $ref: '#/components/schemas/ConsultaPadres'
 *       404:
 *         description: Persona no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: false
 *                 mensaje:
 *                   type: string
 *                   example: "Persona no encontrada con el documento proporcionado"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/persona/:documento',
  AuthMiddleware.authenticateToken,
  FamiliasConsultasController.buscarPersonaPorDocumento
);

export default router;
