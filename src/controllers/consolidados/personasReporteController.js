import personasReporteService from '../../services/consolidados/personasReporteService.js';
import { parseIdOrNombre, parseIdEstricto, FiltroInvalidoError } from '../../utils/queryFilters.js';

/**
 * id_municipio acepta ID numérico o nombre; el resto de IDs exige un entero
 * válido en vez de descartar el filtro en silencio si llega un valor no numérico.
 */
function extraerFiltros(query) {
  const filtros = {
    id_persona: parseIdEstricto(query.id_persona, 'id_persona'),
    id_municipio: parseIdOrNombre(query.id_municipio),
    id_sector: parseIdEstricto(query.id_sector, 'id_sector'),
    id_vereda: parseIdEstricto(query.id_vereda, 'id_vereda'),
    id_parroquia: parseIdEstricto(query.id_parroquia, 'id_parroquia'),
    talla_camisa: query.talla_camisa,
    talla_pantalon: query.talla_pantalon,
    talla_zapatos: query.talla_zapatos,
    id_profesion: parseIdEstricto(query.id_profesion, 'id_profesion'),
    id_destreza: parseIdEstricto(query.id_destreza, 'id_destreza'),
    limite: query.limite ? parseInt(query.limite) : 1000
  };

  Object.keys(filtros).forEach(key => {
    if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
      delete filtros[key];
    }
  });

  return filtros;
}

class PersonasReporteController {
  /**
   * Generar reporte de personas en formato JSON
   * GET /api/personas/reporte
   */
  async generarReporteJSON(req, res) {
    try {
      const filtros = extraerFiltros(req.query);

      console.log('🔍 Generando reporte de personas (JSON) con filtros:', filtros);

      const resultado = await personasReporteService.generarReporte(filtros);

      res.json({
        exito: true,
        mensaje: 'Reporte de personas generado exitosamente',
        ...resultado
      });

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error en generarReporteJSON:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "REPORTE_PERSONAS_JSON_ERROR"
      });
    }
  }

  /**
   * Generar reporte de personas en formato Excel
   * GET /api/personas/reporte/excel
   */
  async generarReporteExcel(req, res) {
    try {
      const filtros = extraerFiltros(req.query);

      console.log('📊 Generando reporte de personas (Excel) con filtros:', filtros);

      const buffer = await personasReporteService.generarReporteExcel(filtros);

      // Generar nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `reporte_personas_${fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error en generarReporteExcel:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "REPORTE_PERSONAS_EXCEL_ERROR"
      });
    }
  }
}

export default new PersonasReporteController();
