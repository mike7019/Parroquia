'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Destreza extends Model {
    static associate(models) {
      // Relación muchos a muchos con Persona (nomenclatura optimizada)
      Destreza.belongsToMany(models.Persona, {
        through: 'persona_destreza',
        foreignKey: 'id_destreza',
        otherKey: 'id_persona',
        as: 'personas'
      });
    }
  }

  Destreza.init({
    id_destrezas: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El nombre de la destreza es requerido'
        },
        notEmpty: {
          msg: 'El nombre de la destreza no puede estar vacío'
        },
        len: {
          args: [1, 255],
          msg: 'El nombre de la destreza debe tener entre 1 y 255 caracteres'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Destreza',
    tableName: 'destrezas',
    timestamps: true, // Activar timestamps para mejor auditoría
    paranoid: false, // Sin soft deletes por ahora
    indexes: [
      {
        fields: ['nombre'],
        unique: true,
        name: 'idx_destrezas_nombre_unique'
      }
    ],
    validate: {
      // Validaciones a nivel de modelo si es necesario
    }
  });

  return Destreza;
};
