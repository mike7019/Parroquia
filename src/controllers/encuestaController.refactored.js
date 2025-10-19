import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import EncuestaService from '../services/encuestaService.js';
import { logger, EncuestaLoggingMiddleware } from '../middlewares/loggingMiddleware.js';
import { generarIdentificacionUnica } from '../middlewares/encuestaValidation.js';

/**
 * Controlador refactorizado para encuestas
 * Mejoras: mejor manejo de errores, logging estructurado, consultas optimizadas
 */

/**
 * Obtener encuestas con paginación optimizada
 */
export const obtenerEncuestas = async (req, res) => {
  try {
    EncuestaLoggingMiddleware.logDatabaseOperation('OBTENER_ENCUESTAS', {
      query: req.query
    });

    const filtros = {
      sector: req.query.sector,
      municipio: req.query.municipio,
      apellido_familiar: req.query.apellido_familiar
    };

    const paginacion = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const resultado = await EncuestaService.obtenerEncuestasOptimizado(filtros, paginacion);

    logger.info('Encuestas obtenidas exitosamente', {
      total: resultado.pagination.total,
      page: resultado.pagination.page,
      filtros_aplicados: Object.keys(filtros).filter(k => filtros[k])
    });

    res.json({
      status: 'success',
      message: `Se encontraron ${resultado.pagination.total} encuestas`,
      data: resultado.data,
      pagination: resultado.pagination
    });

  } catch (error) {
    logger.error('Error obteniendo encuestas', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });

    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al obtener encuestas',
      error_code: 'GET_ENCUESTAS_ERROR'
    });
  }
};

/**
 * Obtener encuesta por ID optimizada
 */
export const obtenerEncuestaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    EncuestaLoggingMiddleware.logDatabaseOperation('OBTENER_ENCUESTA_POR_ID', { id });

    const encuesta = await EncuestaService.obtenerEncuestaPorIdOptimizado(id);

    if (!encuesta) {
      logger.warn('Encuesta no encontrada', { id });
      return res.status(404).json({
        status: 'error',
        message: 'Encuesta no encontrada',
        code: 'NOT_FOUND'
      });
    }

    logger.info('Encuesta obtenida exitosamente', {
      id,
      apellido_familiar: encuesta.apellido_familiar
    });

    res.json({
      status: 'success',
      message: 'Encuesta obtenida exitosamente',
      data: encuesta
    });

  } catch (error) {
    logger.error('Error obteniendo encuesta por ID', {
      error: error.message,
      stack: error.stack,
      id: req.params.id
    });

    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al obtener la encuesta',
      error_code: 'GET_ENCUESTA_BY_ID_ERROR'
    });
  }
};

/**
 * Crear encuesta con validaciones mejoradas
 */
export const crearEncuesta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      informacionGeneral,
      vivienda,
      servicios_agua,
      observaciones,
      familyMembers = [],
      deceasedMembers = [],
      metadata = {}
    } = req.body;

    logger.info('Iniciando creación de encuesta', {
      apellido_familiar: informacionGeneral?.apellido_familiar,
      total_miembros: familyMembers.length,
      total_difuntos: deceasedMembers.length
    });

    // Validar integridad de datos
    const erroresIntegridad = await EncuestaService.validarIntegridadDatos(req.body);
    if (erroresIntegridad.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Errores de integridad en los datos',
        errors: erroresIntegridad,
        code: 'INTEGRITY_ERROR'
      });
    }

    // Crear familia
    const familiaData = await crearRegistroFamilia(informacionGeneral, vivienda, servicios_agua, observaciones, transaction);
    
    logger.info('Familia creada', {
      familia_id: familiaData.id_familia,
      apellido: familiaData.apellido_familiar
    });

    // Procesar miembros
    const personasCreadas = await procesarMiembrosFamiliaOptimizado(
      familiaData.id_familia, 
      familyMembers, 
      informacionGeneral, 
      transaction
    );

    const personasFallecidas = await procesarMiembrosFallecidosOptimizado(
      familiaData.id_familia, 
      deceasedMembers, 
      informacionGeneral, 
      transaction
    );

    // Procesar servicios
    await procesarServiciosFamilia(familiaData.id_familia, vivienda, servicios_agua, transaction);

    await transaction.commit();

    logger.info('Encuesta creada exitosamente', {
      familia_id: familiaData.id_familia,
      personas_creadas: personasCreadas,
      personas_fallecidas: personasFallecidas,
      apellido_familiar: informacionGeneral.apellido_familiar
    });

    res.status(201).json({
      status: 'success',
      message: 'Encuesta guardada exitosamente',
      data: {
        familia_id: familiaData.id_familia,
        personas_creadas: personasCreadas,
        personas_fallecidas: personasFallecidas,
        apellido_familiar: informacionGeneral.apellido_familiar,
        fecha_creacion: new Date().toISOString()
      }
    });

  } catch (error) {
    await transaction.rollback();
    
    logger.error('Error creando encuesta', {
      error: error.message,
      stack: error.stack,
      apellido_familiar: req.body.informacionGeneral?.apellido_familiar
    });

    res.status(500).json({
      status: 'error',
      message: `Error al procesar la encuesta: ${error.message}`,
      error_code: 'CREATE_ENCUESTA_ERROR'
    });
  }
};

/**
 * Crear registro de familia optimizado
 */
const crearRegistroFamilia = async (informacionGeneral, vivienda, servicios_agua, observaciones, transaction) => {
  // 🐛 DEBUG: Verificar valor de corregimiento
  logger.info('🔍 DEBUG crearRegistroFamilia - informacionGeneral.corregimiento:', {
    corregimiento: informacionGeneral.corregimiento,
    corregimiento_id: informacionGeneral.corregimiento?.id,
    type: typeof informacionGeneral.corregimiento
  });

  const familiaData = {
    apellido_familiar: informacionGeneral.apellido_familiar,
    sector: informacionGeneral.sector?.nombre || informacionGeneral.sector,
    direccion_familia: informacionGeneral.direccion,
    numero_contacto: informacionGeneral.telefono,
    telefono: informacionGeneral.telefono,
    email: informacionGeneral.email || null,
    tamaño_familia: 0, // Se actualizará después
    estado_encuesta: 'completada',
    numero_encuestas: 1,
    fecha_ultima_encuesta: informacionGeneral.fecha || new Date(),
    fecha_encuesta: informacionGeneral.fecha || new Date(),
    
    // Información geográfica
    id_municipio: informacionGeneral.municipio?.id || null,
    id_vereda: informacionGeneral.vereda?.id || null,
    id_sector: informacionGeneral.sector?.id || null,
    id_parroquia: informacionGeneral.parroquia?.id || null,
    id_corregimiento: informacionGeneral.corregimiento?.id || null,
    
    // Información adicional
    numero_contrato_epm: informacionGeneral.numero_contrato_epm || null,
    comunionEnCasa: informacionGeneral.comunionEnCasa || false,
    
    // Observaciones
    sustento_familia: observaciones.sustento_familia || null,
    observaciones_encuestador: observaciones.observaciones_encuestador || null,
    autorizacion_datos: observaciones.autorizacion_datos || false,
    
    // Servicios de agua
    pozo_septico: servicios_agua.pozo_septico || false,
    letrina: servicios_agua.letrina || false,
    campo_abierto: servicios_agua.campo_abierto || false,
    
    // Tipo de vivienda
    id_tipo_vivienda: vivienda.tipo_vivienda?.id || null
  };

  // 🐛 DEBUG: Verificar familiaData antes del INSERT
  logger.info('🔍 DEBUG familiaData construido:', {
    id_municipio: familiaData.id_municipio,
    id_vereda: familiaData.id_vereda,
    id_sector: familiaData.id_sector,
    id_parroquia: familiaData.id_parroquia,
    id_corregimiento: familiaData.id_corregimiento,
    apellido_familiar: familiaData.apellido_familiar
  });

  const [familia] = await sequelize.query(`
    INSERT INTO familias (
      apellido_familiar, sector, direccion_familia, numero_contacto, telefono, email,
      tamaño_familia, estado_encuesta, numero_encuestas, fecha_ultima_encuesta, fecha_encuesta,
      id_municipio, id_vereda, id_sector, id_parroquia, id_corregimiento, numero_contrato_epm, comunionEnCasa,
      sustento_familia, observaciones_encuestador, autorizacion_datos,
      pozo_septico, letrina, campo_abierto, id_tipo_vivienda,
      created_at, updated_at
    ) VALUES (
      :apellido_familiar, :sector, :direccion_familia, :numero_contacto, :telefono, :email,
      :tamaño_familia, :estado_encuesta, :numero_encuestas, :fecha_ultima_encuesta, :fecha_encuesta,
      :id_municipio, :id_vereda, :id_sector, :id_parroquia, :id_corregimiento, :numero_contrato_epm, :comunionEnCasa,
      :sustento_familia, :observaciones_encuestador, :autorizacion_datos,
      :pozo_septico, :letrina, :campo_abierto, :id_tipo_vivienda,
      NOW(), NOW()
    ) RETURNING id_familia, apellido_familiar
  `, {
    replacements: familiaData,
    type: QueryTypes.INSERT,
    transaction
  });

  return familia;
};

/**
 * Procesar miembros de familia optimizado
 */
const procesarMiembrosFamiliaOptimizado = async (familiaId, familyMembers, informacionGeneral, transaction) => {
  if (familyMembers.length === 0) return 0;

  logger.info(`Procesando ${familyMembers.length} miembros de familia`, { familiaId });

  const personasData = [];
  
  for (const miembro of familyMembers) {
    const identificacionUnica = miembro.numeroIdentificacion || await generarIdentificacionUnica('TEMP');
    
    personasData.push({
      primer_nombre: extraerPrimerNombre(miembro.nombres),
      segundo_nombre: extraerSegundoNombre(miembro.nombres),
      primer_apellido: extraerPrimerApellido(miembro.nombres),
      segundo_apellido: extraerSegundoApellido(miembro.nombres),
      fecha_nacimiento: miembro.fechaNacimiento || '1900-01-01',
      telefono: miembro.telefono || informacionGeneral.telefono,
      correo_electronico: generarEmailTemporal(miembro.nombres),
      identificacion: identificacionUnica,
      direccion: informacionGeneral.direccion,
      id_familia_familias: familiaId,
      id_sexo: mapearSexo(miembro.sexo),
      id_tipo_identificacion_tipo_identificacion: mapearTipoIdentificacion(miembro.tipoIdentificacion),
      id_estado_civil_estado_civil: mapearEstadoCivil(miembro.situacionCivil),
      estudios: extraerEstudios(miembro.estudio),
      talla_camisa: miembro['talla_camisa/blusa'] || miembro.talla?.camisa,
      talla_pantalon: miembro.talla_pantalon || miembro.talla?.pantalon,
      talla_zapato: miembro.talla_zapato || miembro.talla?.calzado,
      motivo_celebrar: miembro.motivoFechaCelebrar?.motivo,
      dia_celebrar: miembro.motivoFechaCelebrar?.dia ? parseInt(miembro.motivoFechaCelebrar.dia) : null,
      mes_celebrar: miembro.motivoFechaCelebrar?.mes ? parseInt(miembro.motivoFechaCelebrar.mes) : null
    });
  }

  // Inserción batch optimizada
  const placeholders = personasData.map((_, index) => 
    `($${index * 20 + 1}, $${index * 20 + 2}, $${index * 20 + 3}, $${index * 20 + 4}, $${index * 20 + 5}, 
     $${index * 20 + 6}, $${index * 20 + 7}, $${index * 20 + 8}, $${index * 20 + 9}, $${index * 20 + 10},
     $${index * 20 + 11}, $${index * 20 + 12}, $${index * 20 + 13}, $${index * 20 + 14}, $${index * 20 + 15},
     $${index * 20 + 16}, $${index * 20 + 17}, $${index * 20 + 18}, $${index * 20 + 19}, $${index * 20 + 20}, NOW(), NOW())`
  ).join(', ');

  const values = personasData.flatMap(persona => [
    persona.primer_nombre, persona.segundo_nombre, persona.primer_apellido, persona.segundo_apellido,
    persona.fecha_nacimiento, persona.telefono, persona.correo_electronico, persona.identificacion,
    persona.direccion, persona.id_familia_familias, persona.id_sexo, 
    persona.id_tipo_identificacion_tipo_identificacion, persona.id_estado_civil_estado_civil,
    persona.estudios, persona.talla_camisa, persona.talla_pantalon, persona.talla_zapato,
    persona.motivo_celebrar, persona.dia_celebrar, persona.mes_celebrar
  ]);

  await sequelize.query(`
    INSERT INTO personas (
      primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento,
      telefono, correo_electronico, identificacion, direccion, id_familia_familias,
      id_sexo, id_tipo_identificacion_tipo_identificacion, id_estado_civil_estado_civil,
      estudios, talla_camisa, talla_pantalon, talla_zapato, motivo_celebrar, 
      dia_celebrar, mes_celebrar,
      created_at, updated_at
    ) VALUES ${placeholders}
  `, {
    bind: values,
    transaction
  });

  return personasData.length;
};

/**
 * Funciones auxiliares optimizadas
 */
const extraerPrimerNombre = (nombresCompletos) => {
  return nombresCompletos.trim().split(' ')[0] || '';
};

const extraerSegundoNombre = (nombresCompletos) => {
  const partes = nombresCompletos.trim().split(' ');
  return partes.length > 1 ? partes[1] : null;
};

const extraerPrimerApellido = (nombresCompletos) => {
  const partes = nombresCompletos.trim().split(' ');
  return partes.length > 2 ? partes[2] : (partes.length === 2 ? partes[1] : null);
};

const extraerSegundoApellido = (nombresCompletos) => {
  const partes = nombresCompletos.trim().split(' ');
  return partes.length > 3 ? partes[3] : null;
};

const generarEmailTemporal = (nombres) => {
  const nombreLimpio = nombres.toLowerCase().replace(/\s+/g, '.');
  return `${nombreLimpio}.${Date.now()}@temp.com`;
};

const extraerEstudios = (estudio) => {
  if (typeof estudio === 'object' && estudio?.nombre) {
    return estudio.nombre;
  }
  return estudio || null;
};

const mapearSexo = (sexo) => {
  if (!sexo) return null;
  if (typeof sexo === 'object' && sexo.id) return parseInt(sexo.id);
  
  const sexoMapping = {
    'Hombre': 1, 'Mujer': 2, 'Masculino': 1, 'Femenino': 2,
    'M': 1, 'F': 2, 'O': 3, 'Otro': 3
  };
  return sexoMapping[sexo] || null;
};

const mapearTipoIdentificacion = (tipoId) => {
  if (!tipoId) return null;
  if (typeof tipoId === 'object' && tipoId.id) return parseInt(tipoId.id);
  
  const tipoIdMapping = { 'CC': 1, 'TI': 2, 'RC': 3, 'CE': 4, 'PP': 5 };
  return tipoIdMapping[tipoId] || null;
};

const mapearEstadoCivil = (estadoCivil) => {
  if (!estadoCivil) return null;
  if (typeof estadoCivil === 'object' && estadoCivil.id) return parseInt(estadoCivil.id);
  
  const estadoCivilMapping = {
    'Soltero': 1, 'Soltera': 1, 'Soltero(a)': 1,
    'Casado Civil': 2, 'Casado': 2, 'Casada': 2, 'Casado(a)': 2,
    'Viudo': 4, 'Viuda': 4, 'Viudo(a)': 4,
    'Divorciado': 3, 'Divorciada': 3, 'Divorciado(a)': 3,
    'Unión Libre': 5, 'Union Libre': 5
  };
  return estadoCivilMapping[estadoCivil] || null;
};

// Exportar funciones adicionales que se necesiten
export { crearRegistroFamilia, procesarMiembrosFamiliaOptimizado };