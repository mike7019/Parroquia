import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const FamilyMember = sequelize.define('FamilyMember', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  surveyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'survey_id',
    references: {
      model: 'encuestas',
      key: 'id'
    }
  },
  nombres: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 500]
    },
    comment: 'Nombres completos del miembro'
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_nacimiento',
    validate: {
      isDate: true,
      isBefore: new Date().toISOString()
    }
  },
  tipoIdentificacion: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'tipo_identificacion',
    validate: {
      isIn: [['CC', 'TI', 'RC', 'CE', 'PP', 'PEP', 'DIE', 'CCD']]
    }
  },
  numeroIdentificacion: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'numero_identificacion',
    validate: {
      notEmpty: true,
      len: [6, 50]
    }
  },
  sexo: {
    type: DataTypes.ENUM('M', 'F', 'Otro'),
    allowNull: false,
    validate: {
      isIn: [['M', 'F', 'Otro']]
    }
  },
  situacionCivil: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'situacion_civil',
    validate: {
      isIn: [['Soltero', 'Soltera', 'Casado', 'Casada', 'Divorciado', 'Divorciada', 'Viudo', 'Viuda', 'Unión Libre']]
    }
  },
  parentesco: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  // Tallas como JSON para flexibilidad
  talla: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      camisa: '',
      pantalon: '',
      calzado: ''
    },
    validate: {
      isValidTalla(value) {
        if (!value || typeof value !== 'object') {
          throw new Error('Talla must be an object');
        }
        if (!value.hasOwnProperty('camisa') || !value.hasOwnProperty('pantalon') || !value.hasOwnProperty('calzado')) {
          throw new Error('Talla must have camisa, pantalon, and calzado properties');
        }
      }
    }
  },
  estudio: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Nivel educativo o estudios realizados'
  },
  comunidadCultural: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'comunidad_cultural',
    validate: {
      notEmpty: true
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [10, 20]
    }
  },
  enQueEresLider: {
    type: DataTypes.STRING(300),
    allowNull: true,
    field: 'en_que_eres_lider',
    comment: 'Descripción del liderazgo ejercido'
  },
  habilidadDestreza: {
    type: DataTypes.STRING(300),
    allowNull: true,
    field: 'habilidad_destreza',
    comment: 'Habilidades y destrezas del miembro'
  },
  correoElectronico: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'correo_electronico',
    validate: {
      isEmail: true
    }
  },
  enfermedad: {
    type: DataTypes.STRING(300),
    allowNull: true,
    comment: 'Enfermedades o condiciones médicas'
  },
  necesidadesEnfermo: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'necesidades_enfermo',
    comment: 'Necesidades específicas por enfermedad'
  },
  solicitudComunionCasa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'solicitud_comunion_casa',
    defaultValue: false,
    comment: 'Solicita comunión en casa'
  },
  // Información de celebración como JSON
  profesionMotivoFechaCelebrar: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'profesion_motivo_fecha_celebrar',
    defaultValue: {
      profesion: '',
      motivo: '',
      dia: '',
      mes: ''
    },
    validate: {
      isValidCelebration(value) {
        if (!value || typeof value !== 'object') {
          throw new Error('Celebration info must be an object');
        }
        if (!value.hasOwnProperty('profesion') || !value.hasOwnProperty('motivo') || 
            !value.hasOwnProperty('dia') || !value.hasOwnProperty('mes')) {
          throw new Error('Celebration info must have profesion, motivo, dia, and mes properties');
        }
      }
    }
  },
  // Campos adicionales para auditoría
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Orden en la familia'
  }
}, {
  tableName: 'personas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['survey_id']
    },
    {
      fields: ['numero_identificacion']
    },
    {
      fields: ['nombres']
    },
    {
      fields: ['parentesco']
    },
    {
      fields: ['active']
    }
  ]
});

// Métodos de instancia
FamilyMember.prototype.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

FamilyMember.prototype.isMinor = function() {
  return this.getAge() < 18;
};

FamilyMember.prototype.isFamilyHead = function() {
  return this.parentesco.toLowerCase().includes('jefe') || 
         this.parentesco.toLowerCase().includes('padre') ||
         this.parentesco.toLowerCase().includes('madre');
};

export default FamilyMember;
