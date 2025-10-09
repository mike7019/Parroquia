import sequelize from '../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { Familias, Municipios, Parroquia, Sector, Veredas, Sexo, TipoIdentificacion, Persona } from '../models/index.js';
import DifuntosFamilia from '../models/catalog/DifuntosFamilia.js';
import crypto from 'crypto';
import FamiliasConsultasService from '../services/familiasConsultasService.js';
import { generarIdentificacionUnica } from '../middlewares/encuestaValidation.js';

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
 */
const registrarDisposicionBasuras = async (familiaId, disposicionBasuras, transaction) => {
  console.log('🗑️ Registrando disposición de basuras...');
  if (!disposicionBasuras) return;

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
        console.log(`  ⚠️ Error registrando ${tipo}: ${error.message}`);
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
    console.log(`  ⚠️ Error registrando sistema acueducto: ${error.message}`);
  }
};

/**
 * Registrar aguas residuales
 */
const registrarAguasResiduales = async (familiaId, aguasResiduales, transaction) => {
  console.log('🚰 Registrando aguas residuales...');
  if (!aguasResiduales) return;

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
    console.log(`  ⚠️ Error registrando aguas residuales: ${error.message}`);
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
    console.log(`  ⚠️ Error registrando tipo de vivienda: ${error.message}`);
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
      const profesionId = miembro.profesion?.id ? parseInt(miembro.profesion.id) : null;
      const comunidadCulturalId = miembro.comunidadCultural?.id ? parseInt(miembro.comunidadCultural.id) : null;

      const fechaNacimiento = miembro.fechaNacimiento || miembro.fecha_nacimiento;
      const identificacionUnica = await generarIdentificacionUnica('TEMP');
      
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
        id_sexo: sexoId,
        id_tipo_identificacion_tipo_identificacion: tipoIdentificacionId,
        id_estado_civil_estado_civil: estadoCivilId,
        id_parentesco: parentescoId, // ⭐ AGREGADO
        id_profesion: profesionId, // ⭐ AGREGADO
        id_comunidad_cultural: comunidadCulturalId, // ⭐ AGREGADO
        estudios: (miembro.estudio && typeof miembro.estudio === 'object') ? miembro.estudio.nombre : (miembro.estudio || null),
        en_que_eres_lider: miembro.en_que_eres_lider || null, // ⭐ CORREGIDO
        necesidad_enfermo: miembro.enfermedad?.nombre || null, // ⭐ CORREGIDO
        motivo_celebrar: miembro.motivoFechaCelebrar?.motivo || null, // ⭐ AGREGADO
        dia_celebrar: miembro.motivoFechaCelebrar?.dia ? parseInt(miembro.motivoFechaCelebrar.dia) : null, // ⭐ AGREGADO
        mes_celebrar: miembro.motivoFechaCelebrar?.mes ? parseInt(miembro.motivoFechaCelebrar.mes) : null, // ⭐ AGREGADO
        talla_camisa: miembro['talla_camisa/blusa'] || (miembro.talla ? miembro.talla.camisa : null),
        talla_pantalon: miembro.talla_pantalon || (miembro.talla ? miembro.talla.pantalon : null),
        talla_zapato: miembro.talla_zapato || (miembro.talla ? miembro.talla.calzado : null)
      };

      const persona = await Persona.create(personaData, { 
        transaction,
        fields: [
          'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
          'fecha_nacimiento', 'telefono', 'correo_electronico', 'identificacion',
          'direccion', 'id_familia_familias', 'id_sexo', 
          'id_tipo_identificacion_tipo_identificacion', 'id_estado_civil_estado_civil',
          'id_parentesco', 'id_profesion', 'id_comunidad_cultural',
          'estudios', 'en_que_eres_lider', 'necesidad_enfermo',
          'motivo_celebrar', 'dia_celebrar', 'mes_celebrar',
          'talla_camisa', 'talla_pantalon', 'talla_zapato'
        ]
      });
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
        }
      }
      
      // ========================================================================
      // PROCESAR HABILIDADES (relación muchos a muchos)
      // ========================================================================
      if (miembro.habilidades && Array.isArray(miembro.habilidades) && miembro.habilidades.length > 0) {
        console.log(`    💡 Procesando ${miembro.habilidades.length} habilidades...`);
        
        for (const habilidad of miembro.habilidades) {
          const habilidadId = typeof habilidad === 'object' ? habilidad.id : habilidad;
          
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
    try {
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
      console.error(`  ❌ Error registrando persona fallecida ${fallecido.nombres}:`, error.message);
    }
  }

  return personasFallecidas;
};

/**
 * Funciones de mapeo simplificadas
 */
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
        f.id_municipio,
        f.id_vereda,
        f.id_sector,
        f.id_parroquia,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        p.nombre as nombre_parroquia,
        tv.id_tipo_vivienda,
        tv.nombre as nombre_tipo_vivienda
      FROM familias f
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
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
        // Obtener personas VIVAS de la familia (excluir fallecidos)
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
            p.en_que_eres_lider,
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
            ti.codigo as tipo_id_codigo,
            sc.id_situacion_civil as estado_civil_id,
            sc.nombre as estado_civil_nombre
          FROM personas p
          LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
          LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
          LEFT JOIN situaciones_civiles sc ON p.id_estado_civil_estado_civil = sc.id_situacion_civil
          WHERE p.id_familia_familias = :familiaId 
          AND (p.identificacion NOT LIKE 'FALLECIDO%' OR p.identificacion IS NULL)
        `, {
          replacements: { familiaId: familiaData.id_familia },
          type: QueryTypes.SELECT
        });

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
            s.descripcion as sexo_descripcion,
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
              h.categoria,
              ph.nivel
            FROM persona_habilidad ph
            INNER JOIN habilidades h ON ph.id_habilidad = h.id_habilidad
            WHERE ph.id_persona = :personaId
            AND h.activo = true
            ORDER BY h.categoria, h.nombre
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
              descripcion: persona.sexo_descripcion
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
              categoria: h.categoria,
              nivel: h.nivel
            })),
            en_que_eres_lider: persona.en_que_eres_lider || null
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
              nombre: fallecido.sexo_descripcion || null
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
          
          // *** INFORMACIÓN DE VIVIENDA CON ID Y NOMBRE ***
          tipo_vivienda: tipoViviendaInfo,
          tamaño_familia: familiaData.tamaño_familia,
          
          // *** INFORMACIÓN GEOGRÁFICA COMPLETA CON ID Y NOMBRE ***
          sector: sectorInfo,
          municipio: municipioInfo,
          vereda: veredaInfo,
          parroquia: parroquiaInfo,
          // Removido: sector_especifico (no lo necesitas según indicaciones)
          
          // *** INFORMACIÓN DE SERVICIOS CON ID Y NOMBRE ***
          basuras: disposicionBasuras, // Siempre array, nunca null
          acueducto: sistemasAcueducto.length > 0 ? sistemasAcueducto[0] : null, // null cuando no hay información
          aguas_residuales: sistemasAguasResiduales.length > 0 ? sistemasAguasResiduales[0] : null, // null cuando no hay información
          
          // *** INFORMACIÓN RELIGIOSA ***
          comunion_en_casa: familiaData.comunionEnCasa,
          
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
        f.id_municipio,
        f.id_vereda,
        f.id_sector,
        f.id_parroquia,
        m.nombre_municipio,
        v.nombre as nombre_vereda,
        s.nombre as nombre_sector,
        p.nombre as nombre_parroquia,
        tv.id_tipo_vivienda,
        tv.nombre as nombre_tipo_vivienda
      FROM familias f
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      WHERE f.id_familia = :familiaId
    `;
    
    const [familiaData] = await sequelize.query(familiasQuery, {
      replacements: { familiaId: id },
      type: QueryTypes.SELECT
    });

    if (!familiaData) {
      console.log(`❌ Encuesta con ID ${id} no encontrada`);
      return res.status(404).json({
        status: 'error',
        message: 'Encuesta no encontrada',
        code: 'NOT_FOUND'
      });
    }

    console.log(`✅ Encuesta encontrada: ${familiaData.apellido_familiar}`);

    // Usar exactamente la misma lógica que obtenerEncuestas para una familia individual
    // Obtener personas VIVAS de la familia (excluir fallecidos)
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
        p.en_que_eres_lider,
        s.id_sexo as sexo_id,
        s.descripcion as sexo_descripcion,
        ti.id_tipo_identificacion as tipo_id_id,
        ti.nombre as tipo_id_nombre,
        ti.codigo as tipo_id_codigo,
        sc.id_situacion_civil as estado_civil_id,
        sc.nombre as estado_civil_nombre
      FROM personas p
      LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
      LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
      LEFT JOIN situaciones_civiles sc ON p.id_estado_civil_estado_civil = sc.id_situacion_civil
      WHERE p.id_familia_familias = :familiaId 
      AND (p.identificacion NOT LIKE 'FALLECIDO%' OR p.identificacion IS NULL)
    `, {
      replacements: { familiaId: familiaData.id_familia },
      type: QueryTypes.SELECT
    });

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
        s.descripcion as sexo_descripcion,
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
          h.categoria,
          ph.nivel
        FROM persona_habilidad ph
        INNER JOIN habilidades h ON ph.id_habilidad = h.id_habilidad
        WHERE ph.id_persona = :personaId
        AND h.activo = true
        ORDER BY h.categoria, h.nombre
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
          descripcion: persona.sexo_descripcion
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
          categoria: h.categoria,
          nivel: h.nivel
        })),
        en_que_eres_lider: persona.en_que_eres_lider || null
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
          nombre: fallecido.sexo_descripcion || null
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
      
      // *** INFORMACIÓN DE VIVIENDA CON ID Y NOMBRE ***
      tipo_vivienda: tipoViviendaInfo,
      tamaño_familia: familiaData.tamaño_familia,
      
      // *** INFORMACIÓN GEOGRÁFICA COMPLETA CON ID Y NOMBRE ***
      sector: sectorInfo,
      municipio: municipioInfo,
      vereda: veredaInfo,
      parroquia: parroquiaInfo,
      
      // *** INFORMACIÓN DE SERVICIOS CON ID Y NOMBRE ***
      basuras: disposicionBasuras, // Siempre array, nunca null
      acueducto: sistemasAcueducto.length > 0 ? sistemasAcueducto[0] : null, // null cuando no hay información
      aguas_residuales: sistemasAguasResiduales.length > 0 ? sistemasAguasResiduales[0] : null, // null cuando no hay información
      
      // *** INFORMACIÓN RELIGIOSA ***
      comunion_en_casa: familiaData.comunionEnCasa,
      
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

    res.status(200).json({
      status: 'success',
      message: 'Encuesta obtenida exitosamente',
      data: encuestaFormateada
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

    console.log('✅ Validaciones completadas por middlewares');
    console.log('🔍 DEBUG - informacionGeneral.parroquia:', JSON.stringify(informacionGeneral.parroquia, null, 2));
    console.log('🔍 DEBUG - parroquia ID extraído:', informacionGeneral.parroquia?.id);

    // 1. CREAR FAMILIA
    console.log('💾 Creando registro de familia...');
    
    const tamanioFamiliaCalculado = Math.max(1, (familyMembers.length || 0) + (deceasedMembers.length || 0));
    
    // DEBUG: Log para verificar valores de ID geográficos
    console.log('🌍 DEBUG - Valores geográficos a guardar:');
    console.log('  id_municipio:', informacionGeneral.municipio?.id ? parseInt(informacionGeneral.municipio.id) : null);
    console.log('  id_parroquia:', informacionGeneral.parroquia?.id ? parseInt(informacionGeneral.parroquia.id) : null);
    console.log('  id_sector:', informacionGeneral.sector?.id ? parseInt(informacionGeneral.sector.id) : null);
    console.log('  id_vereda:', informacionGeneral.vereda?.id ? parseInt(informacionGeneral.vereda.id) : null);
    
    const familiaData = {
      apellido_familiar: informacionGeneral.apellido_familiar,
      sector: (typeof informacionGeneral.sector === 'object' && informacionGeneral.sector !== null) 
        ? (informacionGeneral.sector.nombre || 'General') 
        : (informacionGeneral.sector || 'General'),
      direccion_familia: informacionGeneral.direccion,
      telefono: informacionGeneral.telefono,
      email: informacionGeneral.email || null,
      tamaño_familia: tamanioFamiliaCalculado,
      tipo_vivienda: vivienda.tipo_vivienda?.nombre || vivienda.tipo_vivienda || 'Casa', // Campo de texto legacy
      id_tipo_vivienda: vivienda.tipo_vivienda?.id ? parseInt(vivienda.tipo_vivienda.id) : null, // FK correcta
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: new Date().toISOString().split('T')[0],
      fecha_encuesta: informacionGeneral.fecha || new Date().toISOString().split('T')[0], // Fecha de registro
      codigo_familia: `FAM_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      tutor_responsable: null,
      id_municipio: informacionGeneral.municipio?.id ? parseInt(informacionGeneral.municipio.id) : null,
      id_parroquia: informacionGeneral.parroquia?.id ? parseInt(informacionGeneral.parroquia.id) : null,
      id_vereda: informacionGeneral.vereda?.id ? parseInt(informacionGeneral.vereda.id) : null,
      id_sector: informacionGeneral.sector?.id ? parseInt(informacionGeneral.sector.id) : null,
      comunionEnCasa: informacionGeneral.comunionEnCasa || false,
      
      // CAMPOS BOOLEANOS DE SERVICIOS DE AGUA
      pozo_septico: servicios_agua?.pozo_septico || false,
      letrina: servicios_agua?.letrina || false,
      campo_abierto: servicios_agua?.campo_abierto || false,
      
      // CAMPOS BOOLEANOS DE DISPOSICIÓN DE BASURAS
      disposicion_recolector: vivienda?.disposicion_basuras?.recolector || false,
      disposicion_quemada: vivienda?.disposicion_basuras?.quemada || false,
      disposicion_enterrada: vivienda?.disposicion_basuras?.enterrada || false,
      disposicion_recicla: vivienda?.disposicion_basuras?.recicla || false,
      disposicion_aire_libre: vivienda?.disposicion_basuras?.aire_libre || false
    };

    console.log('🔍 DEBUG - familiaData a guardar:', JSON.stringify({
      id_municipio: familiaData.id_municipio,
      id_parroquia: familiaData.id_parroquia,
      id_vereda: familiaData.id_vereda,
      id_sector: familiaData.id_sector
    }, null, 2));

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
    
    // DEBUG: Verificar qué se guardó realmente
    console.log('🔍 DEBUG - Familia guardada en BD:', JSON.stringify({
      id_familia: familia.id_familia,
      id_municipio: familia.id_municipio,
      id_parroquia: familia.id_parroquia,
      id_sector: familia.id_sector,
      id_vereda: familia.id_vereda
    }, null, 2));
    
    // DEBUG ADICIONAL: Verificar objeto completo de familia retornado por Sequelize
    console.log('🔍 DEBUG - Familia objeto completo:', familia.toJSON ? JSON.stringify(familia.toJSON(), null, 2) : 'No toJSON available');
    
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
    console.log('❌ ERROR CAPTURADO - VERIFICANDO ESTADO DE TRANSACCIÓN');
    
    try {
      if (transaction && !transaction.finished) {
        console.log('❌ Transacción activa - Iniciando rollback');
        await transaction.rollback();
        console.log('❌ ROLLBACK COMPLETADO');
      }
    } catch (rollbackError) {
      console.log('❌ Error durante rollback:', rollbackError.message);
    }
    
    console.error('❌ Error procesando encuesta:', error);

    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor al procesar la encuesta',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
        error_code: 'ENCUESTA_PROCESSING_ERROR'
      });
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
      return res.status(500).json({
        status: 'error',
        message: 'No se pudo eliminar la encuesta',
        code: 'DELETE_FAILED'
      });
    }

    await transaction.commit();
    console.log('✅ Eliminación completada exitosamente');

    res.status(200).json({
      status: 'success',
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
 */
export const actualizarCamposEncuesta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const camposValidos = req.camposValidos; // Viene del middleware

    console.log(`🔄 Actualizando campos específicos de encuesta ID: ${id}`);
    console.log('📝 Campos a actualizar:', Object.keys(camposValidos));

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
