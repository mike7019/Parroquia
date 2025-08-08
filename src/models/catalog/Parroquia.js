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
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  id_municipio: {
    type: DataTypes.BIGINT,
    allowNull: false, // Ahora requerido
    references: {
      model: 'municipios',
      key: 'id_municipio'
    },
    comment: 'ID del municipio al que pertenece la parroquia'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción opcional de la parroquia'
  },
  direccion: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Dirección física de la parroquia'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número de teléfono de contacto'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Correo electrónico de contacto'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    comment: 'Estado activo/inactivo de la parroquia'
  }
}, {
  sequelize,
  modelName: 'Parroquia',
  tableName: 'parroquia',
  timestamps: true, // Reactivar timestamps
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_parroquia_municipio',
      fields: ['id_municipio']
    },
    {
      name: 'idx_parroquia_nombre',
      fields: ['nombre']
    },
    {
      name: 'idx_parroquia_activo',
      fields: ['activo']
    }
  ]
});

export default Parroquia;
