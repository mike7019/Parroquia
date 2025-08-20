import sectorService from '../../services/catalog/sectorService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class SectorController {
  /**
   * Create a new sector
   */
  async createSector(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      // Usar findOrCreate para evitar duplicados
      const result = await sectorService.findOrCreateSector({ nombre });
      
      if (!result.created) {
        return res.status(409).json(
          createErrorResponse('Sector con este nombre ya existe', null, 'DUPLICATE_ERROR')
        );
      }

      res.status(201).json(
        createSuccessResponse(
          'Sector creado exitosamente',
          null
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error creating sector',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all sectors
   */
  async getAllSectors(req, res) {
    try {
      const {
        search,
        sortBy = 'nombre',
        sortOrder = 'ASC'
      } = req.query;

      const sectors = await sectorService.getAllSectors({
        search,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Sectors retrieved successfully',
          sectors
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving sectors',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get sector by ID
   */
  async getSectorById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid sector ID is required', null, 'VALIDATION_ERROR')
        );
      }

      const sector = await sectorService.getSectorById(parseInt(id));

      res.json(
        createSuccessResponse(
          'Sector retrieved successfully',
          sector
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          error.message.includes('not found') ? 'Sector not found' : 'Error retrieving sector',
          error.message,
          error.message.includes('not found') ? 'NOT_FOUND' : 'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Update sector
   */
  async updateSector(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid sector ID is required', null, 'VALIDATION_ERROR')
        );
      }

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      // Check if another sector already exists with the same name
      const exists = await sectorService.sectorExistsByName(nombre, parseInt(id));
      if (exists) {
        return res.status(409).json(
          createErrorResponse('Another sector with this name already exists', null, 'DUPLICATE_ERROR')
        );
      }

      const updatedSector = await sectorService.updateSector(parseInt(id), { nombre });

      res.json(
        createSuccessResponse(
          'Sector updated successfully',
          updatedSector
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          error.message.includes('not found') ? 'Sector not found' : 'Error updating sector',
          error.message,
          error.message.includes('not found') ? 'NOT_FOUND' : 'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete sector
   */
  async deleteSector(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid sector ID is required', null, 'VALIDATION_ERROR')
        );
      }

      await sectorService.deleteSector(parseInt(id));

      res.json(
        createSuccessResponse(
          'Sector deleted successfully',
          null
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          error.message.includes('not found') ? 'Sector not found' : 'Error deleting sector',
          error.message,
          error.message.includes('not found') ? 'NOT_FOUND' : 'DELETE_ERROR'
        )
      );
    }
  }
}

export default new SectorController();
