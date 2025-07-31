import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Sexo = sequelize.define('Sexo', {
  id_sexo: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Descripción del tipo de sexo'
  }
}, {
  sequelize,
  modelName: 'Sexo',
  tableName: 'sexo',
  timestamps: false
});

export default Sexo;
