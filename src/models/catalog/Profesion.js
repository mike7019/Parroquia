import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Profesion = sequelize.define('Profesion', {
    id_profesion: {
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
          msg: 'El nombre de la profesión no puede estar vacío'
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
    }
  }, {
    sequelize,
    modelName: 'Profesion',
    tableName: 'profesiones',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Definir asociaciones si es necesario
  Profesion.associate = function(models) {
    // Aquí se pueden definir asociaciones con otros modelos
    // Por ejemplo: Profesion.hasMany(models.Persona, { foreignKey: 'id_profesion' });
  };

  return Profesion;
};
