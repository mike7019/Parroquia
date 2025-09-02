'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FamiliaTipoAguasResiduales extends Model {
    static associate(models) {
      // Relaciones con las tablas principales
      if (models.Familias) {
        FamiliaTipoAguasResiduales.belongsTo(models.Familias, {
          foreignKey: 'id_familia',
          as: 'familia'
        });
      }

      if (models.TipoAguasResiduales) {
        FamiliaTipoAguasResiduales.belongsTo(models.TipoAguasResiduales, {
          foreignKey: 'id_tipo_aguas_residuales',
          as: 'tipoAguasResiduales'
        });
      }
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
    tableName: 'familia_sistema_aguas_residuales',
    timestamps: true,
    // No definir indexes aquí ya que la tabla ya existe con sus índices correctos
    // indexes: []
  });

  return FamiliaTipoAguasResiduales;
};
