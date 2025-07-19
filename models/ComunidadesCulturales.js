'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ComunidadesCulturales extends Model {
    static associate(models) {
      ComunidadesCulturales.hasMany(models.Persona, {
        foreignKey: 'id_comunidades_culturales',
        as: 'personas'
      });

      ComunidadesCulturales.belongsToMany(models.Persona, {
        through: models.PersonaComunidadCultural,
        foreignKey: 'id_comunidades_culturales',
        otherKey: 'id_persona',
        as: 'miembros'
      });
    }
  }

  ComunidadesCulturales.init({
    id_comunidades_culturales: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ComunidadesCulturales',
    tableName: 'comunidades_culturales',
    timestamps: false
  });

  return ComunidadesCulturales;
};
