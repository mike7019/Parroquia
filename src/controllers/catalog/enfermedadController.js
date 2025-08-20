import enfermedadService from '../../services/catalog/enfermedadService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class EnfermedadController {
  /**
   * Create a new enfermedad
   */
  async createEnfermedad(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      const enfermedad = await enfermedadService.createEnfermedad({ nombre, descripcion });
      
      res.status(201).json(
        createSuccessResponse(
          'Enfermedad creada exitosamente',
          enfermedad
        )
      );
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json(
          createErrorResponse('Enfermedad ya existe', null, 'DUPLICATE_ERROR')
        );
      }
      
      res.status(500).json(
        createErrorResponse(
          'Error creating enfermedad',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all enfermedades
   */
  async getAllEnfermedades(req, res) {
    try {
      const result = await enfermedadService.getAllEnfermedades();

      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener enfermedades: ${error.message}`
      });
    }
  }

  /**
   * Get enfermedad by ID
   */
  async getEnfermedadById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
        );
      }

      const enfermedad = await enfermedadService.getEnfermedadById(id);

      res.json(
        createSuccessResponse(
          'Enfermedad retrieved successfully',
          enfermedad
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse('Enfermedad not found', null, 'NOT_FOUND')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error retrieving enfermedad',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Update enfermedad
   */
  async updateEnfermedad(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
        );
      }

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      const enfermedad = await enfermedadService.updateEnfermedad(id, { nombre, descripcion });

      res.json(
        createSuccessResponse(
          'Enfermedad updated successfully',
          enfermedad
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse('Enfermedad not found', null, 'NOT_FOUND')
        );
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json(
          createErrorResponse('Enfermedad with this name already exists', null, 'DUPLICATE_ERROR')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error updating enfermedad',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete enfermedad
   */
  async deleteEnfermedad(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
        );
      }

      const result = await enfermedadService.deleteEnfermedad(id);

      res.json(
        createSuccessResponse(
          'Enfermedad deleted successfully',
          result
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse('Enfermedad not found', null, 'NOT_FOUND')
        );
      }

      if (error.message.includes('has associated personas')) {
        return res.status(409).json(
          createErrorResponse('Cannot delete enfermedad: it has associated personas', null, 'CONSTRAINT_ERROR')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error deleting enfermedad',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Get enfermedades by persona ID
   */
  async getEnfermedadesByPersona(req, res) {
    try {
      const { personaId } = req.params;

      if (!personaId || isNaN(personaId)) {
        return res.status(400).json(
          createErrorResponse('Valid persona ID is required', null, 'VALIDATION_ERROR')
        );
      }

      const enfermedades = await enfermedadService.getEnfermedadesByPersona(personaId);

      res.json(
        createSuccessResponse(
          'Enfermedades for persona retrieved successfully',
          enfermedades
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse('Persona not found', null, 'NOT_FOUND')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error retrieving enfermedades for persona',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Associate enfermedad with persona
   */
  async associateEnfermedadWithPersona(req, res) {
    try {
      const { enfermedadId, personaId } = req.params;

      if (!enfermedadId || isNaN(enfermedadId) || !personaId || isNaN(personaId)) {
        return res.status(400).json(
          createErrorResponse('Valid enfermedad ID and persona ID are required', null, 'VALIDATION_ERROR')
        );
      }

      const result = await enfermedadService.associateEnfermedadWithPersona(enfermedadId, personaId);

      res.json(
        createSuccessResponse(
          'Enfermedad associated with persona successfully',
          result
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse(error.message, null, 'NOT_FOUND')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error associating enfermedad with persona',
          error.message,
          'ASSOCIATION_ERROR'
        )
      );
    }
  }

  /**
   * Remove association between enfermedad and persona
   */
  async removeEnfermedadFromPersona(req, res) {
    try {
      const { enfermedadId, personaId } = req.params;

      if (!enfermedadId || isNaN(enfermedadId) || !personaId || isNaN(personaId)) {
        return res.status(400).json(
          createErrorResponse('Valid enfermedad ID and persona ID are required', null, 'VALIDATION_ERROR')
        );
      }

      const result = await enfermedadService.removeEnfermedadFromPersona(enfermedadId, personaId);

      res.json(
        createSuccessResponse(
          'Enfermedad removed from persona successfully',
          result
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse(error.message, null, 'NOT_FOUND')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error removing enfermedad from persona',
          error.message,
          'ASSOCIATION_ERROR'
        )
      );
    }
  }
}

export default new EnfermedadController();
