import familiasConsolidadoService from '../../services/consolidados/familiasConsolidadoService.js';

class FamiliasConsolidadoController {
  /**
   * Consulta consolidada de familias
   * GET /api/familias
   */
  async consultarFamilias(req, res) {
    try {
      const filtros = {
        parroquia: req.query.parroquia,
        municipio: req.query.municipio,
        sector: req.query.sector,
        sexo: req.query.sexo,
        parentesco: req.query.parentesco,
        sinPadre: req.query.sinPadre,
        sinMadre: req.query.sinMadre,
        edad_min: req.query.edad_min,
        edad_max: req.query.edad_max,
        incluir_detalles: req.query.incluir_detalles,
        limite: req.query.limite ? parseInt(req.query.limite) : 100
      };

      // Remover filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('🔍 Consultando familias con filtros:', filtros);

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
        parentesco: 'Madre',
        incluir_detalles: req.query.incluir_detalles,
        parroquia: req.query.parroquia,
        municipio: req.query.municipio,
        sector: req.query.sector,
        limite: req.query.limite ? parseInt(req.query.limite) : 50
      };

      const resultado = await familiasConsolidadoService.consultarFamilias(filtros);

      res.json({
        exito: true,
        mensaje: "Consulta de madres exitosa",
        datos: resultado.datos,
        total: resultado.total,
        estadisticas: resultado.estadisticas
      });

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
        parentesco: 'Padre',
        incluir_detalles: req.query.incluir_detalles,
        parroquia: req.query.parroquia,
        municipio: req.query.municipio,
        sector: req.query.sector,
        limite: req.query.limite ? parseInt(req.query.limite) : 50
      };

      const resultado = await familiasConsolidadoService.consultarFamilias(filtros);

      res.json({
        exito: true,
        mensaje: "Consulta de padres exitosa",
        datos: resultado.datos,
        total: resultado.total,
        estadisticas: resultado.estadisticas
      });

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
        sinPadre: true,
        municipio: req.query.municipio,
        sector: req.query.sector,
        limite: req.query.limite ? parseInt(req.query.limite) : 50
      };

      const resultado = await familiasConsolidadoService.consultarFamilias(filtros);

      res.json({
        exito: true,
        mensaje: "Familias sin padre encontradas",
        datos: resultado.datos,
        total: resultado.total
      });

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
        sinMadre: true,
        municipio: req.query.municipio,
        sector: req.query.sector,
        limite: req.query.limite ? parseInt(req.query.limite) : 50
      };

      const resultado = await familiasConsolidadoService.consultarFamilias(filtros);

      res.json({
        exito: true,
        mensaje: "Familias sin madre encontradas",
        datos: resultado.datos,
        total: resultado.total
      });

    } catch (error) {
      console.error('❌ Error en consultarFamiliasSinMadre:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "FAMILIAS_SIN_MADRE_ERROR"
      });
    }
  }

  /**
   * Generar reporte Excel completo de familias
   * GET /api/familias/excel-completo
   */
  async generarReporteExcelCompleto(req, res) {
    try {
      console.log('📊 Generando Excel completo con familias agrupadas...', req.query);

      const filtros = {
        parroquia: req.query.parroquia,
        municipio: req.query.municipio,
        sector: req.query.sector,
        sexo: req.query.sexo,
        parentesco: req.query.parentesco,
        sinPadre: req.query.sinPadre,
        sinMadre: req.query.sinMadre,
        edad_min: req.query.edad_min,
        edad_max: req.query.edad_max,
        limite: req.query.limite ? parseInt(req.query.limite) : 100
      };

      // Remover filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      // Verificar si el servicio tiene el método Excel
      if (typeof familiasConsolidadoService.generarReporteExcelFamiliar !== 'function') {
        return res.status(501).json({
          status: "error",
          message: "Funcionalidad Excel familiar no está disponible. Use el endpoint básico /api/familias",
          code: "EXCEL_FAMILIAR_NOT_IMPLEMENTED"
        });
      }

      const workbook = await familiasConsolidadoService.generarReporteExcelFamiliar(filtros);

      if (!workbook) {
        return res.status(404).json({
          status: "error",
          message: "No se pudo generar el archivo Excel",
          code: "EXCEL_GENERATION_FAILED"
        });
      }

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `reporte-familias-${timestamp}.xlsx`;

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Escribir workbook directamente a la respuesta
      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('❌ Error generando Excel completo:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "EXCEL_COMPLETO_ERROR"
      });
    }
  }
}

export default new FamiliasConsolidadoController();
