import corregimientosService from '../../services/catalog/corregimientosService.js';
import logger from '../../utils/logger.js';
import DatabaseErrorHandler from '../../utils/databaseErrorHandler.js';

/**
 * Controlador para gestión de corregimientos
 */
class CorregimientosController {

  /**
   * Obtener todos los corregimientos
   */
  async getAllCorregimientos(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CorregimientosController', 
      action: 'getAllCorregimientos',
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

      controllerLogger.info('Getting corregimientos', filters);

      const resultado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => corregimientosService.getAllCorregimientos(filters),
        { operation: 'get_corregimientos' }
      );

      controllerLogger.info('Corregimientos retrieved successfully', {
        total: resultado.pagination.total
      });

      res.status(200).json({
        status: 'success',
        message: resultado.message,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      controllerLogger.error('Error getting corregimientos', error);
      next(error);
    }
  }

  /**
   * Obtener corregimientos por municipio
   */
  async getCorregimientosByMunicipio(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CorregimientosController', 
      action: 'getCorregimientosByMunicipio',
      ip: req.ip 
    });

    try {
      const { id_municipio } = req.params;

      controllerLogger.info('Getting corregimientos by municipio', { id_municipio });

      const resultado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => corregimientosService.getCorregimientosByMunicipio(id_municipio),
        { operation: 'get_corregimientos_by_municipio', id_municipio }
      );

      controllerLogger.info('Corregimientos by municipio retrieved successfully', {
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

      controllerLogger.error('Error getting corregimientos by municipio', error);
      next(error);
    }
  }

  /**
   * Obtener un corregimiento por ID
   */
  async getCorregimientoById(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CorregimientosController', 
      action: 'getCorregimientoById',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Getting corregimiento by ID', { id });

      const corregimiento = await DatabaseErrorHandler.executeWithErrorHandling(
        () => corregimientosService.getCorregimientoById(id),
        { operation: 'get_corregimiento_by_id', id }
      );

      controllerLogger.info('Corregimiento retrieved successfully', {
        id,
        nombre: corregimiento.nombre
      });

      res.status(200).json({
        status: 'success',
        message: 'Corregimiento obtenido exitosamente',
        data: corregimiento
      });
    } catch (error) {
      controllerLogger.error('Error getting corregimiento by ID', error, { id: req.params.id });
      next(error);
    }
  }

  /**
   * Crear un nuevo corregimiento
   */
  async createCorregimiento(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CorregimientosController', 
      action: 'createCorregimiento',
      ip: req.ip 
    });

    try {
      const corregimientoData = req.body;

      controllerLogger.info('Creating corregimiento', {
        nombre: corregimientoData.nombre
      });

      const nuevoCorregimiento = await DatabaseErrorHandler.executeWithErrorHandling(
        () => corregimientosService.createCorregimiento(corregimientoData),
        { operation: 'create_corregimiento', nombre: corregimientoData.nombre }
      );

      controllerLogger.info('Corregimiento created successfully', {
        id: nuevoCorregimiento.id_corregimiento,
        nombre: nuevoCorregimiento.nombre
      });

      res.status(201).json({
        status: 'success',
        message: 'Corregimiento creado exitosamente',
        data: nuevoCorregimiento
      });
    } catch (error) {
      controllerLogger.error('Error creating corregimiento', error, {
        nombre: req.body?.nombre
      });
      next(error);
    }
  }

  /**
   * Actualizar un corregimiento
   */
  async updateCorregimiento(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CorregimientosController', 
      action: 'updateCorregimiento',
      ip: req.ip 
    });

    try {
      const { id } = req.params;
      const corregimientoData = req.body;

      controllerLogger.info('Updating corregimiento', {
        id,
        updateData: corregimientoData
      });

      const corregimientoActualizado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => corregimientosService.updateCorregimiento(id, corregimientoData),
        { operation: 'update_corregimiento', id }
      );

      controllerLogger.info('Corregimiento updated successfully', {
        id,
        nombre: corregimientoActualizado.nombre
      });

      res.status(200).json({
        status: 'success',
        message: 'Corregimiento actualizado exitosamente',
        data: corregimientoActualizado
      });
    } catch (error) {
      controllerLogger.error('Error updating corregimiento', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Eliminar un corregimiento
   */
  async deleteCorregimiento(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CorregimientosController', 
      action: 'deleteCorregimiento',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Deleting corregimiento', { id });

      const result = await DatabaseErrorHandler.executeWithErrorHandling(
        () => corregimientosService.deleteCorregimiento(id),
        { operation: 'delete_corregimiento', id }
      );

      controllerLogger.info('Corregimiento deleted successfully', { id });

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: null
      });
    } catch (error) {
      controllerLogger.error('Error deleting corregimiento', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Obtener estadísticas de corregimientos
   */
  async getEstadisticas(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'CorregimientosController', 
      action: 'getEstadisticas',
      ip: req.ip 
    });

    try {
      controllerLogger.info('Getting estadisticas corregimientos');

      const estadisticas = await DatabaseErrorHandler.executeWithErrorHandling(
        () => corregimientosService.getEstadisticasCorregimientos(),
        { operation: 'get_estadisticas_corregimientos' }
      );

      controllerLogger.info('Estadisticas retrieved successfully', {
        totalCorregimientos: estadisticas.length
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

export default new CorregimientosController();
