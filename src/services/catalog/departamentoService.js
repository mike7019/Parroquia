// import { Departamento } from '../../models/index.js'; // TEMPORALMENTE DESACTIVADO
import sequelize from '../../../config/sequelize.js';

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
      // Verificar si existe por nombre o código DANE
      let existingDepartamento = await getDepartamentoModel().findOne({
        where: { nombre: departamentoData.nombre }
      });

      if (!existingDepartamento && departamentoData.codigo_dane) {
        existingDepartamento = await getDepartamentoModel().findOne({
          where: { codigo_dane: departamentoData.codigo_dane }
        });
      }

      if (existingDepartamento) {
        return { departamento: existingDepartamento, created: false };
      }

      const departamento = await getDepartamentoModel().create(departamentoData);
      return { departamento, created: true };
    } catch (error) {
      throw new Error(`Error finding or creating departamento: ${error.message}`);
    }
  }

  /**
   * Get all departamentos
   */
  async getAllDepartamentos() {
    try {
      const departamentos = await getDepartamentoModel().findAll({
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: departamentos,
        total: departamentos.length,
        message: `Se encontraron ${departamentos.length} departamentos`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener departamentos: ${error.message}`
      };
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

