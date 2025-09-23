import difuntosConsolidadoService from '../../services/consolidados/difuntosConsolidadoService.js';

class DifuntosConsolidadoController {
  /**
   * Consulta consolidada de difuntos
   * GET /api/difuntos
   * @param {Object} req.query - Parámetros de consulta
   * @param {number} req.query.id_parroquia - ID de la parroquia
   * @param {number} req.query.id_municipio - ID del municipio  
   * @param {number} req.query.id_sector - ID del sector
   * @param {string} req.query.parentesco - Tipo de parentesco (Madre, Padre, etc.)
   * @param {string} req.query.fecha_inicio - Fecha de inicio del rango (YYYY-MM-DD)
   * @param {string} req.query.fecha_fin - Fecha de fin del rango (YYYY-MM-DD)
   */
  async consultarDifuntos(req, res) {
    try {
      const filtros = {
        // Nuevos filtros por ID (prioritarios)
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        
        // Filtros adicionales
        parentesco: req.query.parentesco,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        
        // Mantener compatibilidad con filtros por nombre (para casos de uso legacy)
        sector: req.query.sector,
        municipio: req.query.municipio,
        parroquia: req.query.parroquia
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
      
      const aniversarios = await difuntosConsolidadoService.obtenerAniversariosProximos(dias);

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

      // Obtener datos
      const datosDifuntos = await difuntosConsolidadoService.consultarDifuntos(filtros);
      const difuntos = datosDifuntos.datos || [];

      // Crear PDF
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      
      // Configurar headers para descarga
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = `difuntos_consolidado_${timestamp}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Pipe del PDF al response
      doc.pipe(res);

      // Generar contenido del PDF
      await this.generarContenidoPDF(doc, difuntos, filtros, datosDifuntos.estadisticas);

      // Finalizar PDF
      doc.end();

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
   * Método auxiliar para generar contenido del PDF
   */
  async generarContenidoPDF(doc, difuntos, filtros, estadisticas) {
    const fechaReporte = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });

    // Título principal
    doc.fontSize(20).font('Helvetica-Bold').text('REPORTE CONSOLIDADO DE DIFUNTOS', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Generado el: ${fechaReporte}`, { align: 'center' });
    doc.moveDown();

    // Información de filtros aplicados
    if (Object.keys(filtros).length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('FILTROS APLICADOS:', { underline: true });
      doc.fontSize(10).font('Helvetica');
      
      if (filtros.id_parroquia) doc.text(`• Parroquia ID: ${filtros.id_parroquia}`);
      if (filtros.id_municipio) doc.text(`• Municipio ID: ${filtros.id_municipio}`);
      if (filtros.id_sector) doc.text(`• Sector ID: ${filtros.id_sector}`);
      if (filtros.parentesco) doc.text(`• Parentesco: ${filtros.parentesco}`);
      if (filtros.fecha_inicio || filtros.fecha_fin) {
        const rango = `${filtros.fecha_inicio || 'Inicio'} - ${filtros.fecha_fin || 'Fin'}`;
        doc.text(`• Rango de fechas: ${rango}`);
      }
      
      doc.moveDown();
    }

    // Resumen estadístico
    doc.fontSize(14).font('Helvetica-Bold').text('RESUMEN ESTADÍSTICO:', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.text(`• Total de difuntos: ${difuntos.length}`);
    doc.text(`• Registros de tabla difuntos_familia: ${estadisticas?.difuntos_familia || 0}`);
    doc.text(`• Registros de personas fallecidas: ${estadisticas?.personas_fallecidas || 0}`);
    doc.moveDown();

    // Análisis por parentesco
    const parentescos = {};
    difuntos.forEach(d => {
      parentescos[d.parentesco_inferido] = (parentescos[d.parentesco_inferido] || 0) + 1;
    });

    if (Object.keys(parentescos).length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('DISTRIBUCIÓN POR PARENTESCO:', { underline: true });
      doc.fontSize(11).font('Helvetica');
      Object.entries(parentescos).forEach(([parentesco, total]) => {
        const porcentaje = ((total / difuntos.length) * 100).toFixed(1);
        doc.text(`• ${parentesco}: ${total} (${porcentaje}%)`);
      });
      doc.moveDown();
    }

    // Lista de difuntos (primeros 50)
    doc.fontSize(14).font('Helvetica-Bold').text('LISTADO DE DIFUNTOS:', { underline: true });
    doc.fontSize(9).font('Helvetica');
    
    const difuntosMostrar = difuntos.slice(0, 50); // Limitar para no sobrecargar PDF
    
    difuntosMostrar.forEach((difunto, index) => {
      if (doc.y > 700) { // Nueva página si es necesario
        doc.addPage();
        doc.fontSize(9).font('Helvetica');
      }
      
      const fecha = difunto.fecha_aniversario ? 
        new Date(difunto.fecha_aniversario).toLocaleDateString() : 'No especificada';
      
      doc.text(`${index + 1}. ${difunto.nombre_completo}`, { continued: true });
      doc.text(` (${difunto.parentesco_inferido})`, { continued: true });
      doc.text(` - ${fecha}`);
      
      if (difunto.apellido_familiar) {
        doc.text(`   Familia: ${difunto.apellido_familiar}`, { indent: 20 });
      }
      
      if (difunto.nombre_municipio || difunto.nombre_sector) {
        const ubicacion = [difunto.nombre_municipio, difunto.nombre_sector].filter(Boolean).join(' - ');
        doc.text(`   Ubicación: ${ubicacion}`, { indent: 20 });
      }
      
      doc.moveDown(0.5);
    });

    // Nota si hay más registros
    if (difuntos.length > 50) {
      doc.moveDown();
      doc.fontSize(10).font('Helvetica-Oblique');
      doc.text(`Nota: Se muestran los primeros 50 de ${difuntos.length} registros. Descargue el reporte Excel para ver todos los datos.`, { align: 'center' });
    }

    // Footer
    doc.fontSize(8).font('Helvetica').text('Sistema Parroquial - Reporte de Difuntos', 50, doc.page.height - 50, { align: 'center' });
  }
}

export default new DifuntosConsolidadoController();
