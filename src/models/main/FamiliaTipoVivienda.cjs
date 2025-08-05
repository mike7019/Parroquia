'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FamiliaTipoVivienda extends Model {
    static associate(models) {
      // Relaciones con las tablas principales
      FamiliaTipoVivienda.belongsTo(models.Familia, {
        foreignKey: 'id_familia',
        as: 'familia'
      });

      FamiliaTipoVivienda.belongsTo(models.TipoVivienda, {
        foreignKey: 'id_tipo_vivienda',
        as: 'tipoVivienda'
      });
    }
  }

  FamiliaTipoVivienda.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_familia: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de familia es requerido'
        }
      }
    },
    id_tipo_vivienda: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de tipo de vivienda es requerido'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'FamiliaTipoVivienda',
    tableName: 'familia_tipo_vivienda',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['id_familia', 'id_tipo_vivienda'],
        name: 'unique_familia_tipo_vivienda'
      }
    ]
  });

  return FamiliaTipoVivienda;
};
