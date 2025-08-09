import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const TipoAguasResiduales = sequelize.define('TipoAguasResiduales', {
  id_tipo_aguas_residuales: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
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
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'TipoAguasResiduales',
  tableName: 'tipos_aguas_residuales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default TipoAguasResiduales;
