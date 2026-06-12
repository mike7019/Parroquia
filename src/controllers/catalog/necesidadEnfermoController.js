import necesidadEnfermoService from '../../services/catalog/necesidadEnfermoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';

class NecesidadEnfermoController {

  // ─── CATÁLOGO: tipos_necesidad_enfermo ────────────────────────────────────────

  /**
   * GET /api/catalog/necesidad-enfermo
   * Obtener todos los tipos de necesidad del enfermo
   */
  async getAllTiposNecesidad(req, res) {
    try {
      const {
        search = '',
        activo,
        sortBy = 'nombre',
        sortOrder = 'ASC',
        page = 1,
        limit = 50
      } = req.query;

      const result = await necesidadEnfermoService.getAllTiposNecesidad({
        search,
        activo: activo !== undefined ? activo === 'true' : undefined,
        sortBy,
        sortOrder,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json(createSuccessResponse('Tipos de necesidad del enfermo obtenidos exitosamente', result));
    } catch (error) {
      res.status(500).json(createErrorResponse('Error obteniendo tipos de necesidad del enfermo', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * GET /api/catalog/necesidad-enfermo/select
   * Para dropdown/select en formularios
   */
  async getTiposNecesidadSelect(req, res) {
    try {
      const data = await necesidadEnfermoService.getTiposNecesidadSelect();
      res.json(createSuccessResponse('Tipos de necesidad del enfermo para select obtenidos exitosamente', { tipos: data }));
    } catch (error) {
      res.status(500).json(createErrorResponse('Error obteniendo tipos de necesidad del enfermo', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * GET /api/catalog/necesidad-enfermo/stats
   * Estadísticas de necesidades del enfermo
   */
  async getStats(req, res) {
    try {
      const data = await necesidadEnfermoService.getStats();
      res.json(createSuccessResponse('Estadísticas de necesidades del enfermo obtenidas exitosamente', data));
    } catch (error) {
      res.status(500).json(createErrorResponse('Error obteniendo estadísticas', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * GET /api/catalog/necesidad-enfermo/:id
   * Obtener tipo de necesidad por ID
   */
  async getTipoNecesidadById(req, res) {
    try {
      const { id } = req.params;
      const { incluirPersonas = 'false' } = req.query;

      const data = await necesidadEnfermoService.getTipoNecesidadById(
        parseInt(id),
        incluirPersonas === 'true'
      );

      res.json(createSuccessResponse('Tipo de necesidad del enfermo obtenido exitosamente', { tipoNecesidad: data }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      res.status(500).json(createErrorResponse('Error obteniendo tipo de necesidad del enfermo', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * POST /api/catalog/necesidad-enfermo
   * Crear tipo de necesidad del enfermo
   */
  async createTipoNecesidad(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre || !nombre.trim()) {
        return res.status(400).json(createErrorResponse('El nombre del tipo de necesidad del enfermo es requerido', null, 'VALIDATION_ERROR'));
      }

      const tipoNecesidad = await necesidadEnfermoService.createTipoNecesidad({ nombre, descripcion });
      res.status(201).json(createSuccessResponse('Tipo de necesidad del enfermo creado exitosamente', { tipoNecesidad }));
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json(createErrorResponse(error.message, null, 'CONFLICT_ERROR'));
      }
      if (error instanceof ValidationError) {
        return res.status(400).json(createErrorResponse(error.message, null, 'VALIDATION_ERROR'));
      }
      res.status(500).json(createErrorResponse('Error creando tipo de necesidad del enfermo', error.message, 'CREATE_ERROR'));
    }
  }

  /**
   * PUT /api/catalog/necesidad-enfermo/:id
   * Actualizar tipo de necesidad del enfermo
   */
  async updateTipoNecesidad(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;

      const tipoNecesidad = await necesidadEnfermoService.updateTipoNecesidad(parseInt(id), { nombre, descripcion, activo });
      res.json(createSuccessResponse('Tipo de necesidad del enfermo actualizado exitosamente', { tipoNecesidad }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      if (error instanceof ConflictError) {
        return res.status(409).json(createErrorResponse(error.message, null, 'CONFLICT_ERROR'));
      }
      res.status(500).json(createErrorResponse('Error actualizando tipo de necesidad del enfermo', error.message, 'UPDATE_ERROR'));
    }
  }

  /**
   * DELETE /api/catalog/necesidad-enfermo/:id
   * Eliminar/desactivar tipo de necesidad del enfermo
   */
  async deleteTipoNecesidad(req, res) {
    try {
      const { id } = req.params;
      const result = await necesidadEnfermoService.deleteTipoNecesidad(parseInt(id));
      res.json(createSuccessResponse(result.mensaje, null));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      if (error instanceof ConflictError) {
        return res.status(409).json(createErrorResponse(error.message, null, 'CONFLICT_ERROR'));
      }
      res.status(500).json(createErrorResponse('Error eliminando tipo de necesidad del enfermo', error.message, 'DELETE_ERROR'));
    }
  }

  // ─── RELACIÓN PERSONA ↔ NECESIDAD DEL ENFERMO ────────────────────────────────

  /**
   * GET /api/catalog/necesidad-enfermo/:id/personas
   * Obtener personas de un tipo de necesidad
   */
  async getPersonasByTipoNecesidad(req, res) {
    try {
      const { id } = req.params;
      const data = await necesidadEnfermoService.getTipoNecesidadById(parseInt(id), true);
      res.json(createSuccessResponse('Personas obtenidas exitosamente', {
        tipo_necesidad: data.nombre,
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
   * GET /api/catalog/necesidad-enfermo/persona/:idPersona
   * Obtener necesidades de una persona específica
   */
  async getNecesidadesByPersona(req, res) {
    try {
      const { idPersona } = req.params;
      const necesidades = await necesidadEnfermoService.getNecesidadesByPersona(parseInt(idPersona));
      res.json(createSuccessResponse('Necesidades del enfermo de la persona obtenidas exitosamente', {
        id_persona: parseInt(idPersona),
        necesidades,
        total: necesidades.length
      }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      res.status(500).json(createErrorResponse('Error obteniendo necesidades', error.message, 'FETCH_ERROR'));
    }
  }

  /**
   * POST /api/catalog/necesidad-enfermo/persona/:idPersona
   * Asignar tipo de necesidad a una persona
   */
  async asociarPersonaNecesidad(req, res) {
    try {
      const { idPersona } = req.params;
      const { id_tipo_necesidad_enfermo, descripcion } = req.body;

      if (!id_tipo_necesidad_enfermo) {
        return res.status(400).json(createErrorResponse('El id_tipo_necesidad_enfermo es requerido', null, 'VALIDATION_ERROR'));
      }

      const result = await necesidadEnfermoService.asociarPersonaNecesidad(
        parseInt(idPersona),
        parseInt(id_tipo_necesidad_enfermo),
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
      res.status(500).json(createErrorResponse('Error asignando necesidad del enfermo', error.message, 'CREATE_ERROR'));
    }
  }

  /**
   * DELETE /api/catalog/necesidad-enfermo/persona/:idPersona/:idTipoNecesidad
   * Desasociar tipo de necesidad de una persona
   */
  async desasociarPersonaNecesidad(req, res) {
    try {
      const { idPersona, idTipoNecesidad } = req.params;
      const result = await necesidadEnfermoService.desasociarPersonaNecesidad(
        parseInt(idPersona),
        parseInt(idTipoNecesidad)
      );
      res.json(createSuccessResponse(result.mensaje, null));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(createErrorResponse(error.message, null, 'NOT_FOUND'));
      }
      res.status(500).json(createErrorResponse('Error desasociando necesidad del enfermo', error.message, 'DELETE_ERROR'));
    }
  }
}

export default new NecesidadEnfermoController();
