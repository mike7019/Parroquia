import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Municipios = sequelize.define('Municipios', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  codigo_municipio: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Municipios',
  tableName: 'municipios',
  timestamps: false
});

export default Municipios;
