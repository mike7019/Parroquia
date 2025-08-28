import sequelize from '../../../config/sequelize.js';

// Función para obtener modelos de forma segura
const getMunicipioModel = () => {
  const model = sequelize.models.Municipio || sequelize.models.Municipios;
  if (!model) {
    throw new Error('Municipio model not found. Make sure models are loaded.');
  }
  return model;
};

const getDepartamentoModel = () => {
  const model = sequelize.models.Departamento || sequelize.models.Departamentos;
  if (!model) {
    throw new Error('Departamento model not found. Make sure models are loaded.');
  }
  return model;
};

class MunicipioService {
  /**
   * Find or create a municipio (prevents duplicates)
   */
  async findOrCreateMunicipio(municipioData) {
    try {
      const MunicipioModel = getMunicipioModel();
      const DepartamentoModel = getDepartamentoModel();

      // Validate that the departamento exists
      if (municipioData.id_departamento) {
        const departamento = await DepartamentoModel.findByPk(municipioData.id_departamento);
        if (!departamento) {
          throw new Error(`Departamento with ID ${municipioData.id_departamento} does not exist`);
        }
      }

      // Verificar si existe por nombre o código DANE
      let existingMunicipio = await MunicipioModel.findOne({
        where: { nombre_municipio: municipioData.nombre_municipio }
      });

      if (!existingMunicipio && municipioData.codigo_dane) {
        existingMunicipio = await MunicipioModel.findOne({
          where: { codigo_dane: municipioData.codigo_dane }
        });
      }

      if (existingMunicipio) {
        return {
          municipio: await this.getMunicipioById(existingMunicipio.id_municipio),
          created: false
        };
      }

      const municipio = await MunicipioModel.create(municipioData);
      return {
        municipio: await this.getMunicipioById(municipio.id_municipio),
        created: true
      };
    } catch (error) {
      throw new Error(`Error finding or creating municipio: ${error.message}`);
    }
  }

  /**
   * Create a new municipio
   */
  async createMunicipio(municipioData) {
    try {
      const MunicipioModel = getMunicipioModel();
      const DepartamentoModel = getDepartamentoModel();

      // Validate that the departamento exists
      if (municipioData.id_departamento) {
        const departamento = await DepartamentoModel.findByPk(municipioData.id_departamento);
        if (!departamento) {
          throw new Error(`Departamento with ID ${municipioData.id_departamento} does not exist`);
        }
      }

      const municipio = await MunicipioModel.create(municipioData);

      // Devolver el municipio con su departamento
      return await this.getMunicipioById(municipio.id_municipio);
    } catch (error) {
      throw new Error(`Error creating municipio: ${error.message}`);
    }
  }

  /**
   * Get all municipios
   */
  async getAllMunicipios() {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipios = await MunicipioModel.findAll({
        order: [['nombre_municipio', 'ASC']],
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
   * Update municipio
   */
  async updateMunicipio(id, updateData) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipio = await MunicipioModel.findByPk(id);

      if (!municipio) {
        throw new Error('Municipio not found');
      }

      await municipio.update(updateData);

      // Devolver el municipio actualizado con su departamento
      return await this.getMunicipioById(id);
    } catch (error) {
      throw new Error(`Error updating municipio: ${error.message}`);
    }
  }

  /**
   * Delete municipio
   */
  async deleteMunicipio(id) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipio = await MunicipioModel.findByPk(id);

      if (!municipio) {
        throw new Error('Municipio not found');
      }

      await municipio.destroy();
      
      return { message: 'Municipio deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting municipio: ${error.message}`);
    }
  }

  /**
   * Bulk create municipios
   */
  async bulkCreateMunicipios(municipiosData) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipios = municipiosData.map(item => {
        if (typeof item === 'string') {
          return { nombre_municipio: item };
        }
        return {
          nombre_municipio: item.nombre,
          codigo_dane: item.codigo_dane,
          id_departamento: item.id_departamento,
          departamento: item.departamento // Campo legacy
        };
      });

      const result = await MunicipioModel.bulkCreate(municipios, {
        ignoreDuplicates: true,
        returning: true
      });

      return result;
    } catch (error) {
      throw new Error(`Error bulk creating municipios: ${error.message}`);
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

  /**
   * Get all available departamentos
   */
  async getAllDepartamentos() {
    try {
      const DepartamentoModel = getDepartamentoModel();

      const departamentos = await DepartamentoModel.findAll({
        order: [['nombre', 'ASC']]
      });

      return departamentos;
    } catch (error) {
      throw new Error(`Error fetching departamentos: ${error.message}`);
    }
  }
}

export default new MunicipioService();
