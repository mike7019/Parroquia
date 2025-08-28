import destrezaService from '../../services/catalog/destrezaService.js';

/**
 * Controlador para gestión de destrezas/habilidades
 * Maneja las peticiones HTTP y delega la lógica de negocio al servicio
 */
class DestrezaController {

  /**
   * Obtener todas las destrezas con filtros y paginación
   * GET /api/catalog/destrezas
   */
  async getAllDestrezas(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        includePersonas = 'false',
        orderBy = 'nombre',
        orderDirection = 'ASC'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search: search.toString(),
        includePersonas: includePersonas.toLowerCase() === 'true',
        orderBy: orderBy.toString(),
        orderDirection: orderDirection.toString()
      };

      const resultado = await destrezaService.getAllDestrezas(options);

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en getAllDestrezas:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener una destreza por ID
   * GET /api/catalog/destrezas/:id
   */
  async getDestrezaById(req, res) {
    try {
      const { id } = req.params;
      const { includePersonas = 'false' } = req.query;

      const resultado = await destrezaService.getDestrezaById(
        parseInt(id),
        includePersonas.toLowerCase() === 'true'
      );

      if (!resultado.exito) {
        return res.status(404).json(resultado);
      }

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en getDestrezaById:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear una nueva destreza
   * POST /api/catalog/destrezas
   */
  async createDestreza(req, res) {
    try {
      const destrezaData = req.body;

      const resultado = await destrezaService.createDestreza(destrezaData);

      if (!resultado.exito) {
        return res.status(400).json(resultado);
      }

      res.status(201).json(resultado);

    } catch (error) {
      console.error('Error en createDestreza:', error);
      
      // Manejar errores de validación
      if (error.message.includes('validación') || error.message.includes('requerido')) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos de entrada inválidos',
          error: error.message
        });
      }

      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar una destreza existente
   * PUT /api/catalog/destrezas/:id
   */
  async updateDestreza(req, res) {
    try {
      const { id } = req.params;
      const destrezaData = req.body;

      const resultado = await destrezaService.updateDestreza(parseInt(id), destrezaData);

      if (!resultado.exito) {
        const statusCode = resultado.mensaje.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json(resultado);
      }

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en updateDestreza:', error);
      
      if (error.message.includes('validación') || error.message.includes('requerido')) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos de entrada inválidos',
          error: error.message
        });
      }

      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar una destreza
   * DELETE /api/catalog/destrezas/:id
   */
  async deleteDestreza(req, res) {
    try {
      const { id } = req.params;

      const resultado = await destrezaService.deleteDestreza(parseInt(id));

      if (!resultado.exito) {
        const statusCode = resultado.mensaje.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json(resultado);
      }

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en deleteDestreza:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Buscar destrezas por término
   * GET /api/catalog/destrezas/search/:termino
   */
  async searchDestrezas(req, res) {
    try {
      const { termino } = req.params;
      const { limite = 20 } = req.query;

      const resultado = await destrezaService.searchDestrezas(termino, parseInt(limite));

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en searchDestrezas:', error);
      
      if (error.message.includes('requerido')) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Parámetros de búsqueda inválidos',
          error: error.message
        });
      }

      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de destrezas
   * GET /api/catalog/destrezas/stats
   */
  async getDestrezasStats(req, res) {
    try {
      const resultado = await destrezaService.getDestrezasStats();

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en getDestrezasStats:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener destrezas de una persona específica
   * GET /api/catalog/destrezas/persona/:idPersona
   */
  async getDestrezasByPersona(req, res) {
    try {
      const { idPersona } = req.params;

      const resultado = await destrezaService.getDestrezasByPersona(parseInt(idPersona));

      if (!resultado.exito) {
        return res.status(404).json(resultado);
      }

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en getDestrezasByPersona:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Asociar una destreza a una persona
   * POST /api/catalog/destrezas/persona/:idPersona/asociar
   */
  async asociarDestrezaPersona(req, res) {
    try {
      const { idPersona } = req.params;
      const { idDestreza } = req.body;

      const resultado = await destrezaService.asociarDestrezaPersona(
        parseInt(idPersona),
        parseInt(idDestreza)
      );

      if (!resultado.exito) {
        const statusCode = resultado.mensaje.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json(resultado);
      }

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en asociarDestrezaPersona:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Desasociar una destreza de una persona
   * DELETE /api/catalog/destrezas/persona/:idPersona/desasociar
   */
  async desasociarDestrezaPersona(req, res) {
    try {
      const { idPersona } = req.params;
      const { idDestreza } = req.body;

      const resultado = await destrezaService.desasociarDestrezaPersona(
        parseInt(idPersona),
        parseInt(idDestreza)
      );

      if (!resultado.exito) {
        const statusCode = resultado.mensaje.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json(resultado);
      }

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en desasociarDestrezaPersona:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default new DestrezaController();
