import CentrosPoblados from '../../models/catalog/CentrosPoblados.js';
import Municipios from '../../models/catalog/Municipios.js';
import Familias from '../../models/catalog/Familias.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

class CentrosPobladosService {
  
  /**
   * Función para encontrar el próximo ID disponible reutilizando gaps
   */
  async findNextAvailableId() {
    try {
      const existingIds = await CentrosPoblados.findAll({
        attributes: ['id_centro_poblado'],
        order: [['id_centro_poblado', 'ASC']],
        raw: true
      });

      logger.info('findNextAvailableId - IDs existentes:', existingIds.map(e => e.id_centro_poblado).join(', '));

      if (existingIds.length === 0) {
        logger.info('findNextAvailableId - No hay IDs, retornando 1');
        return 1;
      }

      for (let i = 0; i < existingIds.length; i++) {
        const expectedId = i + 1;
        const actualId = parseInt(existingIds[i].id_centro_poblado);
        
        logger.info(`findNextAvailableId - Posición ${i}: esperado=${expectedId}, actual=${actualId}`);
        
        if (actualId !== expectedId) {
          logger.info(`findNextAvailableId - Gap detectado! Retornando ${expectedId}`);
          return expectedId;
        }
      }

      const nextId = existingIds.length + 1;
      logger.info(`findNextAvailableId - Sin gaps, retornando secuencial ${nextId}`);
      return nextId;
    } catch (error) {
      logger.error('Error finding next available ID for centro poblado:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los centros poblados con filtros opcionales
   */
  async getAllCentrosPoblados(filters = {}) {
    try {
      const {
        search = null,
        id_municipio = null,
        page = 1,
        limit = 50,
        sortBy = 'nombre',
        sortOrder = 'ASC'
      } = filters;

      const whereConditions = {};
      
      if (search) {
        whereConditions[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { codigo_centro_poblado: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (id_municipio) {
        whereConditions.id_municipio_municipios = id_municipio;
      }

      const offset = (page - 1) * limit;

      const { rows: centros_poblados, count: total } = await CentrosPoblados.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Municipios,
            as: 'municipio',
            foreignKey: 'id_municipio_municipios',
            targetKey: 'id_municipio',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane'],
            required: false
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        status: 'success',
        data: centros_poblados,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        message: `Se encontraron ${total} centro(s) poblado(s)`
      };
    } catch (error) {
      logger.error('Error getting centros poblados:', error);
      throw error;
    }
  }

  /**
   * Obtener un centro poblado por ID
   */
  async getCentroPobladoById(id) {
    try {
      const centro_poblado = await CentrosPoblados.findByPk(id, {
        include: [
          {
            model: Municipios,
            as: 'municipio',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ]
      });
      
      if (!centro_poblado) {
        const error = new Error('Centro poblado no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      return centro_poblado;
    } catch (error) {
      logger.error(`Error getting centro poblado by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo centro poblado
   */
  async createCentroPoblado(centroPobladoData) {
    try {
      // Verificar si el municipio existe
      if (centroPobladoData.id_municipio_municipios) {
        const municipio = await Municipios.findByPk(centroPobladoData.id_municipio_municipios);
        if (!municipio) {
          const error = new Error('Municipio no encontrado');
          error.statusCode = 404;
          error.code = 'MUNICIPIO_NOT_FOUND';
          throw error;
        }
      }

      // Verificar nombre duplicado
      const existingCentroPoblado = await CentrosPoblados.findOne({
        where: { nombre: centroPobladoData.nombre }
      });

      if (existingCentroPoblado) {
        const error = new Error('Ya existe un centro poblado con ese nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      // Obtener el próximo ID disponible (reutilizando gaps)
      const nextId = await this.findNextAvailableId();
      
      // Generar código automático en formato CP-XXXX
      const codigoAutomatico = `CP-${String(nextId).padStart(4, '0')}`;

      const nuevoCentroPoblado = await CentrosPoblados.create({
        id_centro_poblado: nextId,
        codigo_centro_poblado: codigoAutomatico,
        nombre: centroPobladoData.nombre,
        id_municipio_municipios: centroPobladoData.id_municipio_municipios
      });
      
      logger.info('Centro poblado creado exitosamente', {
        id: nuevoCentroPoblado.id_centro_poblado,
        nombre: nuevoCentroPoblado.nombre
      });

      return await this.getCentroPobladoById(nuevoCentroPoblado.id_centro_poblado);
    } catch (error) {
      logger.error('Error creating centro poblado:', error);
      throw error;
    }
  }

  /**
   * Actualizar un centro poblado
   */
  async updateCentroPoblado(id, centroPobladoData) {
    try {
      const centro_poblado = await CentrosPoblados.findByPk(id);
      
      if (!centro_poblado) {
        const error = new Error('Centro poblado no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar municipio si se proporciona
      if (centroPobladoData.id_municipio_municipios) {
        const municipio = await Municipios.findByPk(centroPobladoData.id_municipio_municipios);
        if (!municipio) {
          const error = new Error('Municipio no encontrado');
          error.statusCode = 404;
          error.code = 'MUNICIPIO_NOT_FOUND';
          throw error;
        }
      }

      // Verificar nombre duplicado (excluyendo el actual)
      if (centroPobladoData.nombre && centroPobladoData.nombre !== centro_poblado.nombre) {
        const existingCentroPoblado = await CentrosPoblados.findOne({
          where: { 
            nombre: centroPobladoData.nombre,
            id_centro_poblado: { [Op.ne]: id }
          }
        });

        if (existingCentroPoblado) {
          const error = new Error('Ya existe un centro poblado con ese nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }

      // Actualizar el centro poblado (código NO se puede actualizar)
      await centro_poblado.update({
        nombre: centroPobladoData.nombre || centro_poblado.nombre,
        id_municipio_municipios: centroPobladoData.id_municipio_municipios || centro_poblado.id_municipio_municipios
      });
      
      logger.info('Centro poblado actualizado exitosamente', {
        id: centro_poblado.id_centro_poblado,
        nombre: centro_poblado.nombre
      });

      return await this.getCentroPobladoById(id);
    } catch (error) {
      logger.error(`Error updating centro poblado ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reindexar IDs para eliminar gaps automáticamente
   */
  async reindexarIDs() {
    try {
      // Obtener todos los centros poblados ordenados por ID
      const centros_poblados = await CentrosPoblados.findAll({
        order: [['id_centro_poblado', 'ASC']],
        raw: true
      });

      logger.info(`Reindexando ${centros_poblados.length} centros poblados...`);

      // Actualizar cada ID para que sea secuencial
      for (let i = 0; i < centros_poblados.length; i++) {
        const nuevoId = i + 1;
        const actualId = parseInt(centros_poblados[i].id_centro_poblado);
        
        if (actualId !== nuevoId) {
          // Generar nuevo código basado en el nuevo ID
          const nuevoCodigo = `CP-${String(nuevoId).padStart(4, '0')}`;
          
          // Actualizar el registro
          await CentrosPoblados.update(
            {
              id_centro_poblado: nuevoId,
              codigo_centro_poblado: nuevoCodigo
            },
            {
              where: { id_centro_poblado: actualId }
            }
          );
          
          logger.info(`Reindexado: ID ${actualId} → ${nuevoId} | Código: ${nuevoCodigo}`);
        }
      }

      logger.info('Reindexación completada exitosamente');
      return true;
    } catch (error) {
      logger.error('Error reindexando IDs:', error);
      throw error;
    }
  }

  /**
   * Eliminar un centro poblado
   */
  async deleteCentroPoblado(id) {
    try {
      const centro_poblado = await CentrosPoblados.findByPk(id);
      
      if (!centro_poblado) {
        const error = new Error('Centro poblado no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay familias usando este centro poblado
      const familiasUsando = await Familias.count({
        where: { id_centro_poblado: id }
      });

      if (familiasUsando > 0) {
        const error = new Error(`No se puede eliminar el centro poblado porque ${familiasUsando} familia(s) lo están usando`);
        error.statusCode = 409;
        error.code = 'CENTRO_POBLADO_IN_USE';
        throw error;
      }

      await centro_poblado.destroy();
      
      logger.info('Centro poblado eliminado exitosamente', {
        id: id,
        nombre: centro_poblado.nombre
      });

      // Reindexar IDs después de eliminar
      await this.reindexarIDs();

      return { message: 'Centro poblado eliminado exitosamente y IDs reindexados' };
    } catch (error) {
      logger.error(`Error deleting centro poblado ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de centros poblados
   */
  async getEstadisticasCentrosPoblados() {
    try {
      const centros_poblados = await CentrosPoblados.findAll({
        attributes: [
          'id_centro_poblado',
          'nombre',
          'codigo_centro_poblado'
        ],
        include: [
          {
            model: Municipios,
            as: 'municipio',
            attributes: ['nombre_municipio']
          }
        ]
      });

      const estadisticas = await Promise.all(
        centros_poblados.map(async (centro_poblado) => {
          const familiasCount = await Familias.count({
            where: { id_centro_poblado: centro_poblado.id_centro_poblado }
          });

          return {
            id_centro_poblado: centro_poblado.id_centro_poblado,
            nombre: centro_poblado.nombre,
            codigo: centro_poblado.codigo_centro_poblado,
            municipio: centro_poblado.municipio?.nombre_municipio || null,
            familias_usando: familiasCount
          };
        })
      );

      return estadisticas;
    } catch (error) {
      logger.error('Error getting estadisticas centros poblados:', error);
      throw error;
    }
  }
}

export default new CentrosPobladosService();
