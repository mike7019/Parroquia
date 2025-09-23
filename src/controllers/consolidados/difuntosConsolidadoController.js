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
}

export default new DifuntosConsolidadoController();
