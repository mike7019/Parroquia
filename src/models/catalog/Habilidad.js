import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Habilidad = sequelize.define('Habilidad', {
  id_habilidad: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notNull: {
        msg: 'El nombre de la habilidad es requerido'
      },
      notEmpty: {
        msg: 'El nombre de la habilidad no puede estar vacío'
      },
      len: {
        args: [1, 100],
        msg: 'El nombre debe tener entre 1 y 100 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'La descripción de la habilidad es requerida'
      },
      notEmpty: {
        msg: 'La descripción no puede estar vacía'
      }
    }
  }
}, {
  sequelize,
  modelName: 'Habilidad',
  tableName: 'habilidades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Habilidad;
