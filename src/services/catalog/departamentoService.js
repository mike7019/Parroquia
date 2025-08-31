// import { Departamento } from '../../models/index.js'; // TEMPORALMENTE DESACTIVADO
import sequelize from '../../../config/sequelize.js';

// Obtener el modelo Departamento desde Sequelize una vez que se cargue
const getDepartamentoModel = () => sequelize.models.Departamentos || sequelize.models.Departamento;

class DepartamentoService {
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

  /**
   * Search departamentos by name (partial match)
   */
  async searchDepartamentosByName(searchTerm) {
    try {
      const departamentos = await getDepartamentoModel().findAll({
        where: {
          nombre: {
            [sequelize.Sequelize.Op.iLike]: `%${searchTerm}%`
          }
        },
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: departamentos,
        total: departamentos.length,
        message: `Se encontraron ${departamentos.length} departamentos que coinciden con "${searchTerm}"`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al buscar departamentos: ${error.message}`
      };
    }
  }
}

export default new DepartamentoService();

