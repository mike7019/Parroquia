'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Familia extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  Familia.init({
    id_familia: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    codigo_familia: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nombre_familia: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    direccion_familia: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    numero_contacto: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    tutor_responsable: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Familia',
    tableName: 'familias',
    timestamps: false
  });

  return Familia;
};
