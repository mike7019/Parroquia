import disposicionBasuraService from '../../services/catalog/disposicionBasuraService.js';
import logger from '../../utils/logger.js';
import DatabaseErrorHandler from '../../utils/databaseErrorHandler.js';

/**
 * Controlador para gestión de tipos de disposición de basura
 */
class DisposicionBasuraController {

  /**
   * Obtener todos los tipos de disposición de basura
   */
  async getAllTipos(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'getAllTipos',
      ip: req.ip 
    });

    try {
      const { 
        page = 1, 
        limit = 10, 
        search = null, 
        sortBy = 'nombre', 
        sortOrder = 'ASC' 
      } = req.query;

      controllerLogger.info('Getting tipos disposicion basura', {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder
      });

      const result = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.getAllTipos(page, limit, search, sortBy, sortOrder),
        { operation: 'get_tipos_disposicion_basura' }
      );

      controllerLogger.info('Tipos disposicion basura retrieved successfully', {
        totalItems: result.pagination.totalItems,
        currentPage: result.pagination.currentPage
      });

      res.status(200).json({
        status: 'success',
        message: 'Tipos de disposición de basura obtenidos exitosamente',
        data: result
      });
    } catch (error) {
      controllerLogger.error('Error getting tipos disposicion basura', error);
      next(error);
    }
  }

  /**
   * Obtener un tipo de disposición por ID
   */
  async getTipoById(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'getTipoById',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Getting tipo disposicion basura by ID', { id });

      const tipo = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.getTipoById(id),
        { operation: 'get_tipo_disposicion_by_id', id }
      );

      controllerLogger.info('Tipo disposicion basura retrieved successfully', {
        id,
        nombre: tipo.nombre
      });

      res.status(200).json({
        status: 'success',
        message: 'Tipo de disposición de basura obtenido exitosamente',
        data: { tipo }
      });
    } catch (error) {
      controllerLogger.error('Error getting tipo disposicion basura by ID', error, { id: req.params.id });
      next(error);
    }
  }

  /**
   * Crear un nuevo tipo de disposición de basura
   */
  async createTipo(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'createTipo',
      ip: req.ip 
    });

    try {
      const tipoData = req.body;

      controllerLogger.info('Creating tipo disposicion basura', {
        nombre: tipoData.nombre
      });

      const nuevoTipo = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.createTipo(tipoData),
        { operation: 'create_tipo_disposicion_basura', nombre: tipoData.nombre }
      );

      controllerLogger.info('Tipo disposicion basura created successfully', {
        id: nuevoTipo.id_tipo_disposicion_basura,
        nombre: nuevoTipo.nombre
      });

      res.status(201).json({
        status: 'success',
        message: 'Tipo de disposición de basura creado exitosamente',
        data: { tipo: nuevoTipo }
      });
    } catch (error) {
      controllerLogger.error('Error creating tipo disposicion basura', error, {
        nombre: req.body?.nombre
      });
      next(error);
    }
  }

  /**
   * Actualizar un tipo de disposición de basura
   */
  async updateTipo(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'updateTipo',
      ip: req.ip 
    });

    try {
      const { id } = req.params;
      const tipoData = req.body;

      controllerLogger.info('Updating tipo disposicion basura', {
        id,
        updateData: tipoData
      });

      const tipoActualizado = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.updateTipo(id, tipoData),
        { operation: 'update_tipo_disposicion_basura', id }
      );

      controllerLogger.info('Tipo disposicion basura updated successfully', {
        id,
        nombre: tipoActualizado.nombre
      });

      res.status(200).json({
        status: 'success',
        message: 'Tipo de disposición de basura actualizado exitosamente',
        data: { tipo: tipoActualizado }
      });
    } catch (error) {
      controllerLogger.error('Error updating tipo disposicion basura', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Eliminar un tipo de disposición de basura
   */
  async deleteTipo(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'deleteTipo',
      ip: req.ip 
    });

    try {
      const { id } = req.params;

      controllerLogger.info('Deleting tipo disposicion basura', { id });

      const result = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.deleteTipo(id),
        { operation: 'delete_tipo_disposicion_basura', id }
      );

      controllerLogger.info('Tipo disposicion basura deleted successfully', { id });

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: null
      });
    } catch (error) {
      controllerLogger.error('Error deleting tipo disposicion basura', error, {
        id: req.params.id
      });
      next(error);
    }
  }

  /**
   * Obtener estadísticas de uso de tipos de disposición
   */
  async getEstadisticas(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'getEstadisticas',
      ip: req.ip 
    });

    try {
      controllerLogger.info('Getting estadisticas tipos disposicion basura');

      const estadisticas = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.getEstadisticasTipos(),
        { operation: 'get_estadisticas_disposicion_basura' }
      );

      controllerLogger.info('Estadisticas retrieved successfully', {
        totalTipos: estadisticas.length
      });

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

  /**
   * Asignar tipo de disposición a una familia
   */
  async asignarTipoAFamilia(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'asignarTipoAFamilia',
      ip: req.ip 
    });

    try {
      const { id_familia, id_tipo_disposicion_basura } = req.body;

      controllerLogger.info('Assigning tipo disposicion to familia', {
        id_familia,
        id_tipo_disposicion_basura
      });

      const asignacion = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.asignarTipoAFamilia(id_familia, id_tipo_disposicion_basura),
        { operation: 'assign_tipo_to_familia', id_familia, id_tipo_disposicion_basura }
      );

      controllerLogger.info('Tipo disposicion assigned to familia successfully', {
        id_familia,
        id_tipo_disposicion_basura,
        asignacionId: asignacion.id_familia_disposicion_basura
      });

      res.status(201).json({
        status: 'success',
        message: 'Tipo de disposición asignado a familia exitosamente',
        data: { asignacion }
      });
    } catch (error) {
      controllerLogger.error('Error assigning tipo disposicion to familia', error, {
        id_familia: req.body?.id_familia,
        id_tipo_disposicion_basura: req.body?.id_tipo_disposicion_basura
      });
      next(error);
    }
  }

  /**
   * Remover asignación de tipo de disposición de una familia
   */
  async removerTipoDeFamilia(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'removerTipoDeFamilia',
      ip: req.ip 
    });

    try {
      const { idFamilia, idTipo } = req.params;

      controllerLogger.info('Removing tipo disposicion from familia', {
        idFamilia,
        idTipo
      });

      const result = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.removerTipoDeFamilia(idFamilia, idTipo),
        { operation: 'remove_tipo_from_familia', idFamilia, idTipo }
      );

      controllerLogger.info('Tipo disposicion removed from familia successfully', {
        idFamilia,
        idTipo
      });

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: null
      });
    } catch (error) {
      controllerLogger.error('Error removing tipo disposicion from familia', error, {
        idFamilia: req.params.idFamilia,
        idTipo: req.params.idTipo
      });
      next(error);
    }
  }

  /**
   * Obtener tipos de disposición de una familia específica
   */
  async getTiposPorFamilia(req, res, next) {
    const controllerLogger = logger.child({ 
      controller: 'DisposicionBasuraController', 
      action: 'getTiposPorFamilia',
      ip: req.ip 
    });

    try {
      const { idFamilia } = req.params;

      controllerLogger.info('Getting tipos disposicion for familia', { idFamilia });

      const tipos = await DatabaseErrorHandler.executeWithErrorHandling(
        () => disposicionBasuraService.getTiposPorFamilia(idFamilia),
        { operation: 'get_tipos_by_familia', idFamilia }
      );

      controllerLogger.info('Tipos disposicion for familia retrieved successfully', {
        idFamilia,
        tiposCount: tipos.length
      });

      res.status(200).json({
        status: 'success',
        message: 'Tipos de disposición de familia obtenidos exitosamente',
        data: { tipos }
      });
    } catch (error) {
      controllerLogger.error('Error getting tipos disposicion for familia', error, {
        idFamilia: req.params.idFamilia
      });
      next(error);
    }
  }
}

export default new DisposicionBasuraController();
