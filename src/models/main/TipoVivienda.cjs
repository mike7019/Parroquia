'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoVivienda extends Model {
    static associate(models) {
      // Relación muchos a muchos con Familia
      TipoVivienda.belongsToMany(models.Familia, {
        through: 'familia_tipo_vivienda',
        foreignKey: 'id_tipo_vivienda',
        otherKey: 'id_familia',
        as: 'familias'
      });
    }
  }

  TipoVivienda.init({
    id_tipo_vivienda: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'La descripción no puede exceder 255 caracteres'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'TipoVivienda',
    tableName: 'tipo_viviendas',
    timestamps: true
  });

  return TipoVivienda;
};
