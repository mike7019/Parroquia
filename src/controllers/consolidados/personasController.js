import personasService from '../../services/consolidados/personasService.js';

/**
 * Extrae y parsea todos los filtros disponibles del query string.
 * Centralizado para que todos los endpoints apliquen el mismo conjunto completo de filtros.
 */
function extraerFiltros(query) {
  const filtros = {
    // Paginación
    page:  query.page  ? parseInt(query.page)  : 1,
    limit: query.limit ? parseInt(query.limit) : 10,

    // Geográficos
    id_municipio:     query.id_municipio     ? parseInt(query.id_municipio)     : undefined,
    id_parroquia:     query.id_parroquia     ? parseInt(query.id_parroquia)     : undefined,
    id_sector:        query.id_sector        ? parseInt(query.id_sector)        : undefined,
    id_vereda:        query.id_vereda        ? parseInt(query.id_vereda)        : undefined,
    id_corregimiento: query.id_corregimiento ? parseInt(query.id_corregimiento) : undefined,
    id_centro_poblado: query.id_centro_poblado ? parseInt(query.id_centro_poblado) : undefined,

    // Familia y vivienda
    apellido_familiar: query.apellido_familiar || undefined,
    id_tipo_vivienda:  query.id_tipo_vivienda  ? parseInt(query.id_tipo_vivienda)  : undefined,
    id_parentesco:     query.id_parentesco     ? parseInt(query.id_parentesco)     : undefined,

    // Datos personales
    id_estado_civil:      query.id_estado_civil      ? parseInt(query.id_estado_civil)      : undefined,
    id_profesion:         query.id_profesion         ? parseInt(query.id_profesion)         : undefined,
    id_nivel_educativo:   query.id_nivel_educativo   ? parseInt(query.id_nivel_educativo)   : undefined,
    id_comunidad_cultural: query.id_comunidad_cultural ? parseInt(query.id_comunidad_cultural) : undefined,
    id_liderazgo:         query.id_liderazgo         ? parseInt(query.id_liderazgo)         : undefined,
    id_destreza:          query.id_destreza          ? parseInt(query.id_destreza)          : undefined,
    id_necesidad_enfermo: query.id_necesidad_enfermo ? parseInt(query.id_necesidad_enfermo) : undefined,

    // Sexo
    id_sexo: query.id_sexo ? parseInt(query.id_sexo) : undefined,
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
async function responderExcel(res, filtros, filename) {
  const buffer = await personasService.generarExcelPersonas(filtros);
  const timestamp = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}_${timestamp}.xlsx"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}

class PersonasController {

  /**
   * GET /api/personas/consolidado/geografico
   */
  async consultarPorGeografia(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = extraerFiltros(req.query);
      console.log('📍 Consulta geográfica:', filtros);

      if (format === 'excel') {
        await responderExcel(res, filtros, 'personas_geografico');
      } else {
        res.json(await personasService.consultarPersonas(filtros));
      }
    } catch (error) {
      console.error('❌ Error en consultarPorGeografia:', error);
      res.status(500).json({ status: 'error', message: error.message, code: 'CONSULTA_GEOGRAFICA_ERROR' });
    }
  }

  /**
   * GET /api/personas/consolidado/familia
   */
  async consultarPorFamilia(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = extraerFiltros(req.query);
      console.log('👨‍👩‍👧‍👦 Consulta por familia:', filtros);

      if (format === 'excel') {
        await responderExcel(res, filtros, 'personas_familia');
      } else {
        res.json(await personasService.consultarPersonas(filtros));
      }
    } catch (error) {
      console.error('❌ Error en consultarPorFamilia:', error);
      res.status(500).json({ status: 'error', message: error.message, code: 'CONSULTA_FAMILIA_ERROR' });
    }
  }

  /**
   * GET /api/personas/consolidado/personal
   */
  async consultarPorDatosPersonales(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = extraerFiltros(req.query);
      console.log('👤 Consulta por datos personales:', filtros);

      if (format === 'excel') {
        await responderExcel(res, filtros, 'personas_personal');
      } else {
        res.json(await personasService.consultarPersonas(filtros));
      }
    } catch (error) {
      console.error('❌ Error en consultarPorDatosPersonales:', error);
      res.status(500).json({ status: 'error', message: error.message, code: 'CONSULTA_PERSONAL_ERROR' });
    }
  }

  /**
   * GET /api/personas/consolidado/tallas
   */
  async consultarPorTallas(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = extraerFiltros(req.query);
      console.log('👕 Consulta por tallas:', filtros);

      if (format === 'excel') {
        await responderExcel(res, filtros, 'personas_tallas');
      } else {
        res.json(await personasService.consultarPersonas(filtros));
      }
    } catch (error) {
      console.error('❌ Error en consultarPorTallas:', error);
      res.status(500).json({ status: 'error', message: error.message, code: 'CONSULTA_TALLAS_ERROR' });
    }
  }

  /**
   * GET /api/personas/consolidado/edad
   */
  async consultarPorEdad(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = extraerFiltros(req.query);
      console.log('🎂 Consulta por edad:', filtros);

      if (format === 'excel') {
        await responderExcel(res, filtros, 'personas_edad');
      } else {
        res.json(await personasService.consultarPersonas(filtros));
      }
    } catch (error) {
      console.error('❌ Error en consultarPorEdad:', error);
      res.status(500).json({ status: 'error', message: error.message, code: 'CONSULTA_EDAD_ERROR' });
    }
  }

  /**
   * GET /api/personas/consolidado/cumpleanos
   */
  async consultarPorCumpleanos(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = extraerFiltros(req.query);
      console.log('🎂 Consulta por cumpleaños:', filtros);

      if (format === 'excel') {
        await responderExcel(res, filtros, 'personas_cumpleanos');
      } else {
        res.json(await personasService.consultarPersonas(filtros));
      }
    } catch (error) {
      console.error('❌ Error en consultarPorCumpleanos:', error);
      res.status(500).json({ status: 'error', message: error.message, code: 'CONSULTA_CUMPLEANOS_ERROR' });
    }
  }

  /**
   * GET /api/personas/consolidado/reporte
   */
  async generarReporteGeneral(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = extraerFiltros(req.query);
      console.log('📊 Reporte general con filtros:', filtros);

      if (format === 'excel') {
        await responderExcel(res, filtros, 'personas_reporte_general');
      } else {
        res.json(await personasService.consultarPersonas(filtros));
      }
    } catch (error) {
      console.error('❌ Error en generarReporteGeneral:', error);
      res.status(500).json({ status: 'error', message: error.message, code: 'REPORTE_GENERAL_ERROR' });
    }
  }
}

export default new PersonasController();
