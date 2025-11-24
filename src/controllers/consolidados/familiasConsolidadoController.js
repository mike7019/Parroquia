import familiasConsolidadoService from '../../services/consolidados/familiasConsolidadoService.js';

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
      const filtros = {
        // Filtros por ID (nuevos)
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_vereda: req.query.id_vereda ? parseInt(req.query.id_vereda) : undefined,
        id_corregimiento: req.query.id_corregimiento ? parseInt(req.query.id_corregimiento) : undefined,
        id_centro_poblado: req.query.id_centro_poblado ? parseInt(req.query.id_centro_poblado) : undefined,
        
        // Paginación
        limite: req.query.limite ? parseInt(req.query.limite) : 100,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      // Remover filtros undefined, null o vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '' || 
            (typeof filtros[key] === 'number' && isNaN(filtros[key]))) {
          delete filtros[key];
        }
      });

      console.log('🔍 Consultando familias consolidadas con filtros:', filtros);

      const resultado = await familiasConsolidadoService.consultarFamilias(filtros);

      res.json(resultado);

    } catch (error) {
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
      const filtros = {
        // Filtros por ID
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_vereda: req.query.id_vereda ? parseInt(req.query.id_vereda) : undefined,
        id_corregimiento: req.query.id_corregimiento ? parseInt(req.query.id_corregimiento) : undefined,
        id_centro_poblado: req.query.id_centro_poblado ? parseInt(req.query.id_centro_poblado) : undefined,
        
        // Sin límite para reporte completo
        limite: 10000
      };

      // Limpiar filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '' || 
            (typeof filtros[key] === 'number' && isNaN(filtros[key]))) {
          delete filtros[key];
        }
      });

      console.log('📊 Generando Excel de familias con filtros:', filtros);

      const workbook = await familiasConsolidadoService.generarReporteExcelFamilias(filtros);

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
      const filtros = {
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_vereda: req.query.id_vereda ? parseInt(req.query.id_vereda) : undefined,
        limite: req.query.limite ? parseInt(req.query.limite) : 100,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      // Limpiar filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null) {
          delete filtros[key];
        }
      });

      const resultado = await familiasConsolidadoService.consultarMadres(filtros);

      res.json(resultado);

    } catch (error) {
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
      const filtros = {
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_vereda: req.query.id_vereda ? parseInt(req.query.id_vereda) : undefined,
        limite: req.query.limite ? parseInt(req.query.limite) : 100,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      // Limpiar filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null) {
          delete filtros[key];
        }
      });

      const resultado = await familiasConsolidadoService.consultarPadres(filtros);

      res.json(resultado);

    } catch (error) {
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
      const filtros = {
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        limite: req.query.limite ? parseInt(req.query.limite) : 100
      };

      // Limpiar filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null) {
          delete filtros[key];
        }
      });

      const resultado = await familiasConsolidadoService.consultarFamiliasSinPadre(filtros);

      res.json(resultado);

    } catch (error) {
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
      const filtros = {
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        limite: req.query.limite ? parseInt(req.query.limite) : 100
      };

      // Limpiar filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null) {
          delete filtros[key];
        }
      });

      const resultado = await familiasConsolidadoService.consultarFamiliasSinMadre(filtros);

      res.json(resultado);

    } catch (error) {
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
