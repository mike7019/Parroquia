import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Municipios = sequelize.define('Municipios', {
  id_municipio: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre_municipio: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo_dane: {
    type: DataTypes.STRING(5),
    allowNull: false,
    comment: 'Código DANE del municipio (5 dígitos)'
  },
  id_departamento: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'departamentos',
      key: 'id_departamento'
    },
    comment: 'ID del departamento al que pertenece el municipio'
  },
}, {
  sequelize,
  modelName: 'Municipios',
  tableName: 'municipios',
  timestamps: true
});

export default Municipios;
