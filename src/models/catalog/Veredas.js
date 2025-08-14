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
    allowNull: false
  },
  nombre_vereda: {
    type: DataTypes.STRING(255),
    allowNull: true // Permitir null inicialmente para la migración
  },
  codigo_vereda: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  id_municipio_municipios: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'municipios',
      key: 'id_municipio'
    }
  },
  id_sector_sector: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'sector',
      key: 'id_sector'
    }
  }
}, {
  sequelize,
  modelName: 'Veredas',
  tableName: 'veredas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // Sincronizar nombre_vereda con nombre al crear
    beforeCreate: (vereda, options) => {
      if (!vereda.nombre_vereda && vereda.nombre) {
        vereda.nombre_vereda = vereda.nombre;
      }
      if (!vereda.nombre && vereda.nombre_vereda) {
        vereda.nombre = vereda.nombre_vereda;
      }
    },
    // Sincronizar nombre_vereda con nombre al actualizar
    beforeUpdate: (vereda, options) => {
      if (vereda.changed('nombre') && !vereda.changed('nombre_vereda')) {
        vereda.nombre_vereda = vereda.nombre;
      }
      if (vereda.changed('nombre_vereda') && !vereda.changed('nombre')) {
        vereda.nombre = vereda.nombre_vereda;
      }
    }
  }
});

export default Veredas;
