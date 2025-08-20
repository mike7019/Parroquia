import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';
import logger from '../../utils/logger.js';

// Obtener el modelo TipoVivienda desde Sequelize una vez que se cargue
const getTipoViviendaModel = () => sequelize.models.TipoVivienda;

class TipoViviendaService {
  
  /**
   * Obtener todos los tipos de vivienda
   */
  async getAllTipos() {
    try {
      const tipos = await getTipoViviendaModel().findAll({
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: tipos,
        total: tipos.length,
        message: `Se encontraron ${tipos.length} tipos de vivienda`
      };
    } catch (error) {
      logger.error('Error getting tipos vivienda:', error);
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener tipos de vivienda: ${error.message}`
      };
    }
  }

  /**
   * Obtener un tipo de vivienda por ID
   */
  async getTipoById(id) {
    try {
      const tipo = await getTipoViviendaModel().findByPk(id);
      
      if (!tipo) {
        const error = new Error('Tipo de vivienda no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      return tipo;
    } catch (error) {
      logger.error(`Error getting tipo vivienda by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo tipo de vivienda
   */
  async createTipo(tipoData) {
    try {
      // Verificar si ya existe un tipo con el mismo nombre
      const existingTipo = await getTipoViviendaModel().findOne({
        where: { nombre: tipoData.nombre }
      });

      if (existingTipo) {
        const error = new Error('Ya existe un tipo de vivienda con ese nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        logger.warn('Attempted to create duplicate tipo vivienda', {
          nombre: tipoData.nombre,
          existing_id: existingTipo.id_tipo_vivienda
        });
        throw error;
      }

      const nuevoTipo = await getTipoViviendaModel().create(tipoData);
      
      logger.info('Tipo de vivienda creado exitosamente', {
        id: nuevoTipo.id_tipo_vivienda,
        nombre: nuevoTipo.nombre
      });

      return nuevoTipo;
    } catch (error) {
      logger.error('Error creating tipo vivienda:', error);
      throw error;
    }
  }

  /**
   * Actualizar un tipo de vivienda
   */
  async updateTipo(id, tipoData) {
    try {
      const tipo = await getTipoViviendaModel().findByPk(id);
      
      if (!tipo) {
        const error = new Error('Tipo de vivienda no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si ya existe otro tipo con el mismo nombre (si se está actualizando el nombre)
      if (tipoData.nombre && tipoData.nombre !== tipo.nombre) {
        const existingTipo = await getTipoViviendaModel().findOne({
          where: { 
            nombre: tipoData.nombre,
            id_tipo_vivienda: { [Op.ne]: id }
          }
        });

        if (existingTipo) {
          const error = new Error('Ya existe un tipo de vivienda con ese nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }

      const tipoActualizado = await tipo.update(tipoData);
      
      logger.info('Tipo de vivienda actualizado exitosamente', {
        id,
        nombre: tipoActualizado.nombre
      });

      return tipoActualizado;
    } catch (error) {
      logger.error(`Error updating tipo vivienda ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un tipo de vivienda
   */
  async deleteTipo(id) {
    try {
      const tipo = await getTipoViviendaModel().findByPk(id);
      
      if (!tipo) {
        const error = new Error('Tipo de vivienda no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si el tipo está siendo usado por alguna familia
      // Nota: Esta funcionalidad se puede implementar cuando se establezca la relación con familias
      
      await tipo.destroy();
      
      logger.info('Tipo de vivienda eliminado exitosamente', { id });

      return {
        message: 'Tipo de vivienda eliminado exitosamente'
      };
    } catch (error) {
      logger.error(`Error deleting tipo vivienda ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener tipos de vivienda activos
   */
  async getTiposActivos() {
    try {
      const tipos = await getTipoViviendaModel().findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']]
      });

      return tipos;
    } catch (error) {
      logger.error('Error getting tipos vivienda activos:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado activo/inactivo de un tipo de vivienda
   */
  async toggleEstado(id) {
    try {
      const tipo = await getTipoViviendaModel().findByPk(id);
      
      if (!tipo) {
        const error = new Error('Tipo de vivienda no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      const tipoActualizado = await tipo.update({ activo: !tipo.activo });
      
      logger.info('Estado de tipo de vivienda cambiado exitosamente', {
        id,
        nuevoEstado: tipoActualizado.activo
      });

      return tipoActualizado;
    } catch (error) {
      logger.error(`Error toggling estado tipo vivienda ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de tipos de vivienda
   */
  async getEstadisticas() {
    try {
      const totalTipos = await getTipoViviendaModel().count();
      const tiposActivos = await getTipoViviendaModel().count({ where: { activo: true } });
      const tiposInactivos = await getTipoViviendaModel().count({ where: { activo: false } });

      return {
        totalTipos,
        tiposActivos,
        tiposInactivos
      };
    } catch (error) {
      logger.error('Error getting estadisticas tipos vivienda:', error);
      throw error;
    }
  }
}

export default new TipoViviendaService();
