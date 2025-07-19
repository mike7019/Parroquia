'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EstadoCivil extends Model {
    static associate(models) {
      // Define associations here
      EstadoCivil.hasMany(models.Persona, {
        foreignKey: 'id_estado_civil',
        as: 'personas'
      });
    }
  }

  EstadoCivil.init({
    id_estado_civil: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(15),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'EstadoCivil',
    tableName: 'estado_civil',
    timestamps: false
  });

  return EstadoCivil;
};
