import sectorService from '../../services/catalog/sectorService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class SectorController {
  /**
   * Create a new sector
   */
  async createSector(req, res) {
    try {
      const sectorData = req.body;

      if (!sectorData.name) {
        return res.status(400).json(
          createErrorResponse('Name is required', null, 'VALIDATION_ERROR')
        );
      }

      const sector = await sectorService.createSector(sectorData);

      res.status(201).json(
        createSuccessResponse(
          'Sector created successfully',
          sector
        )
      );
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('already exists')) statusCode = 409;

      res.status(statusCode).json(
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
        status,
        coordinatorId,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const result = await sectorService.getAllSectors({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        coordinatorId,
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

      const sector = await sectorService.getSectorById(id);

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
          'Error retrieving sector',
          error.message,
          'FETCH_ERROR'
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
      const updateData = req.body;

      const sector = await sectorService.updateSector(id, updateData);

      res.json(
        createSuccessResponse(
          'Sector updated successfully',
          sector
        )
      );
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      if (error.message.includes('already exists')) statusCode = 409;

      res.status(statusCode).json(
        createErrorResponse(
          'Error updating sector',
          error.message,
          'UPDATE_ERROR'
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

      const result = await sectorService.deleteSector(id);

      res.json(
        createSuccessResponse(
          'Sector deleted successfully',
          result
        )
      );
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      if (error.message.includes('associated surveys') || error.message.includes('associated users')) {
        statusCode = 409;
      }

      res.status(statusCode).json(
        createErrorResponse(
          'Error deleting sector',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Get sectors by coordinator
   */
  async getSectorsByCoordinator(req, res) {
    try {
      const { coordinatorId } = req.params;

      const sectors = await sectorService.getSectorsByCoordinator(coordinatorId);

      res.json(
        createSuccessResponse(
          'Coordinator sectors retrieved successfully',
          sectors
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving coordinator sectors',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get sector statistics
   */
  async getSectorStatistics(req, res) {
    try {
      const { sectorId } = req.query;

      const statistics = await sectorService.getSectorStatistics(sectorId);

      res.json(
        createSuccessResponse(
          'Sector statistics retrieved successfully',
          statistics
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving sector statistics',
          error.message,
          'STATS_ERROR'
        )
      );
    }
  }

  /**
   * Update sector survey statistics
   */
  async updateSectorSurveyStats(req, res) {
    try {
      const { sectorName } = req.params;

      const sector = await sectorService.updateSectorSurveyStats(sectorName);

      res.json(
        createSuccessResponse(
          'Sector survey statistics updated successfully',
          sector
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error updating sector survey statistics',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Search sectors
   */
  async searchSectors(req, res) {
    try {
      const { q, status, limit = 20 } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json(
          createErrorResponse(
            'Search term must be at least 2 characters',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const sectors = await sectorService.searchSectors(q, { status, limit });

      res.json(
        createSuccessResponse(
          'Search completed successfully',
          sectors
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error searching sectors',
          error.message,
          'SEARCH_ERROR'
        )
      );
    }
  }

  /**
   * Assign coordinator to sector
   */
  async assignCoordinator(req, res) {
    try {
      const { id } = req.params;
      const { coordinatorId } = req.body;

      if (!coordinatorId) {
        return res.status(400).json(
          createErrorResponse('Coordinator ID is required', null, 'VALIDATION_ERROR')
        );
      }

      const sector = await sectorService.assignCoordinator(id, coordinatorId);

      res.json(
        createSuccessResponse(
          'Coordinator assigned successfully',
          sector
        )
      );
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      if (error.message.includes('not a coordinator')) statusCode = 400;

      res.status(statusCode).json(
        createErrorResponse(
          'Error assigning coordinator',
          error.message,
          'ASSIGN_ERROR'
        )
      );
    }
  }
}

export default new SectorController();
