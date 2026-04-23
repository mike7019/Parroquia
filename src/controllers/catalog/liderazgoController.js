import liderazgoService from '../../services/catalog/liderazgoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';

class LiderazgoController {

  // ─── CATÁLOGO: tipos_liderazgo ────────────────────────────────────────────

  /**
   * GET /api/catalog/liderazgo
   * Obtener todos los tipos de liderazgo
   */
  async getAllTiposLiderazgo(req, res) {
    try {
      const {
        search = '',
        activo,
        sortBy = 'nombre',
        sortOrder = 'ASC',
        page = 1,
        limit = 50
      } = req.query;

      const result = await liderazgoService.getAllTiposLiderazgo({
        search,
        activo: activo !== undefined ? activo === 'true' : undefined,
        sortBy,
        sortOrder,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json(createSuccessResponse('Tipos de liderazgo obtenidos exitosamente', result));
    } catch (error) {
      res.status(500).json(createErrorResponse('Error obteniendo tipos de liderazgo', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * GET /api/catalog/liderazgo/select
   * Para dropdown/select en formularios
   */
  async getTiposLiderazgoSelect(req, res) {
    try {
      const data = await liderazgoService.getTiposLiderazgoSelect();
      res.json(createSuccessResponse('Tipos de liderazgo para select obtenidos exitosamente', { tipos: data }));
    } catch (error) {
      res.status(500).json(createErrorResponse('Error obteniendo tipos de liderazgo', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * GET /api/catalog/liderazgo/stats
   * Estadísticas de liderazgo
   */
  async getStats(req, res) {
    try {
      const data = await liderazgoService.getStats();
      res.json(createSuccessResponse('Estadísticas de liderazgo obtenidas exitosamente', data));
    } catch (error) {
      res.status(500).json(createErrorResponse('Error obteniendo estadísticas', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * GET /api/catalog/liderazgo/:id
   * Obtener tipo de liderazgo por ID
   */
  async getTipoLiderazgoById(req, res) {
    try {
      const { id } = req.params;
      const { incluirPersonas = 'false' } = req.query;

      const data = await liderazgoService.getTipoLiderazgoById(
        parseInt(id),
        incluirPersonas === 'true'
      );

      res.json(createSuccessResponse('Tipo de liderazgo obtenido exitosamente', { tipoLiderazgo: data }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      res.status(500).json(createErrorResponse('Error obteniendo tipo de liderazgo', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * POST /api/catalog/liderazgo
   * Crear tipo de liderazgo
   */
  async createTipoLiderazgo(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre || !nombre.trim()) {
        return res.status(400).json(createErrorResponse('El nombre del tipo de liderazgo es requerido', null, 'VALIDATION_ERROR'));
      }

      const tipoLiderazgo = await liderazgoService.createTipoLiderazgo({ nombre, descripcion });
      res.status(201).json(createSuccessResponse('Tipo de liderazgo creado exitosamente', { tipoLiderazgo }));
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json(createErrorResponse(error.message, null, 'CONFLICT_ERROR'));
      }
      if (error instanceof ValidationError) {
        return res.status(400).json(createErrorResponse(error.message, null, 'VALIDATION_ERROR'));
      }
      res.status(500).json(createErrorResponse('Error creando tipo de liderazgo', error.message, 'CREATE_ERROR'));
    }
  }

  /**
   * PUT /api/catalog/liderazgo/:id
   * Actualizar tipo de liderazgo
   */
  async updateTipoLiderazgo(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;

      const tipoLiderazgo = await liderazgoService.updateTipoLiderazgo(parseInt(id), { nombre, descripcion, activo });
      res.json(createSuccessResponse('Tipo de liderazgo actualizado exitosamente', { tipoLiderazgo }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      if (error instanceof ConflictError) {
        return res.status(409).json(createErrorResponse(error.message, null, 'CONFLICT_ERROR'));
      }
      res.status(500).json(createErrorResponse('Error actualizando tipo de liderazgo', error.message, 'UPDATE_ERROR'));
    }
  }

  /**
   * DELETE /api/catalog/liderazgo/:id
   * Eliminar/desactivar tipo de liderazgo
   */
  async deleteTipoLiderazgo(req, res) {
    try {
      const { id } = req.params;
      const result = await liderazgoService.deleteTipoLiderazgo(parseInt(id));
      res.json(createSuccessResponse(result.mensaje, null));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      if (error instanceof ConflictError) {
        return res.status(409).json(createErrorResponse(error.message, null, 'CONFLICT_ERROR'));
      }
      res.status(500).json(createErrorResponse('Error eliminando tipo de liderazgo', error.message, 'DELETE_ERROR'));
    }
  }

  // ─── RELACIÓN PERSONA ↔ LIDERAZGO ─────────────────────────────────────────

  /**
   * GET /api/catalog/liderazgo/:id/personas
   * Obtener personas de un tipo de liderazgo
   */
  async getPersonasByTipoLiderazgo(req, res) {
    try {
      const { id } = req.params;
      const data = await liderazgoService.getTipoLiderazgoById(parseInt(id), true);
      res.json(createSuccessResponse('Personas obtenidas exitosamente', {
        tipo_liderazgo: data.nombre,
        personas: data.personas,
        total: data.total_personas
      }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      res.status(500).json(createErrorResponse('Error obteniendo personas', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * GET /api/catalog/liderazgo/persona/:idPersona
   * Obtener liderazgos de una persona específica
   */
  async getLiderazgosByPersona(req, res) {
    try {
      const { idPersona } = req.params;
      const liderazgos = await liderazgoService.getLiderazgosByPersona(parseInt(idPersona));
      res.json(createSuccessResponse('Liderazgos de la persona obtenidos exitosamente', {
        id_persona: parseInt(idPersona),
        liderazgos,
        total: liderazgos.length
      }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      res.status(500).json(createErrorResponse('Error obteniendo liderazgos', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * POST /api/catalog/liderazgo/persona/:idPersona
   * Asignar tipo de liderazgo a una persona
   */
  async asociarPersonaLiderazgo(req, res) {
    try {
      const { idPersona } = req.params;
      const { id_tipo_liderazgo, descripcion } = req.body;

      if (!id_tipo_liderazgo) {
        return res.status(400).json(createErrorResponse('El id_tipo_liderazgo es requerido', null, 'VALIDATION_ERROR'));
      }

      const result = await liderazgoService.asociarPersonaLiderazgo(
        parseInt(idPersona),
        parseInt(id_tipo_liderazgo),
        descripcion
      );

      res.status(201).json(createSuccessResponse(result.mensaje, { accion: result.accion }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      if (error instanceof ValidationError) {
        return res.status(400).json(createErrorResponse(error.message, null, 'VALIDATION_ERROR'));
      }
      res.status(500).json(createErrorResponse('Error asignando liderazgo', error.message, 'CREATE_ERROR'));
    }
  }

  /**
   * DELETE /api/catalog/liderazgo/persona/:idPersona/:idTipoLiderazgo
   * Desasociar tipo de liderazgo de una persona
   */
  async desasociarPersonaLiderazgo(req, res) {
    try {
      const { idPersona, idTipoLiderazgo } = req.params;
      const result = await liderazgoService.desasociarPersonaLiderazgo(
        parseInt(idPersona),
        parseInt(idTipoLiderazgo)
      );
      res.json(createSuccessResponse(result.mensaje, null));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      res.status(500).json(createErrorResponse('Error desasociando liderazgo', error.message, 'DELETE_ERROR'));
    }
  }
}

export default new LiderazgoController();
