/**
 * Modelo Estudio
 * Representa los niveles educativos en el sistema
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Estudio = sequelize.define('Estudio', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_niveles_educativos',
    allowNull: false
  },
  nivel: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_nivel_educativo',
      msg: 'Ya existe un estudio con este nivel educativo'
    },
    validate: {
      notEmpty: {
        msg: 'El nivel educativo no puede estar vacío'
      },
      len: {
        args: [2, 255],
        msg: 'El nivel educativo debe tener entre 2 y 255 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'La descripción no puede exceder los 1000 caracteres'
      }
    }
  },
  ordenNivel: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'orden_nivel',
    validate: {
      min: {
        args: [0],
        msg: 'El orden debe ser un número positivo'
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Estudio',
  tableName: 'niveles_educativos',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['nivel'],
      where: {
        deletedAt: null
      }
    },
    {
      fields: ['activo']
    },
    {
      fields: ['orden_nivel']
    },
    {
      fields: ['createdAt']
    }
  ],
  scopes: {
    active: {
      where: {
        activo: true
      }
    },
    inactive: {
      where: {
        activo: false
      }
    },
    ordered: {
      order: [['orden_nivel', 'ASC'], ['nivel', 'ASC']]
    }
  },
  hooks: {
    beforeCreate: async (estudio, options) => {
      // Asignar orden automáticamente si no se proporciona
      if (estudio.ordenNivel === null || estudio.ordenNivel === undefined) {
        const maxOrden = await Estudio.max('ordenNivel', {
          where: { activo: true },
          transaction: options.transaction
        });
        estudio.ordenNivel = (maxOrden || 0) + 1;
      }
      
      // Normalizar el nivel educativo
      if (estudio.nivel) {
        estudio.nivel = estudio.nivel.trim();
      }
    },
    beforeUpdate: async (estudio, options) => {
      // Normalizar el nivel educativo si se está actualizando
      if (estudio.changed('nivel') && estudio.nivel) {
        estudio.nivel = estudio.nivel.trim();
      }
    },
    beforeBulkDestroy: async (options) => {
      // Soft delete - marcar como inactivo en lugar de eliminar
      options.individualHooks = true;
    }
  }
});

export default Estudio;
