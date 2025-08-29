import { body, validationResult } from 'express-validator';

/**
 * Validador para encuestas familiares
 */
export const validarEncuesta = [
  // Validaciones para informacionGeneral
  body('informacionGeneral').isObject().withMessage('informacionGeneral debe ser un objeto'),
  body('informacionGeneral.apellido_familiar')
    .notEmpty()
    .withMessage('El apellido familiar es requerido')
    .isLength({ min: 2, max: 200 })
    .withMessage('El apellido familiar debe tener entre 2 y 200 caracteres'),
  body('informacionGeneral.direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ max: 255 })
    .withMessage('La dirección no puede exceder 255 caracteres'),
  body('informacionGeneral.telefono')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono debe contener solo números y caracteres válidos'),
  body('informacionGeneral.numero_contrato_epm')
    .notEmpty()
    .withMessage('El número de contrato EPM es requerido'),
  body('informacionGeneral.fecha')
    .isISO8601()
    .withMessage('La fecha debe estar en formato ISO válido'),
  body('informacionGeneral.comunionEnCasa')
    .optional()
    .isBoolean()
    .withMessage('comunionEnCasa debe ser un valor booleano (true/false)'),

  // Validaciones para vivienda
  body('vivienda').isObject().withMessage('vivienda debe ser un objeto'),
  body('vivienda.tipo_vivienda').isObject().withMessage('tipo_vivienda debe ser un objeto'),
  body('vivienda.tipo_vivienda.id').notEmpty().withMessage('El ID del tipo de vivienda es requerido'),
  body('vivienda.disposicion_basuras').isObject().withMessage('disposicion_basuras debe ser un objeto'),

  // Validaciones para servicios_agua
  body('servicios_agua').isObject().withMessage('servicios_agua debe ser un objeto'),
  body('servicios_agua.pozo_septico').isBoolean().withMessage('pozo_septico debe ser booleano'),
  body('servicios_agua.letrina').isBoolean().withMessage('letrina debe ser booleano'),
  body('servicios_agua.campo_abierto').isBoolean().withMessage('campo_abierto debe ser booleano'),

  // Validaciones para observaciones
  body('observaciones').isObject().withMessage('observaciones debe ser un objeto'),
  body('observaciones.autorizacion_datos')
    .isBoolean()
    .withMessage('autorizacion_datos debe ser booleano'),
  body('observaciones.sustento_familia')
    .optional()
    .isLength({ max: 500 })
    .withMessage('sustento_familia no puede exceder 500 caracteres'),
  body('observaciones.observaciones_encuestador')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('observaciones_encuestador no puede exceder 1000 caracteres'),

  // Validaciones para familyMembers
  body('familyMembers').isArray().withMessage('familyMembers debe ser un array'),
  body('familyMembers').custom((members) => {
    if (members.length === 0) {
      throw new Error('Debe haber al menos un miembro en la familia');
    }
    return true;
  }),
  
  // Validar identificaciones únicas dentro del mismo array
  body('familyMembers').custom((members) => {
    const identificaciones = members
      .map(m => m.numeroIdentificacion)
      .filter(id => id && id.trim() && id.trim() !== '');
    
    const identificacionesUnicas = new Set(identificaciones);
    
    if (identificaciones.length !== identificacionesUnicas.size) {
      throw new Error('No puede haber números de identificación duplicados en la misma familia');
    }
    
    return true;
  }),
  body('familyMembers.*.nombres')
    .notEmpty()
    .withMessage('El nombre del miembro es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('familyMembers.*.numeroIdentificacion')
    .optional()
    .isString()
    .withMessage('El número de identificación debe ser una cadena')
    .custom((value) => {
      if (value && value.trim()) {
        // Remover caracteres no numéricos para validar longitud
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length > 15) {
          throw new Error('El número de identificación no puede exceder 15 dígitos');
        }
        if (cleanValue.length < 1) {
          throw new Error('El número de identificación debe tener al menos 1 dígito');
        }
      }
      return true;
    }),
  body('familyMembers.*.tipoIdentificacion')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        const validTypes = ['CC', 'TI', 'RC', 'CE', 'PP', 'PEP', 'DIE', 'CCD'];
        if (!validTypes.includes(value)) {
          throw new Error('Tipo de identificación no válido');
        }
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto tipoIdentificacion debe tener id y nombre');
        }
      }
      return true;
    }),
  body('familyMembers.*.fechaNacimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe estar en formato ISO válido'),
  body('familyMembers.*.sexo')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        const validSex = ['Hombre', 'Mujer', 'Masculino', 'Femenino', 'M', 'F'];
        if (!validSex.includes(value)) {
          throw new Error('Sexo no válido');
        }
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto sexo debe tener id y nombre');
        }
      }
      return true;
    }),
  body('familyMembers.*.situacionCivil')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        const validStates = ['Soltero', 'Soltera', 'Casado', 'Casada', 'Casado Civil', 'Divorciado', 'Divorciada', 'Viudo', 'Viuda', 'Unión Libre'];
        if (!validStates.includes(value)) {
          throw new Error('Situación civil no válida');
        }
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto situacionCivil debe tener id y nombre');
        }
      }
      return true;
    }),
  body('familyMembers.*.parentesco')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        return value.length <= 100;
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto parentesco debe tener id y nombre');
        }
      }
      return true;
    }),
  body('familyMembers.*.telefono')
    .optional()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('El teléfono debe contener solo números y caracteres válidos'),
  body('familyMembers.*.estudio')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        return value.length <= 200;
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto estudio debe tener id y nombre');
        }
      }
      return true;
    }),
  body('familyMembers.*.comunidadCultural')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        return value.length <= 100;
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto comunidadCultural debe tener id y nombre');
        }
      }
      return true;
    }),
  body('familyMembers.*.enfermedad')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        return value.length <= 100;
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto enfermedad debe tener id y nombre');
        }
      }
      return true;
    }),
  body('familyMembers.*.profesion')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        return value.length <= 100;
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto profesion debe tener id y nombre');
        }
      }
      return true;
    }),
  body('familyMembers.*[\'talla_camisa/blusa\']')
    .optional()
    .isString()
    .withMessage('Talla de camisa/blusa debe ser una cadena'),
  body('familyMembers.*.talla_pantalon')
    .optional()
    .isString()
    .withMessage('Talla de pantalón debe ser una cadena'),
  body('familyMembers.*.talla_zapato')
    .optional()
    .isString()
    .withMessage('Talla de zapato debe ser una cadena'),
  body('familyMembers.*.motivoFechaCelebrar')
    .optional()
    .isObject()
    .withMessage('motivoFechaCelebrar debe ser un objeto'),
  body('familyMembers.*.motivoFechaCelebrar.motivo')
    .optional()
    .isString()
    .withMessage('Motivo debe ser una cadena'),
  body('familyMembers.*.motivoFechaCelebrar.dia')
    .optional()
    .isString()
    .withMessage('Día debe ser una cadena'),
  body('familyMembers.*.motivoFechaCelebrar.mes')
    .optional()
    .isString()
    .withMessage('Mes debe ser una cadena'),

  // Validaciones para deceasedMembers (opcional)
  body('deceasedMembers').optional().isArray().withMessage('deceasedMembers debe ser un array'),
  
  // Validar identificaciones únicas entre miembros vivos y fallecidos
  body().custom((value) => {
    const familyMembers = value.familyMembers || [];
    const deceasedMembers = value.deceasedMembers || [];
    
    // Obtener todas las identificaciones
    const todasLasIdentificaciones = [
      ...familyMembers.map(m => m.numeroIdentificacion),
      ...deceasedMembers.map(m => m.numeroIdentificacion)
    ].filter(id => id && id.trim() && id.trim() !== '');
    
    const identificacionesUnicas = new Set(todasLasIdentificaciones);
    
    if (todasLasIdentificaciones.length !== identificacionesUnicas.size) {
      throw new Error('No puede haber números de identificación duplicados entre miembros vivos y fallecidos');
    }
    
    return true;
  }),
  body('deceasedMembers.*.nombres')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre del miembro fallecido debe tener entre 2 y 255 caracteres'),
  body('deceasedMembers.*.numeroIdentificacion')
    .optional()
    .isString()
    .withMessage('El número de identificación debe ser una cadena')
    .custom((value) => {
      if (value && value.trim()) {
        // Remover caracteres no numéricos para validar longitud
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length > 15) {
          throw new Error('El número de identificación no puede exceder 15 dígitos');
        }
        if (cleanValue.length < 1) {
          throw new Error('El número de identificación debe tener al menos 1 dígito');
        }
      }
      return true;
    }),
  body('deceasedMembers.*.fechaFallecimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fallecimiento debe estar en formato ISO válido'),
  body('deceasedMembers.*.fechaAniversario')
    .optional()
    .isISO8601()
    .withMessage('La fecha de aniversario debe estar en formato ISO válido'),
  body('deceasedMembers.*.eraPadre')
    .optional()
    .isBoolean()
    .withMessage('eraPadre debe ser booleano'),
  body('deceasedMembers.*.eraMadre')
    .optional()
    .isBoolean()
    .withMessage('eraMadre debe ser booleano'),
  body('deceasedMembers.*.sexo')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        const validSex = ['Hombre', 'Mujer', 'Masculino', 'Femenino', 'M', 'F'];
        if (!validSex.includes(value)) {
          throw new Error('Sexo no válido');
        }
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto sexo debe tener id y nombre');
        }
      }
      return true;
    }),
  body('deceasedMembers.*.parentesco')
    .optional()
    .custom((value) => {
      // Permitir tanto string como objeto {id, nombre}
      if (typeof value === 'string') {
        return value.length <= 100;
      } else if (typeof value === 'object' && value !== null) {
        if (!value.id || !value.nombre) {
          throw new Error('Objeto parentesco debe tener id y nombre');
        }
      }
      return true;
    }),
  body('deceasedMembers.*.causaFallecimiento')
    .optional()
    .isString()
    .withMessage('Causa de fallecimiento debe ser una cadena'),

  // Validaciones para metadata (opcional)
  body('metadata').optional().isObject().withMessage('metadata debe ser un objeto'),
  body('metadata.completed').optional().isBoolean().withMessage('completed debe ser booleano'),
  body('metadata.currentStage').optional().isInt({ min: 1 }).withMessage('currentStage debe ser un entero positivo'),

  // Middleware para manejar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos de la encuesta',
        errors: formattedErrors,
        total_errors: formattedErrors.length
      });
    }
    
    next();
  }
];

/**
 * Validaciones adicionales personalizadas
 */
export const validacionesPersonalizadas = {
  // Validar que al menos un tipo de disposición de basura esté seleccionado
  validarDisposicionBasura: (disposicion) => {
    const opciones = ['recolector', 'quemada', 'enterrada', 'recicla', 'aire_libre', 'no_aplica'];
    const seleccionadas = opciones.filter(opcion => disposicion[opcion] === true);
    return seleccionadas.length > 0;
  },

  // Validar formato de tallas
  validarTallas: (talla) => {
    if (!talla || typeof talla !== 'object') return true; // Opcional
    
    const tallasValidas = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'];
    
    if (talla.camisa && !tallasValidas.includes(talla.camisa)) return false;
    if (talla.pantalon && !tallasValidas.includes(talla.pantalon)) return false;
    if (talla.calzado && !tallasValidas.includes(talla.calzado)) return false;
    
    return true;
  },

  // Validar coherencia en fechas
  validarFechas: (familyMembers) => {
    const fechaActual = new Date();
    
    return familyMembers.every(miembro => {
      if (!miembro.fechaNacimiento) return true;
      
      const fechaNacimiento = new Date(miembro.fechaNacimiento);
      return fechaNacimiento <= fechaActual;
    });
  }
};

export default {
  validarEncuesta,
  validacionesPersonalizadas
};
