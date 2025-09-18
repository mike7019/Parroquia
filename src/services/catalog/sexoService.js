// import { Sexo } from '../../models/index.js'; // TEMPORALMENTE DESACTIVADO
import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

// Obtener el modelo Sexo desde Sequelize una vez que se cargue
const getSexoModel = () => sequelize.models.Sexo;

class SexoService {
  /**
   * Create a new sexo
   */
  async createSexo(sexoData) {
    try {
      const { nombre, descripcion } = sexoData;

      // Check if sexo already exists
      const existingSexo = await getSexoModel().findOne({
        where: { 
          nombre: { [Op.iLike]: nombre }
        }
      });

      if (existingSexo) {
        throw new Error('Sexo with this name already exists');
      }

      const sexo = await getSexoModel().create({ nombre, descripcion });
      return sexo;
    } catch (error) {
      throw new Error(`Error creating sexo: ${error.message}`);
    }
  }

  /**
   * Get sexo by ID
   */
  async getSexoById(id) {
    try {
      const sexo = await getSexoModel().findByPk(id);
      
      if (!sexo) {
        throw new Error('Sexo not found');
      }

      return sexo;
    } catch (error) {
      throw new Error(`Error fetching sexo: ${error.message}`);
    }
  }

  /**
   * Update sexo
   */
  async updateSexo(id, sexoData) {
    try {
      const { nombre, descripcion } = sexoData;

      const sexo = await getSexoModel().findByPk(id);
      if (!sexo) {
        throw new Error('Sexo not found');
      }

      // Solo verificar duplicados por nombre si se está actualizando
      if (nombre !== undefined && nombre !== sexo.nombre) {
        const existingSexo = await getSexoModel().findOne({
          where: { 
            nombre: { [Op.iLike]: nombre },
            id_sexo: { [Op.ne]: id }
          }
        });

        if (existingSexo) {
          throw new Error('Sexo with this name already exists');
        }
      }

      // Solo actualizar campos que están presentes en sexoData
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;

      await sexo.update(updateData);
      await sexo.reload(); // Recargar para obtener los valores actualizados
      return sexo;
    } catch (error) {
      throw new Error(`Error updating sexo: ${error.message}`);
    }
  }

  /**
   * Delete sexo
   */
  async deleteSexo(id) {
    try {
      const sexo = await getSexoModel().findByPk(id);
      
      if (!sexo) {
        throw new Error('Sexo not found');
      }

      // Check if sexo is being used in personas table
      const personaCount = await sequelize.models.Persona?.count({
        where: { id_sexo: id }
      }) || 0;

      if (personaCount > 0) {
        throw new Error('Cannot delete sexo because it is associated with personas');
      }

      await sexo.destroy();
      return { message: 'Sexo deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting sexo: ${error.message}`);
    }
  }

  /**
   * Search sexos
   */
  async searchSexos(query, limit = 20) {
    try {
      if (!query || query.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      const sexos = await getSexoModel().findAll({
        where: {
          nombre: { [Op.iLike]: `%${query}%` }
        },
        order: [['nombre', 'ASC']],
        limit: parseInt(limit)
      });

      return sexos;
    } catch (error) {
      throw new Error(`Error searching sexos: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const totalSexos = await getSexoModel().count();
      
      return {
        totalSexos
      };
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  }

  /**
   * Find or create a sexo to avoid duplicates
   */
  async findOrCreateSexo(sexoData) {
    try {
      const [sexo, created] = await getSexoModel().findOrCreate({
        where: { nombre: sexoData.sexo },
        defaults: { nombre: sexoData.sexo }
      });

      return { sexo, created };
    } catch (error) {
      throw new Error(`Error finding or creating sexo: ${error.message}`);
    }
  }

  /**
   * Get all sexos
   */
  async getAllSexos() {
    try {
      const sexos = await getSexoModel().findAll({
        order: [['id_sexo', 'ASC']]
      });

      return {
        status: 'success',
        data: sexos,
        total: sexos.length,
        message: `Se encontraron ${sexos.length} sexos`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener sexos: ${error.message}`
      };
    }
  }
}

export default new SexoService();
