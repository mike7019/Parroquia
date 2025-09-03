import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Sexo = sequelize.define('Sexo', {
  id_sexo: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notNull: {
        msg: 'El nombre del sexo es requerido'
      },
      notEmpty: {
        msg: 'El nombre del sexo no puede estar vacío'
      },
      len: {
        args: [1, 50],
        msg: 'El nombre debe tener entre 1 y 50 caracteres'
      }
    }
  },
  codigo: {
    type: DataTypes.STRING(1),
    allowNull: false,
    unique: true,
    validate: {
      notNull: {
        msg: 'El código del sexo es requerido'
      },
      notEmpty: {
        msg: 'El código del sexo no puede estar vacío'
      },
      len: {
        args: [1, 1],
        msg: 'El código debe tener exactamente 1 carácter'
      },
      isIn: {
        args: [['M', 'F', 'O']],
        msg: 'El código debe ser M (Masculino), F (Femenino) u O (Otro)'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Sexo',
  tableName: 'sexos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Sexo;
