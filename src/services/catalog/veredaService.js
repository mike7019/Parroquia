import { Veredas, Municipios, Familias, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

// Usar el modelo importado directamente
const getVeredasModel = () => Veredas;

class VeredaService {
  
  /**
   * Función para encontrar el próximo ID disponible reutilizando gaps
   */
  async findNextAvailableId() {
    try {
      // Obtener todos los IDs existentes ordenados
      const existingIds = await getVeredasModel().findAll({
        attributes: ['id_vereda'],
        order: [['id_vereda', 'ASC']],
        raw: true
      });

      // Si no hay registros, empezar desde 1
      if (existingIds.length === 0) {
        return 1;
      }

      // Buscar el primer gap en la secuencia
      for (let i = 0; i < existingIds.length; i++) {
        const expectedId = i + 1;
        const actualId = existingIds[i].id_vereda;
        
        if (actualId !== expectedId) {
          return expectedId;
        }
      }

      // Si no hay gaps, usar el siguiente ID después del último
      return existingIds.length + 1;
    } catch (error) {
      logger.error('Error finding next available ID for vereda:', error);
      throw error;
    }
  }

  /**
   * Generate next vereda code
   */
  async generateNextVeredaCode() {
    try {
      // Encontrar el último código usado
      const lastVereda = await getVeredasModel().findOne({
        where: {
          codigo_vereda: {
            [Op.not]: null,
            [Op.like]: 'V%'
          }
        },
        order: [
          [sequelize.literal(`CAST(SUBSTRING(codigo_vereda FROM 2) AS INTEGER)`), 'DESC']
        ],
        limit: 1
      });

      let nextNumber = 1;
      if (lastVereda && lastVereda.codigo_vereda) {
        const currentNumber = parseInt(lastVereda.codigo_vereda.substring(1));
        nextNumber = currentNumber + 1;
      }

      // Formatear como V001, V002, etc.
      return `V${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      // Si hay error, buscar manualmente
      const allVeredas = await getVeredasModel().findAll({
        where: {
          codigo_vereda: {
            [Op.not]: null
          }
        },
        attributes: ['codigo_vereda']
      });

      const numbers = allVeredas
        .map(v => v.codigo_vereda)
        .filter(code => code && code.startsWith('V'))
        .map(code => parseInt(code.substring(1)))
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a);

      const nextNumber = numbers.length > 0 ? numbers[0] + 1 : 1;
      return `V${nextNumber.toString().padStart(3, '0')}`;
    }
  }

  /**
   * Find or create a vereda (prevents duplicates)
   */
  async findOrCreateVereda(veredaData) {
    try {
      // Generar código automáticamente si no se proporciona
      if (!veredaData.codigo_vereda) {
        veredaData.codigo_vereda = await this.generateNextVeredaCode();
      }

      const [vereda, created] = await getVeredasModel().findOrCreate({
        where: {
          nombre: veredaData.nombre
        },
        defaults: {
          nombre: veredaData.nombre,
          codigo_vereda: veredaData.codigo_vereda,
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
      // Generar código automáticamente si no se proporciona
      if (!veredaData.codigo_vereda) {
        veredaData.codigo_vereda = await this.generateNextVeredaCode();
      }

      // Find the next available ID
      const nextId = await this.findNextAvailableId();

      const vereda = await getVeredasModel().create({
        id_vereda: nextId,
        nombre: veredaData.nombre,
        codigo_vereda: veredaData.codigo_vereda,
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
          model: Municipios,
          as: 'municipio',
          attributes: [
            'id_municipio',
            ['nombre_municipio', 'nombre'],
            ['codigo_dane', 'codigo']
          ],
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
          model: Municipios,
          as: 'municipio',
          attributes: [
            'id_municipio',
            ['nombre_municipio', 'nombre'],
            ['codigo_dane', 'codigo']
          ],
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
      const familiaCount = await Familias?.count({
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
          model: Municipios,
          as: 'municipio',
          attributes: [
            'id_municipio',
            ['nombre_municipio', 'nombre'],
            ['codigo_dane', 'codigo']
          ],
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
          model: Municipios,
          as: 'municipio',
          attributes: [
            'id_municipio',
            ['nombre_municipio', 'nombre'],
            ['codigo_dane', 'codigo']
          ],
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
