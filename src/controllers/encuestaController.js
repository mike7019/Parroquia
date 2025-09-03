import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { Familias, Municipios, Parroquia, Sector, Veredas, Sexo, TipoIdentificacion, Persona } from '../models/index.js';
import crypto from 'crypto';
import FamiliasConsultasService from '../services/familiasConsultasService.js';

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
 * Validar que los miembros de la familia no pertenezcan a otra familia
 * Verifica números de identificación únicos en la base de datos
 */
const validarMiembrosUnicos = async (familyMembers = [], deceasedMembers = []) => {
  try {
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
      return;
    }
    
    console.log(`  🔍 Validando ${identificacionesAValidar.length} identificaciones...`);
    
    // Buscar personas existentes con estas identificaciones usando consulta SQL directa
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
      
      // Lanzar error con detalles de los conflictos
      const error = new Error(`Las siguientes personas ya pertenecen a otra familia: ${conflictos.map(c => `${c.nombre_completo} (${c.identificacion})`).join(', ')}`);
      error.codigo = 'MIEMBROS_DUPLICADOS';
      error.conflictos = conflictos;
      throw error;
    }
    
    console.log('  ✅ Todos los miembros son únicos');
    
  } catch (error) {
    if (error.codigo === 'MIEMBROS_DUPLICADOS') {
      throw error; // Re-lanzar errores de validación
    }
    
    console.log(`  ❌ Error validando miembros únicos: ${error.name} [${error.constructor.name}]: ${error.message}`);
    console.log(error.stack);
    throw new Error(`Error al validar miembros únicos: ${error.message}`);
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

    // Construir condiciones WHERE usando SQL directo
    let whereClause = '1=1';
    let replacements = { limit, offset };
    
    if (sector) {
      whereClause += ' AND sector ILIKE :sector';
      replacements.sector = `%${sector}%`;
    }
    if (apellido_familiar) {
      whereClause += ' AND apellido_familiar ILIKE :apellido_familiar';
      replacements.apellido_familiar = `%${apellido_familiar}%`;
    }

    // Obtener total de registros usando SQL directo
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM familias 
      WHERE ${whereClause}
    `;
    const [{ total }] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Obtener encuestas con información básica usando SQL directo (COLUMNAS EXISTENTES SOLAMENTE)
    const familiasQuery = `
      SELECT 
        id_familia,
        apellido_familiar,
        sector,
        direccion_familia,
        numero_contacto,
        telefono,
        email,
        tamaño_familia,
        tipo_vivienda,
        estado_encuesta,
        numero_encuestas,
        fecha_ultima_encuesta,
        codigo_familia,
        tutor_responsable
      FROM familias 
      WHERE ${whereClause}
      ORDER BY fecha_ultima_encuesta DESC 
      LIMIT :limit OFFSET :offset
    `;
    
    const encuestas = await sequelize.query(familiasQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Para cada familia, obtener información adicional manualmente
    const encuestasFormateadas = await Promise.all(
      encuestas.map(async (familiaData) => {
        // Obtener personas de la familia usando SQL directo para evitar errores de modelo
        const personas = await sequelize.query(`
          SELECT 
            p.id_personas,
            p.primer_nombre,
            p.segundo_nombre,
            p.primer_apellido,
            p.segundo_apellido,
            p.identificacion,
            p.telefono,
            p.correo_electronico,
            p.fecha_nacimiento,
            p.direccion,
            p.estudios,
            p.talla_camisa,
            p.talla_pantalon,
            p.talla_zapato,
            p.id_sexo,
            p.id_tipo_identificacion_tipo_identificacion,
            p.id_estado_civil_estado_civil,
            s.id_sexo as sexo_id,
            s.descripcion as sexo_descripcion,
            ti.id_tipo_identificacion as tipo_id_id,
            ti.nombre as tipo_id_nombre,
            ti.codigo as tipo_id_codigo
          FROM personas p
          LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
          LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
          WHERE p.id_familia_familias = :familiaId
        `, {
          replacements: { familiaId: familiaData.id_familia },
          type: QueryTypes.SELECT
        });

        // Obtener información de ubicación usando texto de la tabla familias
        let municipioInfo = null;
        let veredaInfo = null;
        let sectorInfo = null;
        let tipoViviendaInfo = null;

        // Obtener información del tipo de vivienda
        if (familiaData.tipo_vivienda) {
          try {
            const [tipoVivienda] = await sequelize.query(`
              SELECT id_tipo_vivienda, nombre 
              FROM tipos_vivienda 
              WHERE nombre ILIKE :tipoVivienda
            `, {
              replacements: { tipoVivienda: `%${familiaData.tipo_vivienda}%` },
              type: QueryTypes.SELECT
            });
            
            if (tipoVivienda) {
              tipoViviendaInfo = {
                id: tipoVivienda.id_tipo_vivienda,
                nombre: tipoVivienda.nombre
              };
            } else {
              tipoViviendaInfo = {
                id: null,
                nombre: familiaData.tipo_vivienda
              };
            }
          } catch (error) {
            tipoViviendaInfo = {
              id: null,
              nombre: familiaData.tipo_vivienda
            };
          }
        }

        // Obtener información del sector
        if (familiaData.sector) {
          try {
            const [sector] = await sequelize.query(`
              SELECT id_sector, nombre 
              FROM sectores 
              WHERE nombre ILIKE :sectorNombre
            `, {
              replacements: { sectorNombre: `%${familiaData.sector}%` },
              type: QueryTypes.SELECT
            });
            
            if (sector) {
              sectorInfo = {
                id: sector.id_sector,
                nombre: sector.nombre
              };
            } else {
              sectorInfo = {
                id: null,
                nombre: familiaData.sector
              };
            }
          } catch (error) {
            sectorInfo = {
              id: null,
              nombre: familiaData.sector
            };
          }
        }

        // Obtener información de basuras, acueducto y aguas residuales
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
        }

        // Obtener información adicional para cada persona
        const personasFormateadas = await Promise.all(personas.map(async (persona) => {
          // Obtener información del estado civil
          let estadoCivilInfo = null;
          if (persona.id_estado_civil_estado_civil) {
            try {
              const [estadoCivil] = await sequelize.query(`
                SELECT id_estado_civil, nombre 
                FROM estados_civiles 
                WHERE id_estado_civil = :estadoCivilId
              `, {
                replacements: { estadoCivilId: persona.id_estado_civil_estado_civil },
                type: QueryTypes.SELECT
              });
              
              if (estadoCivil) {
                estadoCivilInfo = {
                  id: estadoCivil.id_estado_civil,
                  nombre: estadoCivil.nombre
                };
              }
            } catch (error) {
              console.log(`⚠️ Error obteniendo estado civil ${persona.id_estado_civil_estado_civil}:`, error.message);
            }
          }

          // Obtener información del estudio
          let estudioInfo = null;
          if (persona.estudios) {
            try {
              // Si estudios contiene un ID numérico, buscar en la tabla
              const estudioId = parseInt(persona.estudios);
              if (!isNaN(estudioId)) {
                const [estudio] = await sequelize.query(`
                  SELECT id_estudios, nombre 
                  FROM estudios 
                  WHERE id_estudios = :estudioId
                `, {
                  replacements: { estudioId },
                  type: QueryTypes.SELECT
                });
                
                if (estudio) {
                  estudioInfo = {
                    id: estudio.id_estudios,
                    nombre: estudio.nombre
                  };
                } else {
                  estudioInfo = {
                    id: estudioId,
                    nombre: persona.estudios
                  };
                }
              } else {
                // Si no es un ID, mantener el texto como nombre
                estudioInfo = {
                  id: null,
                  nombre: persona.estudios
                };
              }
            } catch (error) {
              estudioInfo = {
                id: null,
                nombre: persona.estudios
              };
            }
          }

          return {
            id: persona.id_personas,
            nombre_completo: `${persona.primer_nombre || ''} ${persona.segundo_nombre || ''} ${persona.primer_apellido || ''} ${persona.segundo_apellido || ''}`.trim(),
            primer_nombre: persona.primer_nombre,
            segundo_nombre: persona.segundo_nombre,
            primer_apellido: persona.primer_apellido,
            segundo_apellido: persona.segundo_apellido,
            identificacion: {
              numero: persona.identificacion,
              tipo: persona.tipo_id_id ? {
                id: persona.tipo_id_id,
                nombre: persona.tipo_id_nombre,
                codigo: persona.tipo_id_codigo
              } : null
            },
            telefono: persona.telefono,
            numero_contacto: persona.telefono, // Agregado: numero_contacto es igual al telefono
            email: persona.correo_electronico,
            fecha_nacimiento: persona.fecha_nacimiento,
            direccion: persona.direccion,
            estudios: estudioInfo, // Cambiado: ahora devuelve objeto con id y nombre
            edad: persona.fecha_nacimiento ? 
              Math.floor((new Date() - new Date(persona.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
            sexo: persona.sexo_id ? {
              id: persona.sexo_id,
              descripcion: persona.sexo_descripcion
            } : null,
            estado_civil: estadoCivilInfo, // Cambiado: ahora devuelve objeto con id y nombre
            tallas: {
              camisa: persona.talla_camisa,
              pantalon: persona.talla_pantalon,
              zapato: persona.talla_zapato
            }
          };
        }));

        return {
          // *** ID DE LA ENCUESTA (ÚNICO) ***
          id_encuesta: familiaData.id_familia,
          
          // *** INFORMACIÓN BÁSICA DE LA FAMILIA ***
          apellido_familiar: familiaData.apellido_familiar,
          direccion_familia: familiaData.direccion_familia,
          numero_contacto: familiaData.numero_contacto || familiaData.telefono, // numero_contacto es igual al telefono
          telefono: familiaData.telefono,
          email: familiaData.email,
          codigo_familia: familiaData.codigo_familia,
          tutor_responsable: familiaData.tutor_responsable,
          
          // *** INFORMACIÓN DE LA ENCUESTA ***
          estado_encuesta: familiaData.estado_encuesta,
          numero_encuestas: familiaData.numero_encuestas,
          fecha_ultima_encuesta: familiaData.fecha_ultima_encuesta,
          
          // *** INFORMACIÓN DE VIVIENDA CON ID Y NOMBRE ***
          tipo_vivienda: tipoViviendaInfo,
          tamaño_familia: familiaData.tamaño_familia,
          
          // *** INFORMACIÓN GEOGRÁFICA COMPLETA CON ID Y NOMBRE ***
          sector: sectorInfo,
          municipio: municipioInfo,
          vereda: veredaInfo,
          // Removido: sector_especifico (no lo necesitas según indicaciones)
          
          // *** INFORMACIÓN DE SERVICIOS CON ID Y NOMBRE ***
          basuras: disposicionBasuras.length > 0 ? disposicionBasuras : null,
          acueducto: sistemasAcueducto.length > 0 ? sistemasAcueducto[0] : null, // Tomar el primero si hay varios
          aguas_residuales: sistemasAguasResiduales.length > 0 ? sistemasAguasResiduales[0] : null,
          
          // *** INFORMACIÓN RELIGIOSA ***
          comunion_en_casa: familiaData.comunionEnCasa,
          
          // Información de personas/miembros de familia
          miembros_familia: {
            total_miembros: personasFormateadas.length,
            personas: personasFormateadas
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
    const totalPages = Math.ceil(total / limit);
    
    console.log(`✅ Se encontraron ${total} encuestas con información completa`);

    res.status(200).json({
      status: 'success',
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
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al obtener encuestas',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
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

    // VERIFICACIÓN ADICIONAL: Verificar si la familia existe directamente
    console.log(`🔍 Verificando existencia directa de familia ID: ${id}`);
    const verificacionDirecta = await sequelize.query(
      'SELECT COUNT(*) as existe FROM familias WHERE id_familia = :familiaId',
      {
        replacements: { familiaId: id },
        type: QueryTypes.SELECT
      }
    );
    console.log(`🔍 Familia existe (verificación directa): ${verificacionDirecta[0].existe}`);

    // Buscar la familia usando SQL directo con JOINs para obtener IDs
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
        f.id_municipio,
        f.id_vereda,
        f.id_sector,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        tv.id_tipo_vivienda,
        tv.nombre as nombre_tipo_vivienda,
        tv.descripcion as descripcion_tipo_vivienda
      FROM familias f
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN tipos_vivienda tv ON f.tipo_vivienda = tv.nombre
      WHERE f.id_familia = :familiaId
    `;
    
    const [encuesta] = await sequelize.query(familiasQuery, {
      replacements: { familiaId: id },
      type: QueryTypes.SELECT
    });

    if (!encuesta) {
      console.log(`❌ Encuesta con ID ${id} no encontrada`);
      return res.status(404).json({
        status: 'error',
        message: 'Encuesta no encontrada',
        code: 'NOT_FOUND'
      });
    }

    console.log(`✅ Encuesta encontrada: ${encuesta.apellido_familiar}`);

    const familiaData = encuesta;

    // Obtener personas de la familia usando SQL directo con información completa
    const personas = await sequelize.query(`
      SELECT 
        p.id_personas,
        p.primer_nombre,
        p.segundo_nombre,
        p.primer_apellido,
        p.segundo_apellido,
        p.identificacion,
        p.telefono,
        p.correo_electronico,
        p.fecha_nacimiento,
        p.direccion,
        p.estudios,
        p.talla_camisa,
        p.talla_pantalon,
        p.talla_zapato,
        p.id_sexo,
        p.id_tipo_identificacion_tipo_identificacion,
        p.id_estado_civil_estado_civil,
        s.id_sexo as sexo_id,
        s.descripcion as sexo_descripcion,
        ti.id_tipo_identificacion as tipo_id_id,
        ti.nombre as tipo_id_nombre,
        ti.codigo as tipo_id_codigo
      FROM personas p
      LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
      LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
      WHERE p.id_familia_familias = :familiaId
    `, {
      replacements: { familiaId: familiaData.id_familia },
      type: QueryTypes.SELECT
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

    // Obtener aguas residuales (siguiendo el mismo patrón que sistemas de acueducto)
    let tiposAguasResiduales = [];
    try {
      const aguasResiduales = await sequelize.query(
        'SELECT fsar.id_familia, tar.id_tipo_aguas_residuales, tar.nombre, tar.descripcion FROM familia_sistema_aguas_residuales fsar JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales WHERE fsar.id_familia = $1',
        {
          bind: [familiaData.id_familia],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      tiposAguasResiduales = aguasResiduales.map(ar => ({
        id: ar.id_tipo_aguas_residuales,
        nombre: ar.nombre,
        descripcion: ar.descripcion
      }));
    } catch (error) {
      console.log(`  ⚠️ Error obteniendo tipos de aguas residuales: ${error.message}`);
      tiposAguasResiduales = [];
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

    // Obtener información de ubicación (usar datos obtenidos en la consulta principal)
    let municipioInfo = null;
    let veredaInfo = null;
    let sectorInfo = null;

    // Usar datos obtenidos directamente de la consulta con JOINs
    if (familiaData.id_municipio && familiaData.nombre_municipio) {
      municipioInfo = {
        id: familiaData.id_municipio,
        nombre: familiaData.nombre_municipio
      };
    }

    if (familiaData.id_vereda && familiaData.nombre_vereda) {
      veredaInfo = {
        id: familiaData.id_vereda,
        nombre: familiaData.nombre_vereda
      };
    }

    // Usar datos de sector con ID
    if (familiaData.id_sector && familiaData.nombre_sector) {
      sectorInfo = {
        id: familiaData.id_sector,
        nombre: familiaData.nombre_sector
      };
    } else if (familiaData.sector) {
      // Fallback para sector como texto
      sectorInfo = {
        nombre: familiaData.sector
      };
    }

    // Para cada persona, formatear información completa usando datos ya obtenidos
    const personasDetalladas = personas.map((persona) => {
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
            tipo: persona.tipo_id_id ? {
              id: persona.tipo_id_id,
              nombre: persona.tipo_id_nombre,
              codigo: persona.tipo_id_codigo
            } : null
          },
          demografia: {
            fecha_nacimiento: persona.fecha_nacimiento,
            sexo: persona.sexo_id ? {
              id: persona.sexo_id,
              descripcion: persona.sexo_descripcion
            } : null
          },
          estado_civil: persona.id_estado_civil_estado_civil ? {
            id: persona.id_estado_civil_estado_civil
          } : null,
          contacto: {
            telefono: persona.telefono,
            correo_electronico: persona.correo_electronico,
            direccion: persona.direccion
          },
          educacion_y_liderazgo: {
            estudios: {
              id: null, // No hay tabla de estudios, usar null
              nombre: persona.estudios || null,
              descripcion: null // No hay tabla de estudios, usar null
            },
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
                era_padre: persona.sexo_descripcion === 'Masculino',
                era_madre: persona.sexo_descripcion === 'Femenino'
              };
            }
          })() : null,
          metadata_persona: {
            fecha_registro: persona.createdAt,
            ultima_actualizacion: persona.updatedAt
          }
        };
      });

    // Construir respuesta completa y estructurada con toda la información
    const encuestaCompleta = {
      // Información básica de la familia
      informacion_general: {
        id_familia: familiaData.id_familia,
        apellido_familiar: familiaData.apellido_familiar,
        direccion_familia: familiaData.direccion_familia,
        telefono: familiaData.telefono,
        email: personasDetalladas.length > 0 && !personasDetalladas[0].es_fallecido ? personasDetalladas[0].contacto?.correo_electronico : familiaData.email, // ✅ CORRECCIÓN: Usar email de primera persona viva
        codigo_familia: familiaData.codigo_familia,
        tutor_responsable: familiaData.tutor_responsable,
        numero_contrato_epm: familiaData.numero_contrato_epm // ✅ CORRECCIÓN: Usar datos reales del modelo
      },
      
      // Información de la encuesta
      estado_encuesta: {
        estado: familiaData.estado_encuesta,
        fecha_ultima_encuesta: familiaData.fecha_ultima_encuesta,
        numero_encuestas: familiaData.numero_encuestas
      },
      
      // Información completa de vivienda
      informacion_vivienda: {
        tipo_vivienda: familiaData.id_tipo_vivienda ? {
          id: familiaData.id_tipo_vivienda,
          nombre: familiaData.nombre_tipo_vivienda,
          descripcion: familiaData.descripcion_tipo_vivienda
        } : {
          nombre: familiaData.tipo_vivienda
        },
        tamaño_familia: familiaData.tamaño_familia,
        sector: sectorInfo || { nombre: familiaData.sector },
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
        aguas_residuales: tiposAguasResiduales.length > 0 ? {
          id: tiposAguasResiduales[0].id,
          nombre: tiposAguasResiduales[0].nombre,
          descripcion: tiposAguasResiduales[0].descripcion
        } : null,
        pozo_septico: false,    // Se puede expandir luego
        letrina: false,         // Se puede expandir luego
        campo_abierto: false,   // Se puede expandir luego
        sistemas_registrados: sistemasAcueducto,
        aguas_residuales_registradas: tiposAguasResiduales
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
        total_miembros: personasDetalladas.length,
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

    // VALIDAR MIEMBROS ÚNICOS - No pueden pertenecer a otra familia
    console.log('🔍 Validando que los miembros no pertenezcan a otra familia...');
    await validarMiembrosUnicos(familyMembers, deceasedMembers || []);
    console.log('✅ Validación de miembros únicos completada');

    // VERIFICAR SI LA FAMILIA YA EXISTE
    console.log('🔍 Verificando familia existente...');
    const familiaExistente = await verificarFamiliaExistente(
      informacionGeneral.apellido_familiar,
      informacionGeneral.telefono,
      informacionGeneral.direccion
    );

    if (familiaExistente) {
      // MEJORA: Detectar posibles errores de formulación comparando miembros
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

      await transaction.rollback();
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

    // 1. CREAR FAMILIA
    console.log('💾 Creando registro de familia...');
    
    // Calcular tamaño de familia (mínimo 1)
    const tamanioFamiliaCalculado = Math.max(1, (familyMembers.length || 0) + (deceasedMembers.length || 0));
    
    const familiaData = {
      apellido_familiar: informacionGeneral.apellido_familiar,
      sector: informacionGeneral.sector?.nombre || informacionGeneral.sector || 'General',
      direccion_familia: informacionGeneral.direccion,
      telefono: informacionGeneral.telefono,
      email: informacionGeneral.email || null,
      tamaño_familia: tamanioFamiliaCalculado,
      tipo_vivienda: vivienda.tipo_vivienda?.id || vivienda.tipo_vivienda?.nombre || vivienda.tipo_vivienda || 'Casa',
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: new Date().toISOString().split('T')[0],
      codigo_familia: `FAM_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      tutor_responsable: null, // Se puede definir luego
      id_municipio: informacionGeneral.municipio?.id ? parseInt(informacionGeneral.municipio.id) : null,
      id_vereda: informacionGeneral.vereda?.id ? parseInt(informacionGeneral.vereda.id) : null,
      id_sector: informacionGeneral.sector?.id ? parseInt(informacionGeneral.sector.id) : null,
      comunionEnCasa: informacionGeneral.comunionEnCasa || false
    };

    // Debug: mostrar datos que se van a insertar
    console.log('📋 Datos de familia a insertar:', {
      apellido_familiar: familiaData.apellido_familiar,
      sector: familiaData.sector,
      tamaño_familia: familiaData.tamaño_familia,
      tipo_vivienda: familiaData.tipo_vivienda
      // COMENTADO: id_municipio no existe en la tabla familias
      // id_municipio: familiaData.id_municipio
    });

    const familia = await Familias.create(familiaData, { transaction });
    console.log(`✅ Familia creada con ID: ${familia.id_familia}`);
    console.log(`✅ Datos familia creados:`, {
      id: familia.id_familia,
      apellido: familia.apellido_familiar,
      telefono: familia.telefono,
      comunionEnCasa: familia.comunionEnCasa
    });
    
    // Verificar que se haya creado correctamente el ID
    if (!familia.id_familia) {
      throw new Error('Error al crear la familia: ID no generado correctamente');
    }
    
    const familiaId = familia.id_familia;

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
                bind: [familiaId, disposicionMapping[tipo]],
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
            bind: [familiaId, sistemaId],
            transaction
          }
        );
        console.log(`  ✅ Sistema acueducto registrado: ID ${sistemaId}`);
      } catch (error) {
        console.log(`  ⚠️ Error registrando sistema acueducto: ${error.message}`);
      }
    }

    // 4. REGISTRAR AGUAS RESIDUALES
    console.log('🚰 Registrando aguas residuales...');
    if (servicios_agua.aguas_residuales) {
      try {
        // Mapear aguas residuales por ID o usar default
        let aguaResidualesId = servicios_agua.aguas_residuales.id || 1; // Default: Alcantarillado

        await sequelize.query(
          'INSERT INTO familia_sistema_aguas_residuales (id_familia, id_tipo_aguas_residuales, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
          {
            bind: [familiaId, aguaResidualesId],
            transaction
          }
        );
        console.log(`  ✅ Aguas residuales registradas: ID ${aguaResidualesId}`);
      } catch (error) {
        console.log(`  ⚠️ Error registrando aguas residuales: ${error.message}`);
      }
    }

    // 5. REGISTRAR INFORMACIÓN DE TIPO DE VIVIENDA
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
          bind: [familiaId, tipoViviendaId],
          transaction
        }
      );
      console.log(`  ✅ Tipo vivienda registrado: ID ${tipoViviendaId}`);
    }

    // 6. PROCESAR MIEMBROS VIVOS DE LA FAMILIA
    let personasCreadas = 0;
    if (familyMembers.length > 0) {
      console.log(`👥 Procesando ${familyMembers.length} miembros de la familia...`);
      
      for (const miembro of familyMembers) {
        try {
          // Dividir nombres
          const nombres = miembro.nombres.trim().split(' ');
          const primerNombre = nombres[0] || '';
          const segundoNombre = nombres.slice(1).join(' ') || null;

          // Mapear sexo - el JSON tiene objeto con id y nombre
          let sexoId = null;
          if (miembro.sexo) {
            if (typeof miembro.sexo === 'object' && miembro.sexo.id) {
              sexoId = parseInt(miembro.sexo.id);
            } else if (typeof miembro.sexo === 'string') {
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
          }

          // Mapear tipo de identificación - el JSON tiene objeto con id y nombre
          let tipoIdentificacionId = null;
          if (miembro.tipoIdentificacion) {
            if (typeof miembro.tipoIdentificacion === 'object' && miembro.tipoIdentificacion.id) {
              tipoIdentificacionId = parseInt(miembro.tipoIdentificacion.id);
            } else if (typeof miembro.tipoIdentificacion === 'string') {
              const tipoIdMapping = {
                'CC': 1,
                'TI': 2,
                'RC': 3,
                'CE': 4,
                'PP': 5
              };
              tipoIdentificacionId = tipoIdMapping[miembro.tipoIdentificacion] || null;
            }
          }

          // Mapear estado civil - el JSON tiene objeto con id y nombre
          let estadoCivilId = null;
          if (miembro.situacionCivil) {
            if (typeof miembro.situacionCivil === 'object' && miembro.situacionCivil.id) {
              estadoCivilId = parseInt(miembro.situacionCivil.id);
            } else if (typeof miembro.situacionCivil === 'string') {
              const estadoCivilMapping = {
                'Soltero': 1,
                'Soltera': 1,
                'Soltero(a)': 1,
                'Casado Civil': 2,
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
            identificacion: miembro.numeroIdentificacion || identificacionUnica,
            direccion: informacionGeneral.direccion,
            id_familia_familias: familiaId,
            id_sexo: sexoId,
            id_tipo_identificacion_tipo_identificacion: tipoIdentificacionId,
            id_estado_civil_estado_civil: estadoCivilId,
            estudios: (miembro.estudio && typeof miembro.estudio === 'object') ? miembro.estudio.nombre : (miembro.estudio || null),
            en_que_eres_lider: null,
            necesidad_enfermo: null,
            id_profesion: null, // Campo opcional
            talla_camisa: miembro['talla_camisa/blusa'] || (miembro.talla ? miembro.talla.camisa : null),
            talla_pantalon: miembro.talla_pantalon || (miembro.talla ? miembro.talla.pantalon : null),
            talla_zapato: miembro.talla_zapato || (miembro.talla ? miembro.talla.calzado : null)
          };

          // Crear persona usando el modelo importado con timestamps correctos
          console.log(`  🔧 Intentando crear persona: ${primerNombre} (ID: ${identificacionUnica})`);
          console.log(`  📋 Datos persona:`, {
            primer_nombre: personaData.primer_nombre,
            identificacion: personaData.identificacion,
            telefono: personaData.telefono,
            correo_electronico: personaData.correo_electronico,
            id_familia_familias: personaData.id_familia_familias,
            fecha_nacimiento: personaData.fecha_nacimiento
          });
          
          await Persona.create(personaData, { transaction });
          personasCreadas++;
          console.log(`  ✅ Persona creada exitosamente: ${primerNombre}`);
          
        } catch (error) {
          console.error(`  ❌ Error detallado creando persona ${miembro.nombres}:`);
          console.error(`     - Mensaje: ${error.message}`);
          console.error(`     - Nombre del error: ${error.name}`);
          console.error(`     - SQL State: ${error.sql || 'N/A'}`);
          console.error(`     - Parent error: ${error.parent?.message || 'N/A'}`);
          // NO continuar - lanzar error para que se ejecute rollback
          throw error;
        }
      }
    }

    // 7. PROCESAR MIEMBROS FALLECIDOS
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
            id_familia_familias: familiaId,
            id_familia: familiaId,
            id_parroquia: null, // Evitar error de clave foránea, usar null por defecto
            // Campos adicionales para fallecidos en el campo 'estudios' como JSON temporal
            estudios: JSON.stringify({
              es_fallecido: true,
              fecha_aniversario: fallecido.fechaFallecimiento || fallecido.fechaAniversario || null,
              era_padre: fallecido.eraPadre || false,
              era_madre: fallecido.eraMadre || false,
              causa_fallecimiento: fallecido.causaFallecimiento || null
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

    // 8. CONFIRMAR TRANSACCIÓN
    console.log('🔄 Iniciando commit de transacción...');
    await transaction.commit();
    console.log('✅ Transacción completada exitosamente');
    
    // 8. RESPUESTA EXITOSA INMEDIATA (antes de verificaciones adicionales)
    const responseData = {
      status: 'success',
      message: 'Encuesta guardada exitosamente',
      data: {
        familia_id: familiaId,
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
    };
    
    res.status(201).json(responseData);
    console.log('✅ Respuesta 201 enviada exitosamente');

  } catch (error) {
    // ROLLBACK EN CASO DE ERROR (solo si la transacción aún está activa)
    console.log('❌ ERROR CAPTURADO - VERIFICANDO ESTADO DE TRANSACCIÓN');
    console.log('❌ Tipo de error:', error.constructor.name);
    console.log('❌ Mensaje de error:', error.message);
    
    try {
      // Verificar si la transacción aún está activa
      if (transaction && !transaction.finished) {
        console.log('❌ Transacción activa - Iniciando rollback');
        await transaction.rollback();
        console.log('❌ ROLLBACK COMPLETADO');
      } else {
        console.log('⚠️ Transacción ya finalizada - No se requiere rollback');
      }
    } catch (rollbackError) {
      console.log('❌ Error durante rollback:', rollbackError.message);
    }
    
    console.error('❌ Error procesando encuesta:', error);

    // Solo enviar respuesta de error si no se ha enviado ya una respuesta
    if (!res.headersSent) {
      // Manejar error específico de miembros duplicados
      if (error.codigo === 'MIEMBROS_DUPLICADOS') {
        return res.status(409).json({
          status: 'error',
          message: 'Algunos miembros ya pertenecen a otra familia',
          details: error.message,
          error_code: 'MIEMBROS_DUPLICADOS',
          conflictos: error.conflictos || [],
          sugerencia: 'Verifique los números de identificación de los miembros de la familia'
        });
      }

      // Error genérico
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor al procesar la encuesta',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
        error_code: 'ENCUESTA_PROCESSING_ERROR'
      });
    } else {
      console.log('⚠️ Headers ya enviados - No se puede enviar respuesta de error');
    }
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

/**
 * PATCH - Actualizar campos específicos de una encuesta
 * Permite actualizar uno o varios campos de la familia sin afectar el resto
 */
export const actualizarCamposEncuesta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    console.log(`🔄 Actualizando campos específicos de encuesta ID: ${id}`);
    console.log('📝 Campos a actualizar:', Object.keys(camposActualizar));

    // Validar que el ID sea válido
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de encuesta inválido',
        code: 'INVALID_ID'
      });
    }

    // Verificar que la familia existe
    const familiaExistente = await sequelize.query(
      'SELECT id_familia, apellido_familiar FROM familias WHERE id_familia = :id',
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (!familiaExistente || familiaExistente.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Encuesta no encontrada',
        code: 'ENCUESTA_NOT_FOUND'
      });
    }

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
      'tutor_responsable', // Este es boolean
      'comunionEnCasa'
    ];

    // Filtrar solo campos permitidos
    const camposValidos = {};
    Object.keys(camposActualizar).forEach(campo => {
      if (camposPermitidos.includes(campo)) {
        let valor = camposActualizar[campo];
        
        // Conversión especial para campos boolean
        if (campo === 'tutor_responsable') {
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
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'No se proporcionaron campos válidos para actualizar',
        code: 'NO_VALID_FIELDS',
        campos_permitidos: camposPermitidos
      });
    }

    // Construir query dinámico de actualización
    const setClauses = Object.keys(camposValidos).map(campo => `"${campo}" = :${campo}`);
    const updateQuery = `
      UPDATE familias 
      SET ${setClauses.join(', ')}, fecha_ultima_encuesta = NOW()
      WHERE id_familia = :id
    `;

    // Ejecutar actualización
    await sequelize.query(updateQuery, {
      replacements: { ...camposValidos, id },
      type: QueryTypes.UPDATE,
      transaction
    });

    // Obtener los datos actualizados
    const familiaActualizada = await sequelize.query(
      `SELECT 
        id_familia,
        apellido_familiar,
        sector,
        direccion_familia,
        numero_contacto,
        telefono,
        email,
        "tamaño_familia",
        tipo_vivienda,
        estado_encuesta,
        tutor_responsable,
        "comunionEnCasa",
        fecha_ultima_encuesta
      FROM familias 
      WHERE id_familia = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        transaction
      }
    );

    await transaction.commit();

    console.log('✅ Campos actualizados exitosamente');

    res.status(200).json({
      exito: true,
      mensaje: 'Campos de encuesta actualizados exitosamente',
      datos: familiaActualizada[0],
      campos_actualizados: Object.keys(camposValidos),
      metadata: {
        timestamp: new Date().toISOString(),
        operacion: 'PATCH',
        registros_afectados: 1
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error actualizando campos de encuesta:', error);

    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al actualizar la encuesta',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
      error_code: 'UPDATE_FIELDS_ERROR'
    });
  }
};

/**
 * PUT - Actualizar encuesta completa
 * Reemplaza todos los datos de la familia con los nuevos datos proporcionados
 */
export const actualizarEncuestaCompleta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const datosCompletos = req.body;

    console.log(`🔄 Actualizando encuesta completa ID: ${id}`);
    console.log('📝 Datos recibidos:', JSON.stringify(datosCompletos, null, 2));

    // Validar que el ID sea válido
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de encuesta inválido',
        code: 'INVALID_ID'
      });
    }

    // Verificar que la familia existe
    const familiaExistente = await sequelize.query(
      'SELECT id_familia, apellido_familiar FROM familias WHERE id_familia = :id',
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (!familiaExistente || familiaExistente.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Encuesta no encontrada',
        code: 'ENCUESTA_NOT_FOUND'
      });
    }

    // Validaciones requeridas para actualización completa
    const camposRequeridos = ['apellido_familiar', 'sector', 'direccion_familia'];
    const camposFaltantes = camposRequeridos.filter(campo => !datosCompletos[campo]);

    if (camposFaltantes.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos para actualización completa',
        code: 'MISSING_REQUIRED_FIELDS',
        campos_faltantes: camposFaltantes
      });
    }

    // Actualizar todos los campos de la familia
    const updateQuery = `
      UPDATE familias SET
        apellido_familiar = $1,
        sector = $2,
        direccion_familia = $3,
        numero_contacto = $4,
        telefono = $5,
        email = $6,
        "tamaño_familia" = $7,
        tipo_vivienda = $8,
        estado_encuesta = $9,
        "comunionEnCasa" = $10,
        tutor_responsable = $11,
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
        // Convertir tutor_responsable a boolean - si viene como string, convertir a true/false
        typeof datosCompletos.tutor_responsable === 'string' ? 
          datosCompletos.tutor_responsable.trim() !== '' && datosCompletos.tutor_responsable.toLowerCase() !== 'false' : 
          (datosCompletos.tutor_responsable || false),
        id
      ],
      type: QueryTypes.UPDATE,
      transaction
    });

    console.log('✅ UPDATE ejecutado correctamente');

    // Obtener los datos actualizados
    const familiaActualizada = await sequelize.query(
      `SELECT 
        id_familia,
        apellido_familiar,
        sector,
        direccion_familia,
        numero_contacto,
        telefono,
        email,
        "tamaño_familia",
        tipo_vivienda,
        estado_encuesta,
        tutor_responsable,
        "comunionEnCasa",
        fecha_ultima_encuesta
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

    res.status(200).json({
      exito: true,
      mensaje: 'Encuesta actualizada completamente',
      datos: familiaActualizada[0],
      metadata: {
        timestamp: new Date().toISOString(),
        operacion: 'PUT',
        registros_afectados: 1
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error actualizando encuesta completa:', error);

    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al actualizar la encuesta',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
      error_code: 'UPDATE_COMPLETE_ERROR'
    });
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

    res.status(200).json({
      status: 'success',
      mensaje: resultado.mensaje,
      datos: resultado.datos,
      total: resultado.total,
      filtros_aplicados: filtros,
      nota: 'Toda la información del request se preserva en el response'
    });

  } catch (error) {
    console.error('❌ Error en consultarFamiliasConPadresMadres:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Error al consultar familias con información completa',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
      error_code: 'CONSULTA_FAMILIAS_ERROR'
    });
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
