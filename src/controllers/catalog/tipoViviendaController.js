import tipoViviendaService from '../../services/catalog/tipoViviendaService.js';
import logger from '../../utils/logger.js';
import DatabaseErrorHandler from '../../utils/databaseErrorHandler.js';

/**
 * Controlador para gestión de tipos de vivienda
 */
class TipoViviendaController {

  /**
   * Obtener todos los tipos de vivienda
   */
  async getAllTipos(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'TipoViviendaController', 
      action: 'getAllTipos',
      ip: req.ip 
    });

    try {
      const { 
        search = null, 
        sortBy = 'nombre', 
        sortOrder = 'ASC' 
      } = req.query;

      controllerLogger.info('Getting tipos vivienda', {
        search,
        sortBy,
        sortOrder
      });

      const result = await DatabaseErrorHandler.executeWithErrorHandling(
        () => tipoViviendaService.getAllTipos(search, sortBy, sortOrder),
        { operation: 'get_tipos_vivienda' }
      );

      controllerLogger.info('Tipos vivienda retrieved successfully', {
        totalItems: result.total
      });

      res.status(200).json({
        status: 'success',
        message: 'Tipos de vivienda obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      controllerLogger.error('Error getting tipos vivienda', error);
      next(error);
    }
  }

  /**
   * Obtener un tipo de vivienda por ID
   */
  async getTipoById(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'TipoViviendaController', 
      action: 'getTipoById',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Getting tipo vivienda by ID', { id });

      const tipo = await DatabaseErrorHandler.executeWithErrorHandling(
        () => tipoViviendaService.getTipoById(id),
        { operation: 'get_tipo_vivienda_by_id', id }
      );

      controllerLogger.info('Tipo vivienda retrieved successfully', {
        id,
        nombre: tipo.nombre
      });

      res.status(200).json({
        status: 'success',
        message: 'Tipo de vivienda obtenido exitosamente',
        data: { tipo }
      });
    } catch (error) {
      controllerLogger.error('Error getting tipo vivienda by ID', error, { id: req.params.id });
      next(error);
    }
  }

  /**
   * Crear un nuevo tipo de vivienda
   */
  async createTipo(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'TipoViviendaController', 
      action: 'createTipo',
      ip: req.ip 
    });

    try {
      const tipoData = req.body;

      controllerLogger.info('Creating tipo vivienda', {
        nombre: tipoData.nombre
      });

      const nuevoTipo = await DatabaseErrorHandler.executeWithErrorHandling(
        () => tipoViviendaService.createTipo(tipoData),
        { operation: 'create_tipo_vivienda', nombre: tipoData.nombre }
      );

      controllerLogger.info('Tipo vivienda created successfully', {
        id: nuevoTipo.id_tipo_vivienda,
        nombre: nuevoTipo.nombre
      });

      res.status(201).json({
        status: 'success',
        message: 'Tipo de vivienda creado exitosamente',
        data: { tipo: nuevoTipo }
      });
    } catch (error) {
      controllerLogger.error('Error creating tipo vivienda', error, {
        nombre: req.body?.nombre
      });
      next(error);
    }
  }

  /**
   * Actualizar un tipo de vivienda
   */
  async updateTipo(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'TipoViviendaController', 
      action: 'updateTipo',
      ip: req.ip 
    });

    try {
      const { id } = req.params;
      const tipoData = req.body;

      controllerLogger.info('Updating tipo vivienda', {
        id,
        updateData: tipoData
      });

      const tipoActualizado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => tipoViviendaService.updateTipo(id, tipoData),
        { operation: 'update_tipo_vivienda', id }
      );

      controllerLogger.info('Tipo vivienda updated successfully', {
        id,
        nombre: tipoActualizado.nombre
      });

      res.status(200).json({
        status: 'success',
        message: 'Tipo de vivienda actualizado exitosamente',
        data: { tipo: tipoActualizado }
      });
    } catch (error) {
      controllerLogger.error('Error updating tipo vivienda', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Eliminar un tipo de vivienda
   */
  async deleteTipo(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'TipoViviendaController', 
      action: 'deleteTipo',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Deleting tipo vivienda', { id });

      const result = await DatabaseErrorHandler.executeWithErrorHandling(
        () => tipoViviendaService.deleteTipo(id),
        { operation: 'delete_tipo_vivienda', id }
      );

      controllerLogger.info('Tipo vivienda deleted successfully', { id });

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: null
      });
    } catch (error) {
      controllerLogger.error('Error deleting tipo vivienda', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Obtener tipos de vivienda activos
   */
  async getTiposActivos(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'TipoViviendaController', 
      action: 'getTiposActivos',
      ip: req.ip 
    });

    try {
      controllerLogger.info('Getting tipos vivienda activos');

      const tipos = await DatabaseErrorHandler.executeWithErrorHandling(
        () => tipoViviendaService.getTiposActivos(),
        { operation: 'get_tipos_vivienda_activos' }
      );

      controllerLogger.info('Tipos vivienda activos retrieved successfully', {
        count: tipos.length
      });

      res.status(200).json({
        status: 'success',
        message: 'Tipos de vivienda activos obtenidos exitosamente',
        data: { tipos }
      });
    } catch (error) {
      controllerLogger.error('Error getting tipos vivienda activos', error);
      next(error);
    }
  }

  /**
   * Cambiar estado activo/inactivo de un tipo de vivienda
   */
  async toggleEstado(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'TipoViviendaController', 
      action: 'toggleEstado',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Toggling estado tipo vivienda', { id });

      const tipoActualizado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => tipoViviendaService.toggleEstado(id),
        { operation: 'toggle_estado_tipo_vivienda', id }
      );

      controllerLogger.info('Estado tipo vivienda toggled successfully', {
        id,
        nuevoEstado: tipoActualizado.activo
      });

      res.status(200).json({
        status: 'success',
        message: `Tipo de vivienda ${tipoActualizado.activo ? 'activado' : 'desactivado'} exitosamente`,
        data: { tipo: tipoActualizado }
      });
    } catch (error) {
      controllerLogger.error('Error toggling estado tipo vivienda', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Obtener estadísticas de tipos de vivienda
   */
  async getEstadisticas(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'TipoViviendaController', 
      action: 'getEstadisticas',
      ip: req.ip 
    });

    try {
      controllerLogger.info('Getting estadisticas tipos vivienda');

      const estadisticas = await DatabaseErrorHandler.executeWithErrorHandling(
        () => tipoViviendaService.getEstadisticas(),
        { operation: 'get_estadisticas_tipos_vivienda' }
      );

      controllerLogger.info('Estadisticas retrieved successfully');

      res.status(200).json({
        status: 'success',
        message: 'Estadísticas obtenidas exitosamente',
        data: { estadisticas }
      });
    } catch (error) {
      controllerLogger.error('Error getting estadisticas', error);
      next(error);
    }
  }
}

export default new TipoViviendaController();
