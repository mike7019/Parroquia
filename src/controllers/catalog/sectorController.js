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

      // Check if sector already exists
      const exists = await sectorService.sectorExistsByName(nombre);
      if (exists) {
        return res.status(409).json(
          createErrorResponse('Sector with this name already exists', null, 'DUPLICATE_ERROR')
        );
      }

      const newSector = await sectorService.createSector({ nombre });

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
        page = 1,
        limit = 10,
        search,
        sortBy = 'id_sector',
        sortOrder = 'ASC'
      } = req.query;

      const result = await sectorService.getAllSectors({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Sectors retrieved successfully',
          result
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

  /**
   * Bulk create sectors
   */
  async bulkCreateSectors(req, res) {
    try {
      const { sectors } = req.body;

      if (!sectors || !Array.isArray(sectors) || sectors.length === 0) {
        return res.status(400).json(
          createErrorResponse('Array of sectors is required', null, 'VALIDATION_ERROR')
        );
      }

      // Validate each sector has required fields
      for (const sector of sectors) {
        if (!sector.nombre) {
          return res.status(400).json(
            createErrorResponse('All sectors must have a nombre', null, 'VALIDATION_ERROR')
          );
        }
      }

      const createdSectors = await sectorService.bulkCreateSectors(sectors);

      res.status(201).json(
        createSuccessResponse(
          `${createdSectors.length} sectores creados exitosamente`,
          null
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error bulk creating sectors',
          error.message,
          'BULK_CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get sectors statistics
   */
  async getSectorsStats(req, res) {
    try {
      const totalSectors = await sectorService.getSectorsCount();

      const stats = {
        total: totalSectors,
        lastUpdated: new Date().toISOString()
      };

      res.json(
        createSuccessResponse(
          'Sectors statistics retrieved successfully',
          stats
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving sectors statistics',
          error.message,
          'STATS_ERROR'
        )
      );
    }
  }
}

export default new SectorController();
