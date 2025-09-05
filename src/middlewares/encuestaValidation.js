import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { Familias, Persona } from '../models/index.js';
import crypto from 'crypto';

/**
 * Middleware para validaciones específicas de encuestas
 */
class EncuestaValidationMiddleware {
  
  /**
   * Validar estructura básica de la encuesta
   */
  static validarEstructuraBasica(req, res, next) {
    const {
      informacionGeneral,
      vivienda,
      servicios_agua,
      observaciones,
      familyMembers = [],
      deceasedMembers = [],
      metadata = {}
    } = req.body;

    const errores = [];

    // Validar secciones obligatorias
    if (!informacionGeneral) {
      errores.push('La sección informacionGeneral es requerida');
    }
    if (!vivienda) {
      errores.push('La sección vivienda es requerida');
    }
    if (!servicios_agua) {
      errores.push('La sección servicios_agua es requerida');
    }
    if (!observaciones) {
      errores.push('La sección observaciones es requerida');
    }

    // Validar campos específicos de información general
    if (informacionGeneral) {
      if (!informacionGeneral.apellido_familiar) {
        errores.push('El apellido familiar es requerido');
      }
      if (!informacionGeneral.direccion) {
        errores.push('La dirección es requerida');
      }
      if (!informacionGeneral.telefono) {
        errores.push('El teléfono es requerido');
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan secciones obligatorias en la encuesta',
        errors: errores,
        code: 'INVALID_STRUCTURE'
      });
    }

    next();
  }

  /**
   * Validar identificaciones únicas dentro de la familia
   */
  static validarIdentificacionesUnicas(req, res, next) {
    try {
      const { familyMembers = [], deceasedMembers = [] } = req.body;
      
      console.log('🔍 Validando identificaciones únicas dentro de la familia...');
      
      const todasLasIdentificaciones = [];
      const identificacionesDuplicadas = [];
      
      // Recopilar identificaciones de miembros vivos
      if (familyMembers && familyMembers.length > 0) {
        familyMembers.forEach((member, index) => {
          if (member.numeroIdentificacion && member.numeroIdentificacion.trim()) {
            const identificacion = member.numeroIdentificacion.trim();
            
            if (todasLasIdentificaciones.includes(identificacion)) {
              identificacionesDuplicadas.push({
                identificacion,
                nombre: member.nombres || `Miembro ${index + 1}`,
                tipo: 'miembro_vivo',
                posicion: index + 1
              });
            } else {
              todasLasIdentificaciones.push(identificacion);
            }
          }
        });
      }
      
      // Recopilar identificaciones de miembros fallecidos
      if (deceasedMembers && deceasedMembers.length > 0) {
        deceasedMembers.forEach((member, index) => {
          if (member.numeroIdentificacion && member.numeroIdentificacion.trim()) {
            const identificacion = member.numeroIdentificacion.trim();
            
            if (todasLasIdentificaciones.includes(identificacion)) {
              identificacionesDuplicadas.push({
                identificacion,
                nombre: member.nombres || `Miembro fallecido ${index + 1}`,
                tipo: 'miembro_fallecido',
                posicion: index + 1
              });
            } else {
              todasLasIdentificaciones.push(identificacion);
            }
          }
        });
      }
      
      if (identificacionesDuplicadas.length > 0) {
        console.log(`❌ Se encontraron ${identificacionesDuplicadas.length} identificaciones duplicadas en la familia`);
        
        return res.status(400).json({
          status: 'error',
          message: 'Los miembros de la familia no pueden tener los mismos números de identificación',
          details: `Se encontraron números de identificación duplicados en la familia: ${identificacionesDuplicadas.map(d => `${d.nombre} (${d.identificacion})`).join(', ')}`,
          error_code: 'IDENTIFICACIONES_DUPLICADAS_EN_FAMILIA',
          duplicados: identificacionesDuplicadas,
          sugerencia: 'Verifique que cada miembro de la familia tenga un número de identificación único'
        });
      }
      
      console.log(`✅ Todas las ${todasLasIdentificaciones.length} identificaciones son únicas dentro de la familia`);
      next();
      
    } catch (error) {
      console.error('❌ Error validando identificaciones únicas:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al validar identificaciones únicas',
        error_code: 'VALIDATION_ERROR'
      });
    }
  }

  /**
   * Validar que los miembros no pertenezcan a otra familia
   */
  static async validarMiembrosUnicos(req, res, next) {
    try {
      const { familyMembers = [], deceasedMembers = [] } = req.body;
      
      console.log('🔍 Validando que los miembros no pertenezcan a otra familia...');
      
      // Recopilar todas las identificaciones a validar
      const identificacionesAValidar = [];
      
      // Agregar identificaciones de miembros vivos
      if (familyMembers && familyMembers.length > 0) {
        familyMembers.forEach(member => {
          if (member.numeroIdentificacion) {
            identificacionesAValidar.push(member.numeroIdentificacion);
          }
        });
      }
      
      // Agregar identificaciones de miembros fallecidos
      if (deceasedMembers && deceasedMembers.length > 0) {
        deceasedMembers.forEach(member => {
          if (member.numeroIdentificacion) {
            identificacionesAValidar.push(member.numeroIdentificacion);
          }
        });
      }
      
      if (identificacionesAValidar.length === 0) {
        console.log('  ✅ No hay identificaciones para validar');
        return next();
      }
      
      console.log(`  🔍 Validando ${identificacionesAValidar.length} identificaciones...`);
      
      // Buscar personas existentes con estas identificaciones
      const personasExistentes = await sequelize.query(`
        SELECT 
          p.identificacion,
          p.primer_nombre,
          p.primer_apellido,
          p.id_familia_familias,
          f.apellido_familiar,
          f.id_familia
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        WHERE p.identificacion IN (:identificaciones)
      `, {
        replacements: { identificaciones: identificacionesAValidar },
        type: QueryTypes.SELECT
      });
      
      if (personasExistentes.length > 0) {
        console.log(`  ❌ Se encontraron ${personasExistentes.length} personas que ya pertenecen a otras familias`);
        
        // Formatear conflictos para la respuesta
        const conflictos = personasExistentes.map(persona => ({
          identificacion: persona.identificacion,
          nombre_completo: `${persona.primer_nombre} ${persona.primer_apellido || ''}`.trim(),
          familia_actual: {
            id: persona.id_familia,
            apellido: persona.apellido_familiar || 'Sin apellido familiar'
          }
        }));
        
        return res.status(409).json({
          status: 'error',
          message: 'Algunos miembros ya pertenecen a otra familia',
          details: `Las siguientes personas ya pertenecen a otra familia: ${conflictos.map(c => `${c.nombre_completo} (${c.identificacion})`).join(', ')}`,
          error_code: 'MIEMBROS_DUPLICADOS',
          conflictos: conflictos,
          sugerencia: 'Verifique los números de identificación de los miembros de la familia'
        });
      }
      
      console.log('  ✅ Todos los miembros son únicos');
      next();
      
    } catch (error) {
      console.error('❌ Error validando miembros únicos:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al validar miembros únicos',
        error_code: 'VALIDATION_ERROR'
      });
    }
  }

  /**
   * Verificar si una familia ya existe
   */
  static async verificarFamiliaExistente(req, res, next) {
    try {
      const { informacionGeneral, familyMembers = [] } = req.body;
      
      console.log('🔍 Verificando familia existente...');
      
      const familiaExistente = await Familias.findOne({
        where: {
          apellido_familiar: informacionGeneral.apellido_familiar,
          telefono: informacionGeneral.telefono,
          direccion_familia: informacionGeneral.direccion
        }
      });

      if (familiaExistente) {
        // Detectar posibles errores de formulación comparando miembros
        const miembrosExistentes = await sequelize.query(`
          SELECT identificacion, primer_nombre, primer_apellido 
          FROM personas 
          WHERE id_familia_familias = :familiaId
        `, {
          replacements: { familiaId: familiaExistente.id_familia },
          type: QueryTypes.SELECT
        });

        const identificacionesNuevas = familyMembers?.map(m => m.numeroIdentificacion).filter(Boolean) || [];
        const identificacionesExistentes = miembrosExistentes.map(m => m.identificacion).filter(Boolean);
        
        const hayMiembrosNuevos = identificacionesNuevas.some(id => !identificacionesExistentes.includes(id));
        
        let mensajeDetallado = 'Esta familia ya está registrada en el sistema.';
        if (hayMiembrosNuevos) {
          mensajeDetallado = 'Esta familia ya existe pero detectamos miembros con identificaciones diferentes. Esto podría indicar un error en la formulación de la encuesta.';
          console.log('🚨 Detectado posible error de formulación: misma familia con miembros diferentes');
        }

        console.log(`⚠️ Familia duplicada detectada: ${familiaExistente.apellido_familiar}`);
        return res.status(409).json({
          status: 'error',
          message: mensajeDetallado,
          code: 'DUPLICATE_FAMILY',
          data: {
            familia_existente: {
              id: familiaExistente.id_familia,
              apellido: familiaExistente.apellido_familiar,
              telefono: familiaExistente.telefono,
              direccion: familiaExistente.direccion_familia,
              fecha_registro: familiaExistente.fecha_ultima_encuesta,
              miembros_existentes: miembrosExistentes.map(m => ({
                identificacion: m.identificacion,
                nombre: `${m.primer_nombre} ${m.primer_apellido}`
              }))
            },
            miembros_en_nueva_encuesta: familyMembers?.map(m => ({
              identificacion: m.numeroIdentificacion,
              nombre: `${m.nombres} ${m.apellidos}`
            })) || [],
            posible_error_formulacion: hayMiembrosNuevos,
            instrucciones: hayMiembrosNuevos ? [
              "⚠️ POSIBLE ERROR: Verificar si cambiaste incorrectamente las cédulas de miembros existentes",
              "Si es la misma familia, usa el endpoint de actualización en lugar de crear una nueva"
            ] : [
              "Familia ya registrada anteriormente",
              "Si deseas actualizar la información, usa el endpoint de actualización correspondiente"
            ]
          }
        });
      }

      console.log('✅ Familia no existe previamente, puede continuar');
      next();
      
    } catch (error) {
      console.error('❌ Error verificando familia existente:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al verificar familia existente',
        error_code: 'VALIDATION_ERROR'
      });
    }
  }

  /**
   * Validar ID de encuesta para operaciones de actualización/eliminación
   */
  static validarIdEncuesta(req, res, next) {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de encuesta inválido',
        code: 'INVALID_ID'
      });
    }

    // Convertir a número para asegurar consistencia
    req.params.id = parseInt(id);
    next();
  }

  /**
   * Validar que la encuesta existe antes de operaciones
   */
  static async validarEncuestaExiste(req, res, next) {
    try {
      const { id } = req.params;
      
      const encuesta = await sequelize.query(
        'SELECT id_familia, apellido_familiar FROM familias WHERE id_familia = :id',
        {
          replacements: { id },
          type: QueryTypes.SELECT
        }
      );

      if (!encuesta || encuesta.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Encuesta no encontrada',
          code: 'ENCUESTA_NOT_FOUND'
        });
      }

      // Agregar información de la encuesta al request para uso posterior
      req.encuesta = encuesta[0];
      next();
      
    } catch (error) {
      console.error('❌ Error validando existencia de encuesta:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al validar encuesta',
        error_code: 'VALIDATION_ERROR'
      });
    }
  }

  /**
   * Validar campos permitidos para actualización
   */
  static validarCamposActualizacion(req, res, next) {
    const camposActualizar = req.body;
    
    // Campos permitidos para actualizar en la tabla familias
    const camposPermitidos = [
      'apellido_familiar',
      'sector', 
      'direccion_familia',
      'numero_contacto',
      'telefono',
      'email',
      'tamaño_familia',
      'tipo_vivienda',
      'estado_encuesta',
      'tutor_responsable',
      'comunionEnCasa'
    ];

    // Filtrar solo campos permitidos
    const camposValidos = {};
    Object.keys(camposActualizar).forEach(campo => {
      if (camposPermitidos.includes(campo)) {
        let valor = camposActualizar[campo];
        
        // Conversión especial para campos boolean
        if (campo === 'tutor_responsable' || campo === 'comunionEnCasa') {
          if (typeof valor === 'string') {
            valor = valor.trim() !== '' && valor.toLowerCase() !== 'false';
          } else {
            valor = valor || false;
          }
        }
        
        camposValidos[campo] = valor;
      }
    });

    if (Object.keys(camposValidos).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No se proporcionaron campos válidos para actualizar',
        code: 'NO_VALID_FIELDS',
        campos_permitidos: camposPermitidos
      });
    }

    // Agregar campos válidos al request
    req.camposValidos = camposValidos;
    next();
  }

  /**
   * Validar campos requeridos para actualización completa
   */
  static validarActualizacionCompleta(req, res, next) {
    const datosCompletos = req.body;
    
    const camposRequeridos = ['apellido_familiar', 'sector', 'direccion_familia'];
    const camposFaltantes = camposRequeridos.filter(campo => !datosCompletos[campo]);

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos para actualización completa',
        code: 'MISSING_REQUIRED_FIELDS',
        campos_faltantes: camposFaltantes
      });
    }

    next();
  }
}

/**
 * Función auxiliar para generar identificación única
 */
export const generarIdentificacionUnica = async (tipo = 'TEMP', contadorIntento = 0) => {
  try {
    const uuid = crypto.randomUUID().slice(0, 8);
    const timestamp = Date.now();
    const identificacion = `${tipo}_${timestamp}_${uuid}_${contadorIntento}`;
    
    // Verificar que no exista en la base de datos
    const existe = await Persona.findOne({
      where: { identificacion }
    });
    
    if (existe && contadorIntento < 10) {
      return await generarIdentificacionUnica(tipo, contadorIntento + 1);
    }
    
    if (contadorIntento >= 10) {
      throw new Error('No se pudo generar identificación única después de 10 intentos');
    }
    
    return identificacion;
  } catch (error) {
    console.error('Error generando identificación única:', error);
    return `${tipo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export default EncuestaValidationMiddleware;
