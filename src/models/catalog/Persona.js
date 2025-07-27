import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Persona = sequelize.define('Persona', {
  id_persona: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombres: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  apellidos: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  id_parroquia: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  id_sexo: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  id_vereda: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Persona',
  tableName: 'personas',
  timestamps: false
});

export default Persona;
