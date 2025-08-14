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
  sequelize,
  modelName: 'Talla',
  tableName: 'tallas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Talla;
