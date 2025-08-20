// import { Departamento } from '../../models/index.js'; // TEMPORALMENTE DESACTIVADO
import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

// Obtener el modelo Departamento desde Sequelize una vez que se cargue
const getDepartamentoModel = () => sequelize.models.Departamento;

class DepartamentoService {
  /**
   * Create a new departamento
   */
  async createDepartamento(departamentoData) {
    try {
      const departamento = await getDepartamentoModel().create(departamentoData);
      return departamento;
    } catch (error) {
      throw new Error(`Error creating departamento: ${error.message}`);
    }
  }

  /**
   * Find or create a departamento to avoid duplicates
   */
  async findOrCreateDepartamento(departamentoData) {
    try {
      const [departamento, created] = await getDepartamentoModel().findOrCreate({
        where: { 
          [Op.or]: [
            { nombre: departamentoData.nombre },
            { codigo_dane: departamentoData.codigo_dane }
          ]
        },
        defaults: departamentoData
      });

      return { departamento, created };
    } catch (error) {
      throw new Error(`Error finding or creating departamento: ${error.message}`);
    }
  }

  /**
   * Get all departamentos with pagination and search
   */
  async getAllDepartamentos(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = null,
        sortBy = 'nombre',
        sortOrder = 'ASC'
      } = options;

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { codigo_dane: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const result = await getDepartamentoModel().findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        departamentos: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching departamentos: ${error.message}`);
    }
  }

  /**
   * Get departamento by ID
   */
  async getDepartamentoById(id) {
    try {
      const departamento = await getDepartamentoModel().findByPk(id);

      if (!departamento) {
        throw new Error('Departamento not found');
      }

      return departamento;
    } catch (error) {
      throw new Error(`Error fetching departamento: ${error.message}`);
    }
  }

  /**
   * Get departamento by codigo DANE
   */
  async getDepartamentoByCodigoDane(codigo_dane) {
    try {
      const departamento = await getDepartamentoModel().findOne({
        where: { codigo_dane }
      });

      if (!departamento) {
        throw new Error('Departamento not found with the provided codigo DANE');
      }

      return departamento;
    } catch (error) {
      throw new Error(`Error fetching departamento by codigo DANE: ${error.message}`);
    }
  }

  /**
   * Update departamento
   */
  async updateDepartamento(id, updateData) {
    try {
      const departamento = await getDepartamentoModel().findByPk(id);

      if (!departamento) {
        throw new Error('Departamento not found');
      }

      await departamento.update(updateData);

      return departamento;
    } catch (error) {
      throw new Error(`Error updating departamento: ${error.message}`);
    }
  }

  /**
   * Delete departamento
   */
  async deleteDepartamento(id) {
    try {
      const departamento = await getDepartamentoModel().findByPk(id);

      if (!departamento) {
        throw new Error('Departamento not found');
      }

      await departamento.destroy();
      
      return { message: 'Departamento deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting departamento: ${error.message}`);
    }
  }

  /**
   * Search departamentos
   */
  async searchDepartamentos(query, limit = 20) {
    try {
      if (!query || query.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      const departamentos = await getDepartamentoModel().findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${query}%` } },
            { codigo_dane: { [Op.iLike]: `%${query}%` } }
          ]
        },
        order: [['nombre', 'ASC']],
        limit: parseInt(limit)
      });

      return departamentos;
    } catch (error) {
      throw new Error(`Error searching departamentos: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const totalDepartamentos = await getDepartamentoModel().count();
      
      return {
        totalDepartamentos
      };
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  }
}

export default new DepartamentoService();

