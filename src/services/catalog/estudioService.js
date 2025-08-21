import sequelize from '../../../config/sequelize.js';
import logger from '../../utils/logger.js';

// Obtener el modelo Estudio desde Sequelize una vez que se cargue
const getEstudioModel = () => sequelize.models.Estudio;

class EstudioService {
  
  /**
   * Obtener todos los estudios
   */
  async getAllEstudios() {
    try {
      const estudios = await getEstudioModel().findAll({
        order: [['nivel', 'ASC']]
      });

      return {
        status: 'success',
        data: estudios,
        total: estudios.length,
        message: `Se encontraron ${estudios.length} estudios`
      };
    } catch (error) {
      logger.error('Error getting estudios:', error);
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener estudios: ${error.message}`
      };
    }
  }

  /**
   * Obtener un estudio por ID
   */
  async getEstudioById(id) {
    try {
      const estudio = await getEstudioModel().findByPk(id);
      
      if (!estudio) {
        const error = new Error('Estudio no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      return estudio;
    } catch (error) {
      logger.error(`Error getting estudio by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo estudio
   */
  async createEstudio(estudioData) {
    try {
      // Verificar si ya existe un estudio con el mismo nivel
      const existingEstudio = await getEstudioModel().findOne({
        where: { nivel: estudioData.nivel }
      });

      if (existingEstudio) {
        const error = new Error('Ya existe un estudio con ese nivel');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      const nuevoEstudio = await getEstudioModel().create(estudioData);
      
      logger.info('Estudio creado exitosamente', {
        id: nuevoEstudio.id,
        nivel: nuevoEstudio.nivel
      });

      return nuevoEstudio;
    } catch (error) {
      logger.error('Error creating estudio:', error);
      throw error;
    }
  }

  /**
   * Actualizar un estudio
   */
  async updateEstudio(id, estudioData) {
    try {
      const estudio = await getEstudioModel().findByPk(id);
      
      if (!estudio) {
        const error = new Error('Estudio no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay otro estudio con el mismo nivel (excluyendo el actual)
      if (estudioData.nivel && estudioData.nivel !== estudio.nivel) {
        const existingEstudio = await getEstudioModel().findOne({
          where: { 
            nivel: estudioData.nivel,
            id: { '!=': id }
          }
        });

        if (existingEstudio) {
          const error = new Error('Ya existe un estudio con ese nivel');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }

      await estudio.update(estudioData);
      
      logger.info('Estudio actualizado exitosamente', {
        id: estudio.id,
        nivel: estudio.nivel
      });

      return estudio;
    } catch (error) {
      logger.error(`Error updating estudio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un estudio
   */
  async deleteEstudio(id) {
    try {
      const estudio = await getEstudioModel().findByPk(id);
      
      if (!estudio) {
        const error = new Error('Estudio no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay personas usando este estudio
      // Esta verificación se puede implementar cuando se establezcan las relaciones
      /*
      const personasUsando = await sequelize.models.Persona.count({
        where: { id_estudio: id }
      });

      if (personasUsando > 0) {
        const error = new Error(`No se puede eliminar el estudio porque ${personasUsando} persona(s) lo están usando`);
        error.statusCode = 409;
        error.code = 'ESTUDIO_IN_USE';
        throw error;
      }
      */

      await estudio.destroy();
      
      logger.info('Estudio eliminado exitosamente', {
        id: id,
        nivel: estudio.nivel
      });

      return { message: 'Estudio eliminado exitosamente' };
    } catch (error) {
      logger.error(`Error deleting estudio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estudios por nivel (si existe campo nivel)
   */
  async getEstudiosPorNivel(nivel) {
    try {
      const estudios = await getEstudioModel().findAll({
        where: { nivel: nivel },
        order: [['nivel', 'ASC']]
      });

      return estudios;
    } catch (error) {
      logger.error(`Error getting estudios por nivel ${nivel}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de estudios
   */
  async getEstadisticas() {
    try {
      const totalEstudios = await getEstudioModel().count();
      
      // Obtener distribución por nivel si existe el campo
      const estadisticas = {
        totalEstudios
      };

      return estadisticas;
    } catch (error) {
      logger.error('Error getting estadisticas estudios:', error);
      throw error;
    }
  }
}

export default new EstudioService();
