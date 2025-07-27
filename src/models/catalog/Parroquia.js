import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Parroquia = sequelize.define('Parroquia', {
  id_parroquia: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Parroquia',
  tableName: 'parroquia',
  timestamps: false
});

export default Parroquia;
