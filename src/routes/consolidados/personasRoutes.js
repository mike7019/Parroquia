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
 *         nombres:
 *           type: string
 *         identificacion:
 *           type: string
 *         tipo_identificacion:
 *           type: string
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *         sexo:
 *           type: string
 *         telefono:
 *           type: string
 *         correo_electronico:
 *           type: string
 *         direccion:
 *           type: string
 *         parentesco:
 *           type: string
 *         estado_civil:
 *           type: string
 *         profesion:
 *           type: string
 *         nivel_educativo:
 *           type: string
 *         comunidad_cultural:
 *           type: string
 *         tallas:
 *           type: object
 *           properties:
 *             camisa: { type: string }
 *             pantalon: { type: string }
 *             zapato: { type: string }
 *         destrezas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: integer }
 *               nombre: { type: string }
 *         liderazgos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: integer }
 *               nombre: { type: string }
 *         necesidadesEnfermo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: integer }
 *               nombre: { type: string }
 *         celebraciones:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               motivo: { type: string }
 *               dia: { type: string }
 *               mes: { type: string }
 *         familia:
 *           type: object
 *           properties:
 *             apellido_familiar: { type: string }
 *             tipo_vivienda: { type: string }
 *             disposicion_basura:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   nombre: { type: string }
 *             sistema_acueducto:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 nombre: { type: string }
 *             aguas_residuales:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   nombre: { type: string }
 *         ubicacion:
 *           type: object
 *           properties:
 *             municipio:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 nombre: { type: string }
 *             parroquia:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 nombre: { type: string }
 *             sector:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 nombre: { type: string }
 *             vereda:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 nombre: { type: string }
 *             corregimiento:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 nombre: { type: string }
 *             centro_poblado:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 nombre: { type: string }
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

// ─── Bloque de parámetros reutilizables (inline en cada endpoint) ─────────────
// Todos los endpoints ahora aceptan el conjunto completo de filtros.

/**
 * @swagger
 * /api/personas/consolidado/geografico:
 *   get:
 *     summary: Consultar personas por ubicación geográfica
 *     description: Filtrar personas por municipio, parroquia, sector, vereda u otros criterios geográficos. Admite todos los filtros disponibles.
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_municipio
 *         schema: { type: integer }
 *         description: ID del municipio
 *         example: 1
 *       - in: query
 *         name: id_parroquia
 *         schema: { type: integer }
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_sector
 *         schema: { type: integer }
 *         description: ID del sector
 *       - in: query
 *         name: id_vereda
 *         schema: { type: integer }
 *         description: ID de la vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema: { type: integer }
 *         description: ID del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema: { type: integer }
 *         description: ID del centro poblado
 *       - in: query
 *         name: apellido_familiar
 *         schema: { type: string }
 *         description: Apellido familiar (búsqueda parcial)
 *       - in: query
 *         name: id_tipo_vivienda
 *         schema: { type: integer }
 *         description: ID del tipo de vivienda
 *       - in: query
 *         name: id_parentesco
 *         schema: { type: integer }
 *         description: ID del parentesco
 *       - in: query
 *         name: id_estado_civil
 *         schema: { type: integer }
 *         description: ID del estado civil
 *       - in: query
 *         name: id_profesion
 *         schema: { type: integer }
 *         description: ID de la profesión
 *       - in: query
 *         name: id_nivel_educativo
 *         schema: { type: integer }
 *         description: ID del nivel educativo
 *       - in: query
 *         name: id_comunidad_cultural
 *         schema: { type: integer }
 *         description: ID de la comunidad cultural
 *       - in: query
 *         name: id_liderazgo
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *       - in: query
 *         name: id_destreza
 *         schema: { type: integer }
 *         description: ID de la destreza
 *       - in: query
 *         name: id_necesidad_enfermo
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo (ver catálogo /api/catalog/necesidad-enfermo)
 *         example: 1
 *       - in: query
 *         name: id_sexo
 *         schema: { type: integer }
 *         description: ID del sexo (1=Masculino, 2=Femenino)
 *       - in: query
 *         name: sexo
 *         schema: { type: string }
 *         description: Nombre del sexo (alternativa a id_sexo)
 *       - in: query
 *         name: talla_camisa
 *         schema: { type: string }
 *         description: Talla de camisa
 *       - in: query
 *         name: talla_pantalon
 *         schema: { type: string }
 *         description: Talla de pantalón
 *       - in: query
 *         name: talla_zapato
 *         schema: { type: string }
 *         description: Talla de zapato
 *       - in: query
 *         name: edad_min
 *         schema: { type: integer }
 *         description: Edad mínima
 *       - in: query
 *         name: edad_max
 *         schema: { type: integer }
 *         description: Edad máxima
 *       - in: query
 *         name: fecha_registro_desde
 *         schema: { type: string, format: date }
 *         description: Fecha de registro desde (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_registro_hasta
 *         schema: { type: string, format: date }
 *         description: Fecha de registro hasta (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, excel], default: json }
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas
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
 *     description: Filtrar personas por apellido familiar, tipo de vivienda, parentesco u otros criterios. Admite todos los filtros disponibles.
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apellido_familiar
 *         schema: { type: string }
 *         description: Apellido familiar (búsqueda parcial)
 *         example: García
 *       - in: query
 *         name: id_tipo_vivienda
 *         schema: { type: integer }
 *         description: ID del tipo de vivienda
 *         example: 1
 *       - in: query
 *         name: id_parentesco
 *         schema: { type: integer }
 *         description: ID del parentesco
 *       - in: query
 *         name: id_municipio
 *         schema: { type: integer }
 *         description: ID del municipio
 *       - in: query
 *         name: id_parroquia
 *         schema: { type: integer }
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_sector
 *         schema: { type: integer }
 *         description: ID del sector
 *       - in: query
 *         name: id_vereda
 *         schema: { type: integer }
 *         description: ID de la vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema: { type: integer }
 *         description: ID del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema: { type: integer }
 *         description: ID del centro poblado
 *       - in: query
 *         name: id_estado_civil
 *         schema: { type: integer }
 *         description: ID del estado civil
 *       - in: query
 *         name: id_profesion
 *         schema: { type: integer }
 *         description: ID de la profesión
 *       - in: query
 *         name: id_nivel_educativo
 *         schema: { type: integer }
 *         description: ID del nivel educativo
 *       - in: query
 *         name: id_comunidad_cultural
 *         schema: { type: integer }
 *         description: ID de la comunidad cultural
 *       - in: query
 *         name: id_liderazgo
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *       - in: query
 *         name: id_destreza
 *         schema: { type: integer }
 *         description: ID de la destreza
 *       - in: query
 *         name: id_necesidad_enfermo
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo (ver catálogo /api/catalog/necesidad-enfermo)
 *         example: 1
 *       - in: query
 *         name: id_sexo
 *         schema: { type: integer }
 *         description: ID del sexo
 *       - in: query
 *         name: sexo
 *         schema: { type: string }
 *         description: Nombre del sexo
 *       - in: query
 *         name: talla_camisa
 *         schema: { type: string }
 *         description: Talla de camisa
 *       - in: query
 *         name: talla_pantalon
 *         schema: { type: string }
 *         description: Talla de pantalón
 *       - in: query
 *         name: talla_zapato
 *         schema: { type: string }
 *         description: Talla de zapato
 *       - in: query
 *         name: edad_min
 *         schema: { type: integer }
 *         description: Edad mínima
 *       - in: query
 *         name: edad_max
 *         schema: { type: integer }
 *         description: Edad máxima
 *       - in: query
 *         name: fecha_registro_desde
 *         schema: { type: string, format: date }
 *         description: Fecha de registro desde
 *       - in: query
 *         name: fecha_registro_hasta
 *         schema: { type: string, format: date }
 *         description: Fecha de registro hasta
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, excel], default: json }
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas
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
 *     description: Filtrar personas por estado civil, profesión, nivel educativo, comunidad cultural, liderazgo, destrezas, necesidades del enfermo u otros criterios. Admite todos los filtros disponibles.
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_estado_civil
 *         schema: { type: integer }
 *         description: ID del estado civil
 *         example: 1
 *       - in: query
 *         name: id_profesion
 *         schema: { type: integer }
 *         description: ID de la profesión
 *         example: 5
 *       - in: query
 *         name: id_nivel_educativo
 *         schema: { type: integer }
 *         description: ID del nivel educativo
 *         example: 3
 *       - in: query
 *         name: id_comunidad_cultural
 *         schema: { type: integer }
 *         description: ID de la comunidad cultural
 *         example: 2
 *       - in: query
 *         name: id_liderazgo
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *         example: 1
 *       - in: query
 *         name: id_destreza
 *         schema: { type: integer }
 *         description: ID de la destreza
 *         example: 1
 *       - in: query
 *         name: id_necesidad_enfermo
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo (ver catálogo /api/catalog/necesidad-enfermo)
 *         example: 1
 *       - in: query
 *         name: id_sexo
 *         schema: { type: integer }
 *         description: ID del sexo (1=Masculino, 2=Femenino)
 *       - in: query
 *         name: sexo
 *         schema: { type: string }
 *         description: Nombre del sexo (alternativa a id_sexo)
 *         example: Femenino
 *       - in: query
 *         name: id_municipio
 *         schema: { type: integer }
 *         description: ID del municipio
 *       - in: query
 *         name: id_parroquia
 *         schema: { type: integer }
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_sector
 *         schema: { type: integer }
 *         description: ID del sector
 *       - in: query
 *         name: id_vereda
 *         schema: { type: integer }
 *         description: ID de la vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema: { type: integer }
 *         description: ID del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema: { type: integer }
 *         description: ID del centro poblado
 *       - in: query
 *         name: apellido_familiar
 *         schema: { type: string }
 *         description: Apellido familiar (búsqueda parcial)
 *       - in: query
 *         name: id_tipo_vivienda
 *         schema: { type: integer }
 *         description: ID del tipo de vivienda
 *       - in: query
 *         name: id_parentesco
 *         schema: { type: integer }
 *         description: ID del parentesco
 *       - in: query
 *         name: talla_camisa
 *         schema: { type: string }
 *         description: Talla de camisa
 *       - in: query
 *         name: talla_pantalon
 *         schema: { type: string }
 *         description: Talla de pantalón
 *       - in: query
 *         name: talla_zapato
 *         schema: { type: string }
 *         description: Talla de zapato
 *       - in: query
 *         name: edad_min
 *         schema: { type: integer }
 *         description: Edad mínima
 *       - in: query
 *         name: edad_max
 *         schema: { type: integer }
 *         description: Edad máxima
 *       - in: query
 *         name: fecha_registro_desde
 *         schema: { type: string, format: date }
 *         description: Fecha de registro desde
 *       - in: query
 *         name: fecha_registro_hasta
 *         schema: { type: string, format: date }
 *         description: Fecha de registro hasta
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, excel], default: json }
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas
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
 *     summary: Consultar personas por tallas
 *     description: Filtrar personas por talla de camisa, pantalón o zapato. Admite todos los filtros disponibles.
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: talla_camisa
 *         schema: { type: string }
 *         description: Talla de camisa
 *         example: M
 *       - in: query
 *         name: talla_pantalon
 *         schema: { type: string }
 *         description: Talla de pantalón
 *         example: 32
 *       - in: query
 *         name: talla_zapato
 *         schema: { type: string }
 *         description: Talla de zapato
 *         example: 42
 *       - in: query
 *         name: id_sexo
 *         schema: { type: integer }
 *         description: ID del sexo (1=Masculino, 2=Femenino)
 *         example: 1
 *       - in: query
 *         name: sexo
 *         schema: { type: string }
 *         description: Nombre del sexo (alternativa a id_sexo)
 *         example: Masculino
 *       - in: query
 *         name: edad_min
 *         schema: { type: integer }
 *         description: Edad mínima
 *         example: 18
 *       - in: query
 *         name: edad_max
 *         schema: { type: integer }
 *         description: Edad máxima
 *         example: 65
 *       - in: query
 *         name: id_necesidad_enfermo
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo (ver catálogo /api/catalog/necesidad-enfermo)
 *         example: 1
 *       - in: query
 *         name: id_municipio
 *         schema: { type: integer }
 *         description: ID del municipio
 *       - in: query
 *         name: id_parroquia
 *         schema: { type: integer }
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_sector
 *         schema: { type: integer }
 *         description: ID del sector
 *       - in: query
 *         name: id_vereda
 *         schema: { type: integer }
 *         description: ID de la vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema: { type: integer }
 *         description: ID del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema: { type: integer }
 *         description: ID del centro poblado
 *       - in: query
 *         name: apellido_familiar
 *         schema: { type: string }
 *         description: Apellido familiar (búsqueda parcial)
 *       - in: query
 *         name: id_tipo_vivienda
 *         schema: { type: integer }
 *         description: ID del tipo de vivienda
 *       - in: query
 *         name: id_parentesco
 *         schema: { type: integer }
 *         description: ID del parentesco
 *       - in: query
 *         name: id_estado_civil
 *         schema: { type: integer }
 *         description: ID del estado civil
 *       - in: query
 *         name: id_profesion
 *         schema: { type: integer }
 *         description: ID de la profesión
 *       - in: query
 *         name: id_nivel_educativo
 *         schema: { type: integer }
 *         description: ID del nivel educativo
 *       - in: query
 *         name: id_comunidad_cultural
 *         schema: { type: integer }
 *         description: ID de la comunidad cultural
 *       - in: query
 *         name: id_liderazgo
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *       - in: query
 *         name: id_destreza
 *         schema: { type: integer }
 *         description: ID de la destreza
 *       - in: query
 *         name: fecha_registro_desde
 *         schema: { type: string, format: date }
 *         description: Fecha de registro desde
 *       - in: query
 *         name: fecha_registro_hasta
 *         schema: { type: string, format: date }
 *         description: Fecha de registro hasta
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, excel], default: json }
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas
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
 *     description: Filtrar personas por edad mínima y/o máxima. Admite todos los filtros disponibles.
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: edad_min
 *         schema: { type: integer }
 *         description: Edad mínima
 *         example: 18
 *       - in: query
 *         name: edad_max
 *         schema: { type: integer }
 *         description: Edad máxima
 *         example: 65
 *       - in: query
 *         name: id_sexo
 *         schema: { type: integer }
 *         description: ID del sexo (1=Masculino, 2=Femenino)
 *       - in: query
 *         name: sexo
 *         schema: { type: string }
 *         description: Nombre del sexo (alternativa a id_sexo)
 *       - in: query
 *         name: id_necesidad_enfermo
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo (ver catálogo /api/catalog/necesidad-enfermo)
 *         example: 1
 *       - in: query
 *         name: id_municipio
 *         schema: { type: integer }
 *         description: ID del municipio
 *       - in: query
 *         name: id_parroquia
 *         schema: { type: integer }
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_sector
 *         schema: { type: integer }
 *         description: ID del sector
 *       - in: query
 *         name: id_vereda
 *         schema: { type: integer }
 *         description: ID de la vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema: { type: integer }
 *         description: ID del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema: { type: integer }
 *         description: ID del centro poblado
 *       - in: query
 *         name: apellido_familiar
 *         schema: { type: string }
 *         description: Apellido familiar (búsqueda parcial)
 *       - in: query
 *         name: id_tipo_vivienda
 *         schema: { type: integer }
 *         description: ID del tipo de vivienda
 *       - in: query
 *         name: id_parentesco
 *         schema: { type: integer }
 *         description: ID del parentesco
 *       - in: query
 *         name: id_estado_civil
 *         schema: { type: integer }
 *         description: ID del estado civil
 *       - in: query
 *         name: id_profesion
 *         schema: { type: integer }
 *         description: ID de la profesión
 *       - in: query
 *         name: id_nivel_educativo
 *         schema: { type: integer }
 *         description: ID del nivel educativo
 *       - in: query
 *         name: id_comunidad_cultural
 *         schema: { type: integer }
 *         description: ID de la comunidad cultural
 *       - in: query
 *         name: id_liderazgo
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *       - in: query
 *         name: id_destreza
 *         schema: { type: integer }
 *         description: ID de la destreza
 *       - in: query
 *         name: talla_camisa
 *         schema: { type: string }
 *         description: Talla de camisa
 *       - in: query
 *         name: talla_pantalon
 *         schema: { type: string }
 *         description: Talla de pantalón
 *       - in: query
 *         name: talla_zapato
 *         schema: { type: string }
 *         description: Talla de zapato
 *       - in: query
 *         name: fecha_registro_desde
 *         schema: { type: string, format: date }
 *         description: Fecha de registro desde
 *       - in: query
 *         name: fecha_registro_hasta
 *         schema: { type: string, format: date }
 *         description: Fecha de registro hasta
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, excel], default: json }
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas
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
 * /api/personas/consolidado/cumpleanos:
 *   get:
 *     summary: Consultar personas por mes/día de cumpleaños
 *     description: Filtra personas cuyo día o mes de nacimiento coincide con los parámetros indicados, sin importar el año de nacimiento. Admite todos los filtros disponibles.
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mes_nacimiento
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *         description: Mes de nacimiento (1=Enero … 12=Diciembre)
 *         example: 6
 *       - in: query
 *         name: id_municipio
 *         schema: { type: integer }
 *         description: ID del municipio
 *       - in: query
 *         name: id_parroquia
 *         schema: { type: integer }
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_sector
 *         schema: { type: integer }
 *         description: ID del sector
 *       - in: query
 *         name: id_vereda
 *         schema: { type: integer }
 *         description: ID de la vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema: { type: integer }
 *         description: ID del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema: { type: integer }
 *         description: ID del centro poblado
 *       - in: query
 *         name: id_sexo
 *         schema: { type: integer }
 *         description: ID del sexo (1=Masculino, 2=Femenino)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, excel], default: json }
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Lista de personas filtradas por cumpleaños
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
router.get('/cumpleanos', authMiddleware.authenticateToken, personasController.consultarPorCumpleanos);

/**
 * @swagger
 * /api/personas/consolidado/reporte:
 *   get:
 *     summary: Reporte general con todos los filtros combinados
 *     description: Permite combinar cualquier combinación de filtros disponibles para generar un reporte personalizado en JSON o Excel.
 *     tags:
 *       - Personas Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_municipio
 *         schema: { type: integer }
 *         description: ID del municipio
 *       - in: query
 *         name: id_parroquia
 *         schema: { type: integer }
 *         description: ID de la parroquia
 *       - in: query
 *         name: id_sector
 *         schema: { type: integer }
 *         description: ID del sector
 *       - in: query
 *         name: id_vereda
 *         schema: { type: integer }
 *         description: ID de la vereda
 *       - in: query
 *         name: id_corregimiento
 *         schema: { type: integer }
 *         description: ID del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema: { type: integer }
 *         description: ID del centro poblado
 *       - in: query
 *         name: apellido_familiar
 *         schema: { type: string }
 *         description: Apellido familiar (búsqueda parcial)
 *       - in: query
 *         name: id_tipo_vivienda
 *         schema: { type: integer }
 *         description: ID del tipo de vivienda
 *       - in: query
 *         name: id_parentesco
 *         schema: { type: integer }
 *         description: ID del parentesco
 *       - in: query
 *         name: id_estado_civil
 *         schema: { type: integer }
 *         description: ID del estado civil
 *       - in: query
 *         name: id_profesion
 *         schema: { type: integer }
 *         description: ID de la profesión
 *       - in: query
 *         name: id_nivel_educativo
 *         schema: { type: integer }
 *         description: ID del nivel educativo
 *       - in: query
 *         name: id_comunidad_cultural
 *         schema: { type: integer }
 *         description: ID de la comunidad cultural
 *       - in: query
 *         name: id_liderazgo
 *         schema: { type: integer }
 *         description: ID del tipo de liderazgo
 *         example: 1
 *       - in: query
 *         name: id_destreza
 *         schema: { type: integer }
 *         description: ID de la destreza
 *       - in: query
 *         name: id_necesidad_enfermo
 *         schema: { type: integer }
 *         description: ID del tipo de necesidad del enfermo (ver catálogo /api/catalog/necesidad-enfermo)
 *         example: 1
 *       - in: query
 *         name: id_sexo
 *         schema: { type: integer }
 *         description: ID del sexo (1=Masculino, 2=Femenino)
 *       - in: query
 *         name: sexo
 *         schema: { type: string }
 *         description: Nombre del sexo (alternativa a id_sexo)
 *       - in: query
 *         name: talla_camisa
 *         schema: { type: string }
 *         description: Talla de camisa
 *       - in: query
 *         name: talla_pantalon
 *         schema: { type: string }
 *         description: Talla de pantalón
 *       - in: query
 *         name: talla_zapato
 *         schema: { type: string }
 *         description: Talla de zapato
 *       - in: query
 *         name: edad_min
 *         schema: { type: integer }
 *         description: Edad mínima
 *       - in: query
 *         name: edad_max
 *         schema: { type: integer }
 *         description: Edad máxima
 *       - in: query
 *         name: fecha_registro_desde
 *         schema: { type: string, format: date }
 *         description: Fecha de registro desde
 *       - in: query
 *         name: fecha_registro_hasta
 *         schema: { type: string, format: date }
 *         description: Fecha de registro hasta
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, excel], default: json }
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
