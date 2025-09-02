import models from '../../models/index.js';
import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

// Función para obtener modelos de forma segura
const getMunicipioModel = () => {
  const model = models.Municipios || sequelize.models.Municipios;
  if (!model) {
    throw new Error('Municipios model not found. Make sure models are loaded.');
  }
  return model;
};

const getDepartamentoModel = () => {
  const model = models.Departamentos || sequelize.models.Departamentos;
  if (!model) {
    throw new Error('Departamentos model not found. Make sure models are loaded.');
  }
  return model;
};

class MunicipioService {

  /**
   * Get all municipios with optional filters
   */
  async getAllMunicipios(options = {}) {
    try {
      const MunicipioModel = getMunicipioModel();
      const { search, sortBy = 'nombre_municipio', sortOrder = 'ASC', id_departamento } = options;

      // Construir condiciones de búsqueda
      const whereClause = {};
      if (search) {
        whereClause.nombre_municipio = {
          [Op.iLike]: `%${search}%`
        };
      }
      if (id_departamento) {
        whereClause.id_departamento = id_departamento;
      }

      const municipios = await MunicipioModel.findAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      return {
        status: 'success',
        data: municipios,
        total: municipios.length,
        message: `Se encontraron ${municipios.length} municipios`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener municipios: ${error.message}`
      };
    }
  }

  /**
   * Get municipio by ID
   */
  async getMunicipioById(id) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipio = await MunicipioModel.findByPk(id, {
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      if (!municipio) {
        throw new Error('Municipio not found');
      }

      return municipio;
    } catch (error) {
      throw new Error(`Error fetching municipio: ${error.message}`);
    }
  }

  /**
   * Get municipio by codigo DANE
   */
  async getMunicipioByCodigoDane(codigo_dane) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipio = await MunicipioModel.findOne({
        where: { codigo_dane },
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      if (!municipio) {
        throw new Error('Municipio not found with the provided codigo DANE');
      }

      return municipio;
    } catch (error) {
      throw new Error(`Error fetching municipio by codigo DANE: ${error.message}`);
    }
  }

  /**
   * Search municipios by name
   */
  async searchMunicipiosByName(query) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipios = await MunicipioModel.findAll({
        where: {
          nombre_municipio: {
            [Op.iLike]: `%${query}%`
          }
        },
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ],
        order: [['nombre_municipio', 'ASC']],
        limit: 10
      });

      return municipios;
    } catch (error) {
      throw new Error(`Error searching municipios: ${error.message}`);
    }
  }

  /**
   * Get municipios statistics
   */
  async getStatistics() {
    try {
      const MunicipioModel = getMunicipioModel();
      
      const totalMunicipios = await MunicipioModel.count();

      return {
        totalMunicipios
      };
    } catch (error) {
      throw new Error(`Error getting municipios statistics: ${error.message}`);
    }
  }

  /**
   * Get municipios by departamento
   */
  async getMunicipiosByDepartamento(id_departamento) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipios = await MunicipioModel.findAll({
        where: { id_departamento },
        order: [['nombre_municipio', 'ASC']],
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      return municipios;
    } catch (error) {
      throw new Error(`Error fetching municipios by departamento: ${error.message}`);
    }
  }
}

export default new MunicipioService();
