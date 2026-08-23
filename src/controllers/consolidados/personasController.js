import personasService from '../../services/consolidados/personasService.js';
import { parseCampos } from '../../utils/exportColumns.js';
import { parseIdOrNombre, parseIdEstricto, FiltroInvalidoError } from '../../utils/queryFilters.js';

/**
 * Extrae y parsea todos los filtros disponibles del query string.
 * Centralizado para que todos los endpoints apliquen el mismo conjunto completo de filtros.
 * id_municipio acepta ID numérico o nombre; el resto de IDs exige un entero
 * válido (lanza FiltroInvalidoError) en vez de descartar el filtro en silencio.
 */
function extraerFiltros(query) {
  const filtros = {
    // Paginación
    page:  query.page  ? parseInt(query.page)  : 1,
    limit: query.limit ? parseInt(query.limit) : 10,

    // Geográficos
    id_municipio:     parseIdOrNombre(query.id_municipio),
    id_parroquia:     parseIdEstricto(query.id_parroquia, 'id_parroquia'),
    id_sector:        parseIdEstricto(query.id_sector, 'id_sector'),
    id_vereda:        parseIdEstricto(query.id_vereda, 'id_vereda'),
    id_corregimiento: parseIdEstricto(query.id_corregimiento, 'id_corregimiento'),
    id_centro_poblado: parseIdEstricto(query.id_centro_poblado, 'id_centro_poblado'),

    // Familia y vivienda
    apellido_familiar: query.apellido_familiar || undefined,
    id_tipo_vivienda:  parseIdEstricto(query.id_tipo_vivienda, 'id_tipo_vivienda'),
    id_parentesco:     parseIdEstricto(query.id_parentesco, 'id_parentesco'),

    // Datos personales
    id_estado_civil:      parseIdEstricto(query.id_estado_civil, 'id_estado_civil'),
    id_profesion:         parseIdEstricto(query.id_profesion, 'id_profesion'),
    id_nivel_educativo:   parseIdEstricto(query.id_nivel_educativo, 'id_nivel_educativo'),
    id_comunidad_cultural: parseIdEstricto(query.id_comunidad_cultural, 'id_comunidad_cultural'),
    id_liderazgo:         parseIdEstricto(query.id_liderazgo, 'id_liderazgo'),
    id_destreza:          parseIdEstricto(query.id_destreza, 'id_destreza'),
    id_necesidad_enfermo: parseIdEstricto(query.id_necesidad_enfermo, 'id_necesidad_enfermo'),

    // Sexo
    id_sexo: parseIdEstricto(query.id_sexo, 'id_sexo'),
    sexo:    query.sexo    || undefined,

    // Tallas
    talla_camisa:   query.talla_camisa   || undefined,
    talla_pantalon: query.talla_pantalon || undefined,
    talla_zapato:   query.talla_zapato   || undefined,

    // Edad
    edad_min: query.edad_min ? parseInt(query.edad_min) : undefined,
    edad_max: query.edad_max ? parseInt(query.edad_max) : undefined,

    // Fechas de registro
    fecha_registro_desde: query.fecha_registro_desde || undefined,
    fecha_registro_hasta: query.fecha_registro_hasta || undefined,

    // Cumpleaños
    mes_nacimiento: query.mes_nacimiento ? parseInt(query.mes_nacimiento) : undefined,
    dia_nacimiento: query.dia_nacimiento ? parseInt(query.dia_nacimiento) : undefined,
  };

  // Eliminar claves sin valor (undefined, null, NaN)
  Object.keys(filtros).forEach(key => {
    const v = filtros[key];
    if (v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v))) {
      delete filtros[key];
    }
  });

  return filtros;
}

/**
 * Envía la respuesta Excel con los headers correctos.
 */
async function responderExcel(res, filtros, filename, camposSeleccionados) {
  const buffer = await personasService.generarExcelPersonas(filtros, camposSeleccionados);
  const timestamp = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}_${timestamp}.xlsx"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}

/**
 * Configuración por endpoint: los 7 endpoints de /api/personas/consolidado/*
 * comparten exactamente el mismo comportamiento (extraerFiltros + consultarPersonas),
 * solo cambian el emoji/etiqueta de log, el nombre de archivo Excel y el código de error.
 */
const ENDPOINTS = {
  consultarPorGeografia:       { emoji: '📍', label: 'Consulta geográfica',          filename: 'personas_geografico',      errorCode: 'CONSULTA_GEOGRAFICA_ERROR' },
  consultarPorFamilia:         { emoji: '👨‍👩‍👧‍👦', label: 'Consulta por familia',         filename: 'personas_familia',         errorCode: 'CONSULTA_FAMILIA_ERROR' },
  consultarPorDatosPersonales: { emoji: '👤', label: 'Consulta por datos personales', filename: 'personas_personal',        errorCode: 'CONSULTA_PERSONAL_ERROR' },
  consultarPorTallas:          { emoji: '👕', label: 'Consulta por tallas',           filename: 'personas_tallas',          errorCode: 'CONSULTA_TALLAS_ERROR' },
  consultarPorEdad:            { emoji: '🎂', label: 'Consulta por edad',             filename: 'personas_edad',            errorCode: 'CONSULTA_EDAD_ERROR' },
  consultarPorCumpleanos:      { emoji: '🎂', label: 'Consulta por cumpleaños',       filename: 'personas_cumpleanos',      errorCode: 'CONSULTA_CUMPLEANOS_ERROR' },
  generarReporteGeneral:       { emoji: '📊', label: 'Reporte general con filtros',   filename: 'personas_reporte_general', errorCode: 'REPORTE_GENERAL_ERROR' },
};

/**
 * Maneja la lógica común a los 7 endpoints: extrae filtros, consulta y responde en JSON o Excel.
 */
async function manejarConsultaConsolidada(req, res, { emoji, label, filename, errorCode, methodName }) {
  try {
    const format = req.query.format || 'json';
    const filtros = extraerFiltros(req.query);
    const camposSeleccionados = parseCampos(req.query);
    console.log(`${emoji} ${label}:`, filtros);

    if (format === 'excel') {
      await responderExcel(res, filtros, filename, camposSeleccionados);
    } else {
      res.json(await personasService.consultarPersonas(filtros));
    }
  } catch (error) {
    if (error instanceof FiltroInvalidoError) {
      return res.status(400).json({ status: 'error', message: error.message, code: error.code });
    }
    console.error(`❌ Error en ${methodName}:`, error);
    res.status(500).json({ status: 'error', message: error.message, code: errorCode });
  }
}

class PersonasController {

  /** GET /api/personas/consolidado/geografico */
  async consultarPorGeografia(req, res) {
    return manejarConsultaConsolidada(req, res, { ...ENDPOINTS.consultarPorGeografia, methodName: 'consultarPorGeografia' });
  }

  /** GET /api/personas/consolidado/familia */
  async consultarPorFamilia(req, res) {
    return manejarConsultaConsolidada(req, res, { ...ENDPOINTS.consultarPorFamilia, methodName: 'consultarPorFamilia' });
  }

  /** GET /api/personas/consolidado/personal */
  async consultarPorDatosPersonales(req, res) {
    return manejarConsultaConsolidada(req, res, { ...ENDPOINTS.consultarPorDatosPersonales, methodName: 'consultarPorDatosPersonales' });
  }

  /** GET /api/personas/consolidado/tallas */
  async consultarPorTallas(req, res) {
    return manejarConsultaConsolidada(req, res, { ...ENDPOINTS.consultarPorTallas, methodName: 'consultarPorTallas' });
  }

  /** GET /api/personas/consolidado/edad */
  async consultarPorEdad(req, res) {
    return manejarConsultaConsolidada(req, res, { ...ENDPOINTS.consultarPorEdad, methodName: 'consultarPorEdad' });
  }

  /** GET /api/personas/consolidado/cumpleanos */
  async consultarPorCumpleanos(req, res) {
    return manejarConsultaConsolidada(req, res, { ...ENDPOINTS.consultarPorCumpleanos, methodName: 'consultarPorCumpleanos' });
  }

  /** GET /api/personas/consolidado/reporte */
  async generarReporteGeneral(req, res) {
    return manejarConsultaConsolidada(req, res, { ...ENDPOINTS.generarReporteGeneral, methodName: 'generarReporteGeneral' });
  }
}

export default new PersonasController();
