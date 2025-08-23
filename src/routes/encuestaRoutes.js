import express from 'express';
import { crearEncuesta, obtenerEncuestas, obtenerEncuestaPorId, eliminarEncuesta } from '../controllers/encuestaController.js';
import authMiddleware from '../middlewares/auth.js';
import { validarEncuesta } from '../validators/encuestaValidator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Encuestas
 *   description: API para gestión de encuestas familiares completas con información demográfica, vivienda, servicios y miembros de familia
 */

/**
 * @swagger
 * /api/encuesta:
 *   get:
 *     summary: Obtener todas las encuestas con paginación
 *     description: |
 *       Obtiene una lista paginada de todas las encuestas familiares registradas.
 *       
 *       **Características:**
 *       - Paginación automática con límite configurable
 *       - Filtros opcionales por sector, municipio y apellido familiar
 *       - Información básica de personas asociadas
 *       - Ordenado por fecha de última encuesta (más recientes primero)
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector (búsqueda parcial)
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Filtrar por municipio (búsqueda parcial)
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar (búsqueda parcial)
 *     responses:
 *       200:
 *         description: Lista de encuestas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Se encontraron 25 encuestas"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EncuestaResumen'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: Crear encuesta familiar completa
 *     description: |
 *       Procesa una encuesta familiar completa con toda la información demográfica, 
 *       de vivienda, servicios públicos y miembros de la familia (vivos y fallecidos).
 *       
 *       **Funcionalidades:**
 *       - Validación completa de todos los campos
 *       - Transacciones de base de datos con rollback automático en caso de error
 *       - Procesamiento de miembros vivos y fallecidos
 *       - Mapeo automático de códigos de catálogos (sexo, tipo identificación)
 *       - Generación automática de identificadores temporales si no se proporcionan
 *       
 *       **Flujo de procesamiento:**
 *       1. Validación de estructura JSON y campos requeridos
 *       2. Creación de registro de familia
 *       3. Procesamiento de miembros vivos de la familia
 *       4. Procesamiento de miembros fallecidos
 *       5. Confirmación de transacción o rollback en caso de error
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncuestaCompleta'
 *           example:
 *             informacionGeneral:
 *               municipio: { id: "001", nombre: "Medellín" }
 *               parroquia: { id: "002", nombre: "San José" }
 *               sector: { id: "003", nombre: "Centro" }
 *               vereda: { id: "004", nombre: "El Carmen" }
 *               fecha: "2025-08-23T03:13:14.017Z"
 *               apellido_familiar: "García"
 *               direccion: "Calle 10 # 20-30"
 *               telefono: "6041234567"
 *               numero_contrato_epm: "987654321"
 *             vivienda:
 *               tipo_vivienda: { id: "01", nombre: "Casa" }
 *               disposicion_basuras:
 *                 recolector: true
 *                 quemada: false
 *                 enterrada: false
 *                 recicla: true
 *                 aire_libre: false
 *                 no_aplica: false
 *             servicios_agua:
 *               sistema_acueducto: { id: "10", nombre: "Aguas de Medellín" }
 *               aguas_residuales: "Alcantarillado público"
 *               pozo_septico: false
 *               letrina: false
 *               campo_abierto: false
 *             observaciones:
 *               sustento_familia: "Agricultura"
 *               observaciones_encuestador: "Familia con acceso a servicios básicos"
 *               autorizacion_datos: true
 *             familyMembers:
 *               - nombres: "Juan Pérez"
 *                 fechaNacimiento: "1990-05-12T00:00:00.000Z"
 *                 tipoIdentificacion: "CC"
 *                 sexo: "M"
 *                 situacionCivil: "Soltero"
 *                 parentesco: "Hijo"
 *                 telefono: "3001234567"
 *                 estudio: "Universitario"
 *                 comunidadCultural: "Ninguna"
 *                 talla:
 *                   camisa: "M"
 *                   pantalon: "32"
 *                   calzado: "42"
 *             deceasedMembers:
 *               - nombres: "María López"
 *                 fechaAniversario: "2020-05-20T00:00:00.000Z"
 *                 eraPadre: false
 *                 eraMadre: true
 *             metadata:
 *               timestamp: "2025-08-23T03:13:14.017Z"
 *               completed: true
 *               currentStage: 1
 *     responses:
 *       200:
 *         description: Encuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EncuestaResponse'
 *             example:
 *               status: "success"
 *               message: "Encuesta guardada exitosamente"
 *               data:
 *                 familia_id: 3
 *                 personas_creadas: 1
 *                 personas_fallecidas: 1
 *                 transaccion_id: "tx_12345"
 *       400:
 *         description: Error de validación en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Errores de validación"
 *               code: "VALIDATION_ERROR"
 *               errors:
 *                 - field: "informacionGeneral.apellido_familiar"
 *                   message: "El apellido familiar es requerido"
 *                 - field: "familyMembers[0].nombres"
 *                   message: "Los nombres son requeridos"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor o fallo en transacción de base de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Error al procesar la encuesta: Error de base de datos"
 *               code: "DATABASE_ERROR"
 */

/**
 * @swagger
 * /api/encuesta/{id}:
 *   get:
 *     summary: Obtener encuesta por ID
 *     description: |
 *       Obtiene una encuesta específica por su ID con toda la información detallada
 *       incluyendo datos de familia, miembros vivos y fallecidos.
 *       
 *       **Información incluida:**
 *       - Datos completos de la familia
 *       - Lista de miembros vivos con información demográfica
 *       - Lista de miembros fallecidos
 *       - Estadísticas de la familia
 *       - Información de sexo y tipo de identificación
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la encuesta familiar
 *     responses:
 *       200:
 *         description: Encuesta obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Encuesta obtenida exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/EncuestaDetallada'
 *       404:
 *         description: Encuesta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Encuesta no encontrada"
 *               code: "NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Eliminar encuesta por ID
 *     description: |
 *       Elimina completamente una encuesta familiar y todos sus datos relacionados.
 *       
 *       **Operación destructiva en cascada:**
 *       - Elimina todas las personas asociadas a la familia
 *       - Elimina registros de disposición de basuras
 *       - Elimina registros de sistema de acueducto
 *       - Elimina registros de aguas residuales
 *       - Elimina registros de tipo de vivienda
 *       - Elimina el registro principal de la familia
 *       
 *       **Características de seguridad:**
 *       - Operación dentro de transacción con rollback automático
 *       - Validación de existencia antes de eliminar
 *       - Logs detallados de la operación
 *       - Respuesta con estadísticas de eliminación
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la encuesta familiar a eliminar
 *     responses:
 *       200:
 *         description: Encuesta eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Encuesta de la familia García eliminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     eliminacion_completada:
 *                       type: boolean
 *                       example: true
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         familia_id:
 *                           type: integer
 *                           example: 25
 *                         apellido_familiar:
 *                           type: string
 *                           example: "García"
 *                         personas_eliminadas:
 *                           type: integer
 *                           example: 3
 *                         fecha_eliminacion:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-08-23T10:30:00.000Z"
 *                     registros_afectados:
 *                       type: object
 *                       properties:
 *                         familia:
 *                           type: integer
 *                           example: 1
 *                         personas:
 *                           type: integer
 *                           example: 3
 *                         disposicion_basuras:
 *                           type: boolean
 *                           example: true
 *                         sistema_acueducto:
 *                           type: boolean
 *                           example: true
 *                         aguas_residuales:
 *                           type: boolean
 *                           example: true
 *                         tipo_vivienda:
 *                           type: boolean
 *                           example: true
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         transaccion_id:
 *                           type: string
 *                           example: "delete_txn_1692781800000"
 *                         version:
 *                           type: string
 *                           example: "1.0"
 *       404:
 *         description: Encuesta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Encuesta no encontrada"
 *               code: "NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor al eliminar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Error interno del servidor al eliminar la encuesta"
 *               error_code: "DELETE_ENCUESTA_ERROR"
 */

// Ruta GET para obtener todas las encuestas
router.get('/encuesta', 
  authMiddleware.authenticateToken,
  obtenerEncuestas
);

// Ruta GET para obtener encuesta por ID
router.get('/encuesta/:id', 
  authMiddleware.authenticateToken,
  obtenerEncuestaPorId
);

// Ruta POST para crear encuesta
router.post('/encuesta', 
  authMiddleware.authenticateToken,  // Middleware de autenticación
  validarEncuesta,                   // Middleware de validación
  crearEncuesta                      // Controlador
);

// Ruta DELETE para eliminar encuesta por ID
router.delete('/encuesta/:id', 
  authMiddleware.authenticateToken,  // Middleware de autenticación
  eliminarEncuesta                   // Controlador
);

export default router;
