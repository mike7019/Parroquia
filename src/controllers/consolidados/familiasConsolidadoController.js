import familiasConsolidadoService from '../../services/consolidados/familiasConsolidadoService.js';
import { parseCamposPorHoja } from '../../utils/exportColumns.js';

/**
 * Mapeo de hoja lógica -> nombre del query param que selecciona sus columnas.
 * Cada uno cae de vuelta a `campos` (genérico) si no vino su param específico.
 */
const HOJAS_EXCEL_FAMILIAS = {
  informacionGeneral: 'campos_informacion_general',
  miembrosFamilias: 'campos_miembros_familias',
  difuntos: 'campos_difuntos'
};
import { parseIdOrNombre, parseIdEstricto, FiltroInvalidoError } from '../../utils/queryFilters.js';

/**
 * Extrae los filtros geográficos comunes a todos los endpoints de familias.
 * id_municipio acepta ID numérico o nombre; el resto exige un ID numérico
 * válido (o lanza FiltroInvalidoError en vez de descartar el filtro en silencio).
 */
function extraerFiltrosGeograficos(query) {
  return {
    id_parroquia: parseIdEstricto(query.id_parroquia, 'id_parroquia'),
    id_municipio: parseIdOrNombre(query.id_municipio),
    id_sector: parseIdEstricto(query.id_sector, 'id_sector'),
    id_vereda: parseIdEstricto(query.id_vereda, 'id_vereda'),
    id_corregimiento: parseIdEstricto(query.id_corregimiento, 'id_corregimiento'),
    id_centro_poblado: parseIdEstricto(query.id_centro_poblado, 'id_centro_poblado')
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

class FamiliasConsolidadoController {
  /**
   * Consulta consolidada de familias - NUEVA VERSIÓN CON FILTROS POR ID
   * GET /api/familias
   * @param {number} req.query.id_parroquia - ID de la parroquia
   * @param {number} req.query.id_municipio - ID del municipio
   * @param {number} req.query.id_sector - ID del sector
   * @param {number} req.query.id_vereda - ID de la vereda
   * @param {number} req.query.id_corregimiento - ID del corregimiento
   * @param {number} req.query.id_centro_poblado - ID del centro poblado
   * @param {number} req.query.limite - Límite de resultados
   * @param {number} req.query.offset - Offset para paginación
   */
  async consultarFamilias(req, res) {
    try {
      const filtros = limpiarFiltros({
        ...extraerFiltrosGeograficos(req.query),
        limite: req.query.limite ? parseInt(req.query.limite) : 100,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      });

      console.log('🔍 Consultando familias consolidadas con filtros:', filtros);

      const resultado = await familiasConsolidadoService.consultarFamilias(filtros);

      res.json(resultado);

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error en consultarFamilias:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_FAMILIAS_ERROR"
      });
    }
  }

  /**
   * Generar reporte Excel de familias consolidadas
   * GET /api/familias/reporte/excel
   */
  async generarReporteExcelCompleto(req, res) {
    try {
      const filtros = limpiarFiltros({
        ...extraerFiltrosGeograficos(req.query),
        // Sin límite para reporte completo
        limite: 10000
      });

      console.log('📊 Generando Excel de familias con filtros:', filtros);

      const camposPorHoja = parseCamposPorHoja(req.query, HOJAS_EXCEL_FAMILIAS);
      const workbook = await familiasConsolidadoService.generarReporteExcelFamilias(filtros, camposPorHoja);

      // Configurar headers para descarga
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = `familias_consolidado_${timestamp}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Escribir el archivo al response
      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error generando Excel de familias:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "EXCEL_FAMILIAS_ERROR"
      });
    }
  }

  /**
   * Obtener estadísticas de familias
   * GET /api/familias/estadisticas
   */
  async obtenerEstadisticas(req, res) {
    try {
      // Obtener todas las personas para generar estadísticas generales
      const resultado = await familiasConsolidadoService.consultarFamilias({
        incluir_detalles: true,
        limite: 1000 // Límite alto para estadísticas completas
      });
      
      res.json({
        exito: true,
        mensaje: "Estadísticas de familias obtenidas",
        datos: resultado.estadisticas,
        total_personas: resultado.total
      });

    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "ESTADISTICAS_FAMILIAS_ERROR"
      });
    }
  }

  /**
   * Consultar madres específicamente
   * GET /api/familias/madres
   */
  async consultarMadres(req, res) {
    try {
      const filtros = limpiarFiltros({
        ...extraerFiltrosGeograficos(req.query),
        limite: req.query.limite ? parseInt(req.query.limite) : 100,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      });

      const resultado = await familiasConsolidadoService.consultarMadres(filtros);

      res.json(resultado);

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error en consultarMadres:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_MADRES_ERROR"
      });
    }
  }

  /**
   * Consultar padres específicamente
   * GET /api/familias/padres
   */
  async consultarPadres(req, res) {
    try {
      const filtros = limpiarFiltros({
        ...extraerFiltrosGeograficos(req.query),
        limite: req.query.limite ? parseInt(req.query.limite) : 100,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      });

      const resultado = await familiasConsolidadoService.consultarPadres(filtros);

      res.json(resultado);

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error en consultarPadres:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_PADRES_ERROR"
      });
    }
  }

  /**
   * Consultar familias sin padre
   * GET /api/familias/sin-padre
   */
  async consultarFamiliasSinPadre(req, res) {
    try {
      const filtros = limpiarFiltros({
        ...extraerFiltrosGeograficos(req.query),
        limite: req.query.limite ? parseInt(req.query.limite) : 100
      });

      const resultado = await familiasConsolidadoService.consultarFamiliasSinPadre(filtros);

      res.json(resultado);

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error en consultarFamiliasSinPadre:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "FAMILIAS_SIN_PADRE_ERROR"
      });
    }
  }

  /**
   * Consultar familias sin madre
   * GET /api/familias/sin-madre
   */
  async consultarFamiliasSinMadre(req, res) {
    try {
      const filtros = limpiarFiltros({
        ...extraerFiltrosGeograficos(req.query),
        limite: req.query.limite ? parseInt(req.query.limite) : 100
      });

      const resultado = await familiasConsolidadoService.consultarFamiliasSinMadre(filtros);

      res.json(resultado);

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: "error", message: error.message, code: error.code });
      }
      console.error('❌ Error en consultarFamiliasSinMadre:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "FAMILIAS_SIN_MADRE_ERROR"
      });
    }
  }


}

export default new FamiliasConsolidadoController();
