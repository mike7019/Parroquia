'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NivelesEducativos extends Model {
    static associate(models) {
      NivelesEducativos.hasMany(models.Persona, {
        foreignKey: 'id_niveles_educativos',
        as: 'personas'
      });
    }
  }

  NivelesEducativos.init({
    id_niveles_educativos: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    nivel: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    orden_nivel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NivelesEducativos',
    tableName: 'niveles_educativos',
    timestamps: false
  });

  return NivelesEducativos;
};
