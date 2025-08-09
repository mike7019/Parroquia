import sequelize from '../../../config/sequelize.js';
import '../../../config/sequelize.js';
import '../../models/index.js'; // Asegurar que los modelos estén importados
import { Op } from 'sequelize';

// Obtener el modelo Enfermedad desde Sequelize una vez que se cargue
const getEnfermedadModel = () => sequelize.models.Enfermedad;

class EnfermedadService {
  /**
   * Find or create an enfermedad to avoid duplicates
   */
  async findOrCreateEnfermedad(enfermedadData) {
    try {
      const [enfermedad, created] = await getEnfermedadModel().findOrCreate({
        where: { nombre: enfermedadData.nombre },
        defaults: {
          nombre: enfermedadData.nombre,
          descripcion: enfermedadData.descripcion
        }
      });

      return { enfermedad, created };
    } catch (error) {
      throw new Error(`Error finding or creating enfermedad: ${error.message}`);
    }
  }

  /**
   * Get all enfermedades with search
   */
  async getAllEnfermedades(options = {}) {
    try {
      const {
        search = null,
        sortBy = 'id_enfermedad',
        sortOrder = 'ASC'
      } = options;

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const enfermedades = await getEnfermedadModel().findAll({
        where,
        order: [[sortBy, sortOrder]]
      });

      return {
        enfermedades,
        totalCount: enfermedades.length
      };
    } catch (error) {
      throw new Error(`Error fetching enfermedades: ${error.message}`);
    }
  }

  /**
   * Get enfermedad by ID
   */
  async getEnfermedadById(id) {
    try {
      const enfermedad = await getEnfermedadModel().findByPk(id);

      if (!enfermedad) {
        throw new Error('Enfermedad not found');
      }

      return enfermedad;
    } catch (error) {
      throw new Error(`Error fetching enfermedad: ${error.message}`);
    }
  }

  /**
   * Create a new enfermedad
   */
  async createEnfermedad(enfermedadData) {
    try {
      const enfermedad = await getEnfermedadModel().create({
        nombre: enfermedadData.nombre,
        descripcion: enfermedadData.descripcion
      });

      return enfermedad;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Enfermedad with this name already exists');
      }
      throw new Error(`Error creating enfermedad: ${error.message}`);
    }
  }

  /**
   * Update an enfermedad
   */
  async updateEnfermedad(id, enfermedadData) {
    try {
      const enfermedad = await getEnfermedadModel().findByPk(id);
      
      if (!enfermedad) {
        throw new Error('Enfermedad not found');
      }

      await enfermedad.update({
        nombre: enfermedadData.nombre || enfermedad.nombre,
        descripcion: enfermedadData.descripcion !== undefined ? enfermedadData.descripcion : enfermedad.descripcion
      });

      return enfermedad;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Enfermedad with this name already exists');
      }
      throw new Error(`Error updating enfermedad: ${error.message}`);
    }
  }

  /**
   * Delete an enfermedad
   */
  async deleteEnfermedad(id) {
    try {
      const enfermedad = await getEnfermedadModel().findByPk(id);
      
      if (!enfermedad) {
        throw new Error('Enfermedad not found');
      }

      // TODO: Check if enfermedad has associated personas when associations are defined
      // const personasCount = await enfermedad.countPersonas();
      // if (personasCount > 0) {
      //   throw new Error('Cannot delete enfermedad: it has associated personas');
      // }

      await enfermedad.destroy();
      return { message: 'Enfermedad deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting enfermedad: ${error.message}`);
    }
  }

  /**
   * Get enfermedades by persona ID
   */
  async getEnfermedadesByPersona(personaId) {
    try {
      const PersonaModel = sequelize.models.Persona;
      const persona = await PersonaModel.findByPk(personaId, {
        include: [
          {
            association: 'enfermedades',
            attributes: ['id_enfermedad', 'nombre', 'descripcion']
          }
        ]
      });

      if (!persona) {
        throw new Error('Persona not found');
      }

      return persona.enfermedades;
    } catch (error) {
      throw new Error(`Error fetching enfermedades for persona: ${error.message}`);
    }
  }

  /**
   * Associate enfermedad with persona
   */
  async associateEnfermedadWithPersona(enfermedadId, personaId) {
    try {
      const enfermedad = await getEnfermedadModel().findByPk(enfermedadId);
      const PersonaModel = sequelize.models.Persona;
      const persona = await PersonaModel.findByPk(personaId);

      if (!enfermedad) {
        throw new Error('Enfermedad not found');
      }

      if (!persona) {
        throw new Error('Persona not found');
      }

      await enfermedad.addPersona(persona);
      return { message: 'Enfermedad associated with persona successfully' };
    } catch (error) {
      throw new Error(`Error associating enfermedad with persona: ${error.message}`);
    }
  }

  /**
   * Remove association between enfermedad and persona
   */
  async removeEnfermedadFromPersona(enfermedadId, personaId) {
    try {
      const enfermedad = await getEnfermedadModel().findByPk(enfermedadId);
      const PersonaModel = sequelize.models.Persona;
      const persona = await PersonaModel.findByPk(personaId);

      if (!enfermedad) {
        throw new Error('Enfermedad not found');
      }

      if (!persona) {
        throw new Error('Persona not found');
      }

      await enfermedad.removePersona(persona);
      return { message: 'Enfermedad removed from persona successfully' };
    } catch (error) {
      throw new Error(`Error removing enfermedad from persona: ${error.message}`);
    }
  }
}

export default new EnfermedadService();
