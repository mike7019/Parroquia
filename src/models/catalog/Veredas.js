import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Veredas = sequelize.define('Veredas', {
  id_vereda: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  codigo_vereda: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  id_municipio: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Veredas',
  tableName: 'veredas',
  timestamps: false
});

export default Veredas;
