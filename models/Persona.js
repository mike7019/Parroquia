'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    static associate(models) {
      // Define associations here
      Persona.belongsTo(models.TipoIdentificacion, {
        foreignKey: 'id_tipo_identificacion',
        as: 'tipoIdentificacion'
      });

      Persona.belongsTo(models.EstadoCivil, {
        foreignKey: 'id_estado_civil',
        as: 'estadoCivil'
      });

      Persona.belongsTo(models.Parroquia, {
        foreignKey: 'id_parroquia',
        as: 'parroquia'
      });

      Persona.belongsTo(models.Sexo, {
        foreignKey: 'id_sexo',
        as: 'sexo'
      });

      Persona.belongsTo(models.Familia, {
        foreignKey: 'id_familia',
        as: 'familia'
      });

      // Geographic relationships
      Persona.belongsTo(models.Municipios, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });

      Persona.belongsTo(models.Veredas, {
        foreignKey: 'id_vereda',
        as: 'vereda'
      });

      Persona.belongsTo(models.Sector, {
        foreignKey: 'id_sector',
        as: 'sector'
      });

      // Education and cultural relationships
      Persona.belongsTo(models.NivelesEducativos, {
        foreignKey: 'id_niveles_educativos',
        as: 'nivelEducativo'
      });

      Persona.belongsTo(models.ComunidadesCulturales, {
        foreignKey: 'id_comunidades_culturales',
        as: 'comunidadCultural'
      });

      // Many-to-many relationships
      Persona.belongsToMany(models.Destrezas, {
        through: models.PersonaDestreza,
        foreignKey: 'id_persona',
        otherKey: 'id_destrezas',
        as: 'destrezas'
      });

      Persona.hasMany(models.FamiliaParentesco, {
        foreignKey: 'id_persona',
        as: 'familiasParentesco'
      });
    }
  }

  Persona.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    primer_nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    segundo_nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    primer_apellido: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    segundo_apellido: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    correo_electronico: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    contrasena: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    id_tipo_identificacion: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_estado_civil: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_parroquia: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_tipo_vivienda: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_sexo: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    numero_identificacion: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    lugar_nacimiento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    barrio: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ocupacion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nivel_educativo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    estado_salud: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_bautismo: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_primera_comunion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_confirmacion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    id_familia: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
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
    id_niveles_educativos: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_comunidades_culturales: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Persona',
    tableName: 'personas',
    timestamps: false
  });

  return Persona;
};
