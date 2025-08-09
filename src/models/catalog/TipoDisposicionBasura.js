import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const TipoDisposicionBasura = sequelize.define('TipoDisposicionBasura', {
  id_tipo_disposicion_basura: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_tipo_disposicion_basura'
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
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
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'tipos_disposicion_basura',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['nombre']
    }
  ]
});

export default TipoDisposicionBasura;
