import personasReporteService from '../../services/consolidados/personasReporteService.js';

class PersonasReporteController {
  /**
   * Generar reporte de personas en formato JSON
   * GET /api/personas/reporte
   */
  async generarReporteJSON(req, res) {
    try {
      const filtros = {
        id_persona: req.query.id_persona ? parseInt(req.query.id_persona) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_vereda: req.query.id_vereda ? parseInt(req.query.id_vereda) : undefined,
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        talla_camisa: req.query.talla_camisa,
        talla_pantalon: req.query.talla_pantalon,
        talla_zapatos: req.query.talla_zapatos,
        id_profesion: req.query.id_profesion ? parseInt(req.query.id_profesion) : undefined,
        id_destreza: req.query.id_destreza ? parseInt(req.query.id_destreza) : undefined,
        limite: req.query.limite ? parseInt(req.query.limite) : 1000
      };

      // Remover filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('🔍 Generando reporte de personas (JSON) con filtros:', filtros);

      const resultado = await personasReporteService.generarReporte(filtros);

      res.json({
        exito: true,
        mensaje: 'Reporte de personas generado exitosamente',
        ...resultado
      });

    } catch (error) {
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
      const filtros = {
        id_persona: req.query.id_persona ? parseInt(req.query.id_persona) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_vereda: req.query.id_vereda ? parseInt(req.query.id_vereda) : undefined,
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        talla_camisa: req.query.talla_camisa,
        talla_pantalon: req.query.talla_pantalon,
        talla_zapatos: req.query.talla_zapatos,
        id_profesion: req.query.id_profesion ? parseInt(req.query.id_profesion) : undefined,
        id_destreza: req.query.id_destreza ? parseInt(req.query.id_destreza) : undefined,
        limite: req.query.limite ? parseInt(req.query.limite) : 1000
      };

      // Remover filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

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
