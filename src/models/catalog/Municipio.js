import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Municipio = sequelize.define('Municipio', {
  id_municipio: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre_municipio: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Municipio',
  tableName: 'municipios',
  timestamps: false
});

export default Municipio;
