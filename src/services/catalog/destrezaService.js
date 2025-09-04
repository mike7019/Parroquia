import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

/**
 * Servicio para gestión de destrezas/habilidades
 * Proporciona operaciones CRUD y consultas especializadas para el catálogo de destrezas
 */
class DestrezaService {

  /**
   * Obtener todas las destrezas con paginación y filtros
   * @param {Object} options - Opciones de consulta
   * @param {number} options.page - Número de página (por defecto 1)
   * @param {number} options.limit - Límite de registros por página (por defecto 10)
   * @param {string} options.search - Término de búsqueda para filtrar por nombre
   * @param {boolean} options.includePersonas - Incluir personas asociadas (por defecto false)
   * @param {string} options.orderBy - Campo para ordenar (por defecto 'nombre')
   * @param {string} options.orderDirection - Dirección de ordenamiento (ASC/DESC, por defecto ASC)
   * @returns {Promise<Object>} Resultado con destrezas, paginación y estadísticas
   */
  async getAllDestrezas(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        includePersonas = false,
        orderBy = 'nombre',
        orderDirection = 'ASC'
      } = options;

      const offset = (page - 1) * limit;
      
      // Construir condiciones de búsqueda
      const whereClause = {};
      if (search && search.trim() !== '') {
        whereClause.nombre = {
          [Op.iLike]: `%${search.trim()}%`
        };
      }

      // Configurar inclusiones
      const include = [];
      if (includePersonas) {
        include.push({
          model: sequelize.models.Persona,
          as: 'personas',
          required: false,
          attributes: ['id_persona', 'nombres', 'apellidos', 'numero_identificacion'],
          through: { attributes: [] } // Excluir campos de la tabla intermedia
        });
      }

      // Realizar consulta principal
      const { rows: destrezas, count: total } = await sequelize.models.Destreza.findAndCountAll({
        where: whereClause,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[orderBy, orderDirection.toUpperCase()]],
        distinct: true // Para contar correctamente con includes
      });

      // Calcular estadísticas de paginación
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        exito: true,
        mensaje: 'Destrezas obtenidas exitosamente',
        datos: destrezas,
        paginacion: {
          paginaActual: parseInt(page),
          totalPaginas: totalPages,
          totalRegistros: total,
          registrosPorPagina: parseInt(limit),
          tienePaginaSiguiente: hasNextPage,
          tienePaginaAnterior: hasPrevPage
        },
        filtros: {
          busqueda: search,
          ordenarPor: orderBy,
          direccionOrden: orderDirection,
          incluirPersonas: includePersonas
        }
      };

    } catch (error) {
      console.error('Error en getAllDestrezas:', error);
      throw new Error(`Error al obtener destrezas: ${error.message}`);
    }
  }

  /**
   * Obtener una destreza por ID
   * @param {number} id - ID de la destreza
   * @param {boolean} includePersonas - Incluir personas asociadas
   * @returns {Promise<Object>} Destreza encontrada con sus asociaciones
   */
  async getDestrezaById(id, includePersonas = false) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de destreza inválido');
      }

      const include = [];
      if (includePersonas) {
        include.push({
          model: sequelize.models.Persona,
          as: 'personas',
          required: false,
          attributes: ['id_persona', 'nombres', 'apellidos', 'numero_identificacion', 'email'],
          through: { attributes: [] }
        });
      }

      const destreza = await sequelize.models.Destreza.findByPk(id, {
        include
      });

      if (!destreza) {
        return {
          exito: false,
          mensaje: 'Destreza no encontrada',
          datos: null
        };
      }

      return {
        exito: true,
        mensaje: 'Destreza obtenida exitosamente',
        datos: destreza
      };

    } catch (error) {
      console.error('Error en getDestrezaById:', error);
      throw new Error(`Error al obtener destreza: ${error.message}`);
    }
  }

  /**
   * Crear una nueva destreza
   * @param {Object} destrezaData - Datos de la destreza
   * @param {string} destrezaData.nombre - Nombre de la destreza
   * @returns {Promise<Object>} Destreza creada
   */
  async createDestreza(destrezaData) {
    try {
      const { nombre } = destrezaData;

      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre de la destreza es requerido');
      }

      // Verificar que no exista otra destreza con el mismo nombre
      const existeDestreza = await sequelize.models.Destreza.findOne({
        where: {
          nombre: {
            [Op.iLike]: nombre.trim()
          }
        }
      });

      if (existeDestreza) {
        return {
          exito: false,
          mensaje: 'Ya existe una destreza con ese nombre',
          datos: null
        };
      }

      const nuevaDestreza = await sequelize.models.Destreza.create({
        nombre: nombre.trim()
      });

      return {
        exito: true,
        mensaje: 'Destreza creada exitosamente',
        datos: nuevaDestreza
      };

    } catch (error) {
      console.error('Error en createDestreza:', error);
      
      // Manejar errores de validación de Sequelize
      if (error.name === 'SequelizeValidationError') {
        const errores = error.errors.map(err => err.message);
        throw new Error(`Errores de validación: ${errores.join(', ')}`);
      }
      
      // Manejar errores de unicidad
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe una destreza con ese nombre');
      }

      throw new Error(`Error al crear destreza: ${error.message}`);
    }
  }

  /**
   * Actualizar una destreza existente
   * @param {number} id - ID de la destreza
   * @param {Object} destrezaData - Nuevos datos de la destreza
   * @param {string} destrezaData.nombre - Nuevo nombre de la destreza
   * @returns {Promise<Object>} Destreza actualizada
   */
  async updateDestreza(id, destrezaData) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de destreza inválido');
      }

      const { nombre } = destrezaData;

      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre de la destreza es requerido');
      }

      // Verificar que la destreza existe
      const destreza = await sequelize.models.Destreza.findByPk(id);
      if (!destreza) {
        return {
          exito: false,
          mensaje: 'Destreza no encontrada',
          datos: null
        };
      }

      // Verificar que no exista otra destreza con el mismo nombre (excluyendo la actual)
      const existeOtraDestreza = await sequelize.models.Destreza.findOne({
        where: {
          nombre: {
            [Op.iLike]: nombre.trim()
          },
          id_destreza: {
            [Op.ne]: id
          }
        }
      });

      if (existeOtraDestreza) {
        return {
          exito: false,
          mensaje: 'Ya existe otra destreza con ese nombre',
          datos: null
        };
      }

      // Actualizar la destreza
      await destreza.update({
        nombre: nombre.trim()
      });

      return {
        exito: true,
        mensaje: 'Destreza actualizada exitosamente',
        datos: destreza
      };

    } catch (error) {
      console.error('Error en updateDestreza:', error);
      
      if (error.name === 'SequelizeValidationError') {
        const errores = error.errors.map(err => err.message);
        throw new Error(`Errores de validación: ${errores.join(', ')}`);
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe otra destreza con ese nombre');
      }

      throw new Error(`Error al actualizar destreza: ${error.message}`);
    }
  }

  /**
   * Eliminar una destreza
   * @param {number} id - ID de la destreza
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteDestreza(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de destreza inválido');
      }

      const destreza = await sequelize.models.Destreza.findByPk(id);
      if (!destreza) {
        return {
          exito: false,
          mensaje: 'Destreza no encontrada',
          datos: null
        };
      }

      // Verificar si tiene personas asociadas
      const personasAsociadas = await sequelize.models.Persona.count({
        include: [{
          model: sequelize.models.Destreza,
          as: 'destrezas',
          where: { id_destreza: id },
          required: true
        }]
      });

      if (personasAsociadas > 0) {
        return {
          exito: false,
          mensaje: `No se puede eliminar la destreza porque tiene ${personasAsociadas} persona(s) asociada(s)`,
          datos: { personasAsociadas }
        };
      }

      await destreza.destroy();

      return {
        exito: true,
        mensaje: 'Destreza eliminada exitosamente',
        datos: { id_destreza: id, nombre: destreza.nombre }
      };

    } catch (error) {
      console.error('Error en deleteDestreza:', error);
      throw new Error(`Error al eliminar destreza: ${error.message}`);
    }
  }

  /**
   * Buscar destrezas por término de búsqueda
   * @param {string} termino - Término a buscar en el nombre
   * @param {number} limite - Límite de resultados (por defecto 20)
   * @returns {Promise<Object>} Destrezas que coinciden con la búsqueda
   */
  async searchDestrezas(termino, limite = 20) {
    try {
      if (!termino || typeof termino !== 'string' || termino.trim() === '') {
        throw new Error('Término de búsqueda requerido');
      }

      const destrezas = await sequelize.models.Destreza.findAll({
        where: {
          nombre: {
            [Op.iLike]: `%${termino.trim()}%`
          }
        },
        limit: parseInt(limite),
        order: [['nombre', 'ASC']],
        attributes: ['id_destreza', 'nombre']
      });

      return {
        exito: true,
        mensaje: `Búsqueda completada. ${destrezas.length} resultado(s) encontrado(s)`,
        datos: destrezas,
        total: destrezas.length,
        termino: termino.trim()
      };

    } catch (error) {
      console.error('Error en searchDestrezas:', error);
      throw new Error(`Error en búsqueda de destrezas: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de destrezas
   * @returns {Promise<Object>} Estadísticas del catálogo de destrezas
   */
  async getDestrezasStats() {
    try {
      // Contar total de destrezas
      const totalDestrezas = await sequelize.models.Destreza.count();

      // Contar destrezas con personas asociadas
      const destrezasConPersonas = await sequelize.models.Destreza.count({
        include: [{
          model: sequelize.models.Persona,
          as: 'personas',
          required: true
        }]
      });

      // Contar destrezas sin personas asociadas
      const destrezasSinPersonas = totalDestrezas - destrezasConPersonas;

      // Obtener las 5 destrezas más populares (con más personas)
      // Usamos una consulta SQL directa para evitar problemas con GROUP BY
      const destrezasPopularesQuery = `
        SELECT 
          d.id_destreza,
          d.nombre,
          COUNT(pd.id_personas_personas) as total_personas
        FROM destrezas d
        LEFT JOIN persona_destreza pd ON d.id_destreza = pd.id_destrezas_destrezas
        GROUP BY d.id_destreza, d.nombre
        ORDER BY COUNT(pd.id_personas_personas) DESC
        LIMIT 5
      `;

      const destrezasPopularesResult = await sequelize.query(destrezasPopularesQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      const destrezasPopulares = destrezasPopularesResult.map(d => ({
        id_destreza: d.id_destreza,
        nombre: d.nombre,
        total_personas: parseInt(d.total_personas) || 0
      }));

      return {
        exito: true,
        mensaje: 'Estadísticas obtenidas exitosamente',
        datos: {
          resumen: {
            totalDestrezas,
            destrezasConPersonas,
            destrezasSinPersonas,
            porcentajeUtilizacion: totalDestrezas > 0 ? 
              Math.round((destrezasConPersonas / totalDestrezas) * 100) : 0
          },
          destrezasPopulares: destrezasPopulares
        }
      };

    } catch (error) {
      console.error('Error en getDestrezasStats:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Obtener destrezas de una persona específica
   * @param {number} idPersona - ID de la persona
   * @returns {Promise<Object>} Destrezas de la persona
   */
  async getDestrezasByPersona(idPersona) {
    try {
      if (!idPersona || isNaN(idPersona)) {
        throw new Error('ID de persona inválido');
      }

      const persona = await sequelize.models.Persona.findByPk(idPersona, {
        include: [{
          model: sequelize.models.Destreza,
          as: 'destrezas',
          required: false,
          through: { attributes: [] }
        }],
        attributes: ['id_persona', 'nombres', 'apellidos', 'numero_identificacion']
      });

      if (!persona) {
        return {
          exito: false,
          mensaje: 'Persona no encontrada',
          datos: null
        };
      }

      return {
        exito: true,
        mensaje: 'Destrezas de la persona obtenidas exitosamente',
        datos: {
          persona: {
            id_persona: persona.id_persona,
            nombres: persona.nombres,
            apellidos: persona.apellidos,
            numero_identificacion: persona.numero_identificacion
          },
          destrezas: persona.destrezas,
          total_destrezas: persona.destrezas.length
        }
      };

    } catch (error) {
      console.error('Error en getDestrezasByPersona:', error);
      throw new Error(`Error al obtener destrezas de la persona: ${error.message}`);
    }
  }

  /**
   * Asociar una destreza a una persona
   * @param {number} idPersona - ID de la persona
   * @param {number} idDestreza - ID de la destreza
   * @returns {Promise<Object>} Resultado de la asociación
   */
  async asociarDestrezaPersona(idPersona, idDestreza) {
    try {
      if (!idPersona || isNaN(idPersona)) {
        throw new Error('ID de persona inválido');
      }
      
      if (!idDestreza || isNaN(idDestreza)) {
        throw new Error('ID de destreza inválido');
      }

      const persona = await sequelize.models.Persona.findByPk(idPersona);
      if (!persona) {
        return {
          exito: false,
          mensaje: 'Persona no encontrada',
          datos: null
        };
      }

      const destreza = await sequelize.models.Destreza.findByPk(idDestreza);
      if (!destreza) {
        return {
          exito: false,
          mensaje: 'Destreza no encontrada',
          datos: null
        };
      }

      // Verificar si ya existe la asociación
      const asociacionExiste = await persona.hasDestreza(destreza);
      if (asociacionExiste) {
        return {
          exito: false,
          mensaje: 'La persona ya tiene asociada esta destreza',
          datos: null
        };
      }

      // Crear la asociación
      await persona.addDestreza(destreza);

      return {
        exito: true,
        mensaje: 'Destreza asociada exitosamente a la persona',
        datos: {
          persona: { id_persona: persona.id_persona, nombres: persona.nombres, apellidos: persona.apellidos },
          destreza: { id_destreza: destreza.id_destreza, nombre: destreza.nombre }
        }
      };

    } catch (error) {
      console.error('Error en asociarDestrezaPersona:', error);
      throw new Error(`Error al asociar destreza a persona: ${error.message}`);
    }
  }

  /**
   * Desasociar una destreza de una persona
   * @param {number} idPersona - ID de la persona
   * @param {number} idDestreza - ID de la destreza
   * @returns {Promise<Object>} Resultado de la desasociación
   */
  async desasociarDestrezaPersona(idPersona, idDestreza) {
    try {
      if (!idPersona || isNaN(idPersona)) {
        throw new Error('ID de persona inválido');
      }
      
      if (!idDestreza || isNaN(idDestreza)) {
        throw new Error('ID de destreza inválido');
      }

      const persona = await sequelize.models.Persona.findByPk(idPersona);
      if (!persona) {
        return {
          exito: false,
          mensaje: 'Persona no encontrada',
          datos: null
        };
      }

      const destreza = await sequelize.models.Destreza.findByPk(idDestreza);
      if (!destreza) {
        return {
          exito: false,
          mensaje: 'Destreza no encontrada',
          datos: null
        };
      }

      // Verificar si existe la asociación
      const asociacionExiste = await persona.hasDestreza(destreza);
      if (!asociacionExiste) {
        return {
          exito: false,
          mensaje: 'La persona no tiene asociada esta destreza',
          datos: null
        };
      }

      // Remover la asociación
      await persona.removeDestreza(destreza);

      return {
        exito: true,
        mensaje: 'Destreza desasociada exitosamente de la persona',
        datos: {
          persona: { id_persona: persona.id_persona, nombres: persona.nombres, apellidos: persona.apellidos },
          destreza: { id_destreza: destreza.id_destreza, nombre: destreza.nombre }
        }
      };

    } catch (error) {
      console.error('Error en desasociarDestrezaPersona:', error);
      throw new Error(`Error al desasociar destreza de persona: ${error.message}`);
    }
  }
}

export default new DestrezaService();
