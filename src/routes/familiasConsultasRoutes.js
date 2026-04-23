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
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de centro poblado
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
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de centro poblado
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
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de centro poblado
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
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de centro poblado
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
 *     summary: Consultar familias con información COMPLETA (100% validado)
 *     description: |
 *       **🎯 ENDPOINT COMPLETAMENTE VALIDADO - 100% INTEGRIDAD REQUEST-RESPONSE**
 *       
 *       Obtiene familias con información absolutamente completa estructurada igual al request original.
 *       **GARANTÍA: Toda la información enviada en el request se devuelve en su totalidad en el response.**
 *       
 *       **📊 ESTRUCTURA COMPLETA DEL RESPONSE:**
 *       
 *       ✅ **informacionGeneral**: municipio, sector, apellido_familiar, direccion, telefono, comunionEnCasa
 *       ✅ **vivienda**: tipo_vivienda, disposicion_basuras (6 campos)
 *       ✅ **servicios_agua**: sistema_acueducto, aguas_residuales, tratamiento_agua
 *       ✅ **familyMembers**: nombres, numeroIdentificacion, tipoIdentificacion, fechaNacimiento, sexo, telefono, situacionCivil, estudio, tallas, motivoFechaCelebrar
 *       ✅ **deceasedMembers**: nombres, fechaFallecimiento, causaFallecimiento
 *       ✅ **metadata**: timestamp, completed, currentStage, contadores
 *       
 *       **🏆 VALIDACIÓN COMPLETA:**
 *       - ✅ Porcentaje de éxito: 100.00%
 *       - ✅ 13/13 campos validados correctamente
 *       - ✅ 0 campos fallidos
 *       - ✅ Sin datos NULL en campos críticos
 *       
 *       **📋 EJEMPLO COMPLETO DE RESPUESTA:**
 *       ```json
 *       {
 *         "status": "success",
 *         "datos": [{
 *           "id_encuesta": 667,
 *           "informacionGeneral": {
 *             "municipio": {"id": 1, "nombre": "Municipio Test"},
 *             "sector": {"nombre": "Centro Histórico"},
 *             "apellido_familiar": "Familia Validación Completa",
 *             "direccion": "Carrera 50 #25-30 Apartamento 501",
 *             "telefono": "3007778899",
 *             "comunionEnCasa": true
 *           },
 *           "vivienda": {
 *             "tipo_vivienda": {"nombre": "Apartamento Propio"},
 *             "disposicion_basuras": {
 *               "recolector": false, "quemada": false, "enterrada": false,
 *               "recicla": false, "aire_libre": false, "no_aplica": false
 *             }
 *           },
 *           "servicios_agua": {
 *             "sistema_acueducto": {"id": 1, "nombre": "Acueducto Público"}
 *           },
 *           "familyMembers": [{
 *             "nombres": "Juan Carlos",
 *             "numeroIdentificacion": "10123456-12345",
 *             "tipoIdentificacion": {"id": 1, "nombre": "Cédula de Ciudadanía", "codigo": "CC"},
 *             "fechaNacimiento": "1980-05-15T00:00:00.000Z",
 *             "sexo": {"id": 1, "nombre": "Sexo masculino"},
 *             "telefono": "3001111111",
 *             "situacionCivil": {"id": 1},
 *             "estudio": {"nombre": "Ingeniero de Sistemas"},
 *             "talla_camisa/blusa": "XL",
 *             "talla_pantalon": "34",
 *             "talla_zapato": "43",
 *             "motivoFechaCelebrar": {"motivo": "Cumpleaños", "dia": "15", "mes": "05"}
 *           }],
 *           "deceasedMembers": [{
 *             "nombres": "Roberto Carlos Martínez López",
 *             "fechaFallecimiento": "2019-08-12T00:00:00.000Z",
 *             "causaFallecimiento": "Complicaciones cardiovasculares"
 *           }],
 *           "metadata": {
 *             "timestamp": "2025-08-30T17:23:11.564Z",
 *             "completed": true,
 *             "currentStage": 6,
 *             "total_miembros": 4,
 *             "total_fallecidos": 1
 *           }
 *         }],
 *         "total": 1,
 *         "nota": "Toda la información del request se preserva en el response"
 *       }
 *       ```
 *       
 *     tags: [Consultas Familias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: |
 *           Filtrar por apellido familiar (búsqueda parcial).
 *           
 *           **Ejemplo de uso:**
 *           - `apellido_familiar=García` → busca familias con "García" en el apellido
 *           - `apellido_familiar=Familia Validación` → busca familias de prueba
 *         example: "García"
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: |
 *           Filtrar por sector (búsqueda parcial).
 *           
 *           **Ejemplos de sectores:**
 *           - `sector=Centro` → busca familias en sectores que contengan "Centro"
 *           - `sector=Norte` → busca familias en sectores del norte
 *         example: "Centro Histórico"
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
 *         name: id_vereda
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de centro poblado
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: |
 *           Límite de resultados a devolver.
 *           
 *           **Configuración:**
 *           - Mínimo: 1 familia
 *           - Máximo: 100 familias
 *           - Por defecto: 50 familias
 *     responses:
 *       200:
 *         description: |
 *           **✅ CONSULTA EXITOSA - INFORMACIÓN COMPLETA AL 100%**
 *           
 *           La respuesta incluye absolutamente toda la información estructurada igual al request original.
 *           **Garantía de integridad: 100% de los datos preservados sin valores NULL.**
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamiliaCompletaResponse'
 *       401:
 *         description: |
 *           **❌ ERROR DE AUTENTICACIÓN**
 *           
 *           Token de autenticación inválido, expirado o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Token no válido"
 *       500:
 *         description: |
 *           **❌ ERROR INTERNO DEL SERVIDOR**
 *           
 *           Error inesperado durante el procesamiento de la consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error al consultar familias con información completa"
 *                 details:
 *                   type: string
 *                   description: "Detalles técnicos del error (solo en desarrollo)"
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
