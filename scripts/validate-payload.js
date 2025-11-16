import sequelize from '../config/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * Script para validar y enriquecer un payload de encuesta
 * Valida IDs contra la base de datos y genera un reporte detallado
 */

const payload = {
  "informacionGeneral": {
    "municipio": {
      "id": 1110,
      "nombre": "Yolombó"
    },
    "parroquia": {
      "id": 3,
      "nombre": "Jesús Crucificado"
    },
    "sector": {
      "id": 28,
      "nombre": "CENTRAL 3"
    },
    "vereda": {
      "id": 13,
      "nombre": "ALTO DE MENDEZ"
    },
    "corregimiento": {
      "id": 6,
      "nombre": "Corregimiento San Mike"
    },
    "centro_poblado": {
      "id": 8,
      "nombre": "demo"
    },
    "fecha": "2025-11-09T03:32:17.404Z",
    "apellido_familiar": "Rodriguez Gacha",
    "direccion": "calle 55 # 32-27",
    "telefono": "4339153",
    "numero_contrato_epm": "555748157"
  },
  "vivienda": {
    "tipo_vivienda": {
      "id": 2,
      "nombre": "Apartamento"
    },
    "disposicion_basuras": [
      {
        "id": 5,
        "nombre": "Campo Abierto",
        "seleccionado": true
      },
      {
        "id": 7,
        "nombre": "Compostaje",
        "seleccionado": false
      },
      {
        "id": 3,
        "nombre": "Entierro",
        "seleccionado": false
      },
      {
        "id": 2,
        "nombre": "Quema",
        "seleccionado": true
      },
      {
        "id": 6,
        "nombre": "Reciclaje",
        "seleccionado": false
      },
      {
        "id": 1,
        "nombre": "Recolección Pública",
        "seleccionado": true
      },
      {
        "id": 4,
        "nombre": "Río o Quebrada",
        "seleccionado": false
      }
    ]
  },
  "servicios_agua": {
    "sistema_acueducto": {
      "id": 1,
      "nombre": "Acueducto Público"
    },
    "aguas_residuales": [
      {
        "id": 1,
        "nombre": "Alcantarillado Público",
        "seleccionado": true
      },
      {
        "id": 2,
        "nombre": "Pozo Séptico",
        "seleccionado": true
      },
      {
        "id": 3,
        "nombre": "Letrina",
        "seleccionado": false
      },
      {
        "id": 4,
        "nombre": "Campo Abierto",
        "seleccionado": false
      },
      {
        "id": 5,
        "nombre": "Río o Quebrada",
        "seleccionado": false
      },
      {
        "id": 6,
        "nombre": "tipo prueba 8",
        "seleccionado": true
      }
    ]
  },
  "observaciones": {
    "sustento_familia": "tma nuevo pruiebs",
    "observaciones_encuestador": "completedooo",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "Raquel Rodriguez Gacha",
      "fechaNacimiento": "2000-11-01T00:00:00.000Z",
      "tipoIdentificacion": {
        "id": 1,
        "nombre": "CC - Cédula de Ciudadanía"
      },
      "numeroIdentificacion": "55888447775",
      "sexo": {
        "id": 2,
        "nombre": "Femenino"
      },
      "situacionCivil": {
        "id": 1,
        "nombre": "Soltero(a)"
      },
      "parentesco": {
        "id": 2,
        "nombre": "Jefa de Hogar"
      },
      "talla_camisa": "12",
      "talla_pantalon": "28",
      "talla_zapato": "37",
      "estudio": {
        "id": 5,
        "nombre": "Bachillerato Incompleto"
      },
      "comunidadCultural": {
        "id": 9,
        "nombre": "Afrocolombiano"
      },
      "telefono": "3013445333",
      "enQueEresLider": [
        "mmm",
        "todo",
        "nada"
      ],
      "correoElectronico": "raquel.1762312461034@gmail.com",
      "enfermedades": [
        {
          "id": 2,
          "nombre": "Diabetes tipo 2"
        },
        {
          "id": 5,
          "nombre": "Obesidad"
        }
      ],
      "necesidadesEnfermo": [
        "pasajes",
        "medicamentos"
      ],
      "solicitudComunionCasa": true,
      "profesionMotivoFechaCelebrar": {
        "profesion": {
          "id": 1,
          "nombre": "Agricultor"
        },
        "celebraciones": [
          {
            "motivo": "Cumpleaños",
            "dia": "12",
            "mes": "11"
          },
          {
            "motivo": "Dia de la madre",
            "dia": "8",
            "mes": "5"
          }
        ]
      },
      "habilidades": [
        {
          "id": 1,
          "nombre": "Liderazgo",
          "nivel": "Avanzado"
        },
        {
          "id": 8,
          "nombre": "Creatividad",
          "nivel": "Avanzado"
        }
      ],
      "destrezas": [
        {
          "id": 9,
          "nombre": "Diseño Gráfico"
        },
        {
          "id": 5,
          "nombre": "Costura"
        },
        {
          "id": 3,
          "nombre": "Electricidad"
        }
      ]
    }
  ],
  "deceasedMembers": [
    {
      "nombres": "Juan Camilo Rodriguez Gacha",
      "fechaFallecimiento": "2025-11-28T05:00:00.000Z",
      "sexo": {
        "id": 1,
        "nombre": "Masculino"
      },
      "parentesco": {
        "id": 41,
        "nombre": "Ahijado"
      },
      "causaFallecimiento": "nmmnmnnmnmnmnmn"
    }
  ],
  "metadata": {
    "timestamp": "2025-11-09T04:06:36.092Z",
    "completed": false,
    "currentStage": 6
  },
  "version": "2.0"
};

const validationReport = {
  valid: true,
  errors: [],
  warnings: [],
  validatedFields: {},
  enrichedPayload: null
};

/**
 * Validar un ID contra una tabla de la base de datos
 */
async function validateCatalogId(tableName, idColumn, nameColumn, id, currentName) {
  try {
    const query = `SELECT ${idColumn} as id, ${nameColumn} as nombre FROM ${tableName} WHERE ${idColumn} = :id LIMIT 1`;
    const result = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length > 0) {
      const dbRecord = result[0];
      return {
        exists: true,
        id: dbRecord.id,
        nombre: dbRecord.nombre,
        match: dbRecord.nombre.toLowerCase().trim() === currentName.toLowerCase().trim()
      };
    } else {
      return {
        exists: false,
        id,
        nombre: currentName,
        suggestion: null
      };
    }
  } catch (error) {
    return {
      exists: false,
      error: error.message,
      id,
      nombre: currentName
    };
  }
}

/**
 * Buscar una alternativa por nombre
 */
async function findByName(tableName, idColumn, nameColumn, name) {
  try {
    const query = `SELECT ${idColumn} as id, ${nameColumn} as nombre FROM ${tableName} WHERE LOWER(${nameColumn}) LIKE LOWER(:name) LIMIT 5`;
    const result = await sequelize.query(query, {
      replacements: { name: `%${name}%` },
      type: QueryTypes.SELECT
    });

    return result;
  } catch (error) {
    return [];
  }
}

/**
 * Validar correo electrónico
 */
function validateEmail(email) {
  if (!email) return { valid: false, message: 'Email vacío' };
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, normalized: trimmed, message: 'Formato de email inválido' };
  }
  
  return { valid: true, normalized: trimmed, message: 'Email válido' };
}

/**
 * Función principal de validación
 */
async function validatePayload() {
  console.log('🔍 Iniciando validación del payload...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    process.exit(1);
  }

  const enrichedPayload = JSON.parse(JSON.stringify(payload)); // Deep copy

  // ============================================================================
  // VALIDAR INFORMACIÓN GENERAL - CATÁLOGOS GEOGRÁFICOS
  // ============================================================================
  console.log('📍 Validando información geográfica...');

  // Municipio
  const municipioValidation = await validateCatalogId(
    'municipios',
    'id_municipio',
    'nombre_municipio',
    payload.informacionGeneral.municipio.id,
    payload.informacionGeneral.municipio.nombre
  );
  
  if (!municipioValidation.exists) {
    validationReport.errors.push({
      field: 'informacionGeneral.municipio.id',
      value: payload.informacionGeneral.municipio.id,
      message: `Municipio con ID ${payload.informacionGeneral.municipio.id} no existe en la base de datos`,
      suggestion: await findByName('municipios', 'id_municipio', 'nombre_municipio', payload.informacionGeneral.municipio.nombre)
    });
    validationReport.valid = false;
  } else {
    enrichedPayload.informacionGeneral.municipio = {
      ...enrichedPayload.informacionGeneral.municipio,
      exists: true,
      nombre_db: municipioValidation.nombre,
      match: municipioValidation.match
    };
    console.log(`  ✅ Municipio ID ${payload.informacionGeneral.municipio.id}: ${municipioValidation.nombre}`);
  }

  // Parroquia
  const parroquiaValidation = await validateCatalogId(
    'parroquia',
    'id_parroquia',
    'nombre',
    payload.informacionGeneral.parroquia.id,
    payload.informacionGeneral.parroquia.nombre
  );
  
  if (!parroquiaValidation.exists) {
    validationReport.errors.push({
      field: 'informacionGeneral.parroquia.id',
      value: payload.informacionGeneral.parroquia.id,
      message: `Parroquia con ID ${payload.informacionGeneral.parroquia.id} no existe en la base de datos`,
      suggestion: await findByName('parroquia', 'id_parroquia', 'nombre', payload.informacionGeneral.parroquia.nombre)
    });
    validationReport.valid = false;
  } else {
    enrichedPayload.informacionGeneral.parroquia = {
      ...enrichedPayload.informacionGeneral.parroquia,
      exists: true,
      nombre_db: parroquiaValidation.nombre,
      match: parroquiaValidation.match
    };
    console.log(`  ✅ Parroquia ID ${payload.informacionGeneral.parroquia.id}: ${parroquiaValidation.nombre}`);
  }

  // Sector
  const sectorValidation = await validateCatalogId(
    'sectores',
    'id_sector',
    'nombre',
    payload.informacionGeneral.sector.id,
    payload.informacionGeneral.sector.nombre
  );
  
  if (!sectorValidation.exists) {
    validationReport.errors.push({
      field: 'informacionGeneral.sector.id',
      value: payload.informacionGeneral.sector.id,
      message: `Sector con ID ${payload.informacionGeneral.sector.id} no existe en la base de datos`,
      suggestion: await findByName('sectores', 'id_sector', 'nombre', payload.informacionGeneral.sector.nombre)
    });
    validationReport.valid = false;
  } else {
    enrichedPayload.informacionGeneral.sector = {
      ...enrichedPayload.informacionGeneral.sector,
      exists: true,
      nombre_db: sectorValidation.nombre,
      match: sectorValidation.match
    };
    console.log(`  ✅ Sector ID ${payload.informacionGeneral.sector.id}: ${sectorValidation.nombre}`);
  }

  // Vereda
  const veredaValidation = await validateCatalogId(
    'veredas',
    'id_vereda',
    'nombre',
    payload.informacionGeneral.vereda.id,
    payload.informacionGeneral.vereda.nombre
  );
  
  if (!veredaValidation.exists) {
    validationReport.errors.push({
      field: 'informacionGeneral.vereda.id',
      value: payload.informacionGeneral.vereda.id,
      message: `Vereda con ID ${payload.informacionGeneral.vereda.id} no existe en la base de datos`,
      suggestion: await findByName('veredas', 'id_vereda', 'nombre', payload.informacionGeneral.vereda.nombre)
    });
    validationReport.valid = false;
  } else {
    enrichedPayload.informacionGeneral.vereda = {
      ...enrichedPayload.informacionGeneral.vereda,
      exists: true,
      nombre_db: veredaValidation.nombre,
      match: veredaValidation.match
    };
    console.log(`  ✅ Vereda ID ${payload.informacionGeneral.vereda.id}: ${veredaValidation.nombre}`);
  }

  // Corregimiento
  const corregimientoValidation = await validateCatalogId(
    'corregimientos',
    'id_corregimiento',
    'nombre',
    payload.informacionGeneral.corregimiento.id,
    payload.informacionGeneral.corregimiento.nombre
  );
  
  if (!corregimientoValidation.exists) {
    validationReport.errors.push({
      field: 'informacionGeneral.corregimiento.id',
      value: payload.informacionGeneral.corregimiento.id,
      message: `Corregimiento con ID ${payload.informacionGeneral.corregimiento.id} no existe en la base de datos`,
      suggestion: await findByName('corregimientos', 'id_corregimiento', 'nombre', payload.informacionGeneral.corregimiento.nombre)
    });
    validationReport.valid = false;
  } else {
    enrichedPayload.informacionGeneral.corregimiento = {
      ...enrichedPayload.informacionGeneral.corregimiento,
      exists: true,
      nombre_db: corregimientoValidation.nombre,
      match: corregimientoValidation.match
    };
    console.log(`  ✅ Corregimiento ID ${payload.informacionGeneral.corregimiento.id}: ${corregimientoValidation.nombre}`);
  }

  // Centro Poblado
  const centroPobladoValidation = await validateCatalogId(
    'centros_poblados',
    'id_centro_poblado',
    'nombre',
    payload.informacionGeneral.centro_poblado.id,
    payload.informacionGeneral.centro_poblado.nombre
  );
  
  if (!centroPobladoValidation.exists) {
    validationReport.errors.push({
      field: 'informacionGeneral.centro_poblado.id',
      value: payload.informacionGeneral.centro_poblado.id,
      message: `Centro Poblado con ID ${payload.informacionGeneral.centro_poblado.id} no existe en la base de datos`,
      suggestion: await findByName('centros_poblados', 'id_centro_poblado', 'nombre', payload.informacionGeneral.centro_poblado.nombre)
    });
    validationReport.valid = false;
  } else {
    enrichedPayload.informacionGeneral.centro_poblado = {
      ...enrichedPayload.informacionGeneral.centro_poblado,
      exists: true,
      nombre_db: centroPobladoValidation.nombre,
      match: centroPobladoValidation.match
    };
    console.log(`  ✅ Centro Poblado ID ${payload.informacionGeneral.centro_poblado.id}: ${centroPobladoValidation.nombre}`);
  }

  // ============================================================================
  // VALIDAR VIVIENDA
  // ============================================================================
  console.log('\n🏠 Validando información de vivienda...');

  // Tipo de vivienda
  const tipoViviendaValidation = await validateCatalogId(
    'tipos_vivienda',
    'id_tipo_vivienda',
    'nombre',
    payload.vivienda.tipo_vivienda.id,
    payload.vivienda.tipo_vivienda.nombre
  );
  
  if (!tipoViviendaValidation.exists) {
    validationReport.errors.push({
      field: 'vivienda.tipo_vivienda.id',
      value: payload.vivienda.tipo_vivienda.id,
      message: `Tipo de vivienda con ID ${payload.vivienda.tipo_vivienda.id} no existe en la base de datos`
    });
    validationReport.valid = false;
  } else {
    enrichedPayload.vivienda.tipo_vivienda = {
      ...enrichedPayload.vivienda.tipo_vivienda,
      exists: true,
      nombre_db: tipoViviendaValidation.nombre,
      match: tipoViviendaValidation.match
    };
    console.log(`  ✅ Tipo Vivienda ID ${payload.vivienda.tipo_vivienda.id}: ${tipoViviendaValidation.nombre}`);
  }

  // Disposición de basuras
  console.log('\n  🗑️ Validando disposición de basuras...');
  for (let i = 0; i < payload.vivienda.disposicion_basuras.length; i++) {
    const basura = payload.vivienda.disposicion_basuras[i];
    const validation = await validateCatalogId(
      'tipos_disposicion_basura',
      'id_tipo_disposicion_basura',
      'nombre',
      basura.id,
      basura.nombre
    );
    
    if (!validation.exists) {
      validationReport.errors.push({
        field: `vivienda.disposicion_basuras[${i}].id`,
        value: basura.id,
        message: `Disposición de basura con ID ${basura.id} no existe en la base de datos`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.vivienda.disposicion_basuras[i] = {
        ...enrichedPayload.vivienda.disposicion_basuras[i],
        exists: true,
        nombre_db: validation.nombre,
        match: validation.match
      };
      console.log(`    ✅ Disposición basura ID ${basura.id}: ${validation.nombre}`);
    }
  }

  // ============================================================================
  // VALIDAR SERVICIOS DE AGUA
  // ============================================================================
  console.log('\n💧 Validando servicios de agua...');

  // Sistema de acueducto
  const acueductoValidation = await validateCatalogId(
    'sistemas_acueducto',
    'id_sistema_acueducto',
    'nombre',
    payload.servicios_agua.sistema_acueducto.id,
    payload.servicios_agua.sistema_acueducto.nombre
  );
  
  if (!acueductoValidation.exists) {
    validationReport.errors.push({
      field: 'servicios_agua.sistema_acueducto.id',
      value: payload.servicios_agua.sistema_acueducto.id,
      message: `Sistema de acueducto con ID ${payload.servicios_agua.sistema_acueducto.id} no existe en la base de datos`
    });
    validationReport.valid = false;
  } else {
    enrichedPayload.servicios_agua.sistema_acueducto = {
      ...enrichedPayload.servicios_agua.sistema_acueducto,
      exists: true,
      nombre_db: acueductoValidation.nombre,
      match: acueductoValidation.match
    };
    console.log(`  ✅ Sistema Acueducto ID ${payload.servicios_agua.sistema_acueducto.id}: ${acueductoValidation.nombre}`);
  }

  // Aguas residuales
  console.log('\n  🚰 Validando aguas residuales...');
  for (let i = 0; i < payload.servicios_agua.aguas_residuales.length; i++) {
    const aguaResidual = payload.servicios_agua.aguas_residuales[i];
    const validation = await validateCatalogId(
      'tipos_aguas_residuales',
      'id_tipo_aguas_residuales',
      'nombre',
      aguaResidual.id,
      aguaResidual.nombre
    );
    
    if (!validation.exists) {
      validationReport.errors.push({
        field: `servicios_agua.aguas_residuales[${i}].id`,
        value: aguaResidual.id,
        message: `Tipo de aguas residuales con ID ${aguaResidual.id} no existe en la base de datos`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.servicios_agua.aguas_residuales[i] = {
        ...enrichedPayload.servicios_agua.aguas_residuales[i],
        exists: true,
        nombre_db: validation.nombre,
        match: validation.match
      };
      console.log(`    ✅ Aguas residuales ID ${aguaResidual.id}: ${validation.nombre}`);
    }
  }

  // ============================================================================
  // VALIDAR MIEMBROS DE LA FAMILIA
  // ============================================================================
  console.log('\n👥 Validando miembros de la familia...');

  for (let i = 0; i < payload.familyMembers.length; i++) {
    const miembro = payload.familyMembers[i];
    console.log(`\n  Miembro ${i + 1}: ${miembro.nombres}`);

    // Tipo de identificación
    const tipoIdValidation = await validateCatalogId(
      'tipo_identificacion',
      'id_tipo_identificacion',
      'nombre',
      miembro.tipoIdentificacion.id,
      miembro.tipoIdentificacion.nombre
    );
    
    if (!tipoIdValidation.exists) {
      validationReport.errors.push({
        field: `familyMembers[${i}].tipoIdentificacion.id`,
        value: miembro.tipoIdentificacion.id,
        message: `Tipo de identificación con ID ${miembro.tipoIdentificacion.id} no existe`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.familyMembers[i].tipoIdentificacion = {
        ...enrichedPayload.familyMembers[i].tipoIdentificacion,
        exists: true,
        nombre_db: tipoIdValidation.nombre,
        match: tipoIdValidation.match
      };
      console.log(`    ✅ Tipo ID: ${tipoIdValidation.nombre}`);
    }

    // Sexo
    const sexoValidation = await validateCatalogId(
      'sexos',
      'id_sexo',
      'nombre',
      miembro.sexo.id,
      miembro.sexo.nombre
    );
    
    if (!sexoValidation.exists) {
      validationReport.errors.push({
        field: `familyMembers[${i}].sexo.id`,
        value: miembro.sexo.id,
        message: `Sexo con ID ${miembro.sexo.id} no existe`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.familyMembers[i].sexo = {
        ...enrichedPayload.familyMembers[i].sexo,
        exists: true,
        nombre_db: sexoValidation.nombre,
        match: sexoValidation.match
      };
      console.log(`    ✅ Sexo: ${sexoValidation.nombre}`);
    }

    // Estado civil
    const estadoCivilValidation = await validateCatalogId(
      'estado_civil',
      'id_estado_civil',
      'nombre',
      miembro.situacionCivil.id,
      miembro.situacionCivil.nombre
    );
    
    if (!estadoCivilValidation.exists) {
      validationReport.errors.push({
        field: `familyMembers[${i}].situacionCivil.id`,
        value: miembro.situacionCivil.id,
        message: `Estado civil con ID ${miembro.situacionCivil.id} no existe`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.familyMembers[i].situacionCivil = {
        ...enrichedPayload.familyMembers[i].situacionCivil,
        exists: true,
        nombre_db: estadoCivilValidation.nombre,
        match: estadoCivilValidation.match
      };
      console.log(`    ✅ Estado civil: ${estadoCivilValidation.nombre}`);
    }

    // Parentesco
    const parentescoValidation = await validateCatalogId(
      'parentescos',
      'id_parentesco',
      'nombre',
      miembro.parentesco.id,
      miembro.parentesco.nombre
    );
    
    if (!parentescoValidation.exists) {
      validationReport.errors.push({
        field: `familyMembers[${i}].parentesco.id`,
        value: miembro.parentesco.id,
        message: `Parentesco con ID ${miembro.parentesco.id} no existe`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.familyMembers[i].parentesco = {
        ...enrichedPayload.familyMembers[i].parentesco,
        exists: true,
        nombre_db: parentescoValidation.nombre,
        match: parentescoValidation.match
      };
      console.log(`    ✅ Parentesco: ${parentescoValidation.nombre}`);
    }

    // Estudio (nivel educativo)
    const estudioValidation = await validateCatalogId(
      'niveles_educativos',
      'id_niveles_educativos',
      'nivel',
      miembro.estudio.id,
      miembro.estudio.nombre
    );
    
    if (!estudioValidation.exists) {
      validationReport.errors.push({
        field: `familyMembers[${i}].estudio.id`,
        value: miembro.estudio.id,
        message: `Nivel educativo con ID ${miembro.estudio.id} no existe`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.familyMembers[i].estudio = {
        ...enrichedPayload.familyMembers[i].estudio,
        exists: true,
        nombre_db: estudioValidation.nombre,
        match: estudioValidation.match
      };
      console.log(`    ✅ Nivel educativo: ${estudioValidation.nombre}`);
    }

    // Comunidad cultural
    const comunidadValidation = await validateCatalogId(
      'comunidades_culturales',
      'id_comunidad_cultural',
      'nombre',
      miembro.comunidadCultural.id,
      miembro.comunidadCultural.nombre
    );
    
    if (!comunidadValidation.exists) {
      validationReport.errors.push({
        field: `familyMembers[${i}].comunidadCultural.id`,
        value: miembro.comunidadCultural.id,
        message: `Comunidad cultural con ID ${miembro.comunidadCultural.id} no existe`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.familyMembers[i].comunidadCultural = {
        ...enrichedPayload.familyMembers[i].comunidadCultural,
        exists: true,
        nombre_db: comunidadValidation.nombre,
        match: comunidadValidation.match
      };
      console.log(`    ✅ Comunidad cultural: ${comunidadValidation.nombre}`);
    }

    // Correo electrónico
    const emailValidation = validateEmail(miembro.correoElectronico);
    if (!emailValidation.valid) {
      validationReport.warnings.push({
        field: `familyMembers[${i}].correoElectronico`,
        value: miembro.correoElectronico,
        message: emailValidation.message
      });
      console.log(`    ⚠️ Email inválido: ${miembro.correoElectronico}`);
    } else {
      enrichedPayload.familyMembers[i].correoElectronico = emailValidation.normalized;
      console.log(`    ✅ Email válido: ${emailValidation.normalized}`);
    }

    // Enfermedades
    if (miembro.enfermedades && miembro.enfermedades.length > 0) {
      console.log(`    🏥 Validando ${miembro.enfermedades.length} enfermedades...`);
      for (let j = 0; j < miembro.enfermedades.length; j++) {
        const enfermedad = miembro.enfermedades[j];
        const validation = await validateCatalogId(
          'enfermedades',
          'id_enfermedad',
          'nombre',
          enfermedad.id,
          enfermedad.nombre
        );
        
        if (!validation.exists) {
          validationReport.errors.push({
            field: `familyMembers[${i}].enfermedades[${j}].id`,
            value: enfermedad.id,
            message: `Enfermedad con ID ${enfermedad.id} no existe`
          });
          validationReport.valid = false;
        } else {
          enrichedPayload.familyMembers[i].enfermedades[j] = {
            ...enrichedPayload.familyMembers[i].enfermedades[j],
            exists: true,
            nombre_db: validation.nombre,
            match: validation.match
          };
          console.log(`      ✅ Enfermedad: ${validation.nombre}`);
        }
      }
    }

    // Profesión
    if (miembro.profesionMotivoFechaCelebrar && miembro.profesionMotivoFechaCelebrar.profesion) {
      const profesionValidation = await validateCatalogId(
        'profesiones',
        'id_profesion',
        'nombre',
        miembro.profesionMotivoFechaCelebrar.profesion.id,
        miembro.profesionMotivoFechaCelebrar.profesion.nombre
      );
      
      if (!profesionValidation.exists) {
        validationReport.errors.push({
          field: `familyMembers[${i}].profesionMotivoFechaCelebrar.profesion.id`,
          value: miembro.profesionMotivoFechaCelebrar.profesion.id,
          message: `Profesión con ID ${miembro.profesionMotivoFechaCelebrar.profesion.id} no existe`
        });
        validationReport.valid = false;
      } else {
        enrichedPayload.familyMembers[i].profesionMotivoFechaCelebrar.profesion = {
          ...enrichedPayload.familyMembers[i].profesionMotivoFechaCelebrar.profesion,
          exists: true,
          nombre_db: profesionValidation.nombre,
          match: profesionValidation.match
        };
        console.log(`    ✅ Profesión: ${profesionValidation.nombre}`);
      }
    }

    // Habilidades
    if (miembro.habilidades && miembro.habilidades.length > 0) {
      console.log(`    💡 Validando ${miembro.habilidades.length} habilidades...`);
      for (let j = 0; j < miembro.habilidades.length; j++) {
        const habilidad = miembro.habilidades[j];
        const validation = await validateCatalogId(
          'habilidades',
          'id_habilidad',
          'nombre',
          habilidad.id,
          habilidad.nombre
        );
        
        if (!validation.exists) {
          validationReport.errors.push({
            field: `familyMembers[${i}].habilidades[${j}].id`,
            value: habilidad.id,
            message: `Habilidad con ID ${habilidad.id} no existe`
          });
          validationReport.valid = false;
        } else {
          enrichedPayload.familyMembers[i].habilidades[j] = {
            ...enrichedPayload.familyMembers[i].habilidades[j],
            exists: true,
            nombre_db: validation.nombre,
            match: validation.match
          };
          console.log(`      ✅ Habilidad: ${validation.nombre}`);
        }
      }
    }

    // Destrezas
    if (miembro.destrezas && miembro.destrezas.length > 0) {
      console.log(`    🎯 Validando ${miembro.destrezas.length} destrezas...`);
      for (let j = 0; j < miembro.destrezas.length; j++) {
        const destreza = miembro.destrezas[j];
        const validation = await validateCatalogId(
          'destrezas',
          'id_destreza',
          'nombre',
          destreza.id,
          destreza.nombre
        );
        
        if (!validation.exists) {
          validationReport.errors.push({
            field: `familyMembers[${i}].destrezas[${j}].id`,
            value: destreza.id,
            message: `Destreza con ID ${destreza.id} no existe`
          });
          validationReport.valid = false;
        } else {
          enrichedPayload.familyMembers[i].destrezas[j] = {
            ...enrichedPayload.familyMembers[i].destrezas[j],
            exists: true,
            nombre_db: validation.nombre,
            match: validation.match
          };
          console.log(`      ✅ Destreza: ${validation.nombre}`);
        }
      }
    }
  }

  // ============================================================================
  // VALIDAR MIEMBROS FALLECIDOS
  // ============================================================================
  console.log('\n⚰️ Validando miembros fallecidos...');

  for (let i = 0; i < payload.deceasedMembers.length; i++) {
    const fallecido = payload.deceasedMembers[i];
    console.log(`\n  Fallecido ${i + 1}: ${fallecido.nombres}`);

    // Sexo
    const sexoValidation = await validateCatalogId(
      'sexos',
      'id_sexo',
      'nombre',
      fallecido.sexo.id,
      fallecido.sexo.nombre
    );
    
    if (!sexoValidation.exists) {
      validationReport.errors.push({
        field: `deceasedMembers[${i}].sexo.id`,
        value: fallecido.sexo.id,
        message: `Sexo con ID ${fallecido.sexo.id} no existe`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.deceasedMembers[i].sexo = {
        ...enrichedPayload.deceasedMembers[i].sexo,
        exists: true,
        nombre_db: sexoValidation.nombre,
        match: sexoValidation.match
      };
      console.log(`    ✅ Sexo: ${sexoValidation.nombre}`);
    }

    // Parentesco
    const parentescoValidation = await validateCatalogId(
      'parentescos',
      'id_parentesco',
      'nombre',
      fallecido.parentesco.id,
      fallecido.parentesco.nombre
    );
    
    if (!parentescoValidation.exists) {
      validationReport.errors.push({
        field: `deceasedMembers[${i}].parentesco.id`,
        value: fallecido.parentesco.id,
        message: `Parentesco con ID ${fallecido.parentesco.id} no existe`
      });
      validationReport.valid = false;
    } else {
      enrichedPayload.deceasedMembers[i].parentesco = {
        ...enrichedPayload.deceasedMembers[i].parentesco,
        exists: true,
        nombre_db: parentescoValidation.nombre,
        match: parentescoValidation.match
      };
      console.log(`    ✅ Parentesco: ${parentescoValidation.nombre}`);
    }
  }

  // ============================================================================
  // GENERAR REPORTE FINAL
  // ============================================================================
  validationReport.enrichedPayload = enrichedPayload;

  console.log('\n' + '='.repeat(80));
  console.log('📊 REPORTE DE VALIDACIÓN');
  console.log('='.repeat(80));

  if (validationReport.valid) {
    console.log('\n✅ ¡PAYLOAD VÁLIDO! Todos los IDs existen en la base de datos.');
  } else {
    console.log('\n❌ PAYLOAD INVÁLIDO. Se encontraron los siguientes errores:');
    console.log(`\n  Total de errores: ${validationReport.errors.length}`);
    
    validationReport.errors.forEach((error, index) => {
      console.log(`\n  Error ${index + 1}:`);
      console.log(`    Campo: ${error.field}`);
      console.log(`    Valor: ${error.value}`);
      console.log(`    Mensaje: ${error.message}`);
      
      if (error.suggestion && error.suggestion.length > 0) {
        console.log(`    Sugerencias:`);
        error.suggestion.forEach(sug => {
          console.log(`      - ID ${sug.id}: ${sug.nombre}`);
        });
      }
    });
  }

  if (validationReport.warnings.length > 0) {
    console.log(`\n⚠️ Advertencias (${validationReport.warnings.length}):`);
    validationReport.warnings.forEach((warning, index) => {
      console.log(`\n  Advertencia ${index + 1}:`);
      console.log(`    Campo: ${warning.field}`);
      console.log(`    Valor: ${warning.value}`);
      console.log(`    Mensaje: ${warning.message}`);
    });
  }

  // Guardar reporte en archivo
  const fs = await import('fs');
  const reportPath = './scripts/validation-report.json';
  const enrichedPath = './scripts/enriched-payload.json';

  await fs.promises.writeFile(reportPath, JSON.stringify(validationReport, null, 2));
  await fs.promises.writeFile(enrichedPath, JSON.stringify(enrichedPayload, null, 2));

  console.log('\n📁 Archivos generados:');
  console.log(`  - Reporte completo: ${reportPath}`);
  console.log(`  - Payload enriquecido: ${enrichedPath}`);

  await sequelize.close();
  console.log('\n✅ Validación completada. Conexión cerrada.');
}

// Ejecutar validación
validatePayload().catch(error => {
  console.error('\n❌ Error durante la validación:', error);
  process.exit(1);
});
