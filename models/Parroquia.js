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
    }
  }, {
    sequelize,
    modelName: 'Parroquia',
    tableName: 'parroquia',
    timestamps: false
  });

  return Parroquia;
};
