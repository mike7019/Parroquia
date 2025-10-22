import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const CentrosPoblados = sequelize.define('CentrosPoblados', {
  id_centro_poblado: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo_centro_poblado: {
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
  }
}, {
  sequelize,
  modelName: 'CentrosPoblados',
  tableName: 'centros_poblados',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Definir asociaciones
CentrosPoblados.associate = function(models) {
  // Forzar la relación belongsTo con claves explícitas
  CentrosPoblados.belongsTo(models.Municipios, {
    foreignKey: 'id_municipio_municipios',
    targetKey: 'id_municipio',
    as: 'municipio',
    constraints: false // Evita errores si la FK no está bien enlazada
  });
};

export default CentrosPoblados;
