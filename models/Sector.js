'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sector extends Model {
    static associate(models) {
      // Define associations here
      
      // Relación con Municipio - un sector pertenece a un municipio
      Sector.belongsTo(models.Municipio, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });

      // Relación con Vereda - un sector puede tener muchas veredas
      Sector.hasMany(models.Vereda, {
        foreignKey: 'id_sector_sector',
        as: 'veredas'
      });

      // Relación con Familia - un sector puede tener muchas familias
      Sector.hasMany(models.Familia, {
        foreignKey: 'id_sector',
        as: 'familias'
      });
    }
  }

  Sector.init({
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
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id_municipio'
      }
    }
  }, {
    sequelize,
    modelName: 'Sector',
    tableName: 'sector',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Sector;
};
