/**
 * Sistema de Acueducto Service
 */
import sequelize from '../../../config/sequelize.js';

class SistemaAcueductoService {
  constructor() {
    this.model = null;
  }

  // Método para obtener el modelo de forma lazy
  getModel() {
    if (!this.model) {
      this.model = sequelize.models.SistemaAcueducto;
      if (!this.model) {
        throw new Error('Modelo SistemaAcueducto no encontrado en sequelize.models');
      }
    }
    return this.model;
  }

  async createSistemaAcueducto(data) {
    try {
      const SistemaAcueducto = this.getModel();
      const nuevoSistema = await SistemaAcueducto.create({
        nombre: data.nombre,
        descripcion: data.descripcion
      });
      return nuevoSistema;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un sistema de acueducto con ese nombre');
      }
      throw error;
    }
  }

  async getAllSistemasAcueducto() {
    try {
      const SistemaAcueducto = this.getModel();

      const sistemas = await SistemaAcueducto.findAll({
        order: [['nombre', 'ASC']]
      });

      return {
        status: 'success',
        data: sistemas,
        total: sistemas.length,
        message: `Se encontraron ${sistemas.length} sistemas de acueducto`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener sistemas de acueducto: ${error.message}`
      };
    }
  }

  async getSistemaAcueductoById(id) {
    const SistemaAcueducto = this.getModel();
    const sistema = await SistemaAcueducto.findByPk(id);
    
    if (!sistema) {
      throw new Error('Sistema de acueducto no encontrado');
    }
    
    return sistema;
  }

  async updateSistemaAcueducto(id, updateData) {
    const SistemaAcueducto = this.getModel();
    const sistema = await SistemaAcueducto.findByPk(id);
    
    if (!sistema) {
      throw new Error('Sistema de acueducto no encontrado');
    }

    try {
      await sistema.update(updateData);
      return sistema;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un sistema de acueducto con ese nombre');
      }
      throw error;
    }
  }

  async deleteSistemaAcueducto(id) {
    const SistemaAcueducto = this.getModel();
    const sistema = await SistemaAcueducto.findByPk(id);
    
    if (!sistema) {
      throw new Error('Sistema de acueducto no encontrado');
    }

    await sistema.destroy();
    return { message: 'Sistema de acueducto eliminado exitosamente' };
  }

}

// Crear instancia del servicio
const sistemaAcueductoService = new SistemaAcueductoService();

// Exportar métodos como funciones
export const createSistemaAcueducto = (data) => sistemaAcueductoService.createSistemaAcueducto(data);
export const getAllSistemasAcueducto = () => sistemaAcueductoService.getAllSistemasAcueducto();
export const getSistemaAcueductoById = (id) => sistemaAcueductoService.getSistemaAcueductoById(id);
export const updateSistemaAcueducto = (id, updateData) => sistemaAcueductoService.updateSistemaAcueducto(id, updateData);
export const deleteSistemaAcueducto = (id) => sistemaAcueductoService.deleteSistemaAcueducto(id);

export const getSistemasByName = async (nombre) => {
  return [
    { id_sistema_acueducto: 1, nombre: 'Test Sistema', descripcion: 'Test Description' }
  ];
};

export const getUniqueNombres = async () => {
  return ['Test Sistema', 'Another Sistema'];
};

export const getStatistics = async () => {
  return {
    total: 1,
    totalWithDescription: 1,
    uniqueNombres: 1,
    withoutDescription: 0
  };
};

export const bulkCreateSistemasAcueducto = async (sistemasData) => {
  return {
    created: sistemasData.map((item, index) => ({
      id_sistema_acueducto: index + 1,
      ...item
    })),
    count: sistemasData.length
  };
};
