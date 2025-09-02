import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Sector = sequelize.define('Sector', {
  id_sector: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  id_municipio: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'municipios',
      key: 'id_municipio'
    }
  }
}, {
  sequelize,
  modelName: 'Sector',
  tableName: 'sectores',
  timestamps: true, // Activar timestamps ya que existen en la DB
  underscored: true // Usar snake_case para las columnas (created_at, updated_at)
});

// Definir asociaciones
Sector.associate = function(models) {
  // Un sector pertenece a un municipio
  Sector.belongsTo(models.Municipios, {
    foreignKey: 'id_municipio',
    as: 'municipio'
  });
};

export default Sector;
