import saludConsolidadoService from '../../services/consolidados/saludConsolidadoService.js';
import { parseCampos } from '../../utils/exportColumns.js';
import { parseIdOrNombre, parseIdEstricto, FiltroInvalidoError } from '../../utils/queryFilters.js';

/**
 * Extrae los filtros comunes a los endpoints de salud. id_municipio acepta
 * ID numérico o nombre; el resto de IDs exige un entero válido en vez de
 * descartar el filtro en silencio si llega un valor no numérico.
 */
function extraerFiltrosSalud(query, limiteDefecto) {
  return {
    id_enfermedad: parseIdEstricto(query.id_enfermedad, 'id_enfermedad'),
    edad_min: query.edad_min,
    edad_max: query.edad_max,
    id_sexo: parseIdEstricto(query.id_sexo, 'id_sexo'),
    id_parroquia: parseIdEstricto(query.id_parroquia, 'id_parroquia'),
    id_municipio: parseIdOrNombre(query.id_municipio),
    id_sector: parseIdEstricto(query.id_sector, 'id_sector'),
    id_vereda: parseIdEstricto(query.id_vereda, 'id_vereda'),
    id_corregimiento: parseIdEstricto(query.id_corregimiento, 'id_corregimiento'),
    id_centro_poblado: parseIdEstricto(query.id_centro_poblado, 'id_centro_poblado'),
    limite: query.limite ? parseInt(query.limite) : limiteDefecto
  };
}

function limpiarFiltros(filtros) {
  Object.keys(filtros).forEach(key => {
    if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
      delete filtros[key];
    }
  });
  return filtros;
}

class SaludConsolidadoController {
  /**
   * Consulta consolidada de salud
   * GET /api/personas/salud
   */
  async consultarSalud(req, res) {
    try {
      const filtros = limpiarFiltros(extraerFiltrosSalud(req.query, 100));

      console.log('🔍 Consultando información de salud con filtros:', filtros);

      const resultado = await saludConsolidadoService.consultarSalud(filtros);

      res.json(resultado);

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error en consultarSalud:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_SALUD_ERROR"
      });
    }
  }

  /**
   * Obtener estadísticas de salud
   * GET /api/personas/salud/estadisticas
   */
  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await saludConsolidadoService.obtenerEstadisticas();
      
      res.json({
        exito: true,
        mensaje: "Estadísticas de salud obtenidas",
        datos: estadisticas
      });

    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "ESTADISTICAS_SALUD_ERROR"
      });
    }
  }

  /**
   * Obtener resumen de salud por parroquia
   * GET /api/personas/salud/parroquia/:id
   */
  async obtenerResumenPorParroquia(req, res) {
    try {
      const idParroquia = req.params.id;
      
      const resultado = await saludConsolidadoService.obtenerResumenPorParroquia(idParroquia);
      
      res.json({
        exito: true,
        mensaje: "Resumen de salud por parroquia obtenido",
        datos: resultado
      });

    } catch (error) {
      console.error('❌ Error en obtenerResumenPorParroquia:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "RESUMEN_SALUD_PARROQUIA_ERROR"
      });
    }
  }

  /**
   * Buscar personas con enfermedades específicas
   * GET /api/personas/salud/enfermedades/:enfermedad
   */
  async buscarPorEnfermedad(req, res) {
    try {
      const enfermedad = req.params.enfermedad;
      const filtros = {
        enfermedad: enfermedad,
        limite: req.query.limite ? parseInt(req.query.limite) : 50
      };

      const resultado = await saludConsolidadoService.consultarSalud(filtros);

      res.json({
        exito: true,
        mensaje: `Personas con ${enfermedad}`,
        datos: resultado.datos,
        total: resultado.total,
        estadisticas: resultado.estadisticas
      });

    } catch (error) {
      console.error('❌ Error en buscarPorEnfermedad:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "BUSCAR_ENFERMEDAD_ERROR"
      });
    }
  }

  /**
   * Generar reporte de salud en Excel
   * GET /api/personas/salud/reporte/excel
   */
  async generarReporteExcel(req, res) {
    try {
      const filtros = limpiarFiltros(extraerFiltrosSalud(req.query, 5000));

      console.log('📊 Generando reporte Excel de salud con filtros:', filtros);

      const camposSeleccionados = parseCampos(req.query);
      const buffer = await saludConsolidadoService.generarReporteExcel(filtros, camposSeleccionados);

      // Configurar headers para descarga de archivo Excel
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `reporte_salud_${timestamp}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error generando reporte Excel:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "REPORTE_EXCEL_ERROR"
      });
    }
  }

  /**
   * Generar reporte de salud en JSON
   * GET /api/personas/salud/reporte/json
   */
  async generarReporteJSON(req, res) {
    try {
      const filtros = limpiarFiltros(extraerFiltrosSalud(req.query, 5000));

      console.log('📊 Generando reporte JSON de salud con filtros:', filtros);

      const resultado = await saludConsolidadoService.consultarSalud(filtros);

      res.json({
        exito: true,
        mensaje: `Reporte de salud generado: ${resultado.total} personas encontradas`,
        datos: resultado.datos,
        total: resultado.total,
        filtros_aplicados: resultado.filtros_aplicados,
        fecha_generacion: new Date().toISOString()
      });

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error generando reporte JSON:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "REPORTE_JSON_ERROR"
      });
    }
  }
}

export default new SaludConsolidadoController();
