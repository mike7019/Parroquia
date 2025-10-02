import { Op } from 'sequelize';
import { Parentesco } from '../../models/index.js';
import logger from '../../utils/logger.js';

class ParentescoService {
  
  /**
   * Función para encontrar el próximo ID disponible reutilizando gaps
   */
  async findNextAvailableId() {
    try {
      // Obtener todos los IDs existentes ordenados
      const existingIds = await Parentesco.findAll({
        attributes: ['id_parentesco'],
        order: [['id_parentesco', 'ASC']],
        raw: true
      });

      // Si no hay registros, empezar desde 1
      if (existingIds.length === 0) {
        return 1;
      }

      // Buscar el primer gap en la secuencia
      for (let i = 0; i < existingIds.length; i++) {
        const expectedId = i + 1;
        const actualId = parseInt(existingIds[i].id_parentesco);
        
        if (actualId !== expectedId) {
          return expectedId;
        }
      }

      // Si no hay gaps, usar el siguiente ID después del último
      const lastId = parseInt(existingIds[existingIds.length - 1].id_parentesco);
      return lastId + 1;
    } catch (error) {
      logger.error('Error finding next available ID for parentesco:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los parentescos
   */
  async getAllParentescos() {
    try {
      const parentescos = await Parentesco.findAll({
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
      const parentesco = await Parentesco.findByPk(id);
      
      if (!parentesco) {
        throw new Error('Parentesco no encontrado');
      }

      return parentesco;
    } catch (error) {
      throw new Error(`Error fetching parentesco: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo parentesco
   */
  async createParentesco(parentescoData) {
    try {
      // Verificar si ya existe un parentesco con el mismo nombre
      const existingParentesco = await Parentesco.findOne({
        where: { nombre: parentescoData.nombre }
      });

      if (existingParentesco) {
        throw new Error('Ya existe un parentesco con ese nombre');
      }

      // Find the next available ID
      const nextId = await this.findNextAvailableId();

      const nuevoParentesco = await Parentesco.create({
        id_parentesco: nextId,
        ...parentescoData
      });

      return nuevoParentesco;
    } catch (error) {
      throw new Error(`Error creating parentesco: ${error.message}`);
    }
  }

  /**
   * Actualizar un parentesco
   */
  async updateParentesco(id, parentescoData) {
    try {
      const parentesco = await Parentesco.findByPk(id);
      
      if (!parentesco) {
        throw new Error('Parentesco no encontrado');
      }

      // Verificar si hay otro parentesco con el mismo nombre (excluyendo el actual)
      if (parentescoData.nombre && parentescoData.nombre !== parentesco.nombre) {
        const existingParentesco = await Parentesco.findOne({
          where: { 
            nombre: parentescoData.nombre,
            id_parentesco: { [Op.ne]: id }
          }
        });

        if (existingParentesco) {
          throw new Error('Ya existe un parentesco con ese nombre');
        }
      }

      await parentesco.update(parentescoData);
      return parentesco;
    } catch (error) {
      throw new Error(`Error updating parentesco: ${error.message}`);
    }
  }

  /**
   * Eliminar un parentesco
   */
  async deleteParentesco(id) {
    try {
      const parentesco = await Parentesco.findByPk(id);
      
      if (!parentesco) {
        throw new Error('Parentesco no encontrado');
      }

      await parentesco.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting parentesco: ${error.message}`);
    }
  }
}

export default new ParentescoService();
