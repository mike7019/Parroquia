import express from 'express';
import { crearEncuesta, obtenerEncuestas, obtenerEncuestaPorId, eliminarEncuesta, actualizarCamposEncuesta, actualizarEncuestaCompleta } from '../controllers/encuestaController.js';
import authMiddleware from '../middlewares/auth.js';
import { validarEncuesta } from '../validators/encuestaValidator.js';
import EncuestaValidationMiddleware from '../middlewares/encuestaValidation.js';
import { EncuestaLoggingMiddleware } from '../middlewares/loggingMiddleware.js';
import BackupMiddleware from '../middlewares/backupMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Encuestas
 *   description: |
 *     API para gestión de encuestas familiares completas con información demográfica, vivienda, servicios y miembros de familia.
 *     
 *     **Nota**: Todas las rutas soportan tanto la forma plural (/encuestas) como singular (/encuesta) para mayor flexibilidad.
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
 *             $ref: '#/components/schemas/EncuestaInput'
 *           example:
 *             informacionGeneral:
 *               municipio: { id: 1, nombre: "Medellín" }
 *               parroquia: { id: 1, nombre: "San José" }
 *               sector: { id: 1, nombre: "Centro" }
 *               vereda: { id: 1, nombre: "La Macarena" }
 *               corregimiento: { id: 1, nombre: "El Centro" }
 *               fecha: "2025-08-25"
 *               apellido_familiar: "Rodríguez García"
 *               direccion: "Carrera 45 # 23-67"
 *               telefono: "3001234567"
 *               numero_contrato_epm: "12345678"
 *               comunionEnCasa: false
 *             vivienda:
 *               tipo_vivienda: { id: 1, nombre: "Casa" }
 *               disposicion_basuras:
 *                 recolector: true
 *                 quemada: false
 *                 enterrada: false
 *                 recicla: true
 *                 aire_libre: false
 *                 no_aplica: false
 *             servicios_agua:
 *               sistema_acueducto: { id: 1, nombre: "Acueducto Público" }
 *               aguas_residuales: { id: 1, nombre: "Alcantarillado" }
 *               pozo_septico: false
 *               letrina: false
 *               campo_abierto: false
 *             observaciones:
 *               sustento_familia: "Trabajo independiente en ventas"
 *               observaciones_encuestador: "Familia colaborativa, información completa"
 *               autorizacion_datos: true
 *             familyMembers:
 *               - nombres: "Carlos Andrés Rodríguez García"
 *                 numeroIdentificacion: "12345678"
 *                 tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" }
 *                 fechaNacimiento: "1985-03-15"
 *                 sexo: { id: 1, nombre: "Masculino" }
 *                 telefono: "32066666666"
 *                 situacionCivil: { id: 1, nombre: "Casado Civil" }
 *                 estudio: { id: 1, nombre: "Universitario" }
 *                 parentesco: { id: 1, nombre: "Jefe de Hogar" }
 *                 comunidadCultural: { id: 1, nombre: "Ninguna" }
 *                 enfermedad: { id: 2, nombre: "Diabetes" }
 *                 "talla_camisa/blusa": "L"
 *                 talla_pantalon: "32"
 *                 talla_zapato: "42"
 *                 profesion: { id: 1, nombre: "Estudiante" }
 *                 motivoFechaCelebrar:
 *                   motivo: "Cumpleaños"
 *                   dia: "15"
 *                   mes: "03"
 *                 destrezas:
 *                   - id: 3
 *                     nombre: "Carpintería"
 *                   - id: 4
 *                     nombre: "Electricidad"
 *                 habilidades:
 *                   - id: 1
 *                     nombre: "Comunicación efectiva"
 *                     nivel: "Avanzado"
 *                   - id: 2
 *                     nombre: "Trabajo en equipo"
 *                     nivel: "Intermedio"
 *                 en_que_eres_lider: "Líder comunitario del sector, coordinador de actividades deportivas"
 *             deceasedMembers:
 *               - nombres: "Pedro Antonio Rodríguez"
 *                 fechaFallecimiento: "2020-05-15"
 *                 sexo: { id: 1, nombre: "Masculino" }
 *                 parentesco: { id: 2, nombre: "Padre" }
 *                 causaFallecimiento: "Enfermedad cardiovascular"
 *             metadata:
 *               timestamp: "2025-08-25T10:30:00.000Z"
 *               completed: true
 *               currentStage: 6
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
router.get('/', 
  authMiddleware.authenticateToken,  // Middleware de autenticación
  EncuestaLoggingMiddleware.logOperacion('OBTENER_ENCUESTAS'), // Logging
  obtenerEncuestas
);

/**
 * @swagger
 * /api/encuesta/estadisticas:
 *   get:
 *     summary: Obtener estadísticas generales de encuestas
 *     description: Obtiene estadísticas agregadas del sistema de encuestas
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/estadisticas', 
  authMiddleware.authenticateToken,
  EncuestaLoggingMiddleware.logOperacion('OBTENER_ESTADISTICAS'),
  async (req, res) => {
    try {
      const EncuestaService = (await import('../services/encuestaService.js')).default;
      const estadisticas = await EncuestaService.obtenerEstadisticas();
      
      res.json({
        status: 'success',
        message: 'Estadísticas obtenidas exitosamente',
        data: estadisticas
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error obteniendo estadísticas',
        error_code: 'STATS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/encuesta/buscar:
 *   get:
 *     summary: Buscar encuestas con texto completo
 *     description: Busca encuestas usando búsqueda de texto completo
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Búsqueda completada exitosamente
 */
router.get('/buscar', 
  authMiddleware.authenticateToken,
  EncuestaLoggingMiddleware.logOperacion('BUSCAR_ENCUESTAS'),
  async (req, res) => {
    try {
      const { q: termino, limit = 20, incluir_personas = false } = req.query;
      
      if (!termino || termino.trim().length < 2) {
        return res.status(400).json({
          status: 'error',
          message: 'El término de búsqueda debe tener al menos 2 caracteres',
          code: 'INVALID_SEARCH_TERM'
        });
      }

      const EncuestaService = (await import('../services/encuestaService.js')).default;
      const resultados = await EncuestaService.buscarEncuestas(termino.trim(), {
        limit: Math.min(parseInt(limit), 50),
        incluirPersonas: incluir_personas === 'true'
      });
      
      res.json({
        status: 'success',
        message: `Se encontraron ${resultados.length} resultados`,
        data: resultados,
        termino_busqueda: termino.trim()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error en la búsqueda',
        error_code: 'SEARCH_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/encuesta/cursor:
 *   get:
 *     summary: Obtener encuestas con paginación cursor-based
 *     description: Obtiene encuestas usando paginación cursor-based para mejor rendimiento
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Encuestas obtenidas con cursor exitosamente
 */
router.get('/cursor', 
  authMiddleware.authenticateToken,
  EncuestaLoggingMiddleware.logOperacion('OBTENER_ENCUESTAS_CURSOR'),
  async (req, res) => {
    try {
      const { cursor, limit = 20, ...filtros } = req.query;
      
      const EncuestaService = (await import('../services/encuestaService.js')).default;
      const resultado = await EncuestaService.obtenerEncuestasOptimizado(filtros, {
        cursor,
        limit: Math.min(parseInt(limit), 100),
        useCursor: true
      });
      
      res.json({
        status: 'success',
        message: `Se obtuvieron ${resultado.data.length} encuestas`,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error obteniendo encuestas con cursor',
        error_code: 'CURSOR_PAGINATION_ERROR'
      });
    }
  }
);

// Ruta GET para obtener encuesta por ID
router.get('/:id', 
  authMiddleware.authenticateToken,  // Middleware de autenticación
  EncuestaLoggingMiddleware.logOperacion('OBTENER_ENCUESTA_POR_ID'), // Logging
  obtenerEncuestaPorId
);

// Ruta POST para crear encuesta
router.post('/', 
  authMiddleware.authenticateToken,  // Middleware de autenticación
  EncuestaLoggingMiddleware.logOperacion('CREAR_ENCUESTA'), // Logging
  EncuestaValidationMiddleware.validarEstructuraBasica,  // Validar estructura
  EncuestaValidationMiddleware.validarIdentificacionesUnicas,  // Validar IDs únicos en familia
  EncuestaValidationMiddleware.validarMiembrosUnicos,  // Validar miembros únicos en BD
  EncuestaValidationMiddleware.verificarFamiliaExistente,  // Verificar familia no existe
  crearEncuesta                      // Controlador
);

// Ruta DELETE para eliminar encuesta por ID
router.delete('/:id', 
  authMiddleware.authenticateToken,  // Middleware de autenticación
  EncuestaLoggingMiddleware.logOperacion('ELIMINAR_ENCUESTA'), // Logging
  EncuestaValidationMiddleware.validarIdEncuesta,  // Validar ID
  EncuestaValidationMiddleware.validarEncuestaExiste,  // Verificar que existe
  BackupMiddleware.backupBeforeDelete, // Backup automático antes de eliminar
  eliminarEncuesta                   // Controlador
);

/**
 * @swagger
 * /api/encuesta/{id}:
 *   patch:
 *     summary: Actualizar campos específicos de una encuesta
 *     description: |
 *       Permite actualizar uno o varios campos específicos de una encuesta familiar
 *       sin afectar el resto de la información. Ideal para actualizaciones parciales.
 *       
 *       **Campos permitidos para actualizar:**
 *       - apellido_familiar
 *       - sector
 *       - direccion_familia
 *       - numero_contacto
 *       - telefono
 *       - email
 *       - tamaño_familia
 *       - tipo_vivienda
 *       - estado_encuesta
 *       - tutor_responsable
 *       - comunionEnCasa
 *       
 *       **Características:**
 *       - Solo se actualizarán los campos enviados en el body
 *       - Actualización automática de fecha_ultima_encuesta
 *       - Validación de campos permitidos
 *       - Operación transaccional con rollback automático
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la encuesta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apellido_familiar:
 *                 type: string
 *                 description: Apellido de la familia
 *                 example: "Rodríguez García"
 *               sector:
 *                 type: string
 *                 description: Sector donde vive la familia
 *                 example: "Centro"
 *               direccion_familia:
 *                 type: string
 *                 description: Dirección de residencia
 *                 example: "Carrera 45 # 23-67"
 *               numero_contacto:
 *                 type: string
 *                 description: Número de contacto principal
 *                 example: "3001234567"
 *               telefono:
 *                 type: string
 *                 description: Teléfono de la familia
 *                 example: "3001234567"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico de la familia
 *                 example: "familia@email.com"
 *               tamaño_familia:
 *                 type: integer
 *                 description: Número de miembros en la familia
 *                 example: 4
 *               tipo_vivienda:
 *                 type: string
 *                 description: Tipo de vivienda
 *                 example: "Casa"
 *               estado_encuesta:
 *                 type: string
 *                 enum: [pendiente, completada, verificada]
 *                 description: Estado actual de la encuesta
 *                 example: "completada"
 *               tutor_responsable:
 *                 type: string
 *                 description: Nombre del tutor o responsable
 *                 example: "Carlos Rodríguez"
 *               comunionEnCasa:
 *                 type: boolean
 *                 description: Si la familia realiza comunión en casa
 *                 example: true
 *           example:
 *             telefono: "3009876543"
 *             email: "nuevoemail@familia.com"
 *             estado_encuesta: "completada"
 *             comunionEnCasa: true
 *     responses:
 *       200:
 *         description: Campos actualizados exitosamente
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
 *                   example: "Campos de encuesta actualizados exitosamente"
 *                 datos:
 *                   type: object
 *                   description: Datos actualizados de la familia
 *                 campos_actualizados:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["telefono", "email", "estado_encuesta", "comunionEnCasa"]
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     operacion:
 *                       type: string
 *                       example: "PATCH"
 *                     registros_afectados:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Campos inválidos o ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "No se proporcionaron campos válidos para actualizar"
 *                 code:
 *                   type: string
 *                   example: "NO_VALID_FIELDS"
 *                 campos_permitidos:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Encuesta no encontrada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     summary: Actualizar encuesta completa
 *     description: |
 *       Reemplaza completamente todos los datos de una encuesta familiar.
 *       Requiere proporcionar todos los campos obligatorios.
 *       
 *       **Campos requeridos:**
 *       - apellido_familiar (obligatorio)
 *       - sector (obligatorio)
 *       - direccion_familia (obligatorio)
 *       
 *       **Características:**
 *       - Actualización completa de todos los campos
 *       - Validación de campos requeridos
 *       - Actualización automática de fecha_ultima_encuesta
 *       - Operación transaccional con rollback automático
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la encuesta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apellido_familiar
 *               - sector
 *               - direccion_familia
 *             properties:
 *               apellido_familiar:
 *                 type: string
 *                 description: Apellido de la familia (requerido)
 *                 example: "Rodríguez García"
 *               sector:
 *                 type: string
 *                 description: Sector donde vive la familia (requerido)
 *                 example: "Centro"
 *               direccion_familia:
 *                 type: string
 *                 description: Dirección de residencia (requerido)
 *                 example: "Carrera 45 # 23-67"
 *               numero_contacto:
 *                 type: string
 *                 description: Número de contacto principal
 *                 example: "3001234567"
 *               telefono:
 *                 type: string
 *                 description: Teléfono de la familia
 *                 example: "3001234567"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico de la familia
 *                 example: "familia@email.com"
 *               tamaño_familia:
 *                 type: integer
 *                 description: Número de miembros en la familia
 *                 example: 4
 *               tipo_vivienda:
 *                 type: string
 *                 description: Tipo de vivienda
 *                 example: "Casa"
 *               estado_encuesta:
 *                 type: string
 *                 enum: [pendiente, completada, verificada]
 *                 description: Estado actual de la encuesta
 *                 example: "completada"
 *               tutor_responsable:
 *                 type: string
 *                 description: Nombre del tutor o responsable
 *                 example: "Carlos Rodríguez"
 *               comunionEnCasa:
 *                 type: boolean
 *                 description: Si la familia realiza comunión en casa
 *                 example: false
 *           example:
 *             apellido_familiar: "Rodríguez García"
 *             sector: "Centro"
 *             direccion_familia: "Carrera 45 # 23-67"
 *             numero_contacto: "3001234567"
 *             telefono: "3001234567"
 *             email: "familia@email.com"
 *             tamaño_familia: 4
 *             tipo_vivienda: "Casa"
 *             estado_encuesta: "completada"
 *             tutor_responsable: "Carlos Rodríguez"
 *             comunionEnCasa: false
 *     responses:
 *       200:
 *         description: Encuesta actualizada completamente
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
 *                   example: "Encuesta actualizada completamente"
 *                 datos:
 *                   type: object
 *                   description: Datos actualizados de la familia
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     operacion:
 *                       type: string
 *                       example: "PUT"
 *                     registros_afectados:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Faltan campos requeridos o ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Faltan campos requeridos para actualización completa"
 *                 code:
 *                   type: string
 *                   example: "MISSING_REQUIRED_FIELDS"
 *                 campos_faltantes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["apellido_familiar", "sector"]
 *       404:
 *         description: Encuesta no encontrada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Ruta PATCH para actualizar campos específicos de encuesta
router.patch('/:id', 
  authMiddleware.authenticateToken,  // Middleware de autenticación
  EncuestaValidationMiddleware.validarIdEncuesta,  // Validar ID
  EncuestaValidationMiddleware.validarEncuestaExiste,  // Verificar que existe
  EncuestaValidationMiddleware.validarCamposActualizacion,  // Validar campos permitidos
  actualizarCamposEncuesta          // Controlador
);

// Ruta PUT para actualizar encuesta completa
router.put('/:id', 
  authMiddleware.authenticateToken,  // Middleware de autenticación
  EncuestaLoggingMiddleware.logOperacion('ACTUALIZAR_ENCUESTA_COMPLETA'), // Logging
  EncuestaValidationMiddleware.validarIdEncuesta,  // Validar ID
  EncuestaValidationMiddleware.validarEncuestaExiste,  // Verificar que existe
  EncuestaValidationMiddleware.validarActualizacionCompleta,  // Validar campos requeridos
  actualizarEncuestaCompleta         // Controlador
);

export default router;
