import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Municipios = sequelize.define('Municipios', {
  id_municipio: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  codigo_dane: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Municipios',
  tableName: 'municipios',
  timestamps: false
});

export default Municipios;
