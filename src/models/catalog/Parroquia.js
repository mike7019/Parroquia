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
  direccion: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Dirección física de la parroquia'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [7, 20]
    },
    comment: 'Número de teléfono de contacto'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
      len: [5, 100]
    },
    comment: 'Correo electrónico de contacto'
  },
  id_municipio: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'municipios',
      key: 'id_municipio'
    },
    comment: 'ID del municipio al que pertenece la parroquia'
  }
}, {
  sequelize,
  modelName: 'Parroquia',
  tableName: 'parroquia', // Corregido: tabla singular
  timestamps: false, // Desactivar timestamps
  indexes: [
    {
      name: 'idx_parroquia_municipio',
      fields: ['id_municipio']
    },
    {
      name: 'idx_parroquia_nombre',
      fields: ['nombre']
    }
  ]
});

// Definir asociaciones
Parroquia.associate = function(models) {
  // Una parroquia pertenece a un municipio
  Parroquia.belongsTo(models.Municipios, {
    foreignKey: 'id_municipio',
    as: 'municipio'
  });
  
  // Nota: Los sectores ya no tienen relación con parroquia, 
  // solo con municipio según los nuevos requerimientos
};

export default Parroquia;
