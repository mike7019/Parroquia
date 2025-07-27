import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Persona = sequelize.define('Persona', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  primer_nombre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  segundo_nombre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  primer_apellido: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  segundo_apellido: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  correo_electronico: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  numero_identificacion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fecha_nacimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ocupacion: {
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
  },
  id_municipio: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  id_sector: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Persona',
  tableName: 'personas',
  timestamps: false
});

export default Persona;
