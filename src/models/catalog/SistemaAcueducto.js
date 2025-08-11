import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const SistemaAcueducto = sequelize.define('SistemaAcueducto', {
  id_sistema_acueducto: {
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
      notNull: {
        msg: 'El nombre es requerido'
      },
      notEmpty: {
        msg: 'El nombre no puede estar vacío'
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
        args: [0, 1000],
        msg: 'La descripción no puede exceder 1000 caracteres'
      }
    }
  }
}, {
  sequelize,
  modelName: 'SistemaAcueducto',
  tableName: 'sistemas_acueducto',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['nombre'],
      unique: true
    }
  ]
});

export default SistemaAcueducto;
