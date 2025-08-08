// import { Parroquia } from '../../models/index.js'; // TEMPORALMENTE DESACTIVADO
import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

// Obtener los modelos desde Sequelize una vez que se carguen
const getParroquiaModel = () => sequelize.models.Parroquia;
const getMunicipiosModel = () => sequelize.models.Municipios;

class ParroquiaService {
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

      // Create data object with only available fields
      const createData = {
        nombre: parroquiaData.nombre
      };

      // Add optional fields only if they exist in the model
      const modelAttributes = Object.keys(Parroquia.rawAttributes);
      
      if (modelAttributes.includes('id_municipio') && parroquiaData.id_municipio) {
        createData.id_municipio = parroquiaData.id_municipio;
      }
      if (modelAttributes.includes('descripcion') && parroquiaData.descripcion) {
        createData.descripcion = parroquiaData.descripcion;
      }
      if (modelAttributes.includes('direccion') && parroquiaData.direccion) {
        createData.direccion = parroquiaData.direccion;
      }
      if (modelAttributes.includes('telefono') && parroquiaData.telefono) {
        createData.telefono = parroquiaData.telefono;
      }
      if (modelAttributes.includes('email') && parroquiaData.email) {
        createData.email = parroquiaData.email;
      }
      if (modelAttributes.includes('activo')) {
        createData.activo = parroquiaData.activo !== undefined ? parroquiaData.activo : true;
      }

      const parroquia = await Parroquia.create(createData);

      // Return the parroquia with its municipio if the association exists
      return await this.getParroquiaById(parroquia.id_parroquia);
    } catch (error) {
      throw new Error(`Error creating parroquia: ${error.message}`);
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
   * Get all parroquias with pagination and search
   */
  async getAllParroquias(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = null,
        sortBy = 'id_parroquia',
        sortOrder = 'ASC',
        id_municipio = null
      } = options;

      const where = {};
      const Parroquia = getParroquiaModel();
      const modelAttributes = Object.keys(Parroquia.rawAttributes);
      
      if (search) {
        const searchConditions = [
          { nombre: { [Op.iLike]: `%${search}%` } }
        ];
        
        // Only add descripcion search if the field exists
        if (modelAttributes.includes('descripcion')) {
          searchConditions.push({ descripcion: { [Op.iLike]: `%${search}%` } });
        }
        
        where[Op.or] = searchConditions;
      }

      if (id_municipio && modelAttributes.includes('id_municipio')) {
        where.id_municipio = id_municipio;
      }

      const offset = (page - 1) * limit;

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

      const result = await Parroquia.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: includeOptions
      });

      return {
        parroquias: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching parroquias: ${error.message}`);
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
      const [
        totalParroquias,
        parroquiasWithPersonas,
        totalPersonas
      ] = await Promise.all([
        getParroquiaModel().count(),
        getParroquiaModel().count({
          include: [{
            association: 'personas',
            required: true
          }]
        }),
        getParroquiaModel().findAll({
          attributes: [
            'id_parroquia',
            'nombre',
            [sequelize.fn('COUNT', sequelize.col('personas.id')), 'personasCount']
          ],
          include: [{
            association: 'personas',
            attributes: [],
            required: false
          }],
          group: ['getParroquiaModel().id_parroquia', 'getParroquiaModel().nombre'],
          raw: true
        })
      ]);

      return {
        totalParroquias,
        parroquiasWithPersonas,
        parroquiasWithoutPersonas: totalParroquias - parroquiasWithPersonas,
        detailedStats: totalPersonas
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
