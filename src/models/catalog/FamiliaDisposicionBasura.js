import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const FamiliaDisposicionBasura = sequelize.define('FamiliaDisposicionBasura', {
  id_familia_disposicion_basura: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_familia_disposicion_basura'
  },
  id_familia: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'id_familia',
    validate: {
      notNull: {
        msg: 'El ID de familia es requerido'
      },
      isInt: {
        msg: 'El ID de familia debe ser un número entero'
      }
    }
  },
  id_tipo_disposicion_basura: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'id_tipo_disposicion_basura',
    validate: {
      notNull: {
        msg: 'El ID de tipo de disposición de basura es requerido'
      },
      isInt: {
        msg: 'El ID de tipo de disposición de basura debe ser un número entero'
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
  tableName: 'familia_disposicion_basura',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_familia', 'id_tipo_disposicion_basura']
    }
  ]
});

export default FamiliaDisposicionBasura;
