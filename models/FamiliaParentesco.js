'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FamiliaParentesco extends Model {
    static associate(models) {
      FamiliaParentesco.belongsTo(models.Persona, {
        foreignKey: 'id_persona',
        as: 'persona'
      });
      FamiliaParentesco.belongsTo(models.Familia, {
        foreignKey: 'id_familia',
        as: 'familia'
      });
      FamiliaParentesco.belongsTo(models.Parentesco, {
        foreignKey: 'id_parentesco',
        as: 'parentesco'
      });
    }
  }

  FamiliaParentesco.init({
    id_familia_parentesco: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    id_persona: {
      type: DataTypes.UUID,
      allowNull: false
    },
    id_familia: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id_parentesco: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    es_jefe_familia: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'FamiliaParentesco',
    tableName: 'familias_parentesco',
    timestamps: false
  });

  return FamiliaParentesco;
};
