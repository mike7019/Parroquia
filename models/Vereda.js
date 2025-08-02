'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vereda extends Model {
    static associate(models) {
      // Define associations here
      
      // Relación con Municipio - una vereda pertenece a un municipio
      Vereda.belongsTo(models.Municipio, {
        foreignKey: 'id_municipio_municipios',
        as: 'municipio'
      });

      // Relación con Sector - una vereda pertenece a un sector
      Vereda.belongsTo(models.Sector, {
        foreignKey: 'id_sector_sector',
        as: 'sector'
      });

      // Relación con Familia - una vereda puede tener muchas familias
      Vereda.hasMany(models.Familia, {
        foreignKey: 'id_vereda_veredas',
        as: 'familias'
      });
    }
  }

  Vereda.init({
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
    modelName: 'Vereda',
    tableName: 'veredas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Vereda;
};
