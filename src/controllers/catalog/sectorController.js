import sectorService from '../../services/catalog/sectorService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class SectorController {
  /**
   * Create a new sector
   */
  async createSector(req, res) {
    try {
      const { nombre, id_municipio } = req.body;

      // Validaciones básicas
      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('El nombre del sector es obligatorio', null, 'VALIDATION_ERROR')
        );
      }

      if (!id_municipio) {
        return res.status(400).json(
          createErrorResponse('El municipio es obligatorio', null, 'VALIDATION_ERROR')
        );
      }

      if (isNaN(id_municipio)) {
        return res.status(400).json(
          createErrorResponse('El ID del municipio debe ser un número válido', null, 'VALIDATION_ERROR')
        );
      }

      // Crear el sector con municipio
      const result = await sectorService.createSector({ 
        nombre, 
        id_municipio: parseInt(id_municipio) 
      });

      res.status(201).json(
        createSuccessResponse(
          'Sector creado exitosamente',
          result
        )
      );
    } catch (error) {
      // Manejar diferentes tipos de errores
      if (error.message.includes('no encontrado') || error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse(
            'Municipio no encontrado',
            error.message,
            'NOT_FOUND'
          )
        );
      }
      
      if (error.message.includes('ya existe') || error.message.includes('already exists')) {
        return res.status(409).json(
          createErrorResponse(
            'Ya existe un sector con ese nombre',
            error.message,
            'DUPLICATE_ERROR'
          )
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error al crear el sector',
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
      const { nombre, id_municipio } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('ID de sector válido es requerido', null, 'VALIDATION_ERROR')
        );
      }

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('El nombre del sector es obligatorio', null, 'VALIDATION_ERROR')
        );
      }

      // Validar municipio si se proporciona
      if (id_municipio && isNaN(id_municipio)) {
        return res.status(400).json(
          createErrorResponse('El ID del municipio debe ser un número válido', null, 'VALIDATION_ERROR')
        );
      }

      // Preparar datos de actualización
      const updateData = { nombre };
      if (id_municipio) {
        updateData.id_municipio = parseInt(id_municipio);
      }

      const updatedSector = await sectorService.updateSector(parseInt(id), updateData);

      res.json(
        createSuccessResponse(
          'Sector actualizado exitosamente',
          updatedSector
        )
      );
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('no encontrado')) {
        return res.status(404).json(
          createErrorResponse(
            error.message.includes('Municipio') ? 'Municipio no encontrado' : 'Sector no encontrado',
            error.message,
            'NOT_FOUND'
          )
        );
      }

      if (error.message.includes('ya existe') || error.message.includes('already exists')) {
        return res.status(409).json(
          createErrorResponse(
            'Ya existe un sector con ese nombre',
            error.message,
            'DUPLICATE_ERROR'
          )
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error al actualizar el sector',
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
   * Get available municipios for sector creation
   */
  async getAvailableMunicipios(req, res) {
    try {
      const municipios = await sectorService.getAvailableMunicipios();

      res.json(
        createSuccessResponse(
          'Municipios disponibles obtenidos exitosamente',
          municipios
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error al obtener municipios disponibles',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }
}

export default new SectorController();
