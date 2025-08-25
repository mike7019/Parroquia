import difuntosService from '../services/difuntosService.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responses.js';

class DifuntosController {
  /**
   * Consulta por madres difuntas
   */
  async getMadresDifuntas(req, res) {
    try {
      const filters = {
        sector: req.query.sector,
        apellido_familiar: req.query.apellido_familiar,
        nombre: req.query.nombre,
        fecha_aniversario: req.query.fecha_aniversario
      };

      // Remover filtros vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });

      const madresDifuntas = await difuntosService.getMadresDifuntas(filters);

      res.json(
        createSuccessResponse(
          'Consulta de madres difuntas obtenida exitosamente',
          {
            consultas: madresDifuntas,
            total: madresDifuntas.length,
            filtros_aplicados: filters
          }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error al obtener consulta de madres difuntas',
          error.message,
          'QUERY_ERROR'
        )
      );
    }
  }

  /**
   * Consulta por padres difuntos
   */
  async getPadresDifuntos(req, res) {
    try {
      const filters = {
        sector: req.query.sector,
        apellido_familiar: req.query.apellido_familiar,
        nombre: req.query.nombre,
        fecha_aniversario: req.query.fecha_aniversario
      };

      // Remover filtros vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });

      const padresDifuntos = await difuntosService.getPadresDifuntos(filters);

      res.json(
        createSuccessResponse(
          'Consulta de padres difuntos obtenida exitosamente',
          {
            consultas: padresDifuntos,
            total: padresDifuntos.length,
            filtros_aplicados: filters
          }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error al obtener consulta de padres difuntos',
          error.message,
          'QUERY_ERROR'
        )
      );
    }
  }

  /**
   * Consulta por todos los difuntos
   */
  async getTodosDifuntos(req, res) {
    try {
      const filters = {
        sector: req.query.sector,
        apellido_familiar: req.query.apellido_familiar,
        nombre: req.query.nombre,
        fecha_aniversario: req.query.fecha_aniversario
      };

      // Remover filtros vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });

      const todosDifuntos = await difuntosService.getTodosDifuntos(filters);

      res.json(
        createSuccessResponse(
          'Consulta de todos los difuntos obtenida exitosamente',
          {
            consultas: todosDifuntos,
            total: todosDifuntos.length,
            filtros_aplicados: filters
          }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error al obtener consulta de todos los difuntos',
          error.message,
          'QUERY_ERROR'
        )
      );
    }
  }

  /**
   * Consulta de difuntos por rango de fechas
   */
  async getDifuntosPorRangoFechas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio && !fecha_fin) {
        return res.status(400).json(
          createErrorResponse(
            'Debe proporcionar al menos una fecha (fecha_inicio o fecha_fin)',
            'Se requiere al menos un parámetro de fecha',
            'VALIDATION_ERROR'
          )
        );
      }

      const filters = {
        sector: req.query.sector,
        apellido_familiar: req.query.apellido_familiar,
        nombre: req.query.nombre
      };

      // Remover filtros vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });

      const difuntosPorRango = await difuntosService.getDifuntosPorRangoFechas(
        fecha_inicio,
        fecha_fin,
        filters
      );

      res.json(
        createSuccessResponse(
          'Consulta de difuntos por rango de fechas obtenida exitosamente',
          {
            consultas: difuntosPorRango,
            total: difuntosPorRango.length,
            rango_fechas: { fecha_inicio, fecha_fin },
            filtros_aplicados: filters
          }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error al obtener consulta de difuntos por rango de fechas',
          error.message,
          'QUERY_ERROR'
        )
      );
    }
  }

  /**
   * Obtener estadísticas de difuntos
   */
  async getEstadisticasDifuntos(req, res) {
    try {
      const estadisticas = await difuntosService.getEstadisticasDifuntos();

      res.json(
        createSuccessResponse(
          'Estadísticas de difuntos obtenidas exitosamente',
          estadisticas
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error al obtener estadísticas de difuntos',
          error.message,
          'STATS_ERROR'
        )
      );
    }
  }
}

export default new DifuntosController();
