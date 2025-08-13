/**
 * Modelo Talla para operaciones de catálogo
 * Maneja tallas de zapatos, camisas y pantalones para asignar a personas
 */
import { DataTypes } from 'sequelize';

export default function(sequelize) {
  const Talla = sequelize.define('Talla', {
    id_talla: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_talla'
    },
    tipo_prenda: {
      type: DataTypes.ENUM('zapato', 'camisa', 'pantalon'),
      allowNull: false,
      field: 'tipo_prenda',
      comment: 'Tipo de prenda: zapato, camisa o pantalón'
    },
    talla: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'talla',
      comment: 'Talla de la prenda (ej: 40, M, 32, etc.)'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'descripcion',
      comment: 'Descripción adicional de la talla'
    },
    genero: {
      type: DataTypes.ENUM('masculino', 'femenino', 'unisex'),
      allowNull: false,
      defaultValue: 'unisex',
      field: 'genero',
      comment: 'Género para el cual aplica la talla'
    },
    equivalencia_numerica: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'equivalencia_numerica',
      comment: 'Equivalencia numérica para ordenamiento'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'activo'
    }
  }, {
    tableName: 'tallas',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['tipo_prenda', 'talla', 'genero'],
        name: 'unique_talla_tipo_genero'
      },
      {
        fields: ['tipo_prenda']
      },
      {
        fields: ['genero']
      },
      {
        fields: ['activo']
      }
    ],
    comment: 'Catálogo de tallas para zapatos, camisas y pantalones'
  });

  return Talla;
}
