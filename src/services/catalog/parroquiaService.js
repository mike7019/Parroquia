import models from '../../models/index.js';
import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

// Obtener los modelos desde el índice de modelos
const getParroquiaModel = () => models.Parroquia || sequelize.models.Parroquia;
const getMunicipiosModel = () => models.Municipios || sequelize.models.Municipios;

class ParroquiaService {
  
  /**
   * Función para encontrar el próximo ID disponible (sin gaps - secuencial)
   */
  async findNextAvailableId() {
    try {
      const Parroquia = getParroquiaModel();
      
      // Obtener el ID máximo actual
      const maxIdResult = await Parroquia.findOne({
        attributes: [[sequelize.fn('MAX', sequelize.col('id_parroquia')), 'maxId']],
        raw: true
      });

      const maxId = maxIdResult?.maxId ? parseInt(maxIdResult.maxId) : 0;
      const nextId = maxId + 1;

      console.log(`� ID máximo actual: ${maxId}`);
      console.log(`✅ Siguiente ID asignado: ${nextId}`);

      return nextId;
    } catch (error) {
      logger.error('Error finding next available ID for parroquia:', error);
      throw error;
    }
  }

  /**
   * Create a new parroquia
   */
  async createParroquia(parroquiaData) {
    try {
      const Parroquia = getParroquiaModel();
      const Municipios = getMunicipiosModel();
      
      // Validate that the municipio exists if provided
      if (parroquiaData.id_municipio) {
        const municipio = await Municipios.findByPk(parroquiaData.id_municipio);
        if (!municipio) {
          throw new Error(`Municipio with ID ${parroquiaData.id_municipio} does not exist`);
        }
      }

      // Find the next available ID
      const nextId = await this.findNextAvailableId();

      // Create data object with only fields that exist in the model
      const createData = {
        id_parroquia: nextId,
        nombre: parroquiaData.nombre,
        id_municipio: parroquiaData.id_municipio
      };

      // Add optional fields only if they are provided
      if (parroquiaData.direccion !== undefined && parroquiaData.direccion !== null) {
        createData.direccion = parroquiaData.direccion;
      }
      if (parroquiaData.telefono !== undefined && parroquiaData.telefono !== null) {
        createData.telefono = parroquiaData.telefono;
      }
      if (parroquiaData.email !== undefined && parroquiaData.email !== null) {
        createData.email = parroquiaData.email;
      }
      
      // Log data being created for debugging
      console.log('📝 Creating parroquia with data:', JSON.stringify(createData, null, 2));

      const parroquia = await Parroquia.create(createData);

      // Return the parroquia with its municipio if the association exists
      return await this.getParroquiaById(parroquia.id_parroquia);
    } catch (error) {
      console.error('❌ Error creating parroquia:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if (error.errors) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(e => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('A parroquia with this name already exists in the municipality');
      }
      
      // Handle foreign key constraint errors
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Invalid municipio ID provided');
      }
      
      // Return the actual error message for debugging
      throw new Error(`Error creating parroquia: ${error.message} (Type: ${error.name})`);
    }
  }

  /**
   * Find or create a parroquia to avoid duplicates
   */
  async findOrCreateParroquia(parroquiaData) {
    try {
      const Parroquia = getParroquiaModel();
      const [parroquia, created] = await getParroquiaModel().findOrCreate({
        where: { nombre: parroquiaData.nombre },
        defaults: { nombre: parroquiaData.nombre }
      });

      return { parroquia, created };
    } catch (error) {
      throw new Error(`Error finding or creating parroquia: ${error.message}`);
    }
  }

  /**
   * Get all parroquias
   */
  async getAllParroquias() {
    try {
      const Parroquia = getParroquiaModel();

      // Check if associations exist before including them
      const includeOptions = [];
      if (Parroquia.associations && Parroquia.associations.municipio) {
        includeOptions.push({
          association: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane'],
          include: [
            {
              association: 'departamento',
              attributes: ['id_departamento', 'nombre', 'codigo_dane']
            }
          ]
        });
      }

      const parroquias = await Parroquia.findAll({
        order: [['id_parroquia', 'ASC']],
        include: includeOptions
      });

      return {
        status: 'success',
        data: parroquias,
        total: parroquias.length,
        message: `Se encontraron ${parroquias.length} parroquias`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener parroquias: ${error.message}`
      };
    }
  }

  /**
   * Get parroquia by ID
   */
  async getParroquiaById(id) {
    try {
      const includeOptions = [];
      
      // Check if the association exists before including it
      const Parroquia = getParroquiaModel();
      if (Parroquia.associations && Parroquia.associations.municipio) {
        includeOptions.push({
          association: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane'],
          include: [
            {
              association: 'departamento',
              attributes: ['id_departamento', 'nombre', 'codigo_dane']
            }
          ]
        });
      }

      const parroquia = await Parroquia.findByPk(id, {
        include: includeOptions
      });

      if (!parroquia) {
        throw new Error('Parroquia not found');
      }

      return parroquia;
    } catch (error) {
      throw new Error(`Error fetching parroquia: ${error.message}`);
    }
  }

  /**
   * Update parroquia
   */
  async updateParroquia(id, updateData) {
    try {
      const Municipios = getMunicipiosModel();
      const Parroquia = getParroquiaModel();
      const parroquia = await Parroquia.findByPk(id);
      
      if (!parroquia) {
        throw new Error('Parroquia not found');
      }

      // Validate municipio if it's being updated
      if (updateData.id_municipio && updateData.id_municipio !== parroquia.id_municipio) {
        const municipio = await Municipios.findByPk(updateData.id_municipio);
        if (!municipio) {
          throw new Error(`Municipio with ID ${updateData.id_municipio} does not exist`);
        }
      }

      // Build update object with only existing fields
      const modelAttributes = Object.keys(Parroquia.rawAttributes);
      const updateObject = {};

      if (updateData.nombre !== undefined) {
        updateObject.nombre = updateData.nombre;
      }
      
      if (updateData.id_municipio !== undefined && modelAttributes.includes('id_municipio')) {
        updateObject.id_municipio = updateData.id_municipio;
      }
      
      if (updateData.descripcion !== undefined && modelAttributes.includes('descripcion')) {
        updateObject.descripcion = updateData.descripcion;
      }
      
      if (updateData.direccion !== undefined && modelAttributes.includes('direccion')) {
        updateObject.direccion = updateData.direccion;
      }
      
      if (updateData.telefono !== undefined && modelAttributes.includes('telefono')) {
        updateObject.telefono = updateData.telefono;
      }
      
      if (updateData.email !== undefined && modelAttributes.includes('email')) {
        updateObject.email = updateData.email;
      }
      
      if (updateData.activo !== undefined && modelAttributes.includes('activo')) {
        updateObject.activo = updateData.activo;
      }

      await parroquia.update(updateObject);

      // Return updated parroquia with municipio info
      return await this.getParroquiaById(id);
    } catch (error) {
      throw new Error(`Error updating parroquia: ${error.message}`);
    }
  }

  /**
   * Delete parroquia
   */
  async deleteParroquia(id) {
    try {
      const Parroquia = getParroquiaModel();
      const parroquia = await Parroquia.findByPk(id);
      
      if (!parroquia) {
        throw new Error('Parroquia not found');
      }

      const modelAttributes = Object.keys(Parroquia.rawAttributes);
      
      // Check if we can do soft delete
      if (modelAttributes.includes('activo')) {
        // Soft delete by setting activo to false
        await parroquia.update({ activo: false });
        return { message: 'Parroquia deactivated successfully' };
      } else {
        // Check if parroquia has associated personas only if personas association exists
        try {
          const personasCount = await Parroquia.count({
            include: [{
              association: 'personas',
              required: true
            }],
            where: { id_parroquia: id }
          });

          if (personasCount > 0) {
            throw new Error('Cannot delete parroquia: it has associated personas');
          }
        } catch (associationError) {
          // If association doesn't exist, continue with delete
          console.log('Personas association not found, proceeding with delete');
        }

        await parroquia.destroy();
        return { message: 'Parroquia deleted successfully' };
      }
    } catch (error) {
      throw new Error(`Error deleting parroquia: ${error.message}`);
    }
  }

  /**
   * Get parroquia statistics
   */
  async getParroquiaStatistics() {
    try {
      const totalParroquias = await getParroquiaModel().count();
      
      return {
        totalParroquias
      };
    } catch (error) {
      throw new Error(`Error calculating parroquia statistics: ${error.message}`);
    }
  }

  /**
   * Search parroquias by name
   */
  async searchParroquias(searchTerm) {
    try {
      const parroquias = await getParroquiaModel().findAll({
        where: {
          nombre: { [Op.iLike]: `%${searchTerm}%` }
        },
        include: [
          {
            association: 'municipio',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ],
        order: [['nombre', 'ASC']],
        limit: 20
      });

      return parroquias;
    } catch (error) {
      throw new Error(`Error searching parroquias: ${error.message}`);
    }
  }

  /**
   * Get parroquias by municipio
   */
  async getParroquiasByMunicipio(municipioId) {
    try {
      const parroquias = await getParroquiaModel().findAll({
        where: { id_municipio: municipioId },
        include: [
          {
            association: 'municipio',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ],
        order: [['nombre', 'ASC']]
      });

      return parroquias;
    } catch (error) {
      throw new Error(`Error fetching parroquias by municipio: ${error.message}`);
    }
  }
}

export default new ParroquiaService();
