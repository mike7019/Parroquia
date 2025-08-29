import parroquiasConsolidadoService from '../../services/consolidados/parroquiasConsolidadoService.js';

/**
 * Controlador para endpoints consolidados de parroquias e infraestructura
 * 
 * Endpoints disponibles:
 * - GET /api/parroquias - Lista parroquias con filtros
 * - GET /api/parroquias/:id - Parroquia específica
 * - GET /api/parroquias/estadisticas - Estadísticas consolidadas
 * 
 * Creado: 2025-08-28
 * Fase: 2 - Media prioridad
 */

class ParroquiasConsolidadoController {

  /**
   * Obtener lista de parroquias con filtros avanzados
   * @route GET /api/parroquias
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerParroquias(req, res) {
    try {
      const filtros = {
        municipio: req.query.municipio,
        parroquia: req.query.parroquia,
        tipo_vivienda: req.query.tipo_vivienda,
        sistema_acueducto: req.query.sistema_acueducto,
        tipo_aguas_residuales: req.query.tipo_aguas_residuales,
        disposicion_basura: req.query.disposicion_basura,
        incluir_estadisticas: req.query.incluir_estadisticas !== 'false', // default true
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 50
      };

      // Validar límite máximo para prevenir sobrecarga
      if (filtros.limite > 100) {
        return res.status(400).json({
          status: "error",
          message: "El límite máximo por página es 100",
          code: "LIMITE_EXCEDIDO"
        });
      }

      console.log('🔍 Consultando parroquias con filtros:', filtros);

      const resultado = await parroquiasConsolidadoService.consultarParroquias(filtros);

      // Preparar respuesta
      const response = {
        exito: true,
        mensaje: `Consulta de parroquias completada. ${resultado.total} registros encontrados.`,
        datos: resultado.datos,
        meta: {
          total: resultado.total,
          pagina: resultado.pagina,
          limite: resultado.limite,
          total_paginas: resultado.total_paginas,
          tiene_siguiente: resultado.pagina < resultado.total_paginas,
          tiene_anterior: resultado.pagina > 1
        },
        filtros_aplicados: resultado.filtros_aplicados
      };

      // Incluir estadísticas generales si se solicitan
      if (filtros.incluir_estadisticas && resultado.estadisticas_generales) {
        response.estadisticas_generales = resultado.estadisticas_generales;
      }

      console.log(`✅ Consulta exitosa: ${resultado.datos.length} parroquias devueltas`);

      res.json(response);

    } catch (error) {
      console.error('❌ Error en obtenerParroquias:', error);
      
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor al consultar parroquias",
        code: "CONSULTA_PARROQUIAS_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener parroquia específica por ID
   * @route GET /api/parroquias/:id
   * @param {Object} req - Request object  
   * @param {Object} res - Response object
   */
  async obtenerParroquiaPorId(req, res) {
    try {
      const idParroquia = parseInt(req.params.id);

      if (!idParroquia || isNaN(idParroquia)) {
        return res.status(400).json({
          status: "error",
          message: "ID de parroquia inválido",
          code: "ID_INVALIDO"
        });
      }

      console.log(`🔍 Consultando parroquia ID: ${idParroquia}`);

      const parroquia = await parroquiasConsolidadoService.obtenerParroquiaPorId(idParroquia);

      res.json({
        exito: true,
        mensaje: `Información de parroquia obtenida exitosamente`,
        datos: parroquia
      });

    } catch (error) {
      console.error('❌ Error en obtenerParroquiaPorId:', error);

      // Error específico si no se encuentra la parroquia
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          status: "error",
          message: error.message,
          code: "PARROQUIA_NO_ENCONTRADA"
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error interno del servidor al consultar parroquia",
        code: "CONSULTA_PARROQUIA_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estadísticas consolidadas del sistema de parroquias
   * @route GET /api/parroquias/estadisticas
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerEstadisticasConsolidadas(req, res) {
    try {
      console.log('📊 Consultando estadísticas consolidadas de parroquias');

      const estadisticas = await parroquiasConsolidadoService.obtenerEstadisticasConsolidadas();

      res.json({
        exito: true,
        mensaje: "Estadísticas consolidadas obtenidas exitosamente",
        datos: estadisticas
      });

    } catch (error) {
      console.error('❌ Error en obtenerEstadisticasConsolidadas:', error);

      res.status(500).json({
        status: "error",
        message: "Error interno del servidor al obtener estadísticas",
        code: "ESTADISTICAS_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener tipos de infraestructura disponibles para filtros
   * @route GET /api/parroquias/filtros
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerFiltrosDisponibles(req, res) {
    try {
      console.log('🔧 Consultando filtros disponibles para parroquias');

      // Consultar opciones de filtrado disponibles
      const filtrosDisponibles = await parroquiasConsolidadoService.obtenerFiltrosDisponibles();

      res.json({
        exito: true,
        mensaje: "Filtros disponibles obtenidos exitosamente",
        datos: filtrosDisponibles
      });

    } catch (error) {
      console.error('❌ Error en obtenerFiltrosDisponibles:', error);

      res.status(500).json({
        status: "error",
        message: "Error interno del servidor al obtener filtros",
        code: "FILTROS_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Método auxiliar para obtener opciones de filtrado
   * @private
   * @returns {Promise<Object>} Opciones de filtrado disponibles
   */
  async _obtenerOpcionesFiltrado() {
    const sequelize = (await import('../../../config/sequelize.js')).default;
    const { QueryTypes } = await import('sequelize');

    const [tiposVivienda, sistemasAcueducto, tiposAguasResiduales, tiposDisposicionBasura] = 
      await Promise.all([
        // Tipos de vivienda
        sequelize.query(`
          SELECT DISTINCT nombre as valor, nombre as etiqueta 
          FROM tipos_vivienda 
          WHERE activo = true 
          ORDER BY nombre
        `, { type: QueryTypes.SELECT }),

        // Sistemas de acueducto
        sequelize.query(`
          SELECT DISTINCT nombre as valor, nombre as etiqueta 
          FROM sistemas_acueducto 
          WHERE activo = true 
          ORDER BY nombre
        `, { type: QueryTypes.SELECT }),

        // Tipos de aguas residuales
        sequelize.query(`
          SELECT DISTINCT nombre as valor, nombre as etiqueta 
          FROM tipos_aguas_residuales 
          WHERE activo = true 
          ORDER BY nombre
        `, { type: QueryTypes.SELECT }),

        // Tipos de disposición de basura
        sequelize.query(`
          SELECT DISTINCT nombre as valor, nombre as etiqueta 
          FROM tipos_disposicion_basura 
          WHERE activo = true 
          ORDER BY nombre
        `, { type: QueryTypes.SELECT })
      ]);

    return {
      tipos_vivienda: tiposVivienda,
      sistemas_acueducto: sistemasAcueducto,
      tipos_aguas_residuales: tiposAguasResiduales,
      tipos_disposicion_basura: tiposDisposicionBasura,
      nota: "Valores disponibles para usar en los filtros de consulta"
    };
  }
}

export default new ParroquiasConsolidadoController();
