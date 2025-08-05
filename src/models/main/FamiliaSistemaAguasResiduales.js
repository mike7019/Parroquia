'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FamiliaTipoAguasResiduales extends Model {
    static associate(models) {
      // Relaciones con las tablas principales
      FamiliaTipoAguasResiduales.belongsTo(models.Familia, {
        foreignKey: 'id_familia',
        as: 'familia'
      });

      FamiliaTipoAguasResiduales.belongsTo(models.TipoAguasResiduales, {
        foreignKey: 'id_tipo_aguas_residuales',
        as: 'tipoAguasResiduales'
      });
    }
  }

  FamiliaTipoAguasResiduales.init({
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
    id_tipo_aguas_residuales: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de tipo de aguas residuales es requerido'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'FamiliaTipoAguasResiduales',
    tableName: 'familia_tipo_aguas_residuales',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['id_familia', 'id_tipo_aguas_residuales'],
        name: 'unique_familia_tipo_aguas_residuales'
      }
    ]
  });

  return FamiliaTipoAguasResiduales;
};
