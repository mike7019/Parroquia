'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Veredas extends Model {
    static associate(models) {
      Veredas.belongsTo(models.Municipios, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });

      Veredas.hasMany(models.Persona, {
        foreignKey: 'id_vereda',
        as: 'personas'
      });

      Veredas.hasMany(models.Familia, {
        foreignKey: 'id_vereda',
        as: 'familias'
      });

      Veredas.hasMany(models.Sector, {
        foreignKey: 'id_vereda',
        as: 'sectores'
      });
    }
  }

  Veredas.init({
    id_vereda: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    codigo_vereda: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    id_municipio: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Veredas',
    tableName: 'veredas',
    timestamps: false
  });

  return Veredas;
};
