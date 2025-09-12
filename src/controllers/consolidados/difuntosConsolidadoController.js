import difuntosConsolidadoService from '../../services/consolidados/difuntosConsolidadoService.js';

class DifuntosConsolidadoController {
  /**
   * Consulta consolidada de difuntos
   * GET /api/difuntos
   */
  async consultarDifuntos(req, res) {
    try {
      const filtros = {
        parentesco: req.query.parentesco,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        sector: req.query.sector,
        municipio: req.query.municipio,
        parroquia: req.query.parroquia
      };

      // Remover filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('🔍 Consultando difuntos con filtros:', filtros);

      const resultado = await difuntosConsolidadoService.consultarDifuntos(filtros);

      res.json(resultado);

    } catch (error) {
      console.error('❌ Error en consultarDifuntos:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
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
}

export default new DifuntosConsolidadoController();
