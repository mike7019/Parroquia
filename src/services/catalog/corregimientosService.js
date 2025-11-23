import Corregimientos from '../../models/catalog/Corregimientos.js';
import Municipios from '../../models/catalog/Municipios.js';
import Familias from '../../models/catalog/Familias.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

class CorregimientosService {
  
  /**
   * Función para encontrar el próximo ID disponible reutilizando gaps
   */
  async findNextAvailableId() {
    try {
      const existingIds = await Corregimientos.findAll({
        attributes: ['id_corregimiento'],
        order: [['id_corregimiento', 'ASC']],
        raw: true
      });

      logger.info('findNextAvailableId - IDs existentes:', existingIds.map(e => e.id_corregimiento).join(', '));

      if (existingIds.length === 0) {
        logger.info('findNextAvailableId - No hay IDs, retornando 1');
        return 1;
      }

      for (let i = 0; i < existingIds.length; i++) {
        const expectedId = i + 1;
        const actualId = parseInt(existingIds[i].id_corregimiento);
        
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
      logger.error('Error finding next available ID for corregimiento:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los corregimientos con filtros opcionales
   */
  async getAllCorregimientos(filters = {}) {
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
          { codigo_corregimiento: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (id_municipio) {
        whereConditions.id_municipio_municipios = id_municipio;
      }

      const offset = (page - 1) * limit;

      const { rows: corregimientos, count: total } = await Corregimientos.findAndCountAll({
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
        data: corregimientos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        message: `Se encontraron ${total} corregimiento(s)`
      };
    } catch (error) {
      logger.error('Error getting corregimientos:', error);
      throw error;
    }
  }

  /**
   * Obtener corregimientos por municipio
   */
  async getCorregimientosByMunicipio(id_municipio) {
    try {
      // Validar que el municipio existe
      const municipio = await Municipios.findByPk(id_municipio);
      if (!municipio) {
        const error = new Error('El municipio especificado no existe');
        error.statusCode = 404;
        error.code = 'MUNICIPIO_NOT_FOUND';
        throw error;
      }

      const corregimientos = await Corregimientos.findAll({
        where: { id_municipio_municipios: id_municipio },
        include: [
          {
            model: Municipios,
            as: 'municipio',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ],
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: corregimientos,
        total: corregimientos.length,
        municipio: {
          id_municipio: municipio.id_municipio,
          nombre_municipio: municipio.nombre_municipio
        },
        message: `Se encontraron ${corregimientos.length} corregimiento(s) en ${municipio.nombre_municipio}`
      };
    } catch (error) {
      logger.error(`Error getting corregimientos by municipio ${id_municipio}:`, error);
      throw error;
    }
  }

  /**
   * Obtener un corregimiento por ID
   */
  async getCorregimientoById(id) {
    try {
      const corregimiento = await Corregimientos.findByPk(id, {
        include: [
          {
            model: Municipios,
            as: 'municipio',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ]
      });
      
      if (!corregimiento) {
        const error = new Error('Corregimiento no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      return corregimiento;
    } catch (error) {
      logger.error(`Error getting corregimiento by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo corregimiento
   */
  async createCorregimiento(corregimientoData) {
    try {
      // Verificar si el municipio existe
      if (corregimientoData.id_municipio_municipios) {
        const municipio = await Municipios.findByPk(corregimientoData.id_municipio_municipios);
        if (!municipio) {
          const error = new Error('Municipio no encontrado');
          error.statusCode = 404;
          error.code = 'MUNICIPIO_NOT_FOUND';
          throw error;
        }
      }

      // Mapear id_municipio a id_municipio_municipios (nombre del campo en la BD)
      const id_municipio = corregimientoData.id_municipio || corregimientoData.id_municipio_municipios;

      // Verificar nombre duplicado en el mismo municipio
      const existingCorregimiento = await Corregimientos.findOne({
        where: { 
          nombre: corregimientoData.nombre,
          id_municipio_municipios: id_municipio
        }
      });

      if (existingCorregimiento) {
        const error = new Error('Ya existe un corregimiento con ese nombre en este municipio');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      // Obtener el próximo ID disponible (reutilizando gaps)
      const nextId = await this.findNextAvailableId();
      
      // Generar código automático en formato COR-XXXX
      const codigoAutomatico = `COR-${String(nextId).padStart(4, '0')}`;

      const nuevoCorregimiento = await Corregimientos.create({
        id_corregimiento: nextId,
        codigo_corregimiento: codigoAutomatico,
        nombre: corregimientoData.nombre,
        id_municipio_municipios: id_municipio
      });
      
      logger.info('Corregimiento creado exitosamente', {
        id: nuevoCorregimiento.id_corregimiento,
        nombre: nuevoCorregimiento.nombre
      });

      return await this.getCorregimientoById(nuevoCorregimiento.id_corregimiento);
    } catch (error) {
      logger.error('Error creating corregimiento:', error);
      throw error;
    }
  }

  /**
   * Actualizar un corregimiento
   */
  async updateCorregimiento(id, corregimientoData) {
    try {
      const corregimiento = await Corregimientos.findByPk(id);
      
      if (!corregimiento) {
        const error = new Error('Corregimiento no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar municipio si se proporciona
      if (corregimientoData.id_municipio_municipios) {
        const municipio = await Municipios.findByPk(corregimientoData.id_municipio_municipios);
        if (!municipio) {
          const error = new Error('Municipio no encontrado');
          error.statusCode = 404;
          error.code = 'MUNICIPIO_NOT_FOUND';
          throw error;
        }
      }

      // Verificar nombre duplicado (excluyendo el actual)
      if (corregimientoData.nombre && corregimientoData.nombre !== corregimiento.nombre) {
        const existingCorregimiento = await Corregimientos.findOne({
          where: { 
            nombre: corregimientoData.nombre,
            id_municipio_municipios: corregimientoData.id_municipio_municipios || corregimiento.id_municipio_municipios,
            id_corregimiento: { [Op.ne]: id }
          }
        });

        if (existingCorregimiento) {
          const error = new Error('Ya existe un corregimiento con ese nombre en este municipio');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }

      // Actualizar el corregimiento (código NO se puede actualizar)
      await corregimiento.update({
        nombre: corregimientoData.nombre || corregimiento.nombre,
        id_municipio_municipios: corregimientoData.id_municipio_municipios || corregimiento.id_municipio_municipios
      });
      
      logger.info('Corregimiento actualizado exitosamente', {
        id: corregimiento.id_corregimiento,
        nombre: corregimiento.nombre
      });

      return await this.getCorregimientoById(id);
    } catch (error) {
      logger.error(`Error updating corregimiento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reindexar IDs para eliminar gaps automáticamente
   */
  async reindexarIDs() {
    try {
      // Obtener todos los corregimientos ordenados por ID
      const corregimientos = await Corregimientos.findAll({
        order: [['id_corregimiento', 'ASC']],
        raw: true
      });

      logger.info(`Reindexando ${corregimientos.length} corregimientos...`);

      // Actualizar cada ID para que sea secuencial
      for (let i = 0; i < corregimientos.length; i++) {
        const nuevoId = i + 1;
        const actualId = parseInt(corregimientos[i].id_corregimiento);
        
        if (actualId !== nuevoId) {
          // Generar nuevo código basado en el nuevo ID
          const nuevoCodigo = `COR-${String(nuevoId).padStart(4, '0')}`;
          
          // Actualizar el registro
          await Corregimientos.update(
            {
              id_corregimiento: nuevoId,
              codigo_corregimiento: nuevoCodigo
            },
            {
              where: { id_corregimiento: actualId }
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
   * Eliminar un corregimiento
   */
  async deleteCorregimiento(id) {
    try {
      const corregimiento = await Corregimientos.findByPk(id);
      
      if (!corregimiento) {
        const error = new Error('Corregimiento no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay familias usando este corregimiento
      const familiasUsando = await Familias.count({
        where: { id_corregimiento: id }
      });

      if (familiasUsando > 0) {
        const error = new Error(`No se puede eliminar el corregimiento porque ${familiasUsando} familia(s) lo están usando`);
        error.statusCode = 409;
        error.code = 'CORREGIMIENTO_IN_USE';
        throw error;
      }

      await corregimiento.destroy();
      
      logger.info('Corregimiento eliminado exitosamente', {
        id: id,
        nombre: corregimiento.nombre
      });

      // Reindexar IDs después de eliminar
      await this.reindexarIDs();

      return { message: 'Corregimiento eliminado exitosamente y IDs reindexados' };
    } catch (error) {
      logger.error(`Error deleting corregimiento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de corregimientos
   */
  async getEstadisticasCorregimientos() {
    try {
      const corregimientos = await Corregimientos.findAll({
        attributes: [
          'id_corregimiento',
          'nombre',
          'codigo_corregimiento'
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
        corregimientos.map(async (corregimiento) => {
          const familiasCount = await Familias.count({
            where: { id_corregimiento: corregimiento.id_corregimiento }
          });

          return {
            id_corregimiento: corregimiento.id_corregimiento,
            nombre: corregimiento.nombre,
            codigo: corregimiento.codigo_corregimiento,
            municipio: corregimiento.municipio?.nombre_municipio || null,
            familias_usando: familiasCount
          };
        })
      );

      return estadisticas;
    } catch (error) {
      logger.error('Error getting estadisticas corregimientos:', error);
      throw error;
    }
  }
}

export default new CorregimientosService();
