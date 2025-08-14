/**
 * Modelo Talla para operaciones de catálogo
 * Maneja tallas de zapatos, camisas y pantalones para asignar a personas
 */
import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Talla = sequelize.define('Talla', {
  id_talla: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_prenda: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['zapato', 'camisa', 'pantalon']]
    }
  },
  talla: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  genero: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unisex',
    validate: {
      isIn: [['masculino', 'femenino', 'unisex']]
    }
  },
  equivalencia_numerica: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
      fields: ['tipo_prenda'],
      name: 'idx_tallas_tipo_prenda'
    },
    {
      fields: ['genero'],
      name: 'idx_tallas_genero'
    },
    {
      fields: ['activo'],
      name: 'idx_tallas_activo'
    }
  ]
});

export default Talla;
