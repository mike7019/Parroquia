'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Destrezas extends Model {
    static associate(models) {
      Destrezas.belongsToMany(models.Persona, {
        through: models.PersonaDestreza,
        foreignKey: 'id_destrezas',
        otherKey: 'id_persona',
        as: 'personas'
      });
    }
  }

  Destrezas.init({
    id_destrezas: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Destrezas',
    tableName: 'destrezas',
    timestamps: false
  });

  return Destrezas;
};
