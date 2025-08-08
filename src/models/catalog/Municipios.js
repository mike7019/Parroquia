import { DataTypes, Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Municipios = sequelize.define('Municipios', {
  id_municipio: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre_municipio: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  codigo_dane: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 5],
      isNumeric: true
    },
    comment: 'Código DANE del municipio (5 dígitos) - debe ser único'
  },
  id_departamento: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'departamentos',
      key: 'id_departamento'
    },
    comment: 'ID del departamento al que pertenece el municipio'
  },
}, {
  sequelize,
  modelName: 'Municipios',
  tableName: 'municipios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'municipios_codigo_dane_unique',
      unique: true,
      fields: ['codigo_dane']
    },
    {
      name: 'idx_municipios_nombre',
      fields: ['nombre_municipio']
    },
    {
      name: 'idx_municipios_departamento',
      fields: ['id_departamento']
    }
  ],
  validate: {
    codigoDaneUnique: function() {
      return Municipios.findOne({
        where: {
          codigo_dane: this.codigo_dane,
          id_municipio: { [Op.ne]: this.id_municipio }
        }
      }).then(municipio => {
        if (municipio) {
          throw new Error('El código DANE ya existe para otro municipio');
        }
      });
    }
  }
});

export default Municipios;
