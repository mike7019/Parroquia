import sequelize from '../../config/sequelize.js';
import { Familias, Municipios, Parroquia, Sector, Veredas, Sexo, TipoIdentificacion, Persona } from '../models/index.js';
import crypto from 'crypto';

/**
 * Generar identificación única para personas
 */
const generarIdentificacionUnica = async (tipo = 'TEMP', contadorIntento = 0) => {
  try {
    // Generar UUID corto para mayor unicidad
    const uuid = crypto.randomUUID().slice(0, 8);
    const timestamp = Date.now();
    const identificacion = `${tipo}_${timestamp}_${uuid}_${contadorIntento}`;
    
    // Verificar que no exista en la base de datos
    const existe = await Persona.findOne({
      where: { identificacion }
    });
    
    if (existe && contadorIntento < 10) {
      // Si existe, intentar con un contador diferente
      return await generarIdentificacionUnica(tipo, contadorIntento + 1);
    }
    
    if (contadorIntento >= 10) {
      throw new Error('No se pudo generar identificación única después de 10 intentos');
    }
    
    return identificacion;
  } catch (error) {
    console.error('Error generando identificación única:', error);
    // Fallback con timestamp más específico
    return `${tipo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

/**
 * Verificar si una familia ya existe para evitar duplicados
 */
const verificarFamiliaExistente = async (apellidoFamiliar, telefono, direccion) => {
  try {
    const familiaExistente = await Familias.findOne({
      where: {
        apellido_familiar: apellidoFamiliar,
        telefono: telefono,
        direccion_familia: direccion
      }
    });
    
    return familiaExistente;
  } catch (error) {
    console.error('Error verificando familia existente:', error);
    return null;
  }
};

/**
 * Obtener todas las encuestas con paginación
 */
export const obtenerEncuestas = async (req, res) => {
  try {
    console.log('📋 Obteniendo lista de encuestas...');
    
    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Parámetros de filtros opcionales
    const { sector, municipio, apellido_familiar } = req.query;

    // Construir condiciones WHERE
    let whereConditions = {};
    if (sector) whereConditions.sector = { [sequelize.Op.iLike]: `%${sector}%` };
    if (apellido_familiar) whereConditions.apellido_familiar = { [sequelize.Op.iLike]: `%${apellido_familiar}%` };

    // Obtener encuestas con información básica
    const { count, rows: encuestas } = await Familias.findAndCountAll({
      where: whereConditions,
      order: [['fecha_ultima_encuesta', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    // Para cada familia, obtener información adicional manualmente
    const encuestasFormateadas = await Promise.all(
      encuestas.map(async (familia) => {
        const familiaData = familia.toJSON();
        
        // Obtener personas de la familia usando el modelo importado
        const personas = await Persona.findAll({
          where: { id_familia_familias: familiaData.id_familia }
        });

        // Obtener información de ubicación (municipio, vereda, sector)
        let municipioInfo = null;
        let veredaInfo = null;
        let sectorInfo = null;

        if (familiaData.id_municipio) {
          const Municipios = sequelize.models.Municipios;
          const municipio = await Municipios.findByPk(familiaData.id_municipio);
          if (municipio) {
            municipioInfo = {
              id: municipio.id_municipio,
              nombre: municipio.nombre_municipio
            };
          }
        }

        if (familiaData.id_vereda) {
          const Veredas = sequelize.models.Veredas;
          const vereda = await Veredas.findByPk(familiaData.id_vereda);
          if (vereda) {
            veredaInfo = {
              id: vereda.id_vereda,
              nombre: vereda.nombre_vereda
            };
          }
        }

        if (familiaData.id_sector) {
          const Sectores = sequelize.models.Sector;
          const sector = await Sectores.findByPk(familiaData.id_sector);
          if (sector) {
            sectorInfo = {
              id: sector.id_sector,
              nombre: sector.nombre_sector
            };
          }
        }

        return {
          // Información básica de la familia
          id_familia: familiaData.id_familia,
          apellido_familiar: familiaData.apellido_familiar,
          sector: familiaData.sector,
          direccion_familia: familiaData.direccion_familia,
          telefono: familiaData.telefono,
          email: familiaData.email,
          
          // Información de la encuesta
          estado_encuesta: familiaData.estado_encuesta,
          fecha_ultima_encuesta: familiaData.fecha_ultima_encuesta,
          numero_encuestas: familiaData.numero_encuestas,
          codigo_familia: familiaData.codigo_familia,
          
          // Información de vivienda
          tipo_vivienda: familiaData.tipo_vivienda,
          tamaño_familia: familiaData.tamaño_familia,
          
          // Información geográfica completa
          ubicacion: {
            municipio: municipioInfo,
            vereda: veredaInfo,
            sector: sectorInfo || { nombre: familiaData.sector }
          },
          
          // Información de personas
          miembros_familia: {
            total_miembros: personas.length,
            personas: personas.map(persona => ({
              id: persona.id_personas,
              nombre_completo: `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim(),
              primer_nombre: persona.primer_nombre,
              segundo_nombre: persona.segundo_nombre,
              apellidos: `${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim(),
              fecha_nacimiento: persona.fecha_nacimiento,
              telefono: persona.telefono,
              estudios: persona.estudios,
              tallas: {
                camisa: persona.talla_camisa,
                pantalon: persona.talla_pantalon,
                zapato: persona.talla_zapato
              }
            }))
          },
          
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
    const totalPages = Math.ceil(count / limit);
    
    console.log(`✅ Se encontraron ${count} encuestas con información completa`);

    res.status(200).json({
      status: 'success',
      message: `Se encontraron ${count} encuestas`,
      data: encuestasFormateadas,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo encuestas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al obtener encuestas',
      error: error.message
    });
  }
};

/**
 * Obtener una encuesta específica por ID
 */
export const obtenerEncuestaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando encuesta con ID: ${id}`);

    // Buscar la familia
    const encuesta = await Familias.findByPk(id);

    if (!encuesta) {
      console.log(`❌ Encuesta con ID ${id} no encontrada`);
      return res.status(404).json({
        status: 'error',
        message: 'Encuesta no encontrada',
        code: 'NOT_FOUND'
      });
    }

    console.log(`✅ Encuesta encontrada: ${encuesta.apellido_familiar}`);

    const familiaData = encuesta.toJSON();

    // Obtener personas de la familia usando el modelo importado
    const personas = await Persona.findAll({
      where: { id_familia_familias: familiaData.id_familia }
    });

    // Obtener información adicional de vivienda y servicios
    let disposicionBasuras = [];
    let sistemasAcueducto = [];
    let parroquiaInfo = null;

    // Obtener disposición de basuras
    try {
      const disposiciones = await sequelize.query(
        'SELECT fdb.id_familia, tdb.id_tipo_disposicion_basura, tdb.nombre, tdb.descripcion FROM familia_disposicion_basura fdb JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura WHERE fdb.id_familia = $1',
        {
          bind: [familiaData.id_familia],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      disposicionBasuras = disposiciones.map(d => ({
        id: d.id_tipo_disposicion_basura,
        nombre: d.nombre,
        descripcion: d.descripcion
      }));
    } catch (error) {
      console.log(`  ⚠️ Error obteniendo disposición de basuras: ${error.message}`);
      disposicionBasuras = [];
    }

    // Obtener sistemas de acueducto
    try {
      const sistemas = await sequelize.query(
        'SELECT fsa.id_familia, sa.id_sistema_acueducto, sa.nombre, sa.descripcion FROM familia_sistema_acueducto fsa JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto WHERE fsa.id_familia = $1',
        {
          bind: [familiaData.id_familia],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      sistemasAcueducto = sistemas.map(s => ({
        id: s.id_sistema_acueducto,
        nombre: s.nombre,
        descripcion: s.descripcion
      }));
    } catch (error) {
      console.log(`  ⚠️ Error obteniendo sistemas de acueducto: ${error.message}`);
      sistemasAcueducto = [];
    }

    // Obtener información de parroquia si existe
    if (familiaData.id_parroquia) {
      const Parroquia = sequelize.models.Parroquia;
      const parroquia = await Parroquia.findByPk(familiaData.id_parroquia);
      if (parroquia) {
        parroquiaInfo = {
          id: parroquia.id_parroquia,
          nombre: parroquia.nombre_parroquia
        };
      }
    }

    // Obtener información de ubicación
    let municipioInfo = null;
    let veredaInfo = null;
    let sectorInfo = null;

    if (familiaData.id_municipio) {
      const Municipios = sequelize.models.Municipios;
      const municipio = await Municipios.findByPk(familiaData.id_municipio);
      if (municipio) {
        municipioInfo = {
          id: municipio.id_municipio,
          nombre: municipio.nombre_municipio
        };
      }
    }

    if (familiaData.id_vereda) {
      const Veredas = sequelize.models.Veredas;
      const vereda = await Veredas.findByPk(familiaData.id_vereda);
      if (vereda) {
        veredaInfo = {
          id: vereda.id_vereda,
          nombre: vereda.nombre_vereda
        };
      }
    }

    if (familiaData.id_sector) {
      const Sectores = sequelize.models.Sector;
      const sector = await Sectores.findByPk(familiaData.id_sector);
      if (sector) {
        sectorInfo = {
          id: sector.id_sector,
          nombre: sector.nombre_sector
        };
      }
    }

    // Para cada persona, obtener información adicional y detallada
    const personasDetalladas = await Promise.all(
      personas.map(async (persona) => {
        let sexoInfo = null;
        let tipoIdInfo = null;
        let estadoCivilInfo = null;
        let parroquiaPersonaInfo = null;

        // Obtener información de sexo
        if (persona.id_sexo) {
          const Sexo = sequelize.models.Sexo;
          const sexo = await Sexo.findByPk(persona.id_sexo);
          if (sexo) {
            sexoInfo = {
              id: sexo.id_sexo,
              descripcion: sexo.descripcion_sexo
            };
          }
        }

        // Obtener información de tipo de identificación
        if (persona.id_tipo_identificacion_tipo_identificacion) {
          const TipoIdentificacion = sequelize.models.TipoIdentificacion;
          const tipoId = await TipoIdentificacion.findByPk(persona.id_tipo_identificacion_tipo_identificacion);
          if (tipoId) {
            tipoIdInfo = {
              id: tipoId.id_tipo_identificacion,
              descripcion: tipoId.descripcion_tipo_identificacion
            };
          }
        }

        // Obtener información de estado civil
        if (persona.id_estado_civil_estado_civil) {
          const EstadoCivil = sequelize.models.EstadoCivil;
          const estadoCivil = await EstadoCivil.findByPk(persona.id_estado_civil_estado_civil);
          if (estadoCivil) {
            estadoCivilInfo = {
              id: estadoCivil.id_estado_civil,
              descripcion: estadoCivil.descripcion_estado_civil
            };
          }
        }

        // Obtener información de parroquia de la persona
        if (persona.id_parroquia) {
          const Parroquia = sequelize.models.Parroquia;
          const parroquia = await Parroquia.findByPk(persona.id_parroquia);
          if (parroquia) {
            parroquiaPersonaInfo = {
              id: parroquia.id_parroquia,
              nombre: parroquia.nombre_parroquia
            };
          }
        }

        return {
          id: persona.id_personas,
          informacion_personal: {
            primer_nombre: persona.primer_nombre,
            segundo_nombre: persona.segundo_nombre,
            primer_apellido: persona.primer_apellido,
            segundo_apellido: persona.segundo_apellido,
            nombre_completo: `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim()
          },
          identificacion: {
            numero: persona.identificacion,
            tipo: tipoIdInfo
          },
          demografia: {
            fecha_nacimiento: persona.fecha_nacimiento,
            sexo: sexoInfo
          },
          estado_civil: estadoCivilInfo,
          contacto: {
            telefono: persona.telefono,
            correo_electronico: persona.correo_electronico,
            direccion: persona.direccion
          },
          educacion_y_liderazgo: {
            estudios: persona.estudios,
            liderazgo: persona.en_que_eres_lider
          },
          salud: {
            necesidades_medicas: persona.necesidad_enfermo
          },
          tallas: {
            camisa: persona.talla_camisa,
            pantalon: persona.talla_pantalon,
            zapato: persona.talla_zapato
          },
          parroquia: parroquiaPersonaInfo,
          es_fallecido: persona.identificacion?.startsWith('FALLECIDO'),
          // Información adicional para fallecidos
          informacion_fallecido: persona.identificacion?.startsWith('FALLECIDO') ? (() => {
            try {
              const fallecidoData = JSON.parse(persona.estudios || '{}');
              return {
                fecha_aniversario: fallecidoData.fecha_aniversario || null,
                era_padre: fallecidoData.era_padre || false,
                era_madre: fallecidoData.era_madre || false
              };
            } catch (error) {
              return {
                fecha_aniversario: null,
                era_padre: sexoInfo?.descripcion === 'Masculino',
                era_madre: sexoInfo?.descripcion === 'Femenino'
              };
            }
          })() : null,
          metadata_persona: {
            fecha_registro: persona.createdAt,
            ultima_actualizacion: persona.updatedAt
          }
        };
      })
    );
    
    // Construir respuesta completa y estructurada con toda la información
    const encuestaCompleta = {
      // Información básica de la familia
      informacion_general: {
        id_familia: familiaData.id_familia,
        apellido_familiar: familiaData.apellido_familiar,
        direccion_familia: familiaData.direccion_familia,
        telefono: familiaData.telefono,
        email: familiaData.email,
        codigo_familia: familiaData.codigo_familia,
        tutor_responsable: familiaData.tutor_responsable,
        numero_contrato_epm: null // Campo que se podría agregar luego
      },
      
      // Información de la encuesta
      estado_encuesta: {
        estado: familiaData.estado_encuesta,
        fecha_ultima_encuesta: familiaData.fecha_ultima_encuesta,
        numero_encuestas: familiaData.numero_encuestas
      },
      
      // Información completa de vivienda
      informacion_vivienda: {
        tipo_vivienda: {
          nombre: familiaData.tipo_vivienda
        },
        tamaño_familia: familiaData.tamaño_familia,
        sector: familiaData.sector,
        disposicion_basuras: {
          recolector: disposicionBasuras.some(d => d.nombre === 'Recolección Pública'),
          quemada: disposicionBasuras.some(d => d.nombre === 'Quema'),
          enterrada: disposicionBasuras.some(d => d.nombre === 'Entierro'),
          recicla: disposicionBasuras.some(d => d.nombre === 'Reciclaje'),
          aire_libre: disposicionBasuras.some(d => d.nombre === 'Botadero'),
          no_aplica: disposicionBasuras.some(d => d.nombre === 'Otro'),
          tipos_registrados: disposicionBasuras
        }
      },
      
      // Información completa de servicios de agua
      servicios_agua: {
        sistema_acueducto: sistemasAcueducto.length > 0 ? {
          id: sistemasAcueducto[0].id,
          nombre: sistemasAcueducto[0].nombre,
          descripcion: sistemasAcueducto[0].descripcion
        } : null,
        aguas_residuales: null, // Se puede expandir luego
        pozo_septico: false,    // Se puede expandir luego
        letrina: false,         // Se puede expandir luego
        campo_abierto: false,   // Se puede expandir luego
        sistemas_registrados: sistemasAcueducto
      },
      
      // Información geográfica completa
      ubicacion: {
        municipio: municipioInfo,
        vereda: veredaInfo,
        sector: sectorInfo || { nombre: familiaData.sector },
        parroquia: parroquiaInfo
      },
      
      // Información detallada de personas con separación de vivos y fallecidos
      miembros_familia: {
        total_miembros: personas.length,
        personas: personasDetalladas.filter(p => !p.es_fallecido),
        personas_fallecidas: personasDetalladas.filter(p => p.es_fallecido).map(p => ({
          ...p,
          fecha_aniversario: p.informacion_fallecido?.fecha_aniversario || null,
          era_padre: p.informacion_fallecido?.era_padre || false,
          era_madre: p.informacion_fallecido?.era_madre || false,
          tipo_fallecimiento: 'natural', // Campo adicional
          años_desde_fallecimiento: p.informacion_fallecido?.fecha_aniversario ? 
            new Date().getFullYear() - new Date(p.informacion_fallecido.fecha_aniversario).getFullYear() : null,
          // Limpiar campos que no aplican para fallecidos
          educacion_y_liderazgo: {
            estudios: 'N/A - Persona fallecida',
            liderazgo: null
          },
          contacto: {
            telefono: 'N/A',
            correo_electronico: 'N/A',
            direccion: p.contacto.direccion // Mantener dirección familiar
          }
        }))
      },
      
      // Observaciones (campos que se pueden expandir luego)
      observaciones: {
        sustento_familia: null,           // Campo que se podría agregar a la tabla familias
        observaciones_encuestador: null, // Campo que se podría agregar a la tabla familias
        autorizacion_datos: null         // Campo que se podría agregar a la tabla familias
      },
      
      // Metadatos de la encuesta
      metadatos: {
        fecha_creacion: familiaData.fecha_ultima_encuesta,
        estado: familiaData.estado_encuesta,
        version: '2.0',
        ultima_actualizacion: new Date().toISOString(),
        campos_disponibles: {
          informacion_general: true,
          vivienda: true,
          servicios_agua: true,
          ubicacion_geografica: true,
          miembros_detallados: true,
          disposicion_basuras: disposicionBasuras.length > 0,
          sistemas_acueducto: sistemasAcueducto.length > 0
        }
      }
    };

    res.status(200).json({
      status: 'success',
      message: 'Encuesta obtenida exitosamente',
      data: encuestaCompleta
    });

  } catch (error) {
    console.error('❌ Error obteniendo encuesta por ID:', error);
    res.status(500).json({
      status: 'error',
      message: `Error interno del servidor al obtener encuesta: ${error.message}`,
      code: 'INTERNAL_SERVER_ERROR'
    });
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
 *                   aguas_residuales: { type: string, nullable: true }
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
  const transaction = await sequelize.transaction();
  
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

    // Validaciones básicas
    if (!informacionGeneral || !vivienda || !servicios_agua || !observaciones) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Faltan secciones obligatorias en la encuesta',
        errors: ['informacionGeneral, vivienda, servicios_agua y observaciones son requeridos']
      });
    }

    console.log('✅ Validaciones básicas completadas');

    // VERIFICAR SI LA FAMILIA YA EXISTE
    console.log('🔍 Verificando familia existente...');
    const familiaExistente = await verificarFamiliaExistente(
      informacionGeneral.apellido_familiar,
      informacionGeneral.telefono,
      informacionGeneral.direccion
    );

    if (familiaExistente) {
      await transaction.rollback();
      console.log(`⚠️ Familia duplicada detectada: ${familiaExistente.apellido_familiar}`);
      return res.status(409).json({
        status: 'error',
        message: 'Esta familia ya está registrada en el sistema',
        code: 'DUPLICATE_FAMILY',
        data: {
          familia_existente: {
            id: familiaExistente.id_familia,
            apellido: familiaExistente.apellido_familiar,
            telefono: familiaExistente.telefono,
            direccion: familiaExistente.direccion_familia,
            fecha_registro: familiaExistente.fecha_ultima_encuesta
          }
        }
      });
    }

    // 1. CREAR FAMILIA
    console.log('💾 Creando registro de familia...');
    
    const familiaData = {
      apellido_familiar: informacionGeneral.apellido_familiar,
      sector: informacionGeneral.sector?.nombre || 'TEMP_SECTOR',
      direccion_familia: informacionGeneral.direccion,
      telefono: informacionGeneral.telefono,
      email: informacionGeneral.email || null,
      tamaño_familia: (familyMembers.length || 0) + (deceasedMembers.length || 0),
      tipo_vivienda: vivienda.tipo_vivienda?.nombre || 'Casa',
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: new Date().toISOString().split('T')[0],
      codigo_familia: `FAM_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      tutor_responsable: null, // Se puede definir luego
      id_municipio: informacionGeneral.municipio?.id ? parseInt(informacionGeneral.municipio.id) : null,
      id_vereda: informacionGeneral.vereda?.id ? parseInt(informacionGeneral.vereda.id) : null,
      id_sector: informacionGeneral.sector?.id ? parseInt(informacionGeneral.sector.id) : null
    };

    const familia = await Familias.create(familiaData, { transaction });
    console.log(`✅ Familia creada con ID: ${familia.id_familia}`);

    // 2. REGISTRAR DISPOSICIÓN DE BASURAS (simplificado)
    console.log('🗑️ Registrando disposición de basuras...');
    if (vivienda.disposicion_basuras) {
      const basuras = vivienda.disposicion_basuras;
      
      // Mapear tipos de disposición de basura a IDs
      const disposicionMapping = {
        recolector: 1,    // "Recolección Pública"
        quemada: 2,       // "Quema"
        enterrada: 3,     // "Entierro"
        recicla: 4,       // "Reciclaje"
        aire_libre: 6,    // "Botadero"
        no_aplica: 7      // "Otro"
      };

      // Crear registros para cada tipo de disposición que sea true
      for (const [tipo, activo] of Object.entries(basuras)) {
        if (activo && disposicionMapping[tipo]) {
          try {
            await sequelize.query(
              'INSERT INTO familia_disposicion_basura (id_familia, id_tipo_disposicion_basura, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
              {
                bind: [familia.id_familia, disposicionMapping[tipo]],
                transaction
              }
            );
            console.log(`  ✅ Disposición registrada: ${tipo}`);
          } catch (error) {
            console.log(`  ⚠️ Error registrando ${tipo}: ${error.message}`);
          }
        }
      }
    }

    // 3. REGISTRAR SISTEMA DE ACUEDUCTO (simplificado)
    console.log('💧 Registrando sistema de acueducto...');
    if (servicios_agua.sistema_acueducto) {
      try {
        // Mapear sistema de acueducto por ID o usar default
        let sistemaId = servicios_agua.sistema_acueducto.id || 1; // Default: Acueducto Público

        await sequelize.query(
          'INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
          {
            bind: [familia.id_familia, sistemaId],
            transaction
          }
        );
        console.log(`  ✅ Sistema acueducto registrado: ID ${sistemaId}`);
      } catch (error) {
        console.log(`  ⚠️ Error registrando sistema acueducto: ${error.message}`);
      }
    }

    // 4. REGISTRAR INFORMACIÓN DE TIPO DE VIVIENDA
    console.log('🏠 Registrando tipo de vivienda...');
    if (vivienda.tipo_vivienda) {
      const FamiliaTipoVivienda = sequelize.models.FamiliaTipoVivienda;
      
      // Buscar el tipo de vivienda por ID o nombre
      let tipoViviendaId = vivienda.tipo_vivienda.id;
      if (!tipoViviendaId) {
        const TipoVivienda = sequelize.models.TiposVivienda;
        const tipo = await TipoVivienda.findOne({
          where: { nombre: { [sequelize.Op.iLike]: `%${vivienda.tipo_vivienda.nombre}%` } }
        });
        tipoViviendaId = tipo?.id_tipo_vivienda || 1; // Default: Casa
      }

      // Crear registro sin campo 'id' (usa composite key)
      await sequelize.query(
        'INSERT INTO familia_tipo_vivienda (id_familia, id_tipo_vivienda, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        {
          bind: [familia.id_familia, tipoViviendaId],
          transaction
        }
      );
      console.log(`  ✅ Tipo vivienda registrado: ID ${tipoViviendaId}`);
    }

    // 5. PROCESAR MIEMBROS VIVOS DE LA FAMILIA
    let personasCreadas = 0;
    if (familyMembers.length > 0) {
      console.log(`👥 Procesando ${familyMembers.length} miembros de la familia...`);
      
      for (const miembro of familyMembers) {
        try {
          // Dividir nombres
          const nombres = miembro.nombres.trim().split(' ');
          const primerNombre = nombres[0] || '';
          const segundoNombre = nombres.slice(1).join(' ') || null;

          // Mapear sexo
          let sexoId = null;
          if (miembro.sexo) {
            const sexoMapping = {
              'Hombre': 1,        // Masculino
              'Mujer': 2,         // Femenino  
              'Masculino': 1,
              'Femenino': 2,
              'M': 1,
              'F': 2,
              'O': 3,
              'Otro': 3
            };
            sexoId = sexoMapping[miembro.sexo] || null;
          }

          // Mapear tipo de identificación
          let tipoIdentificacionId = null;
          if (miembro.tipoIdentificacion) {
            const tipoIdMapping = {
              'CC': 1,
              'TI': 2,
              'RC': 3,
              'CE': 4,
              'PP': 5
            };
            tipoIdentificacionId = tipoIdMapping[miembro.tipoIdentificacion] || null;
          }

          // Mapear estado civil
          let estadoCivilId = null;
          if (miembro.situacionCivil) {
            const estadoCivilMapping = {
              'Soltero': 1,
              'Soltera': 1,
              'Soltero(a)': 1,
              'Casado': 2,
              'Casada': 2,
              'Casado(a)': 2,
              'Viudo': 4,
              'Viuda': 4,
              'Viudo(a)': 4,
              'Divorciado': 3,
              'Divorciada': 3,
              'Divorciado(a)': 3,
              'Unión Libre': 5,
              'Union Libre': 5
            };
            estadoCivilId = estadoCivilMapping[miembro.situacionCivil] || null;
          }

          // Extraer fecha de nacimiento
          const fechaNacimiento = miembro.fechaNacimiento || miembro.fecha_nacimiento;
          if (!fechaNacimiento) {
            console.log(`  ⚠️ Advertencia: ${primerNombre} no tiene fecha de nacimiento, usando fecha por defecto`);
          }

          // Generar identificación única
          const identificacionUnica = await generarIdentificacionUnica('TEMP');
          
          const personaData = {
            primer_nombre: primerNombre,
            segundo_nombre: segundoNombre,
            primer_apellido: informacionGeneral.apellido_familiar,
            segundo_apellido: null,
            fecha_nacimiento: fechaNacimiento ? new Date(fechaNacimiento) : new Date('1900-01-01'),
            telefono: miembro.telefono || informacionGeneral.telefono,
            correo_electronico: `${primerNombre.toLowerCase()}.${Date.now()}.${personasCreadas}@temp.com`,
            identificacion: identificacionUnica,
            direccion: informacionGeneral.direccion,
            id_familia_familias: familia.id_familia,
            id_familia: familia.id_familia, // Columna duplicada en la tabla
            id_sexo: sexoId,
            id_tipo_identificacion_tipo_identificacion: tipoIdentificacionId,
            id_estado_civil_estado_civil: estadoCivilId,
            estudios: miembro.estudio || null,
            en_que_eres_lider: null, // Se puede expandir luego
            necesidad_enfermo: null, // Se puede expandir luego
            talla_camisa: miembro.talla?.camisa || null,
            talla_pantalon: miembro.talla?.pantalon || null,
            talla_zapato: miembro.talla?.calzado || null,
            id_parroquia: null // Evitar error de clave foránea, usar null por defecto
          };

          // Crear persona usando el modelo importado con timestamps correctos
          console.log(`  🔧 Intentando crear persona: ${primerNombre} (ID: ${identificacionUnica})`);
          
          await Persona.create(personaData, { transaction });
          personasCreadas++;
          console.log(`  ✅ Persona creada exitosamente: ${primerNombre}`);
          
        } catch (error) {
          console.error(`  ❌ Error detallado creando persona ${miembro.nombres}:`);
          console.error(`     - Mensaje: ${error.message}`);
          console.error(`     - Nombre del error: ${error.name}`);
          // Continuar con el siguiente miembro en lugar de fallar toda la transacción
        }
      }
    }

    // 6. PROCESAR MIEMBROS FALLECIDOS
    let personasFallecidas = 0;
    if (deceasedMembers.length > 0) {
      console.log(`⚰️ Procesando ${deceasedMembers.length} miembros fallecidos...`);
      
      for (const fallecido of deceasedMembers) {
        try {
          const nombres = fallecido.nombres.trim().split(' ');
          const primerNombre = nombres[0] || '';
          const segundoNombre = nombres.slice(1).join(' ') || null;

          // Generar identificación única para fallecidos
          const identificacionUnica = await generarIdentificacionUnica('FALLECIDO');

          const personaFallecidaData = {
            primer_nombre: primerNombre,
            segundo_nombre: segundoNombre,
            primer_apellido: informacionGeneral.apellido_familiar,
            segundo_apellido: null,
            fecha_nacimiento: '1900-01-01', // Fecha placeholder para fallecidos
            telefono: 'N/A',
            correo_electronico: `fallecido.${Date.now()}.${personasFallecidas}@temp.com`,
            identificacion: identificacionUnica,
            direccion: informacionGeneral.direccion,
            id_familia_familias: familia.id_familia,
            id_familia: familia.id_familia,
            id_parroquia: null, // Evitar error de clave foránea, usar null por defecto
            // Campos adicionales para fallecidos en el campo 'estudios' como JSON temporal
            estudios: JSON.stringify({
              es_fallecido: true,
              fecha_aniversario: fallecido.fechaAniversario || null,
              era_padre: fallecido.eraPadre || false,
              era_madre: fallecido.eraMadre || false
            })
          };

          console.log(`  🔧 Creando persona fallecida: ${primerNombre} (ID: ${identificacionUnica})`);
          await Persona.create(personaFallecidaData, { transaction });
          personasFallecidas++;
          console.log(`  ⚰️ Persona fallecida registrada: ${primerNombre}`);
          
        } catch (error) {
          console.error(`  ❌ Error registrando persona fallecida ${fallecido.nombres}:`, error.message);
        }
      }
    }

    // 7. CONFIRMAR TRANSACCIÓN
    await transaction.commit();
    console.log('✅ Transacción completada exitosamente');

    // 8. RESPUESTA EXITOSA CON METADATOS COMPLETOS
    res.status(201).json({
      status: 'success',
      message: 'Encuesta guardada exitosamente',
      data: {
        familia_id: familia.id_familia,
        personas_creadas: personasCreadas,
        personas_fallecidas: personasFallecidas,
        transaccion_id: `txn_${Date.now()}`,
        codigo_familia: familia.codigo_familia,
        informacion_persistida: {
          informacion_general: true,
          vivienda_y_disposicion_basuras: true,
          servicios_agua: true,
          miembros_familia: personasCreadas > 0,
          personas_fallecidas: personasFallecidas > 0,
          ubicacion_geografica: !!(informacionGeneral.municipio || informacionGeneral.vereda || informacionGeneral.sector)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '2.0',
          completada: metadata.completed || false,
          etapa_actual: metadata.currentStage || null,
          observaciones_procesadas: !!(observaciones.sustento_familia || observaciones.observaciones_encuestador),
          autorizacion_datos: observaciones.autorizacion_datos || false,
          validacion_duplicados: 'verificada'
        }
      }
    });

  } catch (error) {
    // ROLLBACK EN CASO DE ERROR
    await transaction.rollback();
    console.error('❌ Error procesando encuesta:', error);

    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al procesar la encuesta',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
      error_code: 'ENCUESTA_PROCESSING_ERROR'
    });
  }
};

/**
 * Eliminar encuesta familiar por ID
 */
export const eliminarEncuesta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    console.log(`🗑️ Iniciando eliminación de encuesta con ID: ${id}`);

    // 1. VERIFICAR QUE LA ENCUESTA EXISTE
    const encuesta = await Familias.findByPk(id);
    
    if (!encuesta) {
      await transaction.rollback();
      console.log(`❌ Encuesta con ID ${id} no encontrada`);
      return res.status(404).json({
        status: 'error',
        message: 'Encuesta no encontrada',
        code: 'NOT_FOUND'
      });
    }

    console.log(`✅ Encuesta encontrada: ${encuesta.apellido_familiar}`);

    // 2. OBTENER ESTADÍSTICAS ANTES DE ELIMINAR
    const personas = await Persona.findAll({
      where: { id_familia_familias: id }
    });

    const estadisticasEliminacion = {
      familia_id: id,
      apellido_familiar: encuesta.apellido_familiar,
      personas_eliminadas: personas.length,
      fecha_eliminacion: new Date().toISOString()
    };

    console.log(`📊 Estadísticas de eliminación:`, estadisticasEliminacion);

    // 3. ELIMINAR REGISTROS RELACIONADOS EN ORDEN CORRECTO
    console.log('🔄 Eliminando registros relacionados...');

    // 3.1 Eliminar personas de la familia
    const personasEliminadas = await Persona.destroy({
      where: { id_familia_familias: id },
      transaction
    });
    console.log(`  👥 Personas eliminadas: ${personasEliminadas}`);

    // 3.2 Eliminar registros de disposición de basuras
    const disposicionEliminada = await sequelize.query(
      'DELETE FROM familia_disposicion_basura WHERE id_familia = $1',
      {
        bind: [id],
        transaction
      }
    );
    console.log(`  🗑️ Registros de disposición de basura eliminados`);

    // 3.3 Eliminar registros de sistema de acueducto
    const acueductoEliminado = await sequelize.query(
      'DELETE FROM familia_sistema_acueducto WHERE id_familia = $1',
      {
        bind: [id],
        transaction
      }
    );
    console.log(`  💧 Registros de sistema de acueducto eliminados`);

    // 3.4 Eliminar registros de sistema de aguas residuales (si existen)
    try {
      await sequelize.query(
        'DELETE FROM familia_sistema_aguas_residuales WHERE id_familia = $1',
        {
          bind: [id],
          transaction
        }
      );
      console.log(`  🌊 Registros de aguas residuales eliminados`);
    } catch (error) {
      console.log(`  ⚠️ No hay registros de aguas residuales o tabla no existe`);
    }

    // 3.5 Eliminar registros de tipo de vivienda (si existen)
    try {
      await sequelize.query(
        'DELETE FROM familia_tipo_vivienda WHERE id_familia = $1',
        {
          bind: [id],
          transaction
        }
      );
      console.log(`  🏠 Registros de tipo de vivienda eliminados`);
    } catch (error) {
      console.log(`  ⚠️ No hay registros de tipo de vivienda o tabla no existe`);
    }

    // 4. ELIMINAR EL REGISTRO PRINCIPAL DE LA FAMILIA
    console.log('🏠 Eliminando registro principal de familia...');
    const familiaEliminada = await Familias.destroy({
      where: { id_familia: id },
      transaction
    });

    if (familiaEliminada === 0) {
      await transaction.rollback();
      console.log(`❌ No se pudo eliminar la familia con ID ${id}`);
      return res.status(500).json({
        status: 'error',
        message: 'No se pudo eliminar la encuesta',
        code: 'DELETE_FAILED'
      });
    }

    // 5. CONFIRMAR TRANSACCIÓN
    await transaction.commit();
    console.log('✅ Eliminación completada exitosamente');

    // 6. RESPUESTA EXITOSA
    res.status(200).json({
      status: 'success',
      message: `Encuesta de la familia ${estadisticasEliminacion.apellido_familiar} eliminada exitosamente`,
      data: {
        eliminacion_completada: true,
        estadisticas: estadisticasEliminacion,
        registros_afectados: {
          familia: 1,
          personas: personasEliminadas,
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
    // ROLLBACK EN CASO DE ERROR
    await transaction.rollback();
    console.error('❌ Error eliminando encuesta:', error);

    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al eliminar la encuesta',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
      error_code: 'DELETE_ENCUESTA_ERROR'
    });
  }
};

export default {
  crearEncuesta,
  eliminarEncuesta
};
