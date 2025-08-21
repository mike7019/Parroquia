import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';
// Importar directamente los modelos para asegurar que las asociaciones estén definidas
import Sector from '../../models/catalog/Sector.js';
import Municipios from '../../models/catalog/Municipios.js';

// Asegurar que las asociaciones estén definidas
if (!Sector.associations.municipio) {
  Sector.belongsTo(Municipios, {
    foreignKey: 'id_municipio',
    as: 'municipio'
  });
}

if (!Municipios.associations.sectores) {
  Municipios.hasMany(Sector, {
    foreignKey: 'id_municipio',
    as: 'sectores'
  });
}

// Obtener el modelo Sector desde Sequelize una vez que se cargue
const getSectorModel = () => Sector;
const getMunicipioModel = () => Municipios;

class SectorService {
  /**
   * Create a new sector
   */
  async createSector(sectorData) {
    try {
      // Validar que el municipio existe
      if (sectorData.id_municipio) {
        const municipio = await getMunicipioModel().findByPk(sectorData.id_municipio);
        if (!municipio) {
          throw new Error('El municipio especificado no existe');
        }
      }

      // Verificar que no existe otro sector con el mismo nombre
      const existingSector = await getSectorModel().findOne({
        where: { nombre: sectorData.nombre }
      });

      if (existingSector) {
        throw new Error('Ya existe un sector con ese nombre');
      }

      const sector = await getSectorModel().create(sectorData);
      
      // Return created sector with municipio info
      const sectorWithMunicipio = await getSectorModel().findByPk(sector.id_sector, {
        include: [{
          model: getMunicipioModel(),
          as: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio']
        }]
      });
      
      return sectorWithMunicipio;
    } catch (error) {
      throw new Error(`Error creating sector: ${error.message}`);
    }
  }

  /**
   * Find or create a sector to avoid duplicates
   */
  async findOrCreateSector(sectorData) {
    try {
      const [sector, created] = await getSectorModel().findOrCreate({
        where: { nombre: sectorData.nombre },
        defaults: sectorData
      });

      return { sector, created };
    } catch (error) {
      throw new Error(`Error finding or creating sector: ${error.message}`);
    }
  }

  /**
   * Get all sectors
   */
  async getAllSectors() {
    try {
      const sectors = await getSectorModel().findAll({
        include: [{
          model: getMunicipioModel(),
          as: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio']
        }],
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: sectors,
        total: sectors.length,
        message: `Se encontraron ${sectors.length} sectores`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener sectores: ${error.message}`
      };
    }
  }

  /**
   * Get sector by ID
   */
  async getSectorById(id) {
    try {
      const sector = await getSectorModel().findByPk(id, {
        include: [{
          model: getMunicipioModel(),
          as: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio']
        }]
      });
      if (!sector) {
        throw new Error('Sector not found');
      }
      return sector;
    } catch (error) {
      throw new Error(`Error fetching sector: ${error.message}`);
    }
  }

  /**
   * Update sector
   */
  async updateSector(id, updateData) {
    try {
      const sector = await getSectorModel().findByPk(id);
      if (!sector) {
        throw new Error('Sector no encontrado');
      }

      // Validar que el municipio existe si se está actualizando
      if (updateData.id_municipio) {
        const municipio = await getMunicipioModel().findByPk(updateData.id_municipio);
        if (!municipio) {
          throw new Error('El municipio especificado no existe');
        }
      }

      // Verificar que no existe otro sector con el mismo nombre (excluyendo el actual)
      if (updateData.nombre && updateData.nombre !== sector.nombre) {
        const existingSector = await getSectorModel().findOne({
          where: { 
            nombre: updateData.nombre,
            id_sector: { [Op.ne]: id }
          }
        });

        if (existingSector) {
          throw new Error('Ya existe un sector con ese nombre');
        }
      }

      await sector.update(updateData);
      
      // Return updated sector with municipio info
      const updatedSector = await getSectorModel().findByPk(id, {
        include: [{
          model: getMunicipioModel(),
          as: 'municipio',
          attributes: ['id_municipio', 'nombre_municipio']
        }]
      });
      
      return updatedSector;
    } catch (error) {
      throw new Error(`Error updating sector: ${error.message}`);
    }
  }

  /**
   * Delete sector
   */
  async deleteSector(id) {
    try {
      const sector = await getSectorModel().findByPk(id);
      if (!sector) {
        throw new Error('Sector not found');
      }

      await sector.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting sector: ${error.message}`);
    }
  }

  /**
   * Check if sector exists by name
   */
  async sectorExistsByName(nombre, excludeId = null) {
    try {
      const whereClause = { nombre };
      
      if (excludeId) {
        whereClause.id_sector = { [Op.ne]: excludeId };
      }

      const sector = await getSectorModel().findOne({ where: whereClause });
      return !!sector;
    } catch (error) {
      throw new Error(`Error checking sector existence: ${error.message}`);
    }
  }

  /**
   * Get all available municipios for sector creation
   */
  async getAvailableMunicipios() {
    try {
      const municipios = await getMunicipioModel().findAll({
        attributes: ['id_municipio', 'nombre_municipio'],
        order: [['nombre_municipio', 'ASC']]
      });

      return {
        status: 'success',
        data: municipios,
        total: municipios.length,
        message: `Se encontraron ${municipios.length} municipios disponibles`
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
}

export default new SectorService();
