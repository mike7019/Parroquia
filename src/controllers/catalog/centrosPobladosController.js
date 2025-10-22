import centrosPobladosService from '../../services/catalog/centrosPobladosService.js';
import logger from '../../utils/logger.js';
import DatabaseErrorHandler from '../../utils/databaseErrorHandler.js';

/**
 * Controlador para gestión de centros poblados
 */
class CentrosPobladosController {

  /**
   * Obtener todos los centros poblados
   */
  async getAllCentrosPoblados(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CentrosPobladosController', 
      action: 'getAllCentrosPoblados',
      ip: req.ip 
    });

    try {
      const filters = {
        search: req.query.search,
        id_municipio: req.query.id_municipio,
        page: req.query.page || 1,
        limit: req.query.limit || 50,
        sortBy: req.query.sortBy || 'nombre',
        sortOrder: req.query.sortOrder || 'ASC'
      };

      controllerLogger.info('Getting centros poblados', filters);

      const resultado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => centrosPobladosService.getAllCentrosPoblados(filters),
        { operation: 'get_centros_poblados' }
      );

      controllerLogger.info('Centros poblados retrieved successfully', {
        total: resultado.pagination.total
      });

      res.status(200).json({
        status: 'success',
        message: resultado.message,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      controllerLogger.error('Error getting centros poblados', error);
      next(error);
    }
  }

  /**
   * Obtener centros poblados por municipio
   */
  async getCentrosPobladosByMunicipio(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CentrosPobladosController', 
      action: 'getCentrosPobladosByMunicipio',
      ip: req.ip 
    });

    try {
      const { id_municipio } = req.params;

      controllerLogger.info('Getting centros poblados by municipio', { id_municipio });

      const resultado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => centrosPobladosService.getCentrosPobladosByMunicipio(id_municipio),
        { operation: 'get_centros_poblados_by_municipio', id_municipio }
      );

      controllerLogger.info('Centros poblados by municipio retrieved successfully', {
        id_municipio,
        total: resultado.total
      });

      res.status(200).json(resultado);
    } catch (error) {
      if (error.statusCode === 404) {
        controllerLogger.warn('Municipio not found', { id_municipio: req.params.id_municipio });
        return res.status(404).json({
          status: 'error',
          message: error.message,
          code: error.code
        });
      }

      controllerLogger.error('Error getting centros poblados by municipio', error);
      next(error);
    }
  }

  /**
   * Obtener un centro poblado por ID
   */
  async getCentroPobladoById(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CentrosPobladosController', 
      action: 'getCentroPobladoById',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Getting centro poblado by ID', { id });

      const centro_poblado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => centrosPobladosService.getCentroPobladoById(id),
        { operation: 'get_centro_poblado_by_id', id }
      );

      controllerLogger.info('Centro poblado retrieved successfully', {
        id,
        nombre: centro_poblado.nombre
      });

      res.status(200).json({
        status: 'success',
        message: 'Centro poblado obtenido exitosamente',
        data: centro_poblado
      });
    } catch (error) {
      controllerLogger.error('Error getting centro poblado by ID', error, { id: req.params.id });
      next(error);
    }
  }

  /**
   * Crear un nuevo centro poblado
   */
  async createCentroPoblado(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CentrosPobladosController', 
      action: 'createCentroPoblado',
      ip: req.ip 
    });

    try {
      const centroPobladoData = req.body;

      controllerLogger.info('Creating centro poblado', {
        nombre: centroPobladoData.nombre
      });

      const nuevoCentroPoblado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => centrosPobladosService.createCentroPoblado(centroPobladoData),
        { operation: 'create_centro_poblado', nombre: centroPobladoData.nombre }
      );

      controllerLogger.info('Centro poblado created successfully', {
        id: nuevoCentroPoblado.id_centro_poblado,
        nombre: nuevoCentroPoblado.nombre
      });

      res.status(201).json({
        status: 'success',
        message: 'Centro poblado creado exitosamente',
        data: nuevoCentroPoblado
      });
    } catch (error) {
      controllerLogger.error('Error creating centro poblado', error, {
        nombre: req.body?.nombre
      });
      next(error);
    }
  }

  /**
   * Actualizar un centro poblado
   */
  async updateCentroPoblado(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CentrosPobladosController', 
      action: 'updateCentroPoblado',
      ip: req.ip 
    });

    try {
      const { id } = req.params;
      const centroPobladoData = req.body;

      controllerLogger.info('Updating centro poblado', {
        id,
        updateData: centroPobladoData
      });

      const centroPobladoActualizado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => centrosPobladosService.updateCentroPoblado(id, centroPobladoData),
        { operation: 'update_centro_poblado', id }
      );

      controllerLogger.info('Centro poblado updated successfully', {
        id,
        nombre: centroPobladoActualizado.nombre
      });

      res.status(200).json({
        status: 'success',
        message: 'Centro poblado actualizado exitosamente',
        data: centroPobladoActualizado
      });
    } catch (error) {
      controllerLogger.error('Error updating centro poblado', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Eliminar un centro poblado
   */
  async deleteCentroPoblado(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CentrosPobladosController', 
      action: 'deleteCentroPoblado',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Deleting centro poblado', { id });

      const result = await DatabaseErrorHandler.executeWithErrorHandling(
        () => centrosPobladosService.deleteCentroPoblado(id),
        { operation: 'delete_centro_poblado', id }
      );

      controllerLogger.info('Centro poblado deleted successfully', { id });

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: null
      });
    } catch (error) {
      controllerLogger.error('Error deleting centro poblado', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Obtener estadísticas de centros poblados
   */
  async getEstadisticas(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CentrosPobladosController', 
      action: 'getEstadisticas',
      ip: req.ip 
    });

    try {
      controllerLogger.info('Getting estadisticas centros poblados');

      const estadisticas = await DatabaseErrorHandler.executeWithErrorHandling(
        () => centrosPobladosService.getEstadisticasCentrosPoblados(),
        { operation: 'get_estadisticas_centros_poblados' }
      );

      controllerLogger.info('Estadisticas retrieved successfully', {
        totalCentrosPoblados: estadisticas.length
      });

      res.status(200).json({
        status: 'success',
        message: 'Estadísticas obtenidas exitosamente',
        data: estadisticas
      });
    } catch (error) {
      controllerLogger.error('Error getting estadisticas', error);
      next(error);
    }
  }
}

export default new CentrosPobladosController();
