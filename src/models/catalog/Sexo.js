import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Sexo = sequelize.define('Sexo', {
  id_sexo: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  sexo: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Sexo',
  tableName: 'sexo',
  timestamps: false
});

export default Sexo;
