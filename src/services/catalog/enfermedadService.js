import sequelize from '../../../config/sequelize.js';
import '../../../config/sequelize.js';
import '../../models/index.js'; // Asegurar que los modelos estén importados
import logger from '../../utils/logger.js';

// Obtener el modelo Enfermedad desde Sequelize una vez que se cargue
const getEnfermedadModel = () => sequelize.models.Enfermedad;

class EnfermedadService {
  /**
   * Reorganizar IDs después de eliminar para evitar gaps
   */
  async reorganizeIds() {
    try {
      const Enfermedad = getEnfermedadModel();
      
      // Obtener todas las enfermedades ordenadas por ID actual
      const enfermedades = await Enfermedad.findAll({
        order: [['id_enfermedad', 'ASC']],
        raw: true
      });

      console.log('Reorganizando IDs de enfermedades...');
      
      // Reorganizar IDs secuencialmente
      for (let i = 0; i < enfermedades.length; i++) {
        const newId = i + 1;
        const currentId = enfermedades[i].id_enfermedad;
        
        if (currentId !== newId) {
          // Actualizar usando SQL directo para evitar problemas con la PK
          await sequelize.query(
            'UPDATE enfermedades SET id_enfermedad = :newId WHERE id_enfermedad = :currentId',
            {
              replacements: { newId, currentId },
              type: sequelize.QueryTypes.UPDATE
            }
          );
          console.log(`ID ${currentId} -> ${newId}`);
        }
      }
      
      // Reiniciar la secuencia si existe
      const nextId = enfermedades.length + 1;
      try {
        await sequelize.query(
          `SELECT setval('enfermedades_id_enfermedad_seq', :nextId, false)`,
          {
            replacements: { nextId },
            type: sequelize.QueryTypes.SELECT
          }
        );
        console.log(`Secuencia reiniciada a ${nextId}`);
      } catch (seqError) {
        console.log('No se encontró secuencia para reiniciar (puede ser normal)');
      }
      
      console.log('Reorganización completada');
    } catch (error) {
      logger.error('Error reorganizando IDs:', error);
      throw error;
    }
  }

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
   * Get all enfermedades
   */
  async getAllEnfermedades() {
    try {
      const enfermedades = await getEnfermedadModel().findAll({
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: enfermedades,
        total: enfermedades.length,
        message: `Se encontraron ${enfermedades.length} enfermedades`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener enfermedades: ${error.message}`
      };
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

      // Eliminar la enfermedad
      await enfermedad.destroy();
      
      // Reorganizar IDs automáticamente para eliminar gaps
      await this.reorganizeIds();
      
      return { 
        message: 'Enfermedad deleted successfully and IDs reorganized',
        reorganized: true
      };
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
