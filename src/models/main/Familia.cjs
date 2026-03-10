'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Familia extends Model {
    static associate(models) {
      // Relaciones existentes pueden mantenerse
      Familia.hasMany(models.Persona, {
        foreignKey: 'id_familia',
        as: 'personas'
      });

      // Nuevas relaciones para el sistema de encuestas
      Familia.belongsTo(models.Municipio, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });

      Familia.belongsTo(models.Sector, {
        foreignKey: 'id_sector',
        as: 'sectorFamilia'
      });

      Familia.belongsTo(models.Vereda, {
        foreignKey: 'id_vereda_veredas',
        as: 'vereda'
      });

      // Relación con Usuario (encuestador)
      Familia.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario_creador',
        as: 'encuestador'
      });

      // Nuevas relaciones muchos a muchos
      Familia.belongsToMany(models.TipoVivienda, {
        through: 'familia_tipo_vivienda',
        foreignKey: 'id_familia',
        otherKey: 'id_tipo_vivienda',
        as: 'tiposVivienda'
      });

      // Nueva relación directa con TipoVivienda
      if (models.TipoVivienda) {
        Familia.belongsTo(models.TipoVivienda, {
          foreignKey: 'id_tipo_vivienda',
          as: 'tipoVivienda'
        });
      }

      // Relación con Parroquia
      if (models.Parroquia) {
        Familia.belongsTo(models.Parroquia, {
          foreignKey: 'id_parroquia',
          as: 'parroquia'
        });
      }
    }
  }

  Familia.init({
    id_familia: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    // Campos actualizados según documentación
    apellidoFamiliar: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'apellido_familiar', // Mapeo al campo actualizado
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'direccion_familia', // Mapeo al campo existente
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'numero_contacto', // Mapeo al campo existente
      validate: {
        len: [10, 20]
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [10, 20]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    familySize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tamaño_familia',
      validate: {
        min: 1,
        max: 50
      }
    },
    surveyStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'estado_encuesta',
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'in_progress', 'completed']]
      }
    },
    surveysCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'numero_encuestas',
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    lastSurveyDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_ultima_encuesta'
    },
    // Campos existentes mantenidos
    codigo_familia: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tutor_responsable: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    // Relaciones geográficas
    id_municipio: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_vereda: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_sector: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    // NUEVOS CAMPOS PARA ENCUESTA
    id_parroquia: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'parroquias',
        key: 'id_parroquia'
      }
    },
    numero_contrato_epm: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    comunionEnCasa: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    fecha_encuesta: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    sustento_familia: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observaciones_encuestador: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_usuario_creador: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    autorizacion_datos: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    // Servicios de agua
    pozo_septico: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    letrina: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    campo_abierto: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    // Disposición de basuras (campos boolean)
    disposicion_recolector: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    disposicion_quemada: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    disposicion_enterrada: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    disposicion_recicla: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    disposicion_aire_libre: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    disposicion_no_aplica: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    // Cambiar tipo_vivienda a FK
    id_tipo_vivienda: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'tipos_vivienda',
        key: 'id_tipo_vivienda'
      }
    }
  }, {
    sequelize,
    modelName: 'Familia',
    tableName: 'familias',
    timestamps: false
  });

  return Familia;
};
