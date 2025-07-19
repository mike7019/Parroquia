'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sexo extends Model {
    static associate(models) {
      // Define associations here
      Sexo.hasMany(models.Persona, {
        foreignKey: 'id_sexo',
        as: 'personas'
      });
    }
  }

  Sexo.init({
    id_sexo: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    sexo: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Sexo',
    tableName: 'sexo',
    timestamps: false
  });

  return Sexo;
};
