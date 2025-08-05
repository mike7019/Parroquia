'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FamiliaDisposicionBasura extends Model {
    static associate(models) {
      // Relaciones con las tablas principales
      FamiliaDisposicionBasura.belongsTo(models.Familia, {
        foreignKey: 'id_familia',
        as: 'familia'
      });

      FamiliaDisposicionBasura.belongsTo(models.TipoDisposicionBasura, {
        foreignKey: 'id_tipo_disposicion_basura',
        as: 'tipoDisposicionBasura'
      });
    }
  }

  FamiliaDisposicionBasura.init({
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
    id_tipo_disposicion_basura: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de tipo de disposición de basura es requerido'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'FamiliaDisposicionBasura',
    tableName: 'familia_disposicion_basura',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['id_familia', 'id_tipo_disposicion_basura'],
        name: 'unique_familia_disposicion_basura'
      }
    ]
  });

  return FamiliaDisposicionBasura;
};
