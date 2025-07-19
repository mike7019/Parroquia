'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Municipios extends Model {
    static associate(models) {
      Municipios.hasMany(models.Persona, {
        foreignKey: 'id_municipio',
        as: 'personas'
      });
      
      Municipios.hasMany(models.Familia, {
        foreignKey: 'id_municipio',
        as: 'familias'
      });

      Municipios.hasMany(models.Veredas, {
        foreignKey: 'id_municipio',
        as: 'veredas'
      });

      Municipios.hasMany(models.Sector, {
        foreignKey: 'id_municipio',
        as: 'sectores'
      });

      Municipios.hasMany(models.Parroquia, {
        foreignKey: 'id_municipio',
        as: 'parroquias'
      });
    }
  }

  Municipios.init({
    id_municipio: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    codigo_dane: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    departamento: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Municipios',
    tableName: 'municipios',
    timestamps: false
  });

  return Municipios;
};
