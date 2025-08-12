const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ComunidadCultural = sequelize.define('ComunidadCultural', {
    id_comunidad_cultural: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'El nombre de la comunidad cultural no puede estar vacío'
        },
        len: {
          args: [2, 255],
          msg: 'El nombre debe tener entre 2 y 255 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'La descripción no puede exceder los 1000 caracteres'
        }
      }
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ComunidadCultural',
    tableName: 'comunidades_culturales',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      },
      {
        fields: ['activo']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Definir asociaciones si es necesario
  ComunidadCultural.associate = function(models) {
    // Aquí se pueden definir asociaciones con otros modelos
    // Por ejemplo: ComunidadCultural.hasMany(models.Persona, { foreignKey: 'id_comunidad_cultural' });
  };

  return ComunidadCultural;
};
