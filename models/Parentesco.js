'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Parentesco extends Model {
    static associate(models) {
      Parentesco.hasMany(models.FamiliaParentesco, {
        foreignKey: 'id_parentesco',
        as: 'familiasParentesco'
      });
    }
  }

  Parentesco.init({
    id_parentesco: {
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
    modelName: 'Parentesco',
    tableName: 'parentesco',
    timestamps: false
  });

  return Parentesco;
};
