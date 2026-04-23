import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const TipoLiderazgo = sequelize.define('TipoLiderazgo', {
  id_tipo_liderazgo: {
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
      notNull: { msg: 'El nombre del tipo de liderazgo es requerido' },
      notEmpty: { msg: 'El nombre no puede estar vacío' },
      len: { args: [2, 255], msg: 'El nombre debe tener entre 2 y 255 caracteres' }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'La descripción no puede exceder los 1000 caracteres' }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'TipoLiderazgo',
  tableName: 'tipos_liderazgo',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['nombre'] },
    { fields: ['activo'] }
  ]
});

export default TipoLiderazgo;
