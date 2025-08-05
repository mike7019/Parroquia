import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const TipoIdentificacion = sequelize.define('TipoIdentificacion', {
  id_tipo_identificacion: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'TipoIdentificacion',
  tableName: 'tipo_identificacion',
  timestamps: false
});

export default TipoIdentificacion;
