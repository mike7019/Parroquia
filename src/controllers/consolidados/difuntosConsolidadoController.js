import difuntosConsolidadoService from '../../services/consolidados/difuntosConsolidadoService.js';

class DifuntosConsolidadoController {
  /**
   * Consulta consolidada        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        
        // Filtros adicionales
        id_parentesco: req.query.id_parentesco ? parseInt(req.query.id_parentesco) : undefined,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      // Limpiar filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '' || 
            (typeof filtros[key] === 'number' && isNaN(filtros[key]))) {
          delete filtros[key];
        }
      });

      console.log('📊 Generando PDF de difuntos con filtros:', filtros);* GET /api/difuntos
   * @param {Object} req.query - Parámetros de consulta
   * @param {number} req.query.id_parroquia - ID de la parroquia
   * @param {number} req.query.id_municipio - ID del municipio
   * @param {number} req.query.id_sector - ID del sector
   * @param {number} req.query.id_parentesco - ID del parentesco
   * @param {string} req.query.fecha_inicio - Fecha de inicio del rango (YYYY-MM-DD)
   * @param {string} req.query.fecha_fin - Fecha de fin del rango (YYYY-MM-DD)
   */
  async consultarDifuntos(req, res) {
    try {
      const filtros = {
        // Filtros por ID
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_parentesco: req.query.id_parentesco ? parseInt(req.query.id_parentesco) : undefined,
        
        // Filtros adicionales
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      // Remover filtros undefined, null o vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '' || 
            (typeof filtros[key] === 'number' && isNaN(filtros[key]))) {
          delete filtros[key];
        }
      });

      console.log('🔍 Consultando difuntos con filtros mejorados:', filtros);

      const resultado = await difuntosConsolidadoService.consultarDifuntos(filtros);

      res.json(resultado);

    } catch (error) {
      console.error('❌ Error en consultarDifuntos:', error);
      res.status(500).json({
        exito: false,
        status: "error",
        mensaje: `Error al consultar difuntos: ${error.message}`,
        code: "CONSULTA_DIFUNTOS_ERROR"
      });
    }
  }

  /**
   * Obtener aniversarios próximos
   * GET /api/difuntos/aniversarios
   */
  async obtenerAniversariosProximos(req, res) {
    try {
      const dias = req.query.dias ? parseInt(req.query.dias) : 30;
      
      const aniversarios = await difuntosConsolidadoService.obtenerProximosAniversarios(dias);

      res.json({
        exito: true,
        mensaje: `Aniversarios próximos en los siguientes ${dias} días`,
        datos: aniversarios,
        total: aniversarios.length
      });

    } catch (error) {
      console.error('❌ Error en obtenerAniversariosProximos:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "ANIVERSARIOS_PROXIMOS_ERROR"
      });
    }
  }

  /**
   * Obtener estadísticas de difuntos
   * GET /api/difuntos/estadisticas
   */
  async obtenerEstadisticas(req, res) {
    try {
      // Obtener todos los difuntos para generar estadísticas generales
      const resultado = await difuntosConsolidadoService.consultarDifuntos({});
      
      res.json({
        exito: true,
        mensaje: "Estadísticas de difuntos obtenidas",
        datos: resultado.estadisticas,
        total_difuntos: resultado.total
      });

    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "ESTADISTICAS_DIFUNTOS_ERROR"
      });
    }
  }

  /**
   * Generar reporte Excel completo de difuntos
   * GET /api/difuntos/excel-completo
   */
  async generarReporteExcelCompleto(req, res) {
    try {
      const filtros = {
        // Filtros por ID (prioritarios)
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        
        // Filtros adicionales
        id_parentesco: req.query.id_parentesco ? parseInt(req.query.id_parentesco) : undefined,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      // Limpiar filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '' || 
            (typeof filtros[key] === 'number' && isNaN(filtros[key]))) {
          delete filtros[key];
        }
      });

      console.log('📊 Generando Excel de difuntos con filtros:', filtros);

      const workbook = await difuntosConsolidadoService.generarReporteExcelDifuntos(filtros);

      // Configurar headers para descarga
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = `difuntos_consolidado_${timestamp}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Escribir el archivo al response
      await workbook.xlsx.write(res);
      res.end();

      console.log(`✅ Excel de difuntos generado: ${filename}`);

    } catch (error) {
      console.error('❌ Error generando Excel de difuntos:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          exito: false,
          status: "error",
          mensaje: `Error al generar reporte Excel: ${error.message}`,
          code: "EXCEL_DIFUNTOS_ERROR"
        });
      }
    }
  }

  /**
   * Generar reporte PDF completo de difuntos
   * GET /api/difuntos/pdf-completo
   */
  async generarReportePDFCompleto(req, res) {
    try {
      const filtros = {
        // Filtros por ID (prioritarios)
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        
        // Filtros adicionales
        parentesco: req.query.parentesco,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      // Limpiar filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '' || 
            (typeof filtros[key] === 'number' && isNaN(filtros[key]))) {
          delete filtros[key];
        }
      });

      console.log('📄 Generando PDF de difuntos con filtros:', filtros);

      // Generar PDF usando el servicio
      const pdfBuffer = await difuntosConsolidadoService.generarReportePDFDifuntos(filtros);
      
      // Configurar headers para descarga
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = `difuntos_consolidado_${timestamp}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Enviar buffer del PDF
      res.send(pdfBuffer);

      console.log(`✅ PDF de difuntos generado: ${filename}`);

    } catch (error) {
      console.error('❌ Error generando PDF de difuntos:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          exito: false,
          status: "error",
          mensaje: `Error al generar reporte PDF: ${error.message}`,
          code: "PDF_DIFUNTOS_ERROR"
        });
      }
    }
  }

  /**
   * Generar reporte JSON completo de difuntos
   * GET /api/difuntos/reporte/json
   */
  async generarReporteJSON(req, res) {
    try {
      const filtros = {
        // Filtros por ID
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_parentesco: req.query.id_parentesco ? parseInt(req.query.id_parentesco) : undefined,
        
        // Filtros adicionales
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      // Limpiar filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '' || 
            (typeof filtros[key] === 'number' && isNaN(filtros[key]))) {
          delete filtros[key];
        }
      });

      console.log('📊 Generando reporte JSON de difuntos con filtros:', filtros);

      const resultado = await difuntosConsolidadoService.consultarDifuntos(filtros);

      res.json({
        exito: true,
        mensaje: `Reporte de difuntos generado: ${resultado.total} registros encontrados`,
        datos: resultado.datos,
        total: resultado.total,
        estadisticas: resultado.estadisticas,
        filtros_aplicados: resultado.filtros_aplicados || filtros,
        fecha_generacion: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error generando reporte JSON de difuntos:', error);
      res.status(500).json({
        exito: false,
        status: "error",
        mensaje: `Error al generar reporte JSON: ${error.message}`,
        code: "REPORTE_JSON_DIFUNTOS_ERROR"
      });
    }
  }
}

export default new DifuntosConsolidadoController();
