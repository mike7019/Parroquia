'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Encuesta extends Model {
    static associate(models) {
      // Relaciones con otras entidades
      Encuesta.belongsTo(models.Parroquia, {
        foreignKey: 'id_parroquia',
        as: 'parroquia'
      });

      Encuesta.belongsTo(models.Municipio, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });

      Encuesta.belongsTo(models.Sector, {
        foreignKey: 'id_sector',
        as: 'sector'
      });

      Encuesta.belongsTo(models.Vereda, {
        foreignKey: 'id_vereda',
        as: 'vereda'
      });
    }
  }

  Encuesta.init({
    id_encuesta: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_parroquia: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La parroquia es requerida'
        },
        notEmpty: {
          msg: 'La parroquia no puede estar vacía'
        }
      }
    },
    id_municipio: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El municipio es requerido'
        },
        notEmpty: {
          msg: 'El municipio no puede estar vacío'
        }
      }
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La fecha es requerida'
        },
        isDate: {
          msg: 'Debe ser una fecha válida'
        }
      }
    },
    id_sector: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El sector es requerido'
        },
        notEmpty: {
          msg: 'El sector no puede estar vacío'
        }
      }
    },
    id_vereda: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La vereda es requerida'
        },
        notEmpty: {
          msg: 'La vereda no puede estar vacía'
        }
      }
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tratamiento_datos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notNull: {
          msg: 'El consentimiento de tratamiento de datos es requerido'
        }
      }
    },
    firma: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Firma digital o ruta de imagen de firma'
    }
  }, {
    sequelize,
    modelName: 'Encuesta',
    tableName: 'encuestas',
    timestamps: true,
    indexes: [
      {
        fields: ['fecha']
      },
      {
        fields: ['id_municipio', 'id_sector']
      },
      {
        fields: ['fecha', 'id_parroquia']
      }
    ]
  });

  return Encuesta;
};
