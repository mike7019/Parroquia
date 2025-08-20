// import { Veredas } from '../../models/index.js'; // TEMPORALMENTE DESACTIVADO
import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

// Obtener el modelo Veredas desde Sequelize una vez que se cargue
const getVeredasModel = () => sequelize.models.Veredas;

class VeredaService {
  /**
   * Find or create a vereda (prevents duplicates)
   */
  async findOrCreateVereda(veredaData) {
    try {
      // Build where conditions dynamically
      const whereConditions = [
        { nombre: veredaData.nombre }
      ];
      
      // Only add codigo_vereda condition if it's provided
      if (veredaData.codigo_vereda) {
        whereConditions.push({ codigo_vereda: veredaData.codigo_vereda });
      }
      
      const [vereda, created] = await getVeredasModel().findOrCreate({
        where: {
          [Op.or]: whereConditions
        },
        defaults: {
          nombre: veredaData.nombre,
          codigo_vereda: veredaData.codigo_vereda || null,
          id_municipio_municipios: veredaData.id_municipio || null
        }
      });

      return {
        vereda,
        created
      };
    } catch (error) {
      throw new Error(`Error finding or creating vereda: ${error.message}`);
    }
  }

  /**
   * Create a new vereda
   */
  async createVereda(veredaData) {
    try {
      const vereda = await getVeredasModel().create({
        nombre: veredaData.nombre,
        codigo_vereda: veredaData.codigo_vereda || null,
        id_municipio_municipios: veredaData.id_municipio || null
      });

      return vereda;
    } catch (error) {
      throw new Error(`Error creating vereda: ${error.message}`);
    }
  }

  /**
   * Get all veredas
   */
  async getAllVeredas() {
    try {
      const veredas = await getVeredasModel().findAll({
        include: [{
          model: sequelize.models.Municipios,
          as: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane'],
          required: false
        }],
        order: [['id_vereda', 'ASC']]
      });

      return {
        status: 'success',
        data: veredas,
        total: veredas.length,
        message: `Se encontraron ${veredas.length} veredas`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener veredas: ${error.message}`
      };
    }
  }

  /**
   * Get vereda by ID
   */
  async getVeredaById(id) {
    try {
      const vereda = await getVeredasModel().findByPk(id, {
        include: [{
          model: sequelize.models.Municipios,
          as: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane'],
          required: false
        }]
      });

      if (!vereda) {
        throw new Error('Vereda not found');
      }

      return vereda;
    } catch (error) {
      throw new Error(`Error fetching vereda: ${error.message}`);
    }
  }

  /**
   * Update vereda
   */
  async updateVereda(id, updateData) {
    try {
      const vereda = await getVeredasModel().findByPk(id);
      
      if (!vereda) {
        throw new Error('Vereda not found');
      }

      const updateFields = {};
      
      if (updateData.nombre !== undefined) {
        updateFields.nombre = updateData.nombre;
      }
      if (updateData.codigo_vereda !== undefined) updateFields.codigo_vereda = updateData.codigo_vereda;
      if (updateData.id_municipio !== undefined) updateFields.id_municipio_municipios = updateData.id_municipio;

      await vereda.update(updateFields);

      return vereda;
    } catch (error) {
      throw new Error(`Error updating vereda: ${error.message}`);
    }
  }

  /**
   * Delete vereda
   */
  async deleteVereda(id) {
    try {
      const vereda = await getVeredasModel().findByPk(id);
      
      if (!vereda) {
        throw new Error('Vereda not found');
      }

      // Check if vereda is being used in familias table
      const familiaCount = await sequelize.models.Familia?.count({
        where: { id_vereda: id }
      }) || 0;

      if (familiaCount > 0) {
        throw new Error('Cannot delete vereda because it is associated with families');
      }

      await vereda.destroy();
      return { message: 'Vereda deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting vereda: ${error.message}`);
    }
  }

  /**
   * Get veredas by municipio
   */
  async getVeredasByMunicipio(municipioId) {
    try {
      const veredas = await getVeredasModel().findAll({
        where: { id_municipio_municipios: municipioId },
        include: [{
          model: sequelize.models.Municipios,
          as: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane'],
          required: false
        }],
        order: [['nombre', 'ASC']]
      });

      return veredas;
    } catch (error) {
      throw new Error(`Error fetching veredas by municipio: ${error.message}`);
    }
  }

  /**
   * Get vereda statistics
   */
  async getVeredaStatistics(veredaId = null) {
    try {
      const where = veredaId ? { id_vereda: veredaId } : {};

      const totalVeredas = await getVeredasModel().count({ where });
      
      const veredas = await getVeredasModel().findAll({
        where,
        attributes: ['id_vereda', 'nombre', 'codigo_vereda', 'id_municipio_municipios'],
        order: [['nombre', 'ASC']]
      });

      const statistics = {
        totalVeredas,
        veredas: veredas.map(vereda => ({
          id: vereda.id_vereda,
          nombre: vereda.nombre,
          codigo: vereda.codigo_vereda,
          municipioId: vereda.id_municipio_municipios
        })),
        lastUpdated: new Date().toISOString()
      };

      return statistics;
    } catch (error) {
      throw new Error(`Error getting vereda statistics: ${error.message}`);
    }
  }

  /**
   * Search veredas
   */
  async searchVeredas(searchTerm, options = {}) {
    try {
      const { municipioId = null } = options;
      
      const where = {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${searchTerm}%` } },
          { codigo_vereda: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      };

      if (municipioId) {
        where.id_municipio_municipios = municipioId;
      }

      const veredas = await getVeredasModel().findAll({
        where,
        include: [{
          model: sequelize.models.Municipios,
          as: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane'],
          required: false
        }],
        order: [['nombre', 'ASC']]
      });

      return veredas;
    } catch (error) {
      throw new Error(`Error searching veredas: ${error.message}`);
    }
  }

  /**
   * Get vereda with full details including counts
   */
  async getVeredaDetails(id) {
    try {
      const vereda = await getVeredasModel().findByPk(id);

      if (!vereda) {
        throw new Error('Vereda not found');
      }

      return {
        ...vereda.toJSON(),
        counts: {
          personas: 0,
          sectores: 0
        }
      };
    } catch (error) {
      throw new Error(`Error fetching vereda details: ${error.message}`);
    }
  }
}

export default new VeredaService();
