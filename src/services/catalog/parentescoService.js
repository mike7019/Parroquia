import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';
import logger from '../../utils/logger.js';

// Obtener el modelo Parentesco desde Sequelize una vez que se cargue
const getParentescoModel = () => sequelize.models.Parentesco;

class ParentescoService {
  
  /**
   * Obtener todos los parentescos
   */
  async getAllParentescos() {
    try {
      const parentescos = await getParentescoModel().findAll({
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: parentescos,
        total: parentescos.length,
        message: `Se encontraron ${parentescos.length} parentescos`
      };
    } catch (error) {
      logger.error('Error getting parentescos:', error);
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener parentescos: ${error.message}`
      };
    }
  }

  /**
   * Obtener un parentesco por ID
   */
  async getParentescoById(id) {
    try {
      const parentesco = await getParentescoModel().findByPk(id);
      
      if (!parentesco) {
        const error = new Error('Parentesco no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      return parentesco;
    } catch (error) {
      logger.error(`Error getting parentesco by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo parentesco
   */
  async createParentesco(parentescoData) {
    try {
      // Verificar si ya existe un parentesco con el mismo nombre
      const existingParentesco = await getParentescoModel().findOne({
        where: { nombre: parentescoData.nombre }
      });

      if (existingParentesco) {
        const error = new Error('Ya existe un parentesco con ese nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      const nuevoParentesco = await getParentescoModel().create(parentescoData);
      
      logger.info('Parentesco creado exitosamente', {
        id: nuevoParentesco.id_parentesco,
        nombre: nuevoParentesco.nombre
      });

      return nuevoParentesco;
    } catch (error) {
      logger.error('Error creating parentesco:', error);
      throw error;
    }
  }

  /**
   * Actualizar un parentesco
   */
  async updateParentesco(id, parentescoData) {
    try {
      const parentesco = await getParentescoModel().findByPk(id);
      
      if (!parentesco) {
        const error = new Error('Parentesco no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay otro parentesco con el mismo nombre (excluyendo el actual)
      if (parentescoData.nombre && parentescoData.nombre !== parentesco.nombre) {
        const existingParentesco = await getParentescoModel().findOne({
          where: { 
            nombre: parentescoData.nombre,
            id_parentesco: { [Op.ne]: id }
          }
        });

        if (existingParentesco) {
          const error = new Error('Ya existe un parentesco con ese nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }

      await parentesco.update(parentescoData);
      
      logger.info('Parentesco actualizado exitosamente', {
        id: parentesco.id_parentesco,
        nombre: parentesco.nombre
      });

      return parentesco;
    } catch (error) {
      logger.error(`Error updating parentesco ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un parentesco
   */
  async deleteParentesco(id) {
    try {
      const parentesco = await getParentescoModel().findByPk(id);
      
      if (!parentesco) {
        const error = new Error('Parentesco no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay personas usando este parentesco
      // Esta verificación se puede implementar cuando se establezcan las relaciones
      /*
      const personasUsando = await sequelize.models.Persona.count({
        where: { id_parentesco: id }
      });

      if (personasUsando > 0) {
        const error = new Error(`No se puede eliminar el parentesco porque ${personasUsando} persona(s) lo están usando`);
        error.statusCode = 409;
        error.code = 'PARENTESCO_IN_USE';
        throw error;
      }
      */

      await parentesco.destroy();
      
      logger.info('Parentesco eliminado exitosamente', {
        id: id,
        nombre: parentesco.nombre
      });

      return { message: 'Parentesco eliminado exitosamente' };
    } catch (error) {
      logger.error(`Error deleting parentesco ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener parentescos más utilizados
   */
  async getParentescosMasUtilizados() {
    try {
      // Esta consulta se puede implementar cuando se establezcan las relaciones con personas
      const parentescos = await getParentescoModel().findAll({
        order: [['nombre', 'ASC']]
      });

      return parentescos;
    } catch (error) {
      logger.error('Error getting parentescos más utilizados:', error);
      throw error;
    }
  }

  /**
   * Buscar parentescos por nombre exacto
   */
  async findByNombre(nombre) {
    try {
      const parentesco = await getParentescoModel().findOne({
        where: { nombre: { [Op.iLike]: nombre } }
      });

      return parentesco;
    } catch (error) {
      logger.error(`Error finding parentesco by nombre ${nombre}:`, error);
      throw error;
    }
  }
}

export default new ParentescoService();
