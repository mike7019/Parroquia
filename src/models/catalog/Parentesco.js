import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Parentesco = sequelize.define('Parentesco', {
  id_parentesco: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'El nombre del parentesco es requerido'
      },
      len: {
        args: [2, 255],
        msg: 'El nombre debe tener entre 2 y 255 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La descripción no puede exceder 500 caracteres'
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
  modelName: 'Parentesco',
  tableName: 'parentescos',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      name: 'idx_parentesco_nombre',
      fields: ['nombre']
    },
    {
      name: 'idx_parentesco_activo',
      fields: ['activo']
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
    }
  }
});

// Define associations
Parentesco.associate = function(models) {
  // Si tienes modelo de Personas, puedes definir la relación aquí
  if (models.Persona) {
    Parentesco.hasMany(models.Persona, {
      foreignKey: 'id_parentesco',
      as: 'personas'
    });
  }
};

export default Parentesco;
