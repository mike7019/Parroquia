import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { Familias, Municipios, Parroquia, Sector, Veredas, Sexo, TipoIdentificacion, Persona } from '../models/index.js';
import DifuntosFamilia from '../models/catalog/DifuntosFamilia.js';
import crypto from 'crypto';
import FamiliasConsultasService from '../services/familiasConsultasService.js';
import { generarIdentificacionUnica } from '../middlewares/encuestaValidation.js';
import { ErrorCodes, createError } from '../utils/errorCodes.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/responseFormatter.js';
import EncuestaService from '../services/encuestaService.js';
import personaDetallesHelper from '../services/helpers/personaDetallesHelper.js';

/**
 * Helper function to safely parse integers and return null if NaN
 */
const safeParseInt = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Helper function to format complete names properly
 */
const formatearNombreCompleto = (primerNombre, segundoNombre, primerApellido, segundoApellido) => {
  const partes = [primerNombre, segundoNombre, primerApellido, segundoApellido]
    .filter(parte => parte && parte.trim()) // Solo incluir partes no vacías
    .map(parte => parte.trim()); // Limpiar espacios en blanco
  
  return partes.join(' ');
};

/**
 * Funciones auxiliares para reducir complejidad del controller principal
 */

/**
 * Registrar disposición de basuras
 * Soporta dos formatos:
 * - Formato v1: { recolector: true, quemada: false, ... }
 * - Formato v2: [{ id: "5", nombre: "Campo Abierto", seleccionado: true }, ...]
 */
const registrarDisposicionBasuras = async (familiaId, disposicionBasuras, transaction) => {
  console.log('🗑️ Registrando disposición de basuras...');
  if (!disposicionBasuras) return;

  // Detectar si es formato v2 (array) o v1 (objeto)
  const isV2Format = Array.isArray(disposicionBasuras);
  
  if (isV2Format) {
    // Formato v2: Array de objetos con ID directo
    console.log('  📋 Detectado formato v2.0 (array de disposiciones)');
    
    for (const disposicion of disposicionBasuras) {
      if (disposicion.seleccionado) {
        const disposicionId = safeParseInt(disposicion.id);
        
        if (!disposicionId) {
          console.log(`  ⚠️ ID inválido para disposición: ${disposicion.nombre}, saltando...`);
          continue;
        }
        
        try {
          // Verificar si ya existe antes de insertar
          const existingRecord = await sequelize.query(
            'SELECT id FROM familia_disposicion_basura WHERE id_familia = $1 AND id_tipo_disposicion_basura = $2',
            {
              bind: [familiaId, disposicionId],
              type: QueryTypes.SELECT,
              transaction
            }
          );
          
          if (existingRecord.length === 0) {
            await sequelize.query(
              'INSERT INTO familia_disposicion_basura (id_familia, id_tipo_disposicion_basura, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
              {
                bind: [familiaId, disposicionId],
                transaction
              }
            );
            console.log(`  ✅ Disposición registrada: ${disposicion.nombre} (ID: ${disposicionId})`);
          } else {
            console.log(`  ℹ️ Disposición ya existe: ${disposicion.nombre}`);
          }
        } catch (error) {
          // Detectar violaciones de foreign key
          if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
            throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
              catalog: 'tipo_disposicion_basura',
              invalidId: disposicionId,
              details: `El tipo de disposición de basura "${disposicion.nombre}" (ID ${disposicionId}) no existe en el catálogo`,
              suggestion: 'Verifique que el ID de la disposición de basura sea válido del catálogo'
            });
          }
          
          throw createError(ErrorCodes.BUSINESS_LOGIC.SERVICE_REGISTRATION_FAILED, {
            service: 'disposicion_basuras',
            tipo: disposicion.nombre,
            familiaId,
            originalError: error.message
          });
        }
      }
    }
  } else {
    // Formato v1: Objeto con propiedades booleanas
    console.log('  📋 Detectado formato v1.0 (objeto con booleanos)');
    
    const disposicionMapping = {
      recolector: 1,    // "Recolección Pública"
      quemada: 2,       // "Quema"
      enterrada: 3,     // "Entierro"
      recicla: 4,       // "Reciclaje"
      aire_libre: 6,    // "Botadero"
      no_aplica: 7      // "Otro"
    };

    for (const [tipo, activo] of Object.entries(disposicionBasuras)) {
      if (activo && disposicionMapping[tipo]) {
        try {
          // Verificar si ya existe antes de insertar
          const existingRecord = await sequelize.query(
            'SELECT id FROM familia_disposicion_basura WHERE id_familia = $1 AND id_tipo_disposicion_basura = $2',
            {
              bind: [familiaId, disposicionMapping[tipo]],
              type: QueryTypes.SELECT,
              transaction
            }
          );
          
          if (existingRecord.length === 0) {
            await sequelize.query(
              'INSERT INTO familia_disposicion_basura (id_familia, id_tipo_disposicion_basura, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
              {
                bind: [familiaId, disposicionMapping[tipo]],
                transaction
              }
            );
            console.log(`  ✅ Disposición registrada: ${tipo}`);
          } else {
            console.log(`  ℹ️ Disposición ya existe: ${tipo}`);
          }
        } catch (error) {
          // Detectar violaciones de foreign key
          if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
            throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
              catalog: 'tipo_disposicion_basura',
              invalidId: disposicionMapping[tipo],
              details: `El tipo de disposición de basura "${tipo}" (ID ${disposicionMapping[tipo]}) no existe en el catálogo`,
              suggestion: 'Verifique que el tipo de disposición de basura sea válido'
            });
          }
          
          throw createError(ErrorCodes.BUSINESS_LOGIC.SERVICE_REGISTRATION_FAILED, {
            service: 'disposicion_basuras',
            tipo,
            familiaId,
            originalError: error.message
          });
        }
      }
    }
  }
};

/**
 * Registrar sistema de acueducto
 */
const registrarSistemaAcueducto = async (familiaId, sistemaAcueducto, transaction) => {
  console.log('💧 Registrando sistema de acueducto...');
  if (!sistemaAcueducto) return;

  try {
    let sistemaId = sistemaAcueducto.id || 1; // Default: Acueducto Público
    
    // Verificar si ya existe antes de insertar
    const existingRecord = await sequelize.query(
      'SELECT id FROM familia_sistema_acueducto WHERE id_familia = $1 AND id_sistema_acueducto = $2',
      {
        bind: [familiaId, sistemaId],
        type: QueryTypes.SELECT,
        transaction
      }
    );
    
    if (existingRecord.length === 0) {
      await sequelize.query(
        'INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        {
          bind: [familiaId, sistemaId],
          transaction
        }
      );
      console.log(`  ✅ Sistema acueducto registrado: ID ${sistemaId}`);
    } else {
      console.log(`  ℹ️ Sistema acueducto ya existe: ID ${sistemaId}`);
    }
  } catch (error) {
    // Detectar violaciones de foreign key
    if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
      throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
        catalog: 'sistemas_acueducto',
        invalidId: sistemaId,
        details: `El sistema de acueducto con ID ${sistemaId} no existe en el catálogo`,
        suggestion: 'Verifique que el ID del sistema de acueducto sea correcto o seleccione un sistema válido del catálogo'
      });
    }
    
    throw createError(ErrorCodes.BUSINESS_LOGIC.SERVICE_REGISTRATION_FAILED, {
      service: 'sistema_acueducto',
      familiaId,
      sistemaId: sistemaAcueducto?.id,
      originalError: error.message
    });
  }
};

/**
 * Registrar aguas residuales
 * Soporta dos formatos:
 * - Formato v1: { id: 1, nombre: "Alcantarillado" }
 * - Formato v2: [{ id: "1", nombre: "Alcantarillado Público", seleccionado: true }, ...]
 */
const registrarAguasResiduales = async (familiaId, aguasResiduales, transaction) => {
  console.log('🚰 Registrando aguas residuales...');
  if (!aguasResiduales) return;

  // Detectar si es formato v2 (array) o v1 (objeto)
  const isV2Format = Array.isArray(aguasResiduales);
  
  if (isV2Format) {
    // Formato v2: Array de objetos - procesar todos los seleccionados
    console.log('  📋 Detectado formato v2.0 (array de aguas residuales)');
    
    for (const aguaResidual of aguasResiduales) {
      if (aguaResidual.seleccionado) {
        const aguaResidualId = safeParseInt(aguaResidual.id);
        
        if (!aguaResidualId) {
          console.log(`  ⚠️ ID inválido para agua residual: ${aguaResidual.nombre}, saltando...`);
          continue;
        }
        
        try {
          // Verificar si ya existe antes de insertar
          const existingRecord = await sequelize.query(
            'SELECT id FROM familia_sistema_aguas_residuales WHERE id_familia = $1 AND id_tipo_aguas_residuales = $2',
            {
              bind: [familiaId, aguaResidualId],
              type: QueryTypes.SELECT,
              transaction
            }
          );
          
          if (existingRecord.length === 0) {
            await sequelize.query(
              'INSERT INTO familia_sistema_aguas_residuales (id_familia, id_tipo_aguas_residuales, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
              {
                bind: [familiaId, aguaResidualId],
                transaction
              }
            );
            console.log(`  ✅ Agua residual registrada: ${aguaResidual.nombre} (ID: ${aguaResidualId})`);
          } else {
            console.log(`  ℹ️ Agua residual ya existe: ${aguaResidual.nombre}`);
          }
        } catch (error) {
          // Detectar violaciones de foreign key
          if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
            throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
              catalog: 'tipos_aguas_residuales',
              invalidId: aguaResidualId,
              details: `El tipo de aguas residuales "${aguaResidual.nombre}" (ID ${aguaResidualId}) no existe en el catálogo`,
              suggestion: 'Verifique que el ID del tipo de aguas residuales sea válido del catálogo'
            });
          }
          
          throw createError(ErrorCodes.BUSINESS_LOGIC.SERVICE_REGISTRATION_FAILED, {
            service: 'aguas_residuales',
            familiaId,
            aguaResidualesId: aguaResidualId,
            originalError: error.message
          });
        }
      }
    }
  } else {
    // Formato v1: Objeto único
    console.log('  📋 Detectado formato v1.0 (objeto único)');
    
    try {
      let aguaResidualesId = aguasResiduales.id || 1; // Default: Alcantarillado
      
      // Verificar si ya existe antes de insertar
      const existingRecord = await sequelize.query(
        'SELECT id FROM familia_sistema_aguas_residuales WHERE id_familia = $1 AND id_tipo_aguas_residuales = $2',
        {
          bind: [familiaId, aguaResidualesId],
          type: QueryTypes.SELECT,
          transaction
        }
      );
      
      if (existingRecord.length === 0) {
        await sequelize.query(
          'INSERT INTO familia_sistema_aguas_residuales (id_familia, id_tipo_aguas_residuales, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
          {
            bind: [familiaId, aguaResidualesId],
            transaction
          }
        );
        console.log(`  ✅ Aguas residuales registradas: ID ${aguaResidualesId}`);
      } else {
        console.log(`  ℹ️ Aguas residuales ya existen: ID ${aguaResidualesId}`);
      }
    } catch (error) {
      // Detectar violaciones de foreign key
      if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
        throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
          catalog: 'tipos_aguas_residuales',
          invalidId: aguasResiduales.id,
          details: `El tipo de aguas residuales con ID ${aguasResiduales.id} no existe en el catálogo`,
          suggestion: 'Verifique que el ID del tipo de aguas residuales sea correcto o seleccione un tipo válido del catálogo'
        });
      }
      
      throw createError(ErrorCodes.BUSINESS_LOGIC.SERVICE_REGISTRATION_FAILED, {
        service: 'aguas_residuales',
        familiaId,
        aguaResidualesId: aguasResiduales?.id,
        originalError: error.message
      });
    }
  }
};

/**
 * Registrar tipo de vivienda
 */
const registrarTipoVivienda = async (familiaId, tipoVivienda, transaction) => {
  console.log('🏠 Registrando tipo de vivienda...');
  if (!tipoVivienda) return;

  try {
    let tipoViviendaId = tipoVivienda.id;
    if (!tipoViviendaId) {
      const TipoVivienda = sequelize.models.TiposVivienda;
      const tipo = await TipoVivienda.findOne({
        where: { nombre: { [sequelize.Op.iLike]: `%${tipoVivienda.nombre}%` } }
      });
      tipoViviendaId = tipo?.id_tipo_vivienda || 1; // Default: Casa
    }

    // Verificar si ya existe antes de insertar
    const existingRecord = await sequelize.query(
      'SELECT id_familia FROM familia_tipo_vivienda WHERE id_familia = $1 AND id_tipo_vivienda = $2',
      {
        bind: [familiaId, tipoViviendaId],
        type: QueryTypes.SELECT,
        transaction
      }
    );
    
    if (existingRecord.length === 0) {
      await sequelize.query(
        'INSERT INTO familia_tipo_vivienda (id_familia, id_tipo_vivienda, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        {
          bind: [familiaId, tipoViviendaId],
          transaction
        }
      );
      console.log(`  ✅ Tipo vivienda registrado: ID ${tipoViviendaId}`);
    } else {
      console.log(`  ℹ️ Tipo vivienda ya existe: ID ${tipoViviendaId}`);
    }
  } catch (error) {
    // Detectar violaciones de foreign key
    if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
      throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
        catalog: 'tipos_vivienda',
        invalidId: tipoViviendaId,
        details: `El tipo de vivienda con ID ${tipoViviendaId} no existe en el catálogo`,
        suggestion: 'Verifique que el ID del tipo de vivienda sea correcto o seleccione un tipo válido del catálogo'
      });
    }
    
    throw createError(ErrorCodes.BUSINESS_LOGIC.SERVICE_REGISTRATION_FAILED, {
      service: 'tipo_vivienda',
      familiaId,
      tipoViviendaId: tipoVivienda?.id,
      originalError: error.message
    });
  }
};

/**
 * Procesar miembros vivos de la familia
 */
const procesarMiembrosFamilia = async (familiaId, familyMembers, informacionGeneral, transaction) => {
  let personasCreadas = 0;
  if (familyMembers.length === 0) return personasCreadas;

  console.log(`👥 Procesando ${familyMembers.length} miembros de la familia...`);
  
  for (const miembro of familyMembers) {
    try {
      // Separar nombres y apellidos correctamente
      const nombresCompletos = miembro.nombres.trim().split(' ');
      let primerNombre = '';
      let segundoNombre = '';
      let primerApellido = '';
      let segundoApellido = '';
      
      if (nombresCompletos.length >= 1) {
        primerNombre = nombresCompletos[0];
      }
      if (nombresCompletos.length >= 2) {
        segundoNombre = nombresCompletos[1];
      }
      if (nombresCompletos.length >= 3) {
        primerApellido = nombresCompletos[2];
      }
      if (nombresCompletos.length >= 4) {
        segundoApellido = nombresCompletos[3];
      }
      
      // Si solo hay 2 palabras, asumir: nombre apellido
      if (nombresCompletos.length === 2) {
        primerNombre = nombresCompletos[0];
        segundoNombre = '';
        primerApellido = nombresCompletos[1];
        segundoApellido = '';
      }
      
      // Si hay más de 4 palabras, tomar las últimas 2 como apellidos
      if (nombresCompletos.length > 4) {
        primerNombre = nombresCompletos[0];
        segundoNombre = nombresCompletos.slice(1, -2).join(' '); // Todo el medio como segundo nombre
        primerApellido = nombresCompletos[nombresCompletos.length - 2];
        segundoApellido = nombresCompletos[nombresCompletos.length - 1];
      }

      // Mapear IDs de manera simplificada
      const sexoId = mapearSexo(miembro.sexo);
      const tipoIdentificacionId = mapearTipoIdentificacion(miembro.tipoIdentificacion);
      const estadoCivilId = mapearEstadoCivil(miembro.situacionCivil);
      const parentescoId = miembro.parentesco?.id ? parseInt(miembro.parentesco.id) : null;
      
      // ⭐ SOPORTE v2.0: Extraer profesión desde profesionMotivoFechaCelebrar o profesion
      let profesionId = null;
      if (miembro.profesionMotivoFechaCelebrar?.profesion?.id) {
        profesionId = parseInt(miembro.profesionMotivoFechaCelebrar.profesion.id);
      } else if (miembro.profesion?.id) {
        profesionId = parseInt(miembro.profesion.id);
      }
      
      const comunidadCulturalId = miembro.comunidadCultural?.id ? parseInt(miembro.comunidadCultural.id) : null;

      const fechaNacimiento = miembro.fechaNacimiento || miembro.fecha_nacimiento;
      const identificacionUnica = await generarIdentificacionUnica('TEMP');
      
      // ⭐ SOPORTE v2.0: Extraer motivoFechaCelebrar desde profesionMotivoFechaCelebrar.celebraciones[0] o motivoFechaCelebrar.celebraciones o motivoFechaCelebrar
      let motivoCelebrar = null;
      let diaCelebrar = null;
      let mesCelebrar = null;
      
      if (miembro.profesionMotivoFechaCelebrar?.celebraciones && Array.isArray(miembro.profesionMotivoFechaCelebrar.celebraciones) && miembro.profesionMotivoFechaCelebrar.celebraciones.length > 0) {
        // Formato v2.0: profesionMotivoFechaCelebrar.celebraciones array
        const primeraCelebracion = miembro.profesionMotivoFechaCelebrar.celebraciones[0];
        motivoCelebrar = primeraCelebracion.motivo || null;
        diaCelebrar = primeraCelebracion.dia ? parseInt(primeraCelebracion.dia) : null;
        mesCelebrar = primeraCelebracion.mes ? parseInt(primeraCelebracion.mes) : null;
      } else if (miembro.motivoFechaCelebrar?.celebraciones && Array.isArray(miembro.motivoFechaCelebrar.celebraciones) && miembro.motivoFechaCelebrar.celebraciones.length > 0) {
        // Formato v2.1: motivoFechaCelebrar.celebraciones array (nuevo formato detectado en payload)
        const primeraCelebracion = miembro.motivoFechaCelebrar.celebraciones[0];
        motivoCelebrar = primeraCelebracion.motivo || null;
        diaCelebrar = primeraCelebracion.dia ? parseInt(primeraCelebracion.dia) : null;
        mesCelebrar = primeraCelebracion.mes ? parseInt(primeraCelebracion.mes) : null;
      } else if (miembro.motivoFechaCelebrar) {
        // Formato v1.0: Objeto único
        motivoCelebrar = miembro.motivoFechaCelebrar.motivo || null;
        diaCelebrar = miembro.motivoFechaCelebrar.dia ? parseInt(miembro.motivoFechaCelebrar.dia) : null;
        mesCelebrar = miembro.motivoFechaCelebrar.mes ? parseInt(miembro.motivoFechaCelebrar.mes) : null;
      }
      
      // ⭐ SOPORTE v2.0: Procesar enfermedades (plural) o enfermedad (singular)
      let nombreEnfermedad = null;
      if (miembro.enfermedades && Array.isArray(miembro.enfermedades) && miembro.enfermedades.length > 0) {
        // Formato v2.0: Array de enfermedades, tomar la primera
        nombreEnfermedad = miembro.enfermedades[0].nombre || null;
      } else if (miembro.enfermedad) {
        // Formato v1.0: Objeto único
        nombreEnfermedad = miembro.enfermedad.nombre || null;
      }
      
      // ⭐ SOPORTE v2.0: Procesar enQueEresLider como array o string
      let enQueEresLider = null;
      if (miembro.enQueEresLider && Array.isArray(miembro.enQueEresLider)) {
        // Formato v2.0: Array de strings, unir con comas
        enQueEresLider = miembro.enQueEresLider.join(', ');
      } else if (miembro.en_que_eres_lider) {
        // Formato v1.0: String
        enQueEresLider = miembro.en_que_eres_lider;
      }
      
      // ⭐ SOPORTE v2.0: Procesar necesidadesEnfermo (guardar como JSON string)
      let necesidadEnfermo = null;
      if (miembro.necesidadesEnfermo && Array.isArray(miembro.necesidadesEnfermo) && miembro.necesidadesEnfermo.length > 0) {
        // Formato v2.0: Array de necesidades, unir con comas
        necesidadEnfermo = miembro.necesidadesEnfermo.join(', ');
      } else {
        // Mantener compatibilidad con formato anterior (nombre de enfermedad)
        necesidadEnfermo = nombreEnfermedad;
      }
      
      const personaData = {
        primer_nombre: primerNombre,
        segundo_nombre: segundoNombre || null,
        primer_apellido: primerApellido || null,
        segundo_apellido: segundoApellido || null,
        fecha_nacimiento: fechaNacimiento ? new Date(fechaNacimiento) : new Date('1900-01-01'),
        telefono: miembro.telefono || informacionGeneral.telefono,
        correo_electronico: `${primerNombre.toLowerCase()}.${Date.now()}.${personasCreadas}@temp.com`,
        identificacion: miembro.numeroIdentificacion || identificacionUnica,
        direccion: informacionGeneral.direccion,
        id_familia_familias: familiaId,
        id_familia: familiaId, // ⭐ AÑADIDO: Asegurar que id_familia también se llene
        id_sexo: sexoId,
        id_tipo_identificacion_tipo_identificacion: tipoIdentificacionId,
        id_estado_civil_estado_civil: estadoCivilId,
        id_parentesco: parentescoId,
        id_profesion: profesionId,
        id_comunidad_cultural: comunidadCulturalId,
        estudios: (miembro.estudio && typeof miembro.estudio === 'object') ? miembro.estudio.nombre : (miembro.estudio || null),
        en_que_eres_lider: enQueEresLider,
        necesidad_enfermo: necesidadEnfermo,
        motivo_celebrar: motivoCelebrar,
        dia_celebrar: diaCelebrar,
        mes_celebrar: mesCelebrar,
        talla_camisa: miembro.talla_camisa || miembro['talla_camisa/blusa'] || (miembro.talla ? miembro.talla.camisa : null),
        talla_pantalon: miembro.talla_pantalon || (miembro.talla ? miembro.talla.pantalon : null),
        talla_zapato: miembro.talla_zapato || (miembro.talla ? miembro.talla.calzado : null)
      };

      let persona;
      try {
        persona = await Persona.create(personaData, { 
          transaction,
          fields: [
            'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
            'fecha_nacimiento', 'telefono', 'correo_electronico', 'identificacion',
            'direccion', 'id_familia_familias', 'id_familia', 'id_sexo', 
            'id_tipo_identificacion_tipo_identificacion', 'id_estado_civil_estado_civil',
            'id_parentesco', 'id_profesion', 'id_comunidad_cultural',
            'estudios', 'en_que_eres_lider', 'necesidad_enfermo',
            'motivo_celebrar', 'dia_celebrar', 'mes_celebrar',
            'talla_camisa', 'talla_pantalon', 'talla_zapato'
          ]
        });
      } catch (error) {
        // Detectar violaciones de foreign key y dar mensajes específicos
        if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
          const constraint = error.original?.constraint || '';
          
          // Determinar qué catálogo falló basado en el constraint name
          if (constraint.includes('profesion') || profesionId) {
            throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
              catalog: 'profesiones',
              invalidId: profesionId,
              person: miembro.nombres,
              details: `La profesión con ID ${profesionId} no existe en el catálogo`,
              suggestion: 'Verifique que el ID de la profesión sea correcto o seleccione una profesión válida del catálogo'
            });
          }
          
          if (constraint.includes('parentesco') || parentescoId) {
            throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
              catalog: 'parentescos',
              invalidId: parentescoId,
              person: miembro.nombres,
              details: `El parentesco con ID ${parentescoId} no existe en el catálogo`,
              suggestion: 'Verifique que el ID del parentesco sea correcto o seleccione un parentesco válido del catálogo'
            });
          }
          
          if (constraint.includes('comunidad') || comunidadCulturalId) {
            throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
              catalog: 'comunidades_culturales',
              invalidId: comunidadCulturalId,
              person: miembro.nombres,
              details: `La comunidad cultural con ID ${comunidadCulturalId} no existe en el catálogo`,
              suggestion: 'Verifique que el ID de la comunidad cultural sea correcto o seleccione una comunidad válida del catálogo'
            });
          }
          
          // Si no podemos determinar cuál FK falló, error genérico
          throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
            catalog: 'unknown',
            person: miembro.nombres,
            details: `Error de referencia en catálogo al crear persona: ${error.message}`,
            suggestion: 'Verifique que todos los IDs de catálogos sean válidos'
          });
        }
        
        throw error;
      }
      
      const personaId = persona.id_personas || persona.id; // Obtener ID de forma segura
      personasCreadas++;
      console.log(`  ✅ Persona creada exitosamente: ${primerNombre} (ID: ${personaId})`);
      
      // ========================================================================
      // PROCESAR DESTREZAS (relación muchos a muchos)
      // ========================================================================
      if (miembro.destrezas && Array.isArray(miembro.destrezas) && miembro.destrezas.length > 0) {
        console.log(`    🎯 Procesando ${miembro.destrezas.length} destrezas...`);
        
        for (const destreza of miembro.destrezas) {
          const destrezaId = typeof destreza === 'object' ? destreza.id : destreza;
          
          try {
            await sequelize.query(`
              INSERT INTO persona_destreza (id_personas_personas, id_destrezas_destrezas, "createdAt", "updatedAt")
              VALUES (:id_persona, :id_destreza, NOW(), NOW())
              ON CONFLICT ON CONSTRAINT persona_destreza_pkey DO NOTHING
            `, {
              replacements: {
                id_persona: personaId,
                id_destreza: destrezaId
              },
              transaction
            });
            
            console.log(`      ✅ Destreza ${destrezaId} asociada`);
          } catch (error) {
            // Si es error de foreign key, dar mensaje específico
            if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
              throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
                catalog: 'destrezas',
                invalidId: destrezaId,
                person: miembro.nombres,
                details: `La destreza con ID ${destrezaId} no existe en el catálogo`,
                suggestion: 'Verifique que el ID de la destreza sea correcto o seleccione una destreza válida del catálogo'
              });
            }
            throw error;
          }
        }
      }
      
      // ========================================================================
      // PROCESAR HABILIDADES (relación muchos a muchos)
      // ========================================================================
      if (miembro.habilidades && Array.isArray(miembro.habilidades) && miembro.habilidades.length > 0) {
        console.log(`    💡 Procesando ${miembro.habilidades.length} habilidades...`);
        
        for (const habilidad of miembro.habilidades) {
          const habilidadId = typeof habilidad === 'object' ? habilidad.id : habilidad;
          
          try {
            await sequelize.query(`
              INSERT INTO persona_habilidad (id_persona, id_habilidad, nivel, "createdAt", "updatedAt")
              VALUES (:id_persona, :id_habilidad, :nivel, NOW(), NOW())
              ON CONFLICT (id_persona, id_habilidad) DO NOTHING
            `, {
              replacements: {
                id_persona: personaId,
                id_habilidad: habilidadId,
                nivel: habilidad.nivel || 'Básico'
              },
              transaction
            });
            
            console.log(`      ✅ Habilidad ${habilidadId} asociada`);
          } catch (error) {
            // Si es error de foreign key, dar mensaje específico
            if (error.name === 'SequelizeForeignKeyConstraintError' || error.original?.code === '23503') {
              throw createError(ErrorCodes.VALIDATION.INVALID_CATALOG_REFERENCE, {
                catalog: 'habilidades',
                invalidId: habilidadId,
                person: miembro.nombres,
                details: `La habilidad con ID ${habilidadId} no existe en el catálogo`,
                suggestion: 'Verifique que el ID de la habilidad sea correcto o seleccione una habilidad válida del catálogo'
              });
            }
            throw error;
          }
        }
      }
      
      // ========================================================================
      // PROCESAR CELEBRACIONES (tabla intermedia persona_celebracion)
      // ========================================================================
      if (miembro.profesionMotivoFechaCelebrar?.celebraciones && Array.isArray(miembro.profesionMotivoFechaCelebrar.celebraciones)) {
        console.log(`    🎉 Procesando ${miembro.profesionMotivoFechaCelebrar.celebraciones.length} celebraciones...`);
        
        for (const celebracion of miembro.profesionMotivoFechaCelebrar.celebraciones) {
          const motivo = celebracion.motivo || null;
          const dia = celebracion.dia ? parseInt(celebracion.dia) : null;
          const mes = celebracion.mes ? parseInt(celebracion.mes) : null;
          
          if (motivo) {
            // Usar SAVEPOINT para que errores en esta inserción no aborten la
            // transacción principal (por ejemplo, si la tabla no existe).
            // Creamos un savepoint por cada celebración.
            const savepointName = `sp_celebracion_${personaId}_${Date.now()}`;
            try {
              await sequelize.query(`SAVEPOINT ${savepointName};`, { transaction });

              await sequelize.query(`
                INSERT INTO persona_celebracion (id_persona, motivo, dia, mes, created_at, updated_at)
                VALUES (:id_persona, :motivo, :dia, :mes, NOW(), NOW())
                ON CONFLICT (id_persona, motivo, dia, mes) DO NOTHING
              `, {
                replacements: {
                  id_persona: personaId,
                  motivo: motivo,
                  dia: dia,
                  mes: mes
                },
                transaction
              });

              console.log(`      ✅ Celebración guardada: ${motivo} - ${dia}/${mes}`);
            } catch (error) {
              // En caso de error, revertir sólo hasta el savepoint y continuar.
              try {
                await sequelize.query(`ROLLBACK TO SAVEPOINT ${savepointName};`, { transaction });
                console.warn(`      ⚠️ Error guardando celebración "${motivo}": ${error.message} — Revertido al savepoint`);
              } catch (rbErr) {
                // Si no podemos hacer rollback to savepoint (ej. transacción ya abortada), rethrow
                console.error(`      ❌ Error al revertir savepoint para celebración "${motivo}": ${rbErr.message}`);
                throw error;
              }
            }
          }
        }
      } else if (motivoCelebrar && diaCelebrar && mesCelebrar) {
        // Formato v1.0: Una sola celebración (ya guardada en tabla personas)
        // También guardarla en persona_celebracion para consistencia
        console.log(`    🎉 Guardando celebración v1.0 en tabla intermedia...`);
        
        const savepointName = `sp_celebracion_v1_${personaId}_${Date.now()}`;
        try {
          await sequelize.query(`SAVEPOINT ${savepointName};`, { transaction });

          await sequelize.query(`
            INSERT INTO persona_celebracion (id_persona, motivo, dia, mes, created_at, updated_at)
            VALUES (:id_persona, :motivo, :dia, :mes, NOW(), NOW())
            ON CONFLICT (id_persona, motivo, dia, mes) DO NOTHING
          `, {
            replacements: {
              id_persona: personaId,
              motivo: motivoCelebrar,
              dia: diaCelebrar,
              mes: mesCelebrar
            },
            transaction
          });

          console.log(`      ✅ Celebración guardada: ${motivoCelebrar} - ${diaCelebrar}/${mesCelebrar}`);
        } catch (error) {
          try {
            await sequelize.query(`ROLLBACK TO SAVEPOINT ${savepointName};`, { transaction });
            console.warn(`      ⚠️ Error guardando celebración v1.0: ${error.message} — Revertido al savepoint`);
          } catch (rbErr) {
            console.error(`      ❌ Error al revertir savepoint v1.0: ${rbErr.message}`);
            throw error;
          }
        }
      }
      
      // ========================================================================
      // PROCESAR ENFERMEDADES (tabla intermedia persona_enfermedad)
      // Con SAVEPOINT para evitar abortar transacción principal
      // ========================================================================
      if (miembro.enfermedades && Array.isArray(miembro.enfermedades) && miembro.enfermedades.length > 0) {
        console.log(`    🏥 Procesando ${miembro.enfermedades.length} enfermedades...`);
        
        for (const enfermedad of miembro.enfermedades) {
          const savepointName = `sp_enfermedad_${personaId}_${Date.now()}`;
          
          try {
            // Crear SAVEPOINT antes de intentar insertar enfermedad
            await sequelize.query(`SAVEPOINT ${savepointName};`, { transaction });
            
            // Validar y convertir ID de forma segura
            const enfermedadIdRaw = enfermedad.id ? String(enfermedad.id).trim() : null;
            const enfermedadId = enfermedadIdRaw && !isNaN(enfermedadIdRaw) ? parseInt(enfermedadIdRaw) : null;
            const enfermedadNombre = enfermedad.nombre || null;
            
            if (enfermedadId && !isNaN(enfermedadId)) {
              // Primero verificar que la enfermedad existe en el catálogo
              // Detectar dinámicamente el nombre de la columna ID
              const columnsInfoResult = await sequelize.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'enfermedades' 
                AND column_name IN ('id', 'id_enfermedad') 
                LIMIT 1
              `, {
                type: QueryTypes.SELECT,
                transaction
              });
              
              const idColumn = (columnsInfoResult && columnsInfoResult.length > 0) 
                ? columnsInfoResult[0].column_name 
                : 'id_enfermedad'; // Usar 'id_enfermedad' como fallback seguro
              
              const enfermedadExisteResult = await sequelize.query(`
                SELECT ${idColumn} FROM enfermedades WHERE ${idColumn} = :id_enfermedad LIMIT 1
              `, {
                replacements: { id_enfermedad: enfermedadId },
                type: QueryTypes.SELECT,
                transaction
              });
              
              const enfermedadExiste = enfermedadExisteResult && enfermedadExisteResult.length > 0 ? enfermedadExisteResult[0] : null;
              
              if (!enfermedadExiste) {
                console.warn(`      ⚠️ Enfermedad con ID ${enfermedadId} no existe en catálogo, omitiendo...`);
                await sequelize.query(`ROLLBACK TO SAVEPOINT ${savepointName};`, { transaction });
                continue;
              }
              
              await sequelize.query(`
                INSERT INTO persona_enfermedad (id_persona, id_enfermedad, created_at, updated_at)
                VALUES (:id_persona, :id_enfermedad, NOW(), NOW())
                ON CONFLICT (id_persona, id_enfermedad) DO NOTHING
              `, {
                replacements: {
                  id_persona: personaId,
                  id_enfermedad: enfermedadId
                },
                transaction
              });
              
              console.log(`      ✅ Enfermedad guardada: ${enfermedadNombre} (ID: ${enfermedadId})`);
            } else if (enfermedadNombre) {
              // Si solo viene el nombre, intentar buscar en el catálogo
              console.log(`      ℹ️ Buscando enfermedad por nombre: "${enfermedadNombre}"`);
              
              const columnsInfoResult2 = await sequelize.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'enfermedades' 
                AND column_name IN ('id', 'id_enfermedad') 
                LIMIT 1
              `, {
                type: QueryTypes.SELECT,
                transaction
              });
              
              const idColumn = (columnsInfoResult2 && columnsInfoResult2.length > 0)
                ? columnsInfoResult2[0].column_name
                : 'id_enfermedad';
              
              const enfermedadCatalogoResult = await sequelize.query(`
                SELECT ${idColumn} as id FROM enfermedades WHERE LOWER(nombre) = LOWER(:nombre) LIMIT 1
              `, {
                replacements: { nombre: enfermedadNombre },
                type: QueryTypes.SELECT,
                transaction
              });
              
              const enfermedadCatalogo = enfermedadCatalogoResult && enfermedadCatalogoResult.length > 0 ? enfermedadCatalogoResult[0] : null;
              
              if (enfermedadCatalogo) {
                await sequelize.query(`
                  INSERT INTO persona_enfermedad (id_persona, id_enfermedad, created_at, updated_at)
                  VALUES (:id_persona, :id_enfermedad, NOW(), NOW())
                  ON CONFLICT (id_persona, id_enfermedad) DO NOTHING
                `, {
                  replacements: {
                    id_persona: personaId,
                    id_enfermedad: enfermedadCatalogo.id
                  },
                  transaction
                });
                
                console.log(`      ✅ Enfermedad guardada por nombre: ${enfermedadNombre}`);
              } else {
                // Si no existe, usar "Otra" (ID 14)
                await sequelize.query(`
                  INSERT INTO persona_enfermedad (id_persona, id_enfermedad, created_at, updated_at)
                  VALUES (:id_persona, 14, NOW(), NOW())
                  ON CONFLICT (id_persona, id_enfermedad) DO NOTHING
                `, {
                  replacements: {
                    id_persona: personaId
                  },
                  transaction
                });
                
                console.log(`      ⚠️ Enfermedad no encontrada en catálogo, guardada como "Otra": ${enfermedadNombre}`);
              }
            }
          } catch (error) {
            try {
              await sequelize.query(`ROLLBACK TO SAVEPOINT ${savepointName};`, { transaction });
              console.warn(`      ⚠️ Error guardando enfermedad: ${error.message} — Revertido al savepoint`);
            } catch (rbErr) {
              console.error(`      ❌ Error al revertir savepoint enfermedad: ${rbErr.message}`);
              throw error;
            }
          }
        }
      } else if (nombreEnfermedad) {
        // Formato v1.0: Una sola enfermedad
        console.log(`    🏥 Procesando enfermedad v1.0: ${nombreEnfermedad}`);
        const savepointName = `sp_enfermedad_v1_${personaId}_${Date.now()}`;
        
        try {
          await sequelize.query(`SAVEPOINT ${savepointName};`, { transaction });
          
          const columnsInfoResult3 = await sequelize.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'enfermedades' 
            AND column_name IN ('id', 'id_enfermedad') 
            LIMIT 1
          `, {
            type: QueryTypes.SELECT,
            transaction
          });
          
          const idColumn = (columnsInfoResult3 && columnsInfoResult3.length > 0)
            ? columnsInfoResult3[0].column_name
            : 'id_enfermedad';
          
          const enfermedadCatalogoResult3 = await sequelize.query(`
            SELECT ${idColumn} as id FROM enfermedades WHERE LOWER(nombre) = LOWER(:nombre) LIMIT 1
          `, {
            replacements: { nombre: nombreEnfermedad },
            type: QueryTypes.SELECT,
            transaction
          });
          
          const enfermedadCatalogo = enfermedadCatalogoResult3 && enfermedadCatalogoResult3.length > 0 ? enfermedadCatalogoResult3[0] : null;
          const idEnfermedad = enfermedadCatalogo ? enfermedadCatalogo.id : 14; // 14 = "Otra"
          
          await sequelize.query(`
            INSERT INTO persona_enfermedad (id_persona, id_enfermedad, created_at, updated_at)
            VALUES (:id_persona, :id_enfermedad, NOW(), NOW())
            ON CONFLICT (id_persona, id_enfermedad) DO NOTHING
          `, {
            replacements: {
              id_persona: personaId,
              id_enfermedad: idEnfermedad
            },
            transaction
          });
          
          console.log(`      ✅ Enfermedad v1.0 guardada: ${nombreEnfermedad}`);
        } catch (error) {
          try {
            await sequelize.query(`ROLLBACK TO SAVEPOINT ${savepointName};`, { transaction });
            console.warn(`      ⚠️ Error guardando enfermedad v1.0: ${error.message} — Revertido al savepoint`);
          } catch (rbErr) {
            console.error(`      ❌ Error al revertir savepoint enfermedad v1.0: ${rbErr.message}`);
            throw error;
          }
        }
      }
      
      // ========================================================================
      // PROCESAR LIDERAZGO (campo de texto libre)
      // ========================================================================
      if (miembro.en_que_eres_lider || miembro.liderazgo) {
        const liderazgoTexto = miembro.en_que_eres_lider || miembro.liderazgo;
        console.log(`    👑 Actualizando liderazgo: "${liderazgoTexto}"`);
        
        await sequelize.query(`
          UPDATE personas 
          SET en_que_eres_lider = :liderazgo
          WHERE id_personas = :id_persona
        `, {
          replacements: {
            liderazgo: liderazgoTexto,
            id_persona: personaId
          },
          transaction
        });
        
        console.log(`      ✅ Campo liderazgo actualizado`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error creando persona ${miembro.nombres}:`, error.message);
      throw error;
    }
  }

  return personasCreadas;
};

/**
 * Procesar miembros fallecidos
 */
const procesarMiembrosFallecidos = async (familiaId, deceasedMembers, informacionGeneral, transaction) => {
  let personasFallecidas = 0;
  if (deceasedMembers.length === 0) return personasFallecidas;

  console.log(`⚰️ Procesando ${deceasedMembers.length} miembros fallecidos...`);
  
  for (const fallecido of deceasedMembers) {
    const savepointName = `sp_difunto_${familiaId}_${Date.now()}`;
    
    try {
      // Crear SAVEPOINT antes de intentar insertar difunto
      await sequelize.query(`SAVEPOINT ${savepointName};`, { transaction });
      
      // Separar nombres y apellidos correctamente para fallecidos
      const nombresCompletos = fallecido.nombres.trim().split(' ');
      let primerNombre = '';
      let segundoNombre = '';
      let primerApellido = '';
      let segundoApellido = '';
      
      if (nombresCompletos.length >= 1) {
        primerNombre = nombresCompletos[0];
      }
      if (nombresCompletos.length >= 2) {
        segundoNombre = nombresCompletos[1];
      }
      if (nombresCompletos.length >= 3) {
        primerApellido = nombresCompletos[2];
      }
      if (nombresCompletos.length >= 4) {
        segundoApellido = nombresCompletos[3];
      }
      
      // Si solo hay 2 palabras, asumir: nombre apellido
      if (nombresCompletos.length === 2) {
        primerNombre = nombresCompletos[0];
        segundoNombre = '';
        primerApellido = nombresCompletos[1];
        segundoApellido = '';
      }
      
      // Si hay más de 4 palabras, tomar las últimas 2 como apellidos
      if (nombresCompletos.length > 4) {
        primerNombre = nombresCompletos[0];
        segundoNombre = nombresCompletos.slice(1, -2).join(' '); // Todo el medio como segundo nombre
        primerApellido = nombresCompletos[nombresCompletos.length - 2];
        segundoApellido = nombresCompletos[nombresCompletos.length - 1];
      }

      const identificacionUnica = await generarIdentificacionUnica('FALLECIDO');

      // Determinar parentesco: priorizar nuevo formato con objeto parentesco
      let parentescoId = null;
      let eraPadre = false;
      let eraMadre = false;

      if (fallecido.parentesco && fallecido.parentesco.id) {
        // Nuevo formato: objeto parentesco con ID numérico
        if (typeof fallecido.parentesco.id === 'string') {
          // Si viene como string "PADRE" o "MADRE", convertir a ID numérico
          if (fallecido.parentesco.id.toUpperCase() === 'PADRE') {
            parentescoId = 2;
            eraPadre = true;
          } else if (fallecido.parentesco.id.toUpperCase() === 'MADRE') {
            parentescoId = 3;
            eraMadre = true;
          } else {
            // Si es otro tipo de parentesco string, intentar parsear como número
            parentescoId = parseInt(fallecido.parentesco.id);
          }
        } else {
          // Si ya viene como número
          parentescoId = parseInt(fallecido.parentesco.id);
        }
        
        // Inferir era_padre/era_madre basado en el nombre del parentesco si no se determinó arriba
        if (!eraPadre && !eraMadre && fallecido.parentesco.nombre) {
          const nombreParentesco = fallecido.parentesco.nombre.toLowerCase();
          eraPadre = nombreParentesco === 'padre';
          eraMadre = nombreParentesco === 'madre';
        }
      } else {
        // Formato anterior: campos eraPadre/eraMadre boolean
        eraPadre = fallecido.eraPadre || false;
        eraMadre = fallecido.eraMadre || false;
        
        // Asignar ID de parentesco basado en boolean
        if (eraPadre) {
          parentescoId = 2; // ID de "Padre"
        } else if (eraMadre) {
          parentescoId = 3; // ID de "Madre"
        }
      }

      // ✅ Crear registro SOLO en tabla difuntos_familia (no en personas)
      const difuntoData = {
        nombre_completo: fallecido.nombres,
        fecha_fallecimiento: fallecido.fechaFallecimiento || fallecido.fechaAniversario || '1900-01-01',
        observaciones: fallecido.causaFallecimiento || null,
        id_familia_familias: familiaId,
        id_sexo: fallecido.sexo && fallecido.sexo.id ? parseInt(fallecido.sexo.id) : null,
        id_parentesco: parentescoId,
        causa_fallecimiento: fallecido.causaFallecimiento || null
      };

      await DifuntosFamilia.create(difuntoData, { transaction });
      
      personasFallecidas++;
      console.log(`  ⚰️ Persona fallecida registrada: ${primerNombre} (solo en difuntos_familia)`);
      
    } catch (error) {
      try {
        await sequelize.query(`ROLLBACK TO SAVEPOINT ${savepointName};`, { transaction });
        console.warn(`  ⚠️ Error registrando persona fallecida ${fallecido.nombres}: ${error.message} — Revertido al savepoint`);
      } catch (rbErr) {
        console.error(`  ❌ Error al revertir savepoint difunto: ${rbErr.message}`);
        throw error;
      }
    }
  }

  return personasFallecidas;
};

/**
 * Funciones de mapeo simplificadas
 */
const mapearSexo = (sexo) => {
  if (!sexo) return null;
  if (typeof sexo === 'object' && sexo.id) {
    const parsed = safeParseInt(sexo.id);
    if (parsed) return parsed;
    // Si no es número, intentar mapear por string
  }
  
  const sexoMapping = {
    'Hombre': 1, 'Mujer': 2, 'Masculino': 1, 'Femenino': 2,
    'M': 1, 'F': 2, 'O': 3, 'Otro': 3, '1': 1, '2': 2, '3': 3
  };
  
  const sexoValue = typeof sexo === 'object' ? sexo.nombre || sexo.id : sexo;
  return sexoMapping[sexoValue] || safeParseInt(sexoValue);
};

const mapearTipoIdentificacion = (tipoId) => {
  if (!tipoId) return null;
  
  // Si es un objeto, intentar extraer ID
  if (typeof tipoId === 'object' && tipoId.id) {
    const parsed = safeParseInt(tipoId.id);
    if (parsed) return parsed;
    // Si no es número, es un código como "CC", "TI", etc.
    // Retornar directamente el código para que se use como string
    return tipoId.id;
  }
  
  // Si es string o número directo
  const parsed = safeParseInt(tipoId);
  if (parsed) return parsed;
  
  // Si es un código de texto, retornarlo tal cual
  return tipoId;
};

const mapearEstadoCivil = (estadoCivil) => {
  if (!estadoCivil) return null;
  if (typeof estadoCivil === 'object' && estadoCivil.id) {
    return safeParseInt(estadoCivil.id);
  }
  
  const estadoCivilMapping = {
    'Soltero': 1, 'Soltera': 1, 'Soltero(a)': 1,
    'Casado Civil': 2, 'Casado': 2, 'Casada': 2, 'Casado(a)': 2,
    'Viudo': 4, 'Viuda': 4, 'Viudo(a)': 4,
    'Divorciado': 3, 'Divorciada': 3, 'Divorciado(a)': 3,
    'Unión Libre': 5, 'Union Libre': 5
  };
  return estadoCivilMapping[estadoCivil] || null;
};
export const obtenerEncuestas = async (req, res) => {
  try {
    const { logger } = await import('../middlewares/loggingMiddleware.js');
    const EncuestaService = (await import('../services/encuestaService.js')).default;
    
    logger.info('Obteniendo lista de encuestas', {
      query: req.query,
      user_id: req.user?.id
    });
    
    // Parámetros de paginación con cursor-based support
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Máximo 100
    const offset = (page - 1) * limit; // Calcular offset basado en página y límite
    const cursor = req.query.cursor;

    // Parámetros de filtros opcionales
    const { q, sector, municipio, apellido_familiar, encuestador_id } = req.query;

    // Construir condiciones WHERE usando SQL directo
    let whereClause = '1=1';
    let replacements = { limit, offset };
    
    // Filtro de búsqueda general (q) - OR entre apellido_familiar, parroquia, sector y municipio
    if (q) {
      const searchTerm = q;
      whereClause += ` AND (
        f.apellido_familiar ILIKE :searchTerm OR 
        p.nombre ILIKE :searchTerm OR
        s.nombre ILIKE :searchTerm OR
        m.nombre_municipio ILIKE :searchTerm
      )`;
      replacements.searchTerm = `%${searchTerm}%`;
    }
    
    // Filtro específico por ID de sector
    if (sector) {
      whereClause += ' AND f.id_sector = :sector';
      replacements.sector = parseInt(sector);
    }
    
    // Filtro específico por ID de municipio
    if (municipio) {
      whereClause += ' AND f.id_municipio = :municipio';
      replacements.municipio = parseInt(municipio);
    }
    
    // Filtro específico por encuestador_id - Nota: columnas id_encuestador y nombre_encuestador no existen en tabla familias
    // TODO: Implementar relación con tabla de usuarios/encuestadores si es necesaria
    if (encuestador_id) {
      // Por ahora ignoramos este filtro hasta que se implemente la relación correcta
      console.warn('⚠️ Filtro encuestador_id ignorado - columna no existe en tabla familias');
    }
    
    if (apellido_familiar) {
      whereClause += ' AND f.apellido_familiar ILIKE :apellido_familiar';
      replacements.apellido_familiar = `%${apellido_familiar}%`;
    }

    // Obtener total de registros usando SQL directo
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM familias f
      LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      WHERE ${whereClause}
    `;
    const [{ total }] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Obtener encuestas con información básica incluyendo datos geográficos usando SQL directo
    const familiasQuery = `
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.sector,
        f.direccion_familia,
        f.numero_contacto,
        f.telefono,
        f.email,
        f.tamaño_familia,
        f.tipo_vivienda,
        f.estado_encuesta,
        f.numero_encuestas,
        f.fecha_ultima_encuesta,
        f.codigo_familia,
        f.tutor_responsable,
        f.numero_contrato_epm,
        f."comunionEnCasa",
        f.id_municipio,
        f.id_vereda,
        f.id_sector,
        f.id_parroquia,
        f.id_corregimiento,
        f.id_centro_poblado,
        f.id_usuario_creador,
        f.sustento_familia,
        f.observaciones_encuestador,
        f.autorizacion_datos,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        p.nombre as nombre_parroquia,
        corr.nombre as nombre_corregimiento,
        cp.nombre as nombre_centro_poblado,
        tv.id_tipo_vivienda,
        tv.nombre as nombre_tipo_vivienda,
        u.id as encuestador_id,
        CONCAT(u.primer_nombre, ' ', u.primer_apellido) as nombre_encuestador
      FROM familias f
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
      LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      LEFT JOIN usuarios u ON f.id_usuario_creador = u.id
      WHERE ${whereClause}
      ORDER BY f.fecha_ultima_encuesta DESC 
      LIMIT :limit OFFSET :offset
    `;
    
    const encuestas = await sequelize.query(familiasQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Para cada familia, obtener información adicional manualmente
    const encuestasFormateadas = await Promise.all(
      encuestas.map(async (familiaData) => {
        // Obtener personas VIVAS de la familia (excluir fallecidos) con celebraciones y enfermedades
        const personas = await personaDetallesHelper.obtenerPersonasFamiliaCompletas(
          familiaData.id_familia
        );

        // Obtener difuntos desde la tabla difuntos_familia (en lugar de personas con FALLECIDO%)
        const difuntos = await sequelize.query(`
          SELECT 
            df.id_difunto,
            df.nombre_completo,
            '' as primer_nombre,
            '' as segundo_nombre, 
            '' as primer_apellido,
            '' as segundo_apellido,
            df.id_sexo,
            df.id_parentesco,
            s.nombre as sexo_nombre,
            par.nombre as parentesco_nombre,
            df.fecha_fallecimiento,
            df.causa_fallecimiento,
            df.observaciones
          FROM difuntos_familia df
          LEFT JOIN sexos s ON df.id_sexo = s.id_sexo
          LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
          WHERE df.id_familia_familias = :familiaId
        `, {
          replacements: { familiaId: familiaData.id_familia },
          type: QueryTypes.SELECT
        });

        // Obtener información de ubicación usando datos ya obtenidos con JOINs
        let municipioInfo = null;
        let veredaInfo = null;
        let sectorInfo = null;
        let parroquiaInfo = null;
        let corregimientoInfo = null;
        let tipoViviendaInfo = null;

        // Usar datos de municipio ya obtenidos en el JOIN
        if (familiaData.id_municipio && familiaData.nombre_municipio) {
          municipioInfo = {
            id: familiaData.id_municipio,
            nombre: familiaData.nombre_municipio
          };
        }

        // Usar datos de vereda ya obtenidos en el JOIN
        if (familiaData.id_vereda && familiaData.nombre_vereda) {
          veredaInfo = {
            id: familiaData.id_vereda,
            nombre: familiaData.nombre_vereda
          };
        }

        // Usar datos de sector ya obtenidos en el JOIN
        if (familiaData.id_sector && familiaData.nombre_sector) {
          sectorInfo = {
            id: familiaData.id_sector,
            nombre: familiaData.nombre_sector
          };
        } else if (familiaData.sector) {
          // Fallback para sector como texto
          sectorInfo = {
            id: null,
            nombre: familiaData.sector
          };
        }

        // Usar datos de parroquia ya obtenidos en el JOIN
        if (familiaData.id_parroquia && familiaData.nombre_parroquia) {
          parroquiaInfo = {
            id: familiaData.id_parroquia,
            nombre: familiaData.nombre_parroquia
          };
        } else if (familiaData.id_parroquia) {
          // Si tenemos id_parroquia pero no nombre, buscar en la tabla parroquias
          try {
            const parroquiaDb = await sequelize.query(
              'SELECT id_parroquia, nombre FROM parroquias WHERE id_parroquia = :id',
              {
                replacements: { id: parseInt(familiaData.id_parroquia) },
                type: QueryTypes.SELECT
              }
            );
            
            if (parroquiaDb.length > 0) {
              parroquiaInfo = {
                id: parroquiaDb[0].id_parroquia,
                nombre: parroquiaDb[0].nombre
              };
            } else {
              parroquiaInfo = {
                id: familiaData.id_parroquia,
                nombre: 'Parroquia no encontrada'
              };
            }
          } catch (error) {
            console.error('Error buscando parroquia:', error);
            parroquiaInfo = {
              id: familiaData.id_parroquia,
              nombre: `ID: ${familiaData.id_parroquia}`
            };
          }
        }

        // Usar datos de corregimiento ya obtenidos en el JOIN
        if (familiaData.id_corregimiento && familiaData.nombre_corregimiento) {
          corregimientoInfo = {
            id: familiaData.id_corregimiento,
            nombre: familiaData.nombre_corregimiento
          };
        }

        // Usar datos de centro poblado ya obtenidos en el JOIN
        let centroPobladoInfo = null;
        if (familiaData.id_centro_poblado && familiaData.nombre_centro_poblado) {
          centroPobladoInfo = {
            id: familiaData.id_centro_poblado,
            nombre: familiaData.nombre_centro_poblado
          };
        }

        // Usar datos de tipo de vivienda ya obtenidos en el JOIN
        if (familiaData.id_tipo_vivienda && familiaData.nombre_tipo_vivienda) {
          tipoViviendaInfo = {
            id: familiaData.id_tipo_vivienda,
            nombre: familiaData.nombre_tipo_vivienda
          };
        } else if (familiaData.tipo_vivienda) {
          // Si tipo_vivienda es un número, buscar en la tabla tipos_vivienda
          if (!isNaN(familiaData.tipo_vivienda)) {
            try {
              const tipoViviendaDb = await sequelize.query(
                'SELECT id_tipo_vivienda, nombre FROM tipos_vivienda WHERE id_tipo_vivienda = :id AND activo = true',
                {
                  replacements: { id: parseInt(familiaData.tipo_vivienda) },
                  type: QueryTypes.SELECT
                }
              );
              
              if (tipoViviendaDb.length > 0) {
                tipoViviendaInfo = {
                  id: tipoViviendaDb[0].id_tipo_vivienda,
                  nombre: tipoViviendaDb[0].nombre
                };
              } else {
                tipoViviendaInfo = {
                  id: null,
                  nombre: 'Tipo no encontrado'
                };
              }
            } catch (error) {
              console.error('Error buscando tipo de vivienda:', error);
              tipoViviendaInfo = {
                id: null,
                nombre: `ID: ${familiaData.tipo_vivienda}`
              };
            }
          } else {
            // Fallback para tipo de vivienda como texto
            tipoViviendaInfo = {
              id: null,
              nombre: familiaData.tipo_vivienda
            };
          }
        }

        // Obtener información de basuras, acueducto y aguas residuales - SIEMPRE DEVOLVER ARRAYS
        let disposicionBasuras = [];
        let sistemasAcueducto = [];
        let sistemasAguasResiduales = [];

        try {
          // Obtener disposición de basuras
          const disposiciones = await sequelize.query(`
            SELECT tdb.id_tipo_disposicion_basura, tdb.nombre 
            FROM familia_disposicion_basura fdb 
            JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura 
            WHERE fdb.id_familia = :familiaId
          `, {
            replacements: { familiaId: familiaData.id_familia },
            type: QueryTypes.SELECT
          });
          
          disposicionBasuras = disposiciones.map(d => ({
            id: d.id_tipo_disposicion_basura,
            nombre: d.nombre
          }));
        } catch (error) {
          console.log(`⚠️ Error obteniendo disposición de basuras: ${error.message}`);
          disposicionBasuras = []; // Array vacío en lugar de null
        }

        try {
          // Obtener sistemas de acueducto
          const sistemas = await sequelize.query(`
            SELECT sa.id_sistema_acueducto, sa.nombre 
            FROM familia_sistema_acueducto fsa 
            JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto 
            WHERE fsa.id_familia = :familiaId
          `, {
            replacements: { familiaId: familiaData.id_familia },
            type: QueryTypes.SELECT
          });
          
          sistemasAcueducto = sistemas.map(s => ({
            id: s.id_sistema_acueducto,
            nombre: s.nombre
          }));
        } catch (error) {
          console.log(`⚠️ Error obteniendo sistemas de acueducto: ${error.message}`);
          sistemasAcueducto = []; // Array vacío en lugar de null
        }

        try {
          // Obtener sistemas de aguas residuales
          const sistemasAR = await sequelize.query(`
            SELECT tar.id_tipo_aguas_residuales, tar.nombre 
            FROM familia_sistema_aguas_residuales fsar 
            JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales 
            WHERE fsar.id_familia = :familiaId
          `, {
            replacements: { familiaId: familiaData.id_familia },
            type: QueryTypes.SELECT
          });
          
          sistemasAguasResiduales = sistemasAR.map(s => ({
            id: s.id_tipo_aguas_residuales,
            nombre: s.nombre
          }));
        } catch (error) {
          console.log(`⚠️ Error obteniendo sistemas de aguas residuales: ${error.message}`);
          sistemasAguasResiduales = []; // Array vacío en lugar de null
        }

        // Obtener información adicional para cada persona VIVA
        const personasFormateadas = await Promise.all(personas.map(async (persona) => {
          // Información del estudio - manejar casos donde estudios contiene JSON
          let estudioInfo = null;
          if (persona.estudios) {
            try {
              // Verificar si es un JSON string (típicamente para fallecidos que no deberían estar aquí)
              if (persona.estudios.startsWith('{') && persona.estudios.includes('es_fallecido')) {
                // Si es un fallecido que se coló, usar placeholder
                estudioInfo = {
                  id: null,
                  nombre: 'Datos inconsistentes - revisar'
                };
              } else {
                // Si estudios contiene un ID numérico, buscar en la tabla
                const estudioId = parseInt(persona.estudios);
                if (!isNaN(estudioId)) {
                  const [estudio] = await sequelize.query(`
                    SELECT id_niveles_educativos as id, nivel as nombre 
                    FROM niveles_educativos 
                    WHERE id_niveles_educativos = :estudioId
                  `, {
                    replacements: { estudioId },
                    type: QueryTypes.SELECT
                  });
                  
                  if (estudio) {
                    estudioInfo = {
                      id: estudio.id,
                      nombre: estudio.nombre
                    };
                  } else {
                    estudioInfo = {
                      id: estudioId,
                      nombre: persona.estudios
                    };
                  }
                } else {
                  // Si no es un ID, intentar buscar por nombre/nivel
                  const [estudio] = await sequelize.query(`
                    SELECT id_niveles_educativos as id, nivel as nombre 
                    FROM niveles_educativos 
                    WHERE LOWER(nivel) LIKE LOWER(:nivelBusqueda)
                    AND activo = true
                  `, {
                    replacements: { nivelBusqueda: `%${persona.estudios}%` },
                    type: QueryTypes.SELECT
                  });
                  
                  if (estudio) {
                    estudioInfo = {
                      id: estudio.id,
                      nombre: estudio.nombre
                    };
                  } else {
                    // Si no se encuentra en el catálogo, mantener el texto original con ID null
                    estudioInfo = {
                      id: null,
                      nombre: persona.estudios
                    };
                  }
                }
              }
            } catch (error) {
              estudioInfo = {
                id: null,
                nombre: persona.estudios
              };
            }
          }

          // ========================================================================
          // CONSULTAR DESTREZAS DE LA PERSONA
          // ========================================================================
          const destrezas = await sequelize.query(`
            SELECT 
              d.id_destreza,
              d.nombre
            FROM persona_destreza pd
            INNER JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
            WHERE pd.id_personas_personas = :personaId
            ORDER BY d.nombre
          `, {
            replacements: { personaId: persona.id_personas },
            type: QueryTypes.SELECT
          });

          // ========================================================================
          // CONSULTAR HABILIDADES DE LA PERSONA
          // ========================================================================
          const habilidades = await sequelize.query(`
            SELECT 
              h.id_habilidad,
              h.nombre,
              h.descripcion,
              ph.nivel
            FROM persona_habilidad ph
            INNER JOIN habilidades h ON ph.id_habilidad = h.id_habilidad
            WHERE ph.id_persona = :personaId
            ORDER BY h.nombre
          `, {
            replacements: { personaId: persona.id_personas },
            type: QueryTypes.SELECT
          });

          return {
            id: persona.id_personas,
            nombre_completo: formatearNombreCompleto(persona.primer_nombre, persona.segundo_nombre, persona.primer_apellido, persona.segundo_apellido),
            identificacion: {
              numero: persona.identificacion,
              tipo: persona.tipo_id_id ? {
                id: persona.tipo_id_id,
                nombre: persona.tipo_id_nombre,
                codigo: persona.tipo_id_codigo
              } : null
            },
            telefono: persona.telefono,
            email: persona.correo_electronico,
            fecha_nacimiento: persona.fecha_nacimiento,
            direccion: persona.direccion,
            estudios: estudioInfo, // Cambiado: ahora devuelve objeto con id y nombre
            edad: persona.fecha_nacimiento ? 
              Math.floor((new Date() - new Date(persona.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
            sexo: persona.sexo_id ? {
              id: persona.sexo_id,
              nombre: persona.sexo_nombre
            } : null,
            estado_civil: persona.estado_civil_id ? {
              id: persona.estado_civil_id,
              nombre: persona.estado_civil_nombre
            } : null, // CORREGIDO: Ahora incluye estado civil real
            tallas: {
              camisa: persona.talla_camisa,
              pantalon: persona.talla_pantalon,
              zapato: persona.talla_zapato
            },
            // ⭐ NUEVOS CAMPOS ⭐
            destrezas: destrezas.map(d => ({
              id: d.id_destreza,
              nombre: d.nombre
            })),
            habilidades: habilidades.map(h => ({
              id: h.id_habilidad,
              nombre: h.nombre,
              descripcion: h.descripcion,
              nivel: h.nivel
            })),
            en_que_eres_lider: persona.en_que_eres_lider || null,
            // ⭐ CAMPOS AGREGADOS - profesion, parentesco, comunidad cultural, celebraciones, necesidades ⭐
            profesion: persona.id_profesion ? {
              id: persona.id_profesion,
              nombre: persona.profesion_nombre || null
            } : null,
            parentesco: persona.id_parentesco ? {
              id: persona.id_parentesco,
              nombre: persona.parentesco_nombre || null
            } : null,
            comunidad_cultural: persona.id_comunidad_cultural ? {
              id: persona.id_comunidad_cultural,
              nombre: persona.comunidad_cultural_nombre || null
            } : null,
            // ⭐ NUEVOS CAMPOS - Celebraciones y Enfermedades (arrays) ⭐
            celebraciones: persona.celebraciones || [],
            enfermedades: persona.enfermedades || [],
            necesidad_enfermo: persona.necesidad_enfermo || null
          };
        }));

        // Procesar difuntos desde la tabla difuntos_familia
        const difuntosFormateados = difuntos.map(fallecido => {
          // Los datos ya vienen directamente de la tabla difuntos_familia
          return {
            nombres: fallecido.nombre_completo,
            fechaFallecimiento: fallecido.fecha_fallecimiento || null,
            sexo: fallecido.id_sexo ? {
              id: parseInt(fallecido.id_sexo),
              nombre: fallecido.sexo_nombre || null
            } : {
              id: null,
              nombre: null
            },
            parentesco: fallecido.id_parentesco ? {
              id: parseInt(fallecido.id_parentesco),
              nombre: fallecido.parentesco_nombre || null
            } : {
              id: null,
              nombre: null
            },
            causaFallecimiento: fallecido.causa_fallecimiento || fallecido.observaciones || null
          };
        });

        const familiaInfo = {
          // *** INFORMACIÓN BÁSICA DE LA FAMILIA ***
          apellido_familiar: familiaData.apellido_familiar,
          direccion_familia: familiaData.direccion_familia,
          telefono: familiaData.telefono,
          codigo_familia: familiaData.codigo_familia,
        };
        
        // Solo agregar campos opcionales si no son null
        if (familiaData.email !== null) {
          familiaInfo.email = familiaData.email;
        }
        if (familiaData.tutor_responsable !== null) {
          familiaInfo.tutor_responsable = familiaData.tutor_responsable;
        }

        return {
          // *** ID DE LA ENCUESTA (ÚNICO) ***
          id_encuesta: familiaData.id_familia,
          
          ...familiaInfo,
          
          // *** INFORMACIÓN DE LA ENCUESTA ***
          estado_encuesta: familiaData.estado_encuesta,
          numero_encuestas: familiaData.numero_encuestas,
          fecha_ultima_encuesta: familiaData.fecha_ultima_encuesta,
          
          // *** INFORMACIÓN DEL ENCUESTADOR ***
          encuestador: familiaData.nombre_encuestador || null,
          
          // *** INFORMACIÓN DE VIVIENDA CON ID Y NOMBRE ***
          tipo_vivienda: tipoViviendaInfo,
          tamaño_familia: familiaData.tamaño_familia,
          
          // *** INFORMACIÓN GEOGRÁFICA COMPLETA CON ID Y NOMBRE ***
          sector: sectorInfo,
          municipio: municipioInfo,
          vereda: veredaInfo,
          parroquia: parroquiaInfo,
          corregimiento: corregimientoInfo,
          centro_poblado: centroPobladoInfo,
          // Removido: sector_especifico (no lo necesitas según indicaciones)
          
          // *** INFORMACIÓN DE SERVICIOS CON ID Y NOMBRE ***
          basuras: disposicionBasuras, // Siempre array, nunca null
          acueducto: sistemasAcueducto.length > 0 ? sistemasAcueducto[0] : null, // null cuando no hay información
          aguas_residuales: sistemasAguasResiduales, // Siempre array, igual que basuras
          
          // *** INFORMACIÓN RELIGIOSA ***
          comunion_en_casa: familiaData.comunionEnCasa,
          
          // *** INFORMACIÓN DE SERVICIOS PÚBLICOS ***
          numero_contrato_epm: familiaData.numero_contrato_epm || null,
          
          // *** OBSERVACIONES ***
          observaciones: {
            sustento_familia: familiaData.sustento_familia || '',
            observaciones_encuestador: familiaData.observaciones_encuestador || '',
            autorizacion_datos: familiaData.autorizacion_datos || false
          },
          
          // Información de personas/miembros de familia - SEPARADOS CORRECTAMENTE
          miembros_familia: {
            total_miembros: personasFormateadas.length,
            personas: personasFormateadas
          },
          
          // NUEVO: Personas fallecidas en el mismo formato que el request body
          deceasedMembers: difuntosFormateados,
          
          // Metadatos
          metadatos: {
            fecha_creacion: familiaData.fecha_ultima_encuesta,
            estado: familiaData.estado_encuesta,
            version: '1.0'
          }
        };
      })
    );

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit);
    
    console.log(`✅ Se encontraron ${total} encuestas con información completa`);

    return paginatedResponse(res, {
      message: 'Encuestas obtenidas exitosamente',
      data: encuestasFormateadas,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: parseInt(total),
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo encuestas:', error);
    return errorResponse(res, error);
  }
};

/**
 * Obtener una encuesta específica por ID
 */
export const obtenerEncuestaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando encuesta con ID: ${id}`);

    // Validar que el ID sea un número válido
    const idNumerico = parseInt(id);
    if (isNaN(idNumerico) || idNumerico <= 0) {
      throw createError(ErrorCodes.VALIDATION.INVALID_ID_FORMAT, {
        field: 'id_familia',
        value: id
      });
    }

    // Buscar la familia usando la misma consulta que obtenerEncuestas
    const familiasQuery = `
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.sector,
        f.direccion_familia,
        f.numero_contacto,
        f.telefono,
        f.email,
        f.tamaño_familia,
        f.tipo_vivienda,
        f.estado_encuesta,
        f.numero_encuestas,
        f.fecha_ultima_encuesta,
        f.codigo_familia,
        f.tutor_responsable,
        f.numero_contrato_epm,
        f."comunionEnCasa",
        f.id_municipio,
        f.id_vereda,
        f.id_sector,
        f.id_parroquia,
        f.id_corregimiento,
        f.id_centro_poblado,
        f.id_usuario_creador,
        f.sustento_familia,
        f.observaciones_encuestador,
        f.autorizacion_datos,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        p.nombre as nombre_parroquia,
        corr.nombre as nombre_corregimiento,
        cp.nombre as nombre_centro_poblado,
        tv.id_tipo_vivienda,
        tv.nombre as nombre_tipo_vivienda,
        u.id as encuestador_id,
        CONCAT(u.primer_nombre, ' ', u.primer_apellido) as nombre_encuestador
      FROM familias f
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
      LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      LEFT JOIN usuarios u ON f.id_usuario_creador = u.id
      WHERE f.id_familia = :familiaId
    `;
    
    const [familiaData] = await sequelize.query(familiasQuery, {
      replacements: { familiaId: id },
      type: QueryTypes.SELECT
    });

    if (!familiaData) {
      console.log(`❌ Encuesta con ID ${id} no encontrada`);
      throw createError(ErrorCodes.NOT_FOUND.ENCUESTA_NOT_FOUND, {
        id: idNumerico
      });
    }

    console.log(`✅ Encuesta encontrada: ${familiaData.apellido_familiar}`);

    // ⭐ USAR HELPER para obtener personas con celebraciones y enfermedades
    const personas = await personaDetallesHelper.obtenerPersonasFamiliaCompletas(
      familiaData.id_familia
    );

    // Obtener difuntos desde la tabla difuntos_familia (en lugar de personas con FALLECIDO%)
    const difuntos = await sequelize.query(`
      SELECT 
        df.id_difunto,
        df.nombre_completo,
        '' as primer_nombre,
        '' as segundo_nombre, 
        '' as primer_apellido,
        '' as segundo_apellido,
        df.id_sexo,
        df.id_parentesco,
        s.nombre as sexo_nombre,
        par.nombre as parentesco_nombre,
        df.fecha_fallecimiento,
        df.causa_fallecimiento,
        df.observaciones
      FROM difuntos_familia df
      LEFT JOIN sexos s ON df.id_sexo = s.id_sexo
      LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
      WHERE df.id_familia_familias = :familiaId
    `, {
      replacements: { familiaId: familiaData.id_familia },
      type: QueryTypes.SELECT
    });

    // Obtener información de ubicación usando datos ya obtenidos con JOINs
    let municipioInfo = null;
    let veredaInfo = null;
    let sectorInfo = null;
    let parroquiaInfo = null;
    let corregimientoInfo = null;
    let centroPobladoInfo = null;
    let tipoViviendaInfo = null;

    // Usar datos de municipio ya obtenidos en el JOIN
    if (familiaData.id_municipio && familiaData.nombre_municipio) {
      municipioInfo = {
        id: familiaData.id_municipio,
        nombre: familiaData.nombre_municipio
      };
    }

    // Usar datos de vereda ya obtenidos en el JOIN
    if (familiaData.id_vereda && familiaData.nombre_vereda) {
      veredaInfo = {
        id: familiaData.id_vereda,
        nombre: familiaData.nombre_vereda
      };
    }

    // Usar datos de sector ya obtenidos en el JOIN
    if (familiaData.id_sector && familiaData.nombre_sector) {
      sectorInfo = {
        id: familiaData.id_sector,
        nombre: familiaData.nombre_sector
      };
    } else if (familiaData.sector) {
      // Fallback para sector como texto
      sectorInfo = {
        id: null,
        nombre: familiaData.sector
      };
    }

    // Usar datos de parroquia ya obtenidos en el JOIN
    if (familiaData.id_parroquia && familiaData.nombre_parroquia) {
      parroquiaInfo = {
        id: familiaData.id_parroquia,
        nombre: familiaData.nombre_parroquia
      };
    } else if (familiaData.id_parroquia) {
      // Si tenemos id_parroquia pero no nombre, buscar en la tabla parroquias
      try {
        const parroquiaDb = await sequelize.query(
          'SELECT id_parroquia, nombre FROM parroquias WHERE id_parroquia = :id',
          {
            replacements: { id: parseInt(familiaData.id_parroquia) },
            type: QueryTypes.SELECT
          }
        );
        
        if (parroquiaDb.length > 0) {
          parroquiaInfo = {
            id: parroquiaDb[0].id_parroquia,
            nombre: parroquiaDb[0].nombre
          };
        } else {
          parroquiaInfo = {
            id: familiaData.id_parroquia,
            nombre: 'Parroquia no encontrada'
          };
        }
      } catch (error) {
        console.error('Error buscando parroquia:', error);
        parroquiaInfo = {
          id: familiaData.id_parroquia,
          nombre: `ID: ${familiaData.id_parroquia}`
        };
      }
    }

    // Usar datos de corregimiento ya obtenidos en el JOIN
    if (familiaData.id_corregimiento && familiaData.nombre_corregimiento) {
      corregimientoInfo = {
        id: familiaData.id_corregimiento,
        nombre: familiaData.nombre_corregimiento
      };
    }

    // Usar datos de centro poblado ya obtenidos en el JOIN
    if (familiaData.id_centro_poblado && familiaData.nombre_centro_poblado) {
      centroPobladoInfo = {
        id: familiaData.id_centro_poblado,
        nombre: familiaData.nombre_centro_poblado
      };
    }

    // Usar datos de tipo de vivienda ya obtenidos en el JOIN
    if (familiaData.id_tipo_vivienda && familiaData.nombre_tipo_vivienda) {
      tipoViviendaInfo = {
        id: familiaData.id_tipo_vivienda,
        nombre: familiaData.nombre_tipo_vivienda
      };
    } else if (familiaData.tipo_vivienda) {
      // Si tipo_vivienda es un número, buscar en la tabla tipos_vivienda
      if (!isNaN(familiaData.tipo_vivienda)) {
        try {
          const tipoViviendaDb = await sequelize.query(
            'SELECT id_tipo_vivienda, nombre FROM tipos_vivienda WHERE id_tipo_vivienda = :id AND activo = true',
            {
              replacements: { id: parseInt(familiaData.tipo_vivienda) },
              type: QueryTypes.SELECT
            }
          );
          
          if (tipoViviendaDb.length > 0) {
            tipoViviendaInfo = {
              id: tipoViviendaDb[0].id_tipo_vivienda,
              nombre: tipoViviendaDb[0].nombre
            };
          } else {
            tipoViviendaInfo = {
              id: null,
              nombre: 'Tipo no encontrado'
            };
          }
        } catch (error) {
          console.error('Error buscando tipo de vivienda:', error);
          tipoViviendaInfo = {
            id: null,
            nombre: `ID: ${familiaData.tipo_vivienda}`
          };
        }
      } else {
        // Fallback para tipo de vivienda como texto
        tipoViviendaInfo = {
          id: null,
          nombre: familiaData.tipo_vivienda
        };
      }
    }

    // Obtener información de basuras, acueducto y aguas residuales - SIEMPRE DEVOLVER ARRAYS
    let disposicionBasuras = [];
    let sistemasAcueducto = [];
    let sistemasAguasResiduales = [];

    try {
      // Obtener disposición de basuras
      const disposiciones = await sequelize.query(`
        SELECT tdb.id_tipo_disposicion_basura, tdb.nombre 
        FROM familia_disposicion_basura fdb 
        JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura 
        WHERE fdb.id_familia = :familiaId
      `, {
        replacements: { familiaId: familiaData.id_familia },
        type: QueryTypes.SELECT
      });
      
      disposicionBasuras = disposiciones.map(d => ({
        id: d.id_tipo_disposicion_basura,
        nombre: d.nombre
      }));
    } catch (error) {
      console.log(`⚠️ Error obteniendo disposición de basuras: ${error.message}`);
      disposicionBasuras = [];
    }

    try {
      // Obtener sistemas de acueducto
      const sistemas = await sequelize.query(`
        SELECT sa.id_sistema_acueducto, sa.nombre 
        FROM familia_sistema_acueducto fsa 
        JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto 
        WHERE fsa.id_familia = :familiaId
      `, {
        replacements: { familiaId: familiaData.id_familia },
        type: QueryTypes.SELECT
      });
      
      sistemasAcueducto = sistemas.map(s => ({
        id: s.id_sistema_acueducto,
        nombre: s.nombre
      }));
    } catch (error) {
      console.log(`⚠️ Error obteniendo sistemas de acueducto: ${error.message}`);
      sistemasAcueducto = [];
    }

    try {
      // Obtener sistemas de aguas residuales
      const sistemasAR = await sequelize.query(`
        SELECT tar.id_tipo_aguas_residuales, tar.nombre 
        FROM familia_sistema_aguas_residuales fsar 
        JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales 
        WHERE fsar.id_familia = :familiaId
      `, {
        replacements: { familiaId: familiaData.id_familia },
        type: QueryTypes.SELECT
      });
      
      sistemasAguasResiduales = sistemasAR.map(s => ({
        id: s.id_tipo_aguas_residuales,
        nombre: s.nombre
      }));
    } catch (error) {
      console.log(`⚠️ Error obteniendo sistemas de aguas residuales: ${error.message}`);
      sistemasAguasResiduales = [];
    }

    // Obtener información adicional para cada persona VIVA (misma lógica que obtenerEncuestas)
    const personasFormateadas = await Promise.all(personas.map(async (persona) => {
      // Información del estudio - manejar casos donde estudios contiene JSON
      let estudioInfo = null;
      if (persona.estudios) {
        try {
          // Verificar si es un JSON string (típicamente para fallecidos que no deberían estar aquí)
          if (persona.estudios.startsWith('{') && persona.estudios.includes('es_fallecido')) {
            // Si es un fallecido que se coló, usar placeholder
            estudioInfo = {
              id: null,
              nombre: 'Datos inconsistentes - revisar'
            };
          } else {
            // Si estudios contiene un ID numérico, buscar en la tabla
            const estudioId = parseInt(persona.estudios);
            if (!isNaN(estudioId)) {
              const [estudio] = await sequelize.query(`
                SELECT id_niveles_educativos as id, nivel as nombre 
                FROM niveles_educativos 
                WHERE id_niveles_educativos = :estudioId
              `, {
                replacements: { estudioId },
                type: QueryTypes.SELECT
              });
              
              if (estudio) {
                estudioInfo = {
                  id: estudio.id,
                  nombre: estudio.nombre
                };
              } else {
                estudioInfo = {
                  id: estudioId,
                  nombre: persona.estudios
                };
              }
            } else {
              // Si no es un ID, intentar buscar por nombre/nivel
              const [estudio] = await sequelize.query(`
                SELECT id_niveles_educativos as id, nivel as nombre 
                FROM niveles_educativos 
                WHERE LOWER(nivel) LIKE LOWER(:nivelBusqueda)
                AND activo = true
              `, {
                replacements: { nivelBusqueda: `%${persona.estudios}%` },
                type: QueryTypes.SELECT
              });
              
              if (estudio) {
                estudioInfo = {
                  id: estudio.id,
                  nombre: estudio.nombre
                };
              } else {
                // Si no se encuentra en el catálogo, mantener el texto original con ID null
                estudioInfo = {
                  id: null,
                  nombre: persona.estudios
                };
              }
            }
          }
        } catch (error) {
          estudioInfo = {
            id: null,
            nombre: persona.estudios
          };
        }
      }

      // ========================================================================
      // CONSULTAR DESTREZAS DE LA PERSONA
      // ========================================================================
      const destrezas = await sequelize.query(`
        SELECT 
          d.id_destreza,
          d.nombre
        FROM persona_destreza pd
        INNER JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
        WHERE pd.id_personas_personas = :personaId
        ORDER BY d.nombre
      `, {
        replacements: { personaId: persona.id_personas },
        type: QueryTypes.SELECT
      });

      // ========================================================================
      // CONSULTAR HABILIDADES DE LA PERSONA
      // ========================================================================
      const habilidades = await sequelize.query(`
        SELECT 
          h.id_habilidad,
          h.nombre,
          h.descripcion,
          ph.nivel
        FROM persona_habilidad ph
        INNER JOIN habilidades h ON ph.id_habilidad = h.id_habilidad
        WHERE ph.id_persona = :personaId
        ORDER BY h.nombre
      `, {
        replacements: { personaId: persona.id_personas },
        type: QueryTypes.SELECT
      });

      return {
        id: persona.id_personas,
        nombre_completo: formatearNombreCompleto(persona.primer_nombre, persona.segundo_nombre, persona.primer_apellido, persona.segundo_apellido),
        identificacion: {
          numero: persona.identificacion,
          tipo: persona.tipo_id_id ? {
            id: persona.tipo_id_id,
            nombre: persona.tipo_id_nombre,
            codigo: persona.tipo_id_codigo
          } : null
        },
        telefono: persona.telefono,
        email: persona.correo_electronico,
        fecha_nacimiento: persona.fecha_nacimiento,
        direccion: persona.direccion,
        estudios: estudioInfo,
        edad: persona.fecha_nacimiento ? 
          Math.floor((new Date() - new Date(persona.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        sexo: persona.sexo_id ? {
          id: persona.sexo_id,
          nombre: persona.sexo_nombre
        } : null,
        estado_civil: persona.estado_civil_id ? {
          id: persona.estado_civil_id,
          nombre: persona.estado_civil_nombre
        } : null,
        tallas: {
          camisa: persona.talla_camisa,
          pantalon: persona.talla_pantalon,
          zapato: persona.talla_zapato
        },
        // ⭐ NUEVOS CAMPOS ⭐
        destrezas: destrezas.map(d => ({
          id: d.id_destreza,
          nombre: d.nombre
        })),
        habilidades: habilidades.map(h => ({
          id: h.id_habilidad,
          nombre: h.nombre,
          descripcion: h.descripcion,
          nivel: h.nivel
        })),
        en_que_eres_lider: persona.en_que_eres_lider || null,
        // ⭐ CAMPOS AGREGADOS - profesion, parentesco, comunidad cultural, celebraciones, necesidades ⭐
        profesion: persona.id_profesion ? {
          id: persona.id_profesion,
          nombre: persona.profesion_nombre || null
        } : null,
        parentesco: persona.id_parentesco ? {
          id: persona.id_parentesco,
          nombre: persona.parentesco_nombre || null
        } : null,
        comunidad_cultural: persona.id_comunidad_cultural ? {
          id: persona.id_comunidad_cultural,
          nombre: persona.comunidad_cultural_nombre || null
        } : null,
        // ⭐ NUEVOS CAMPOS - Celebraciones y Enfermedades (arrays) ⭐
        celebraciones: persona.celebraciones || [],
        enfermedades: persona.enfermedades || [],
        necesidad_enfermo: persona.necesidad_enfermo || null
      };
    }));

    // Procesar difuntos desde la tabla difuntos_familia (misma lógica que obtenerEncuestas)
    const difuntosFormateados = difuntos.map(fallecido => {
      // Los datos ya vienen directamente de la tabla difuntos_familia
      return {
        nombres: fallecido.nombre_completo,
        fechaFallecimiento: fallecido.fecha_fallecimiento || null,
        sexo: fallecido.id_sexo ? {
          id: parseInt(fallecido.id_sexo),
          nombre: fallecido.sexo_nombre || null
        } : {
          id: null,
          nombre: null
        },
        parentesco: fallecido.id_parentesco ? {
          id: parseInt(fallecido.id_parentesco),
          nombre: fallecido.parentesco_nombre || null
        } : {
          id: null,
          nombre: null
        },
        causaFallecimiento: fallecido.causa_fallecimiento || fallecido.observaciones || null
      };
    });

    const familiaInfo = {
      // *** INFORMACIÓN BÁSICA DE LA FAMILIA ***
      apellido_familiar: familiaData.apellido_familiar,
      direccion_familia: familiaData.direccion_familia,
      telefono: familiaData.telefono,
      codigo_familia: familiaData.codigo_familia,
    };
    
    // Solo agregar campos opcionales si no son null
    if (familiaData.email !== null) {
      familiaInfo.email = familiaData.email;
    }
    if (familiaData.tutor_responsable !== null) {
      familiaInfo.tutor_responsable = familiaData.tutor_responsable;
    }

    // Usar exactamente la misma estructura que obtenerEncuestas
    const encuestaFormateada = {
      // *** ID DE LA ENCUESTA (ÚNICO) ***
      id_encuesta: familiaData.id_familia,
      
      ...familiaInfo,
      
      // *** INFORMACIÓN DE LA ENCUESTA ***
      estado_encuesta: familiaData.estado_encuesta,
      numero_encuestas: familiaData.numero_encuestas,
      fecha_ultima_encuesta: familiaData.fecha_ultima_encuesta,
      
      // *** INFORMACIÓN DEL ENCUESTADOR ***
      encuestador: familiaData.nombre_encuestador || null,
      
      // *** INFORMACIÓN DE VIVIENDA CON ID Y NOMBRE ***
      tipo_vivienda: tipoViviendaInfo,
      tamaño_familia: familiaData.tamaño_familia,
      
      // *** INFORMACIÓN GEOGRÁFICA COMPLETA CON ID Y NOMBRE ***
      sector: sectorInfo,
      municipio: municipioInfo,
      vereda: veredaInfo,
      parroquia: parroquiaInfo,
      corregimiento: corregimientoInfo,
      centro_poblado: centroPobladoInfo,
      
      // *** INFORMACIÓN DE SERVICIOS CON ID Y NOMBRE ***
      basuras: disposicionBasuras, // Siempre array, nunca null
      acueducto: sistemasAcueducto.length > 0 ? sistemasAcueducto[0] : null, // null cuando no hay información
      aguas_residuales: sistemasAguasResiduales, // Siempre array, igual que basuras
      
      // *** INFORMACIÓN RELIGIOSA ***
      comunion_en_casa: familiaData.comunionEnCasa,
      
      // *** INFORMACIÓN DE SERVICIOS PÚBLICOS ***
      numero_contrato_epm: familiaData.numero_contrato_epm || null,
      
      // *** OBSERVACIONES ***
      observaciones: {
        sustento_familia: familiaData.sustento_familia || "",
        observaciones_encuestador: familiaData.observaciones_encuestador || "",
        autorizacion_datos: familiaData.autorizacion_datos || false
      },
      
      // Información de personas/miembros de familia - SEPARADOS CORRECTAMENTE
      miembros_familia: {
        total_miembros: personasFormateadas.length,
        personas: personasFormateadas
      },
      
      // NUEVO: Personas fallecidas en el mismo formato que el request body
      deceasedMembers: difuntosFormateados,
      
      // Metadatos
      metadatos: {
        fecha_creacion: familiaData.fecha_ultima_encuesta,
        estado: familiaData.estado_encuesta,
        version: '1.0'
      }
    };

    return successResponse(res, {
      message: 'Encuesta obtenida exitosamente',
      data: encuestaFormateada
    });

  } catch (error) {
    console.error('❌ Error obteniendo encuesta por ID:', error);
    return errorResponse(res, error);
  }
};

/**
 * @swagger
 * /api/encuesta:
 *   post:
 *     summary: Crear una nueva encuesta familiar completa
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - informacionGeneral
 *               - vivienda
 *               - servicios_agua
 *               - observaciones
 *               - familyMembers
 *             properties:
 *               informacionGeneral:
 *                 type: object
 *                 properties:
 *                   municipio:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                   parroquia:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                   sector:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                   vereda:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                   fecha: { type: string, format: date-time }
 *                   apellido_familiar: { type: string }
 *                   direccion: { type: string }
 *                   telefono: { type: string }
 *                   numero_contrato_epm: { type: string }
 *                   comunionEnCasa: { type: boolean }
 *               vivienda:
 *                 type: object
 *                 properties:
 *                   tipo_vivienda:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                   disposicion_basuras:
 *                     type: object
 *                     properties:
 *                       recolector: { type: boolean }
 *                       quemada: { type: boolean }
 *                       enterrada: { type: boolean }
 *                       recicla: { type: boolean }
 *                       aire_libre: { type: boolean }
 *                       no_aplica: { type: boolean }
 *               servicios_agua:
 *                 type: object
 *                 properties:
 *                   sistema_acueducto:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       nombre: { type: string }
 *                   aguas_residuales:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         nombre: { type: string }
 *                   pozo_septico: { type: boolean }
 *                   letrina: { type: boolean }
 *                   campo_abierto: { type: boolean }
 *               observaciones:
 *                 type: object
 *                 properties:
 *                   sustento_familia: { type: string }
 *                   observaciones_encuestador: { type: string }
 *                   autorizacion_datos: { type: boolean }
 *               familyMembers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombres: { type: string }
 *                     fechaNacimiento: { type: string, format: date-time }
 *                     tipoIdentificacion: { type: string }
 *                     sexo: { type: string }
 *                     situacionCivil: { type: string }
 *                     parentesco: { type: string }
 *                     telefono: { type: string }
 *                     estudio: { type: string }
 *                     comunidadCultural: { type: string }
 *                     talla:
 *                       type: object
 *                       properties:
 *                         camisa: { type: string }
 *                         pantalon: { type: string }
 *                         calzado: { type: string }
 *               deceasedMembers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombres: { type: string }
 *                     fechaAniversario: { type: string, format: date-time }
 *                     eraPadre: { type: boolean }
 *                     eraMadre: { type: boolean }
 *               metadata:
 *                 type: object
 *                 properties:
 *                   timestamp: { type: string, format: date-time }
 *                   completed: { type: boolean }
 *                   currentStage: { type: integer }
 *     responses:
 *       201:
 *         description: Encuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Encuesta guardada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     familia_id:
 *                       type: integer
 *                       example: 123
 *                     personas_creadas:
 *                       type: integer
 *                       example: 3
 *                     personas_fallecidas:
 *                       type: integer
 *                       example: 1
 *                     transaccion_id:
 *                       type: string
 *                       example: "txn_12345"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Datos de encuesta inválidos
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor
 *                 details:
 *                   type: string
 */

export const crearEncuesta = async (req, res) => {
  let transaction;
  
  try {
    console.log('🔄 Iniciando procesamiento de encuesta...');
    
    const {
      informacionGeneral,
      vivienda,
      servicios_agua,
      observaciones,
      familyMembers = [],
      deceasedMembers = [],
      metadata = {}
    } = req.body;

    console.log('🔍 DEBUG observaciones recibidas:', JSON.stringify(observaciones, null, 2));
    console.log('✅ Validaciones completadas por middlewares');
    
    // VALIDAR INTEGRIDAD DE DATOS ANTES DE INICIAR TRANSACCIÓN
    console.log('🔍 Validando integridad de datos...');
    try {
      await EncuestaService.validarIntegridadDatos({
        informacionGeneral,
        vivienda,
        servicios_agua
      });
      console.log('✅ Validación de integridad completada');
    } catch (validationError) {
      console.log('❌ Error en validación de integridad:', validationError.message);
      throw validationError; // Propagar el AppError del servicio
    }
    
    // Iniciar transacción SOLO después de validar
    transaction = await sequelize.transaction();
    
    // 1. VALIDAR UNICIDAD DE NÚMERO DE CONTRATO EPM
    if (informacionGeneral.numero_contrato_epm) {
      console.log(`🔍 Verificando unicidad de contrato EPM: ${informacionGeneral.numero_contrato_epm}...`);
      
      const [existingFamily] = await sequelize.query(`
        SELECT f.id_familia, f.apellido_familiar, f.telefono, f.direccion_familia
        FROM familias f
        WHERE f.numero_contrato_epm = :numero_contrato_epm
        LIMIT 1
      `, {
        replacements: { numero_contrato_epm: informacionGeneral.numero_contrato_epm },
        type: QueryTypes.SELECT,
        transaction
      });
      
      if (existingFamily) {
        console.log('❌ Número de contrato EPM duplicado:', existingFamily);
        throw createError(ErrorCodes.DUPLICATES.DUPLICATE_EPM_CONTRACT, {
          numeroContrato: informacionGeneral.numero_contrato_epm,
          familiaExistente: {
            id: existingFamily.id_familia,
            apellido: existingFamily.apellido_familiar,
            telefono: existingFamily.telefono,
            direccion: existingFamily.direccion_familia
          },
          details: `El contrato EPM ${informacionGeneral.numero_contrato_epm} ya está asignado a la familia "${existingFamily.apellido_familiar}"`
        });
      }
      
      console.log('✅ Número de contrato EPM disponible');
    }
    
    // 2. CREAR FAMILIA
    console.log('💾 Creando registro de familia...');
    
    const tamanioFamiliaCalculado = Math.max(1, (familyMembers.length || 0) + (deceasedMembers.length || 0));
    
    const familiaData = {
      apellido_familiar: informacionGeneral.apellido_familiar,
      sector: (typeof informacionGeneral.sector === 'object' && informacionGeneral.sector !== null) 
        ? (informacionGeneral.sector.nombre || 'General') 
        : (informacionGeneral.sector || 'General'),
      direccion_familia: informacionGeneral.direccion,
      telefono: informacionGeneral.telefono,
      email: informacionGeneral.email || null,
      tamaño_familia: tamanioFamiliaCalculado,
      // Campo de texto legacy - solo si es string, no objeto
      tipo_vivienda: (typeof vivienda.tipo_vivienda === 'string') 
        ? vivienda.tipo_vivienda 
        : (vivienda.tipo_vivienda?.nombre || 'Casa'),
      id_tipo_vivienda: vivienda.tipo_vivienda?.id ? safeParseInt(vivienda.tipo_vivienda.id) : null, // FK correcta
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: new Date().toISOString().split('T')[0],
      fecha_encuesta: informacionGeneral.fecha || new Date().toISOString().split('T')[0], // Fecha de registro
      codigo_familia: `FAM_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      tutor_responsable: null,
      numero_contrato_epm: informacionGeneral.numero_contrato_epm || null,
      id_usuario_creador: req.user?.id || null, // ID del usuario que crea la encuesta
      id_municipio: safeParseInt(informacionGeneral.municipio?.id),
      id_parroquia: safeParseInt(informacionGeneral.parroquia?.id),
      id_vereda: safeParseInt(informacionGeneral.vereda?.id),
      id_sector: safeParseInt(informacionGeneral.sector?.id),
      id_corregimiento: safeParseInt(informacionGeneral.corregimiento?.id),
      id_centro_poblado: safeParseInt(informacionGeneral.centro_poblado?.id),
      
      // ⭐ SOPORTE v2.0: comunionEnCasa puede venir en informacionGeneral O en cualquier miembro (solicitudComunionCasa)
      comunionEnCasa: informacionGeneral.comunionEnCasa || 
                     (familyMembers && familyMembers.some(m => m.solicitudComunionCasa === true)) || 
                     false,
      
      // CAMPOS BOOLEANOS DE SERVICIOS DE AGUA
      pozo_septico: servicios_agua?.pozo_septico || false,
      letrina: servicios_agua?.letrina || false,
      campo_abierto: servicios_agua?.campo_abierto || false,
      
      // CAMPOS BOOLEANOS DE DISPOSICIÓN DE BASURAS
      disposicion_recolector: vivienda?.disposicion_basuras?.recolector || false,
      disposicion_quemada: vivienda?.disposicion_basuras?.quemada || false,
      disposicion_enterrada: vivienda?.disposicion_basuras?.enterrada || false,
      disposicion_recicla: vivienda?.disposicion_basuras?.recicla || false,
      disposicion_aire_libre: vivienda?.disposicion_basuras?.aire_libre || false,
      
      // ⭐ CAMPOS DE OBSERVACIONES
      sustento_familia: observaciones?.sustento_familia || null,
      observaciones_encuestador: observaciones?.observaciones_encuestador || null,
      autorizacion_datos: observaciones?.autorizacion_datos || false
    };

    console.log('🔍 DEBUG familiaData.sustento_familia:', familiaData.sustento_familia);
    console.log('🔍 DEBUG familiaData.observaciones_encuestador:', familiaData.observaciones_encuestador);
    console.log('🔍 DEBUG familiaData.autorizacion_datos:', familiaData.autorizacion_datos);

    const familia = await Familias.create(familiaData, { transaction });
    console.log(`✅ Familia creada con ID: ${familia.id_familia}`);
    
    // FIX TEMPORAL: Sequelize no está guardando id_parroquia en el create, forzar con UPDATE directo
    if (familiaData.id_parroquia && !familia.id_parroquia) {
      console.log('🔧 FIX: Actualizando id_parroquia manualmente...');
      await sequelize.query(
        'UPDATE familias SET id_parroquia = $1 WHERE id_familia = $2',
        {
          bind: [familiaData.id_parroquia, familia.id_familia],
          transaction
        }
      );
      console.log(`✅ id_parroquia actualizado a: ${familiaData.id_parroquia}`);
    }

    // FIX TEMPORAL: Sequelize no está guardando campos de observaciones en el create, forzar con UPDATE directo
    if (familiaData.sustento_familia || familiaData.observaciones_encuestador || familiaData.autorizacion_datos !== undefined) {
      console.log('🔧 FIX: Actualizando campos de observaciones manualmente...');
      await sequelize.query(
        'UPDATE familias SET sustento_familia = $1, observaciones_encuestador = $2, autorizacion_datos = $3 WHERE id_familia = $4',
        {
          bind: [
            familiaData.sustento_familia || null,
            familiaData.observaciones_encuestador || null,
            familiaData.autorizacion_datos || false,
            familia.id_familia
          ],
          transaction
        }
      );
      console.log(`✅ Observaciones actualizadas: sustento="${familiaData.sustento_familia?.substring(0, 30)}...", obs="${familiaData.observaciones_encuestador?.substring(0, 30)}...", auth=${familiaData.autorizacion_datos}`);
    }
    
    if (!familia.id_familia) {
      throw new Error('Error al crear la familia: ID no generado correctamente');
    }
    
    const familiaId = familia.id_familia;

    // 2. REGISTRAR SERVICIOS (usando funciones auxiliares)
    await registrarDisposicionBasuras(familiaId, vivienda.disposicion_basuras, transaction);
    await registrarSistemaAcueducto(familiaId, servicios_agua.sistema_acueducto, transaction);
    await registrarAguasResiduales(familiaId, servicios_agua.aguas_residuales, transaction);
    await registrarTipoVivienda(familiaId, vivienda.tipo_vivienda, transaction);

    // 3. PROCESAR MIEMBROS DE LA FAMILIA
    const personasCreadas = await procesarMiembrosFamilia(familiaId, familyMembers, informacionGeneral, transaction);
    const personasFallecidas = await procesarMiembrosFallecidos(familiaId, deceasedMembers, informacionGeneral, transaction);

    // 4. CONFIRMAR TRANSACCIÓN
    await transaction.commit();
    console.log('✅ Transacción completada exitosamente');
    
    // 5. RESPUESTA EXITOSA
    return successResponse(res, {
      statusCode: 201,
      message: 'Encuesta guardada exitosamente',
      data: {
        familia_id: familiaId,
        codigo_familia: familia.codigo_familia,
        personas_creadas: personasCreadas,
        personas_fallecidas: personasFallecidas,
        informacion_persistida: {
          informacion_general: true,
          vivienda_y_disposicion_basuras: true,
          servicios_agua: true,
          miembros_familia: personasCreadas > 0,
          personas_fallecidas: personasFallecidas > 0,
          ubicacion_geografica: !!(informacionGeneral.municipio || informacionGeneral.vereda || informacionGeneral.sector)
        }
      },
      metadata: {
        transaccion_id: `txn_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '2.0',
        completada: metadata.completed || false,
        etapa_actual: metadata.currentStage || null,
        observaciones_procesadas: !!(observaciones.sustento_familia || observaciones.observaciones_encuestador),
        autorizacion_datos: observaciones.autorizacion_datos || false,
        validacion_duplicados: 'verificada'
      }
    });

  } catch (error) {
    console.log('❌ ERROR CAPTURADO - VERIFICANDO ESTADO DE TRANSACCIÓN');
    
    if (transaction && !transaction.finished) {
      try {
        console.log('❌ Transacción activa - Iniciando rollback');
        await transaction.rollback();
        console.log('❌ ROLLBACK COMPLETADO');
      } catch (rollbackError) {
        console.error('❌ Error durante rollback:', rollbackError.message);
      }
    }
    
    console.error('❌ Error procesando encuesta:', error);
    return errorResponse(res, error);
  }
};

/**
 * Eliminar encuesta familiar por ID
 */
export const eliminarEncuesta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Validar ID numérico
    const idNumerico = parseInt(id);
    if (isNaN(idNumerico) || idNumerico <= 0) {
      throw createError(ErrorCodes.VALIDATION.INVALID_ID_FORMAT, {
        field: 'id_familia',
        value: id
      });
    }
    
    const encuesta = req.encuesta; // Viene del middleware de validación

    console.log(`🗑️ Iniciando eliminación de encuesta: ${encuesta.apellido_familiar}`);

    // Obtener estadísticas antes de eliminar
    const personas = await sequelize.query(`
      SELECT COUNT(*) as total FROM personas WHERE id_familia_familias = :familiaId
    `, {
      replacements: { familiaId: id },
      type: QueryTypes.SELECT
    });

    const totalPersonas = parseInt(personas[0].total) || 0;
    const estadisticasEliminacion = {
      familia_id: id,
      apellido_familiar: encuesta.apellido_familiar,
      personas_eliminadas: totalPersonas,
      fecha_eliminacion: new Date().toISOString()
    };

    console.log(`📊 Eliminando: ${totalPersonas} personas`);

    // Eliminar registros de difuntos_familia relacionados
    const difuntosEliminados = await sequelize.query(`
      DELETE FROM difuntos_familia WHERE id_familia_familias = :familiaId
    `, {
      replacements: { familiaId: id },
      transaction
    });

    console.log(`🪦 Difuntos eliminados: ${difuntosEliminados[1]} registros`);

    // Eliminar registros relacionados
    const personasEliminadas = await Persona.destroy({
      where: { id_familia_familias: id },
      transaction
    });

    // Eliminar registros de servicios
    await Promise.all([
      sequelize.query('DELETE FROM familia_disposicion_basura WHERE id_familia = $1', { bind: [id], transaction }),
      sequelize.query('DELETE FROM familia_sistema_acueducto WHERE id_familia = $1', { bind: [id], transaction }),
      sequelize.query('DELETE FROM familia_sistema_aguas_residuales WHERE id_familia = $1', { bind: [id], transaction }).catch(() => {}),
      sequelize.query('DELETE FROM familia_tipo_vivienda WHERE id_familia = $1', { bind: [id], transaction }).catch(() => {})
    ]);

    // Eliminar familia principal
    const familiaEliminada = await Familias.destroy({
      where: { id_familia: id },
      transaction
    });

    if (familiaEliminada === 0) {
      await transaction.rollback();
      throw createError(ErrorCodes.BUSINESS_LOGIC.DELETE_FAILED, {
        id: idNumerico,
        apellido_familiar: encuesta.apellido_familiar
      });
    }

    await transaction.commit();
    console.log('✅ Eliminación completada exitosamente');

    return successResponse(res, {
      message: `Encuesta de la familia ${estadisticasEliminacion.apellido_familiar} eliminada exitosamente`,
      data: {
        eliminacion_completada: true,
        estadisticas: estadisticasEliminacion,
        registros_afectados: {
          familia: 1,
          personas: personasEliminadas,
          difuntos_eliminados: difuntosEliminados[1] || 0,
          disposicion_basuras: true,
          sistema_acueducto: true,
          aguas_residuales: true,
          tipo_vivienda: true
        },
        metadata: {
          timestamp: new Date().toISOString(),
          transaccion_id: `delete_txn_${Date.now()}`,
          version: '1.0'
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error eliminando encuesta:', error);
    return errorResponse(res, error);
  }
};

/**
 * PATCH - Actualizar campos específicos de una encuesta
 */
export const actualizarCamposEncuesta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const camposValidos = req.camposValidos; // Viene del middleware
    const bodyCompleto = req.bodyCompleto || req.body; // Body completo para relaciones

    console.log(`🔄 Actualizando campos específicos de encuesta ID: ${id}`);
    console.log('📝 Campos a actualizar:', Object.keys(camposValidos));

    // Construir query dinámico de actualización
    const setClauses = Object.keys(camposValidos).map(campo => `"${campo}" = :${campo}`);
    const updateQuery = `
      UPDATE familias 
      SET ${setClauses.join(', ')}, fecha_ultima_encuesta = NOW()
      WHERE id_familia = :id
    `;

    // Ejecutar actualización de campos básicos
    await sequelize.query(updateQuery, {
      replacements: { ...camposValidos, id },
      type: QueryTypes.UPDATE,
      transaction
    });

    // Actualizar relaciones many-to-many si vienen en el body
    
    // 1. Actualizar disposición de basuras
    if (bodyCompleto.vivienda?.disposicion_basuras) {
      const basurasSeleccionadas = bodyCompleto.vivienda.disposicion_basuras
        .filter(b => b.seleccionado)
        .map(b => b.id);
      
      if (basurasSeleccionadas.length > 0) {
        // Eliminar registros existentes
        await sequelize.query(
          'DELETE FROM familia_disposicion_basura WHERE id_familia = :id',
          { replacements: { id }, type: QueryTypes.DELETE, transaction }
        );
        
        // Insertar nuevos registros
        for (const idBasura of basurasSeleccionadas) {
          await sequelize.query(
            'INSERT INTO familia_disposicion_basura (id_familia, id_tipo_disposicion_basura) VALUES (:id, :idBasura)',
            { replacements: { id, idBasura }, type: QueryTypes.INSERT, transaction }
          );
        }
        console.log('✅ Disposición de basuras actualizada');
      }
    }

    // 2. Actualizar sistema de acueducto
    if (bodyCompleto.servicios_agua?.sistema_acueducto?.id) {
      const idAcueducto = bodyCompleto.servicios_agua.sistema_acueducto.id;
      
      // Eliminar registros existentes
      await sequelize.query(
        'DELETE FROM familia_sistema_acueducto WHERE id_familia = :id',
        { replacements: { id }, type: QueryTypes.DELETE, transaction }
      );
      
      // Insertar nuevo registro
      await sequelize.query(
        'INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto) VALUES (:id, :idAcueducto)',
        { replacements: { id, idAcueducto }, type: QueryTypes.INSERT, transaction }
      );
      console.log('✅ Sistema de acueducto actualizado');
    }

    // 3. Actualizar aguas residuales
    if (bodyCompleto.servicios_agua?.aguas_residuales) {
      const aguasSeleccionadas = bodyCompleto.servicios_agua.aguas_residuales
        .filter(a => a.seleccionado)
        .map(a => a.id);
      
      if (aguasSeleccionadas.length > 0) {
        // Eliminar registros existentes
        await sequelize.query(
          'DELETE FROM familia_sistema_aguas_residuales WHERE id_familia = :id',
          { replacements: { id }, type: QueryTypes.DELETE, transaction }
        );
        
        // Insertar nuevos registros
        for (const idAgua of aguasSeleccionadas) {
          await sequelize.query(
            'INSERT INTO familia_sistema_aguas_residuales (id_familia, id_tipo_aguas_residuales) VALUES (:id, :idAgua)',
            { replacements: { id, idAgua }, type: QueryTypes.INSERT, transaction }
          );
        }
        console.log('✅ Aguas residuales actualizada');
      }
    }

    // 4. Actualizar personas (familyMembers) si vienen en el body
    if (bodyCompleto.familyMembers && Array.isArray(bodyCompleto.familyMembers)) {
      console.log(`📋 Actualizando ${bodyCompleto.familyMembers.length} personas...`);
      
      for (const miembro of bodyCompleto.familyMembers) {
        // Buscar si la persona ya existe por identificación
        const personaExistente = await sequelize.query(
          `SELECT id_personas FROM personas 
           WHERE identificacion = :identificacion AND id_familia_familias = :idFamilia`,
          {
            replacements: { 
              identificacion: miembro.numeroIdentificacion,
              idFamilia: id 
            },
            type: QueryTypes.SELECT,
            transaction
          }
        );

        if (personaExistente.length > 0) {
          // ACTUALIZAR persona existente
          const idPersona = personaExistente[0].id_personas;
          
          await sequelize.query(`
            UPDATE personas SET
              primer_nombre = :primerNombre,
              primer_apellido = :primerApellido,
              fecha_nacimiento = :fechaNacimiento,
              id_sexo = :idSexo,
              telefono = :telefono,
              correo_electronico = :correo,
              direccion = :direccion,
              id_estado_civil = :idEstadoCivil,
              id_estudios = :idEstudios,
              id_parentesco = :idParentesco,
              id_comunidad_cultural = :idComunidadCultural,
              id_profesion = :idProfesion,
              talla_camisa = :tallaCamisa,
              talla_pantalon = :tallaPantalon,
              talla_zapato = :tallaZapato,
              en_que_eres_lider = :enQueEresLider,
              necesidad_enfermo = :necesidadEnfermo
            WHERE id_personas = :idPersona
          `, {
            replacements: {
              idPersona,
              primerNombre: miembro.nombres?.split(' ')[0] || '',
              primerApellido: miembro.nombres?.split(' ').slice(-1)[0] || '',
              fechaNacimiento: miembro.fechaNacimiento || null,
              idSexo: miembro.sexo?.id || null,
              telefono: miembro.telefono || null,
              correo: miembro.correo_electronico || null,
              direccion: null,
              idEstadoCivil: miembro.situacionCivil?.id || null,
              idEstudios: miembro.estudio?.id || null,
              idParentesco: miembro.parentesco?.id || null,
              idComunidadCultural: miembro.comunidadCultural?.id || null,
              idProfesion: miembro.profesionMotivoFechaCelebrar?.profesion?.id || null,
              tallaCamisa: miembro.talla_camisa || null,
              tallaPantalon: miembro.talla_pantalon || null,
              tallaZapato: miembro.talla_zapato || null,
              enQueEresLider: miembro.enQueEresLider ? JSON.stringify(miembro.enQueEresLider) : null,
              necesidadEnfermo: miembro.necesidadesEnfermo ? JSON.stringify(miembro.necesidadesEnfermo) : null
            },
            type: QueryTypes.UPDATE,
            transaction
          });

          // Actualizar habilidades
          if (miembro.habilidades && Array.isArray(miembro.habilidades)) {
            await sequelize.query(
              'DELETE FROM persona_habilidades WHERE id_persona = :idPersona',
              { replacements: { idPersona }, type: QueryTypes.DELETE, transaction }
            );
            
            for (const habilidad of miembro.habilidades) {
              await sequelize.query(
                'INSERT INTO persona_habilidades (id_persona, id_habilidad, nivel) VALUES (:idPersona, :idHabilidad, :nivel)',
                { 
                  replacements: { 
                    idPersona, 
                    idHabilidad: habilidad.id,
                    nivel: habilidad.nivel || 'Básico'
                  }, 
                  type: QueryTypes.INSERT, 
                  transaction 
                }
              );
            }
          }

          // Actualizar destrezas
          if (miembro.destrezas && Array.isArray(miembro.destrezas)) {
            await sequelize.query(
              'DELETE FROM persona_destrezas WHERE id_persona = :idPersona',
              { replacements: { idPersona }, type: QueryTypes.DELETE, transaction }
            );
            
            for (const destreza of miembro.destrezas) {
              await sequelize.query(
                'INSERT INTO persona_destrezas (id_persona, id_destreza) VALUES (:idPersona, :idDestreza)',
                { 
                  replacements: { idPersona, idDestreza: destreza.id }, 
                  type: QueryTypes.INSERT, 
                  transaction 
                }
              );
            }
          }

          // Actualizar celebraciones
          if (miembro.profesionMotivoFechaCelebrar?.celebraciones && Array.isArray(miembro.profesionMotivoFechaCelebrar.celebraciones)) {
            await sequelize.query(
              'DELETE FROM persona_celebraciones WHERE id_persona = :idPersona',
              { replacements: { idPersona }, type: QueryTypes.DELETE, transaction }
            );
            
            for (const celebracion of miembro.profesionMotivoFechaCelebrar.celebraciones) {
              await sequelize.query(
                'INSERT INTO persona_celebraciones (id_persona, motivo_celebracion, dia, mes) VALUES (:idPersona, :motivo, :dia, :mes)',
                { 
                  replacements: { 
                    idPersona,
                    motivo: celebracion.motivo,
                    dia: celebracion.dia,
                    mes: celebracion.mes
                  }, 
                  type: QueryTypes.INSERT, 
                  transaction 
                }
              );
            }
          }

          // Actualizar enfermedades
          if (miembro.enfermedades && Array.isArray(miembro.enfermedades)) {
            await sequelize.query(
              'DELETE FROM persona_enfermedades WHERE id_persona = :idPersona',
              { replacements: { idPersona }, type: QueryTypes.DELETE, transaction }
            );
            
            for (const enfermedad of miembro.enfermedades) {
              await sequelize.query(
                'INSERT INTO persona_enfermedades (id_persona, id_enfermedad) VALUES (:idPersona, :idEnfermedad)',
                { 
                  replacements: { idPersona, idEnfermedad: enfermedad.id }, 
                  type: QueryTypes.INSERT, 
                  transaction 
                }
              );
            }
          }

          console.log(`  ✅ Persona actualizada: ${miembro.nombres} (ID: ${idPersona})`);
        }
        // Si no existe, no la creamos en PATCH (solo actualizamos)
      }
    }

    // 5. Actualizar difuntos (deceasedMembers) si vienen en el body
    if (bodyCompleto.deceasedMembers && Array.isArray(bodyCompleto.deceasedMembers)) {
      console.log(`⚰️  Actualizando ${bodyCompleto.deceasedMembers.length} difuntos...`);
      
      // Eliminar difuntos existentes y recrearlos (más simple que buscar por nombre)
      await sequelize.query(
        'DELETE FROM difuntos_familia WHERE id_familia_familias = :id',
        { replacements: { id }, type: QueryTypes.DELETE, transaction }
      );
      
      for (const difunto of bodyCompleto.deceasedMembers) {
        await sequelize.query(`
          INSERT INTO difuntos_familia 
          (id_familia_familias, nombre_completo, fecha_fallecimiento, id_sexo, id_parentesco, causa_fallecimiento)
          VALUES (:idFamilia, :nombre, :fechaFallecimiento, :idSexo, :idParentesco, :causa)
        `, {
          replacements: {
            idFamilia: id,
            nombre: difunto.nombres,
            fechaFallecimiento: difunto.fechaFallecimiento || null,
            idSexo: difunto.sexo?.id || null,
            idParentesco: difunto.parentesco?.id || null,
            causa: difunto.causaFallecimiento || null
          },
          type: QueryTypes.INSERT,
          transaction
        });
      }
      
      console.log('  ✅ Difuntos actualizados');
    }

    // Obtener los datos actualizados
    const familiaActualizada = await sequelize.query(
      `SELECT 
        id_familia, apellido_familiar, sector, direccion_familia,
        numero_contacto, telefono, email, "tamaño_familia",
        tipo_vivienda, estado_encuesta, tutor_responsable,
        "comunionEnCasa", fecha_ultima_encuesta, sustento_familia,
        observaciones_encuestador, autorizacion_datos
      FROM familias 
      WHERE id_familia = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        transaction
      }
    );

    await transaction.commit();
    console.log('✅ Encuesta actualizada exitosamente');

    // Construir metadata de lo que se actualizó
    const metadata = {
      campos_actualizados: Object.keys(camposValidos),
      timestamp: new Date().toISOString(),
      operacion: 'PATCH',
      registros_afectados: 1
    };

    if (bodyCompleto.familyMembers) {
      metadata.personas_actualizadas = bodyCompleto.familyMembers.length;
    }
    if (bodyCompleto.deceasedMembers) {
      metadata.difuntos_actualizados = bodyCompleto.deceasedMembers.length;
    }
    if (bodyCompleto.vivienda?.disposicion_basuras) {
      metadata.relaciones_actualizadas = metadata.relaciones_actualizadas || [];
      metadata.relaciones_actualizadas.push('disposicion_basuras');
    }
    if (bodyCompleto.servicios_agua?.sistema_acueducto) {
      metadata.relaciones_actualizadas = metadata.relaciones_actualizadas || [];
      metadata.relaciones_actualizadas.push('sistema_acueducto');
    }
    if (bodyCompleto.servicios_agua?.aguas_residuales) {
      metadata.relaciones_actualizadas = metadata.relaciones_actualizadas || [];
      metadata.relaciones_actualizadas.push('aguas_residuales');
    }

    return successResponse(res, {
      message: 'Encuesta actualizada exitosamente',
      data: familiaActualizada[0],
      metadata
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error actualizando encuesta:', error);
    return errorResponse(res, error);
  }
};

/**
 * PUT - Actualizar encuesta completa
 */
export const actualizarEncuestaCompleta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const datosCompletos = req.body;

    console.log(`🔄 Actualizando encuesta completa ID: ${id}`);

    // Actualizar todos los campos de la familia
    const updateQuery = `
      UPDATE familias SET
        apellido_familiar = $1, sector = $2, direccion_familia = $3,
        numero_contacto = $4, telefono = $5, email = $6,
        "tamaño_familia" = $7, tipo_vivienda = $8, estado_encuesta = $9,
        "comunionEnCasa" = $10, tutor_responsable = $11,
        fecha_ultima_encuesta = NOW()
      WHERE id_familia = $12
    `;

    await sequelize.query(updateQuery, {
      bind: [
        datosCompletos.apellido_familiar,
        datosCompletos.sector,
        datosCompletos.direccion_familia,
        datosCompletos.numero_contacto || null,
        datosCompletos.telefono || null,
        datosCompletos.email || null,
        datosCompletos.tamaño_familia !== undefined ? datosCompletos.tamaño_familia : 1,
        datosCompletos.tipo_vivienda || 'Casa',
        datosCompletos.estado_encuesta || 'pendiente',
        datosCompletos.comunionEnCasa || false,
        typeof datosCompletos.tutor_responsable === 'string' ? 
          datosCompletos.tutor_responsable.trim() !== '' && datosCompletos.tutor_responsable.toLowerCase() !== 'false' : 
          (datosCompletos.tutor_responsable || false),
        id
      ],
      type: QueryTypes.UPDATE,
      transaction
    });

    // Obtener los datos actualizados
    const familiaActualizada = await sequelize.query(
      `SELECT 
        id_familia, apellido_familiar, sector, direccion_familia,
        numero_contacto, telefono, email, "tamaño_familia",
        tipo_vivienda, estado_encuesta, tutor_responsable,
        "comunionEnCasa", fecha_ultima_encuesta
      FROM familias 
      WHERE id_familia = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        transaction
      }
    );

    await transaction.commit();
    console.log('✅ Encuesta completa actualizada exitosamente');

    return successResponse(res, {
      message: 'Encuesta actualizada completamente',
      data: familiaActualizada[0],
      metadata: {
        timestamp: new Date().toISOString(),
        operacion: 'PUT',
        registros_afectados: 1
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error actualizando encuesta completa:', error);
    return errorResponse(res, error);
  }
};

/**
 * Consultar familias con información completa preservando toda la estructura del request
 */
const consultarFamiliasConPadresMadres = async (req, res) => {
  try {
    console.log('🔍 Consulta de familias con información completa iniciada...');
    
    const filtros = {
      apellido_familiar: req.query.apellido_familiar || '',
      sector: req.query.sector || '',
      limite: parseInt(req.query.limite) || 50
    };

    // Instanciar el servicio
    const familiasService = new FamiliasConsultasService();
    
    // Ejecutar consulta completa
    const resultado = await familiasService.consultarFamiliasConPadresMadres(filtros);

    console.log(`✅ Consulta completada: ${resultado.total} familias encontradas`);

    return successResponse(res, {
      message: resultado.mensaje,
      data: resultado.datos,
      metadata: {
        total: resultado.total,
        filtros_aplicados: filtros,
        nota: 'Toda la información del request se preserva en el response'
      }
    });

  } catch (error) {
    console.error('❌ Error en consultarFamiliasConPadresMadres:', error);
    return errorResponse(res, error);
  }
};

export default {
  crearEncuesta,
  eliminarEncuesta,
  obtenerEncuestas,
  obtenerEncuestaPorId,
  actualizarCamposEncuesta,
  actualizarEncuestaCompleta,
  consultarFamiliasConPadresMadres
};
