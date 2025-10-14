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
      isValidPhone(value) {
        if (value && value.trim() !== '') {
          if (value.length < 7 || value.length > 20) {
            throw new Error('Teléfono debe tener entre 7 y 20 caracteres');
          }
        }
      }
    },
    comment: 'Número de teléfono de contacto'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isValidEmail(value) {
        if (value && value.trim() !== '') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error('Email debe ser válido');
          }
          if (value.length < 5 || value.length > 100) {
            throw new Error('Email debe tener entre 5 y 100 caracteres');
          }
        }
      }
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
