'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Parroquia extends Model {
    static associate(models) {
      // Define associations here
      Parroquia.hasMany(models.Persona, {
        foreignKey: 'id_parroquia',
        as: 'personas'
      });

      // Relación con Municipio - una parroquia pertenece a un municipio
      Parroquia.belongsTo(models.Municipio, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });
    }
  }

  Parroquia.init({
    id_parroquia: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    modelName: 'Parroquia',
    tableName: 'parroquia',
    timestamps: false
  });

  return Parroquia;
};
