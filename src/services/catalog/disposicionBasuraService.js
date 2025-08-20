import TipoDisposicionBasura from '../../models/catalog/TipoDisposicionBasura.js';
import FamiliaDisposicionBasura from '../../models/catalog/FamiliaDisposicionBasura.js';
import sequelize from '../../../config/sequelize.js';
import logger from '../../utils/logger.js';

class DisposicionBasuraService {
  
  /**
   * Obtener todos los tipos de disposición de basura
   */
  async getAllTipos() {
    try {
      const tipos = await TipoDisposicionBasura.findAll({
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: tipos,
        total: tipos.length,
        message: `Se encontraron ${tipos.length} tipos de disposición de basura`
      };
    } catch (error) {
      logger.error('Error getting tipos disposicion basura:', error);
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener tipos de disposición de basura: ${error.message}`
      };
    }
  }

  /**
   * Obtener un tipo de disposición por ID
   */
  async getTipoById(id) {
    try {
      const tipo = await TipoDisposicionBasura.findByPk(id);
      
      if (!tipo) {
        const error = new Error('Tipo de disposición de basura no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      return tipo;
    } catch (error) {
      logger.error(`Error getting tipo disposicion basura by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo tipo de disposición de basura
   */
  async createTipo(tipoData) {
    try {
      // Verificar si ya existe un tipo con el mismo nombre
      const existingTipo = await TipoDisposicionBasura.findOne({
        where: { nombre: tipoData.nombre }
      });

      if (existingTipo) {
        const error = new Error('Ya existe un tipo de disposición de basura con ese nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      const nuevoTipo = await TipoDisposicionBasura.create(tipoData);
      
      logger.info('Tipo de disposición de basura creado exitosamente', {
        id: nuevoTipo.id_tipo_disposicion_basura,
        nombre: nuevoTipo.nombre
      });

      return nuevoTipo;
    } catch (error) {
      logger.error('Error creating tipo disposicion basura:', error);
      throw error;
    }
  }

  /**
   * Actualizar un tipo de disposición de basura
   */
  async updateTipo(id, tipoData) {
    try {
      const tipo = await TipoDisposicionBasura.findByPk(id);
      
      if (!tipo) {
        const error = new Error('Tipo de disposición de basura no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay otro tipo con el mismo nombre (excluyendo el actual)
      if (tipoData.nombre && tipoData.nombre !== tipo.nombre) {
        const existingTipo = await TipoDisposicionBasura.findOne({
          where: { 
            nombre: tipoData.nombre,
            id_tipo_disposicion_basura: { '!=': id }
          }
        });

        if (existingTipo) {
          const error = new Error('Ya existe un tipo de disposición de basura con ese nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }

      await tipo.update(tipoData);
      
      logger.info('Tipo de disposición de basura actualizado exitosamente', {
        id: tipo.id_tipo_disposicion_basura,
        nombre: tipo.nombre
      });

      return tipo;
    } catch (error) {
      logger.error(`Error updating tipo disposicion basura ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un tipo de disposición de basura
   */
  async deleteTipo(id) {
    try {
      const tipo = await TipoDisposicionBasura.findByPk(id);
      
      if (!tipo) {
        const error = new Error('Tipo de disposición de basura no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay familias usando este tipo
      const familiasUsando = await FamiliaDisposicionBasura.count({
        where: { id_tipo_disposicion_basura: id }
      });

      if (familiasUsando > 0) {
        const error = new Error(`No se puede eliminar el tipo de disposición porque ${familiasUsando} familia(s) lo están usando`);
        error.statusCode = 409;
        error.code = 'TIPO_IN_USE';
        throw error;
      }

      await tipo.destroy();
      
      logger.info('Tipo de disposición de basura eliminado exitosamente', {
        id: id,
        nombre: tipo.nombre
      });

      return { message: 'Tipo de disposición de basura eliminado exitosamente' };
    } catch (error) {
      logger.error(`Error deleting tipo disposicion basura ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de tipos de disposición
   */
  async getEstadisticasTipos() {
    try {
      const estadisticas = await sequelize.query(`
        SELECT 
          tdb.id_tipo_disposicion_basura,
          tdb.nombre,
          tdb.descripcion,
          COUNT(fdb.id_familia) as familias_usando
        FROM tipos_disposicion_basura tdb
        LEFT JOIN familia_disposicion_basura fdb 
          ON tdb.id_tipo_disposicion_basura = fdb.id_tipo_disposicion_basura
        GROUP BY 
          tdb.id_tipo_disposicion_basura,
          tdb.nombre,
          tdb.descripcion
        ORDER BY tdb.nombre ASC
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      return estadisticas;
    } catch (error) {
      logger.error('Error getting estadisticas tipos disposicion basura:', error);
      throw error;
    }
  }

  /**
   * Asignar tipo de disposición de basura a una familia
   */
  async asignarTipoAFamilia(idFamilia, idTipoDisposicion) {
    try {
      // Verificar si ya existe la asignación
      const existingAsignacion = await FamiliaDisposicionBasura.findOne({
        where: {
          id_familia: idFamilia,
          id_tipo_disposicion_basura: idTipoDisposicion
        }
      });

      if (existingAsignacion) {
        const error = new Error('La familia ya tiene asignado este tipo de disposición de basura');
        error.statusCode = 409;
        error.code = 'ASSIGNMENT_EXISTS';
        throw error;
      }

      // Verificar que el tipo de disposición existe
      const tipoExists = await TipoDisposicionBasura.findByPk(idTipoDisposicion);
      if (!tipoExists) {
        const error = new Error('Tipo de disposición de basura no encontrado');
        error.statusCode = 404;
        error.code = 'TIPO_NOT_FOUND';
        throw error;
      }

      const nuevaAsignacion = await FamiliaDisposicionBasura.create({
        id_familia: idFamilia,
        id_tipo_disposicion_basura: idTipoDisposicion
      });

      logger.info('Tipo de disposición asignado a familia exitosamente', {
        idFamilia,
        idTipoDisposicion,
        asignacionId: nuevaAsignacion.id_familia_disposicion_basura
      });

      return nuevaAsignacion;
    } catch (error) {
      logger.error('Error asignando tipo disposicion a familia:', error);
      throw error;
    }
  }

  /**
   * Remover asignación de tipo de disposición de una familia
   */
  async removerTipoDeFamilia(idFamilia, idTipoDisposicion) {
    try {
      const asignacion = await FamiliaDisposicionBasura.findOne({
        where: {
          id_familia: idFamilia,
          id_tipo_disposicion_basura: idTipoDisposicion
        }
      });

      if (!asignacion) {
        const error = new Error('Asignación no encontrada');
        error.statusCode = 404;
        error.code = 'ASSIGNMENT_NOT_FOUND';
        throw error;
      }

      await asignacion.destroy();

      logger.info('Tipo de disposición removido de familia exitosamente', {
        idFamilia,
        idTipoDisposicion
      });

      return { message: 'Asignación eliminada exitosamente' };
    } catch (error) {
      logger.error('Error removiendo tipo disposicion de familia:', error);
      throw error;
    }
  }

  /**
   * Obtener tipos de disposición de una familia específica
   */
  async getTiposPorFamilia(idFamilia) {
    try {
      const asignaciones = await sequelize.query(`
        SELECT 
          fdb.id_familia_disposicion_basura,
          fdb.id_familia,
          fdb.id_tipo_disposicion_basura,
          fdb.created_at,
          fdb.updated_at,
          tdb.nombre as tipo_nombre,
          tdb.descripcion as tipo_descripcion
        FROM familia_disposicion_basura fdb
        JOIN tipos_disposicion_basura tdb 
          ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura
        WHERE fdb.id_familia = :idFamilia
        ORDER BY tdb.nombre ASC
      `, {
        replacements: { idFamilia },
        type: sequelize.QueryTypes.SELECT
      });

      return asignaciones;
    } catch (error) {
      logger.error(`Error getting tipos disposicion for familia ${idFamilia}:`, error);
      throw error;
    }
  }
}

export default new DisposicionBasuraService();
