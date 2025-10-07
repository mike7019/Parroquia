import saludConsolidadoService from '../../services/consolidados/saludConsolidadoService.js';

class SaludConsolidadoController {
  /**
   * Consulta consolidada de salud
   * GET /api/personas/salud
   */
  async consultarSalud(req, res) {
    try {
      const filtros = {
        enfermedad: req.query.enfermedad,
        edad_min: req.query.edad_min,
        edad_max: req.query.edad_max,
        id_sexo: req.query.id_sexo ? parseInt(req.query.id_sexo) : undefined,
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        limite: req.query.limite ? parseInt(req.query.limite) : 100
      };

      // Remover filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('🔍 Consultando información de salud con filtros:', filtros);

      const resultado = await saludConsolidadoService.consultarSalud(filtros);

      res.json(resultado);

    } catch (error) {
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
}

export default new SaludConsolidadoController();
