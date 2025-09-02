import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';
import { Sector, Municipios } from '../../models/index.js';

// Helper functions to get models
const getSectorModel = () => Sector;
const getMunicipiosModel = () => Municipios;

class SectorService {
  /**
   * Create a new sector
   */
  async createSector(sectorData) {
    try {
      // Validar que el municipio existe
      if (sectorData.id_municipio) {
        const municipio = await getMunicipiosModel().findByPk(sectorData.id_municipio);
        if (!municipio) {
          throw new Error('El municipio especificado no existe');
        }
      }

      // Verificar que no existe otro sector con el mismo nombre en el mismo municipio
      const existingSector = await getSectorModel().findOne({
        where: { 
          nombre: sectorData.nombre,
          id_municipio: sectorData.id_municipio
        }
      });

      if (existingSector) {
        throw new Error('Ya existe un sector con ese nombre en este municipio');
      }

      const sector = await getSectorModel().create(sectorData);
      
      // Return created sector with municipio info
      const sectorWithMunicipio = await getSectorModel().findByPk(sector.id_sector, {
        include: [{
          model: getMunicipiosModel(),
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
          model: getMunicipiosModel(),
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
        const municipio = await getMunicipiosModel().findByPk(updateData.id_municipio);
        if (!municipio) {
          throw new Error('El municipio especificado no existe');
        }
      }

      // Verificar que no existe otro sector con el mismo nombre en el mismo municipio (excluyendo el actual)
      if (updateData.nombre && updateData.nombre !== sector.nombre) {
        const existingSector = await getSectorModel().findOne({
          where: { 
            nombre: updateData.nombre,
            id_municipio: updateData.id_municipio || sector.id_municipio,
            id_sector: { [Op.ne]: id }
          }
        });

        if (existingSector) {
          throw new Error('Ya existe un sector con ese nombre en este municipio');
        }
      }

      await sector.update(updateData);
      
      // Return updated sector with municipio info
      const updatedSector = await getSectorModel().findByPk(id, {
        include: [{
          model: getMunicipiosModel(),
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

}

export default new SectorService();
