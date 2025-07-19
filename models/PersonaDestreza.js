'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PersonaDestreza extends Model {
    static associate(models) {
      PersonaDestreza.belongsTo(models.Persona, {
        foreignKey: 'id_persona',
        as: 'persona'
      });
      PersonaDestreza.belongsTo(models.Destrezas, {
        foreignKey: 'id_destrezas',
        as: 'destreza'
      });
    }
  }

  PersonaDestreza.init({
    id_persona_destreza: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    id_persona: {
      type: DataTypes.UUID,
      allowNull: false
    },
    id_destrezas: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    nivel_competencia: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fecha_adquisicion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PersonaDestreza',
    tableName: 'personas_destrezas',
    timestamps: false
  });

  return PersonaDestreza;
};
