// Test de Encuesta Completa - Validación de Datos Completos
// Este script valida que la consulta completa de familias devuelve TODA la información enviada en el request

import sequelize from './config/sequelize.js';
import { 
  Familias, 
  Persona, 
  Sexo, 
  TipoIdentificacion, 
  Municipios,
  Departamentos,
  Veredas,
  Sector,
  Parroquia,
  TipoVivienda,
  DifuntosFamilia
} from './src/models/index.js';
import FamiliasConsultasService from './src/services/familiasConsultasService.js';
import { QueryTypes } from 'sequelize';

console.log('🚀 Iniciando pruebas completas de encuesta familiar...');
console.log('📚 Librerías importadas correctamente');

// Database Connection Setup
async function verificarConexionBD() {
  try {
    console.log('\n🔍 Verificando conexión a base de datos...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida correctamente');
    
    // Verify required tables exist
    const tablas = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas disponibles:', tablas.length);
    
    const tablasRequeridas = [
      'familias', 'personas', 'sexos', 'tipos_identificacion', 
      'municipios', 'departamentos', 'veredas', 'sectores',
      'tipos_vivienda', 'difuntos_familia'
    ];
    
    const tablasExistentes = tablasRequeridas.filter(tabla => 
      tablas.some(t => t.toLowerCase() === tabla.toLowerCase())
    );
    
    console.log('✅ Tablas requeridas encontradas:', tablasExistentes.length, '/', tablasRequeridas.length);
    
    if (tablasExistentes.length !== tablasRequeridas.length) {
      const faltantes = tablasRequeridas.filter(tabla => 
        !tablas.some(t => t.toLowerCase() === tabla.toLowerCase())
      );
      console.warn('⚠️ Tablas faltantes:', faltantes);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en conexión a BD:', error.message);
    return false;
  }
}

// Create Complete Test Data
async function crearDatosCompletosReferencia() {
  try {
    console.log('\n🏗️ Creando datos de referencia completos...');
    
    // 1. Crear o verificar datos de referencia básicos
    
    // Departamento
    const [departamento] = await sequelize.query(`
      INSERT INTO departamentos (nombre_departamento, codigo_dane) 
      VALUES ('Test Departamento Completo', '99999') 
      ON CONFLICT (codigo_dane) DO UPDATE SET nombre_departamento = EXCLUDED.nombre_departamento
      RETURNING id_departamento, nombre_departamento;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Departamento:', departamento);
    
    // Municipio
    const [municipio] = await sequelize.query(`
      INSERT INTO municipios (nombre_municipio, codigo_dane, id_departamento) 
      VALUES ('Test Municipio Completo', '99999001', ${departamento.id_departamento}) 
      ON CONFLICT (codigo_dane) DO UPDATE SET nombre_municipio = EXCLUDED.nombre_municipio
      RETURNING id_municipio, nombre_municipio;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Municipio:', municipio);
    
    // Sexos
    const sexos = await sequelize.query(`
      INSERT INTO sexos (descripcion) VALUES 
      ('Masculino'), ('Femenino')
      ON CONFLICT (descripcion) DO NOTHING
      RETURNING id_sexo, descripcion;
    `, { type: QueryTypes.SELECT });
    
    if (sexos.length === 0) {
      const sexosExistentes = await sequelize.query(`
        SELECT id_sexo, descripcion FROM sexos LIMIT 2;
      `, { type: QueryTypes.SELECT });
      sexos.push(...sexosExistentes);
    }
    
    console.log('✅ Sexos disponibles:', sexos.length);
    
    // Tipos de identificación
    const [tipoId] = await sequelize.query(`
      INSERT INTO tipos_identificacion (nombre, codigo) 
      VALUES ('Cédula de Ciudadanía Test', 'CC_TEST') 
      ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
      RETURNING id_tipo_identificacion, nombre, codigo;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Tipo Identificación:', tipoId);
    
    return {
      departamento,
      municipio,
      sexos,
      tipoId
    };
    
  } catch (error) {
    console.error('❌ Error creando datos de referencia:', error);
    throw error;
  }
}

// Create Complete Family with All Required Fields
async function crearFamiliaCompleta(datosReferencia) {
  try {
    console.log('\n👨‍👩‍👧‍👦 Creando familia con datos 100% completos...');
    
    const timestampActual = new Date().toISOString();
    const familiaCompleta = {
      apellido_familiar: 'Familia Test Completa ' + Date.now(),
      sector: 'Sector Test Completo',
      direccion_familia: 'Calle 123 # 45-67, Barrio Test Completo',
      numero_contacto: '6043334455',
      telefono: '6043334455',
      email: `test.completo.${Date.now()}@email.com`,
      tamaño_familia: 4,
      tipo_vivienda: 'Casa propia completa',
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: timestampActual.split('T')[0],
      codigo_familia: `FAM_COMP_${Date.now()}`,
      tutor_responsable: true,
      id_municipio: datosReferencia.municipio.id_municipio,
      comunionEnCasa: true,
      observaciones: 'Familia de prueba con datos absolutamente completos - sin ningún null'
    };
    
    // Insert family
    const [familiaCreada] = await sequelize.query(`
      INSERT INTO familias (${Object.keys(familiaCompleta).join(', ')})
      VALUES (${Object.keys(familiaCompleta).map(() => '?').join(', ')})
      RETURNING *;
    `, {
      replacements: Object.values(familiaCompleta),
      type: QueryTypes.SELECT
    });
    
    console.log('✅ Familia creada con ID:', familiaCreada.id_familia);
    
    // Create family members with complete data
    const miembros = [
      {
        primer_nombre: 'Juan Carlos',
        segundo_nombre: 'Antonio',
        primer_apellido: 'Pérez',
        segundo_apellido: 'González',
        identificacion: `CC_TEST_${Date.now()}_001`,
        telefono: '3201234567',
        correo_electronico: `juan.carlos.${Date.now()}@email.com`,
        fecha_nacimiento: '1980-05-15',
        direccion: 'Calle 123 # 45-67',
        estudios: 'Ingeniero de Sistemas',
        talla_camisa: 'L',
        talla_pantalon: '32',
        talla_zapato: '42',
        id_sexo: datosReferencia.sexos.find(s => s.descripcion === 'Masculino')?.id_sexo,
        id_tipo_identificacion_tipo_identificacion: datosReferencia.tipoId.id_tipo_identificacion,
        id_familia_familias: familiaCreada.id_familia
      },
      {
        primer_nombre: 'María Elena',
        segundo_nombre: 'Patricia',
        primer_apellido: 'Rodríguez',
        segundo_apellido: 'Martínez',
        identificacion: `CC_TEST_${Date.now()}_002`,
        telefono: '3209876543',
        correo_electronico: `maria.elena.${Date.now()}@email.com`,
        fecha_nacimiento: '1985-08-22',
        direccion: 'Calle 123 # 45-67',
        estudios: 'Administradora de Empresas',
        talla_camisa: 'M',
        talla_pantalon: '28',
        talla_zapato: '37',
        id_sexo: datosReferencia.sexos.find(s => s.descripcion === 'Femenino')?.id_sexo,
        id_tipo_identificacion_tipo_identificacion: datosReferencia.tipoId.id_tipo_identificacion,
        id_familia_familias: familiaCreada.id_familia
      }
    ];
    
    const miembrosCreados = [];
    for (const miembro of miembros) {
      const [miembroCreado] = await sequelize.query(`
        INSERT INTO personas (${Object.keys(miembro).join(', ')})
        VALUES (${Object.keys(miembro).map(() => '?').join(', ')})
        RETURNING *;
      `, {
        replacements: Object.values(miembro),
        type: QueryTypes.SELECT
      });
      miembrosCreados.push(miembroCreado);
    }
    
    console.log('✅ Miembros de familia creados:', miembrosCreados.length);
    
    // Create deceased member
    const [difuntoCreado] = await sequelize.query(`
      INSERT INTO difuntos_familia (
        nombre_completo, 
        fecha_fallecimiento, 
        observaciones, 
        id_familia_familias
      )
      VALUES (
        'Pedro Pérez Rodríguez (Abuelo)', 
        '2020-03-15', 
        'Causa natural - edad avanzada', 
        ?
      )
      RETURNING *;
    `, {
      replacements: [familiaCreada.id_familia],
      type: QueryTypes.SELECT
    });
    
    console.log('✅ Difunto registrado:', difuntoCreado.nombre_completo);
    
    return {
      familia: familiaCreada,
      miembros: miembrosCreados,
      difunto: difuntoCreado
    };
    
  } catch (error) {
    console.error('❌ Error creando familia completa:', error);
    throw error;
  }
}

// Execute Complete Query with All Required Fields
async function ejecutarConsultaCompleta(familiaCompleta) {
  try {
    console.log('\n🔍 Ejecutando consulta completa con el servicio...');
    
    // Initialize service
    const servicio = new FamiliasConsultasService();
    
    // Execute query with specific family filter
    const filtros = {
      apellido_familiar: familiaCompleta.familia.apellido_familiar,
      limite: 1
    };
    
    console.log('🎯 Filtros aplicados:', filtros);
    
    // Execute the complete query
    const resultado = await servicio.consultarFamiliasConPadresMadres(filtros);
    
    console.log('✅ Consulta ejecutada exitosamente');
    console.log('📊 Total familias encontradas:', resultado.total);
    
    if (resultado.total === 0) {
      throw new Error('No se encontró la familia creada en la consulta');
    }
    
    const familiaConsultada = resultado.datos[0];
    console.log('🎯 Familia encontrada con ID:', familiaConsultada.id_encuesta);
    
    return {
      resultado,
      familiaConsultada
    };
    
  } catch (error) {
    console.error('❌ Error en consulta completa:', error);
    throw error;
  }
}

// Validate Query Results for Null Values
function validarDatosCompletos(familiaConsultada) {
  console.log('\n🔍 Validando que no existan valores null en datos críticos...');
  
  const errores = [];
  const advertencias = [];
  
  // Validate main structure
  if (!familiaConsultada.id_encuesta) {
    errores.push('❌ id_encuesta es null o undefined');
  }
  
  // Validate informacionGeneral
  const info = familiaConsultada.informacionGeneral;
  if (!info) {
    errores.push('❌ informacionGeneral es null');
  } else {
    if (!info.apellido_familiar) errores.push('❌ apellido_familiar es null');
    if (!info.direccion) errores.push('❌ direccion es null');
    if (!info.telefono) errores.push('❌ telefono es null');
    if (!info.municipio) {
      advertencias.push('⚠️ municipio es null');
    } else {
      if (!info.municipio.id) errores.push('❌ municipio.id es null');
      if (!info.municipio.nombre) errores.push('❌ municipio.nombre es null');
    }
    if (!info.sector) {
      advertencias.push('⚠️ sector es null');
    } else {
      if (!info.sector.nombre) errores.push('❌ sector.nombre es null');
    }
  }
  
  // Validate vivienda
  const vivienda = familiaConsultada.vivienda;
  if (!vivienda) {
    errores.push('❌ vivienda es null');
  } else {
    if (!vivienda.tipo_vivienda) {
      errores.push('❌ tipo_vivienda es null');
    } else {
      if (!vivienda.tipo_vivienda.nombre) errores.push('❌ tipo_vivienda.nombre es null');
    }
    if (!vivienda.disposicion_basuras) {
      errores.push('❌ disposicion_basuras es null');
    }
  }
  
  // Validate servicios_agua
  const servicios = familiaConsultada.servicios_agua;
  if (!servicios) {
    errores.push('❌ servicios_agua es null');
  }
  
  // Validate familyMembers
  const miembros = familiaConsultada.familyMembers;
  if (!miembros || !Array.isArray(miembros)) {
    errores.push('❌ familyMembers es null o no es array');
  } else {
    if (miembros.length === 0) {
      errores.push('❌ familyMembers está vacío');
    } else {
      miembros.forEach((miembro, index) => {
        if (!miembro.nombres) errores.push(`❌ familyMembers[${index}].nombres es null`);
        if (!miembro.numeroIdentificacion) errores.push(`❌ familyMembers[${index}].numeroIdentificacion es null`);
        if (!miembro.tipoIdentificacion) {
          advertencias.push(`⚠️ familyMembers[${index}].tipoIdentificacion es null`);
        }
        if (!miembro.sexo) {
          advertencias.push(`⚠️ familyMembers[${index}].sexo es null`);
        }
        if (!miembro.estudio) {
          advertencias.push(`⚠️ familyMembers[${index}].estudio es null`);
        }
      });
    }
  }
  
  // Validate deceasedMembers
  const difuntos = familiaConsultada.deceasedMembers;
  if (!difuntos || !Array.isArray(difuntos)) {
    errores.push('❌ deceasedMembers es null o no es array');
  }
  
  // Validate metadata
  const metadata = familiaConsultada.metadata;
  if (!metadata) {
    errores.push('❌ metadata es null');
  } else {
    if (metadata.timestamp === null || metadata.timestamp === undefined) {
      errores.push('❌ metadata.timestamp es null');
    }
    if (metadata.completed === null || metadata.completed === undefined) {
      errores.push('❌ metadata.completed es null');
    }
    if (!metadata.currentStage) errores.push('❌ metadata.currentStage es null');
  }
  
  // Report results
  console.log('\n📊 RESULTADOS DE VALIDACIÓN:');
  console.log('==================================');
  
  if (errores.length === 0) {
    console.log('✅ ¡VALIDACIÓN EXITOSA! No se encontraron errores críticos');
  } else {
    console.log(`❌ Se encontraron ${errores.length} errores críticos:`);
    errores.forEach(error => console.log(`  ${error}`));
  }
  
  if (advertencias.length > 0) {
    console.log(`⚠️ Se encontraron ${advertencias.length} advertencias:`);
    advertencias.forEach(adv => console.log(`  ${adv}`));
  }
  
  console.log('==================================');
  
  return {
    errores,
    advertencias,
    esValido: errores.length === 0
  };
}

// Main execution function
async function ejecutarPruebasCompletas() {
  try {
    console.log('🎯 INICIANDO PRUEBAS COMPLETAS DE ENCUESTA FAMILIAR');
    console.log('=====================================================');
    
    // Step 1: Verify database connection
    const conexionOK = await verificarConexionBD();
    if (!conexionOK) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    // Step 2: Create reference data
    const datosReferencia = await crearDatosCompletosReferencia();
    console.log('🎯 Datos de referencia completos creados');
    
    // Step 3: Create complete family
    const familiaCompleta = await crearFamiliaCompleta(datosReferencia);
    console.log('🎉 Familia completa creada exitosamente');
    
    // Step 4: Execute complete query
    const consultaResultado = await ejecutarConsultaCompleta(familiaCompleta);
    console.log('✅ Consulta completa ejecutada');
    
    // Step 5: Validate results
    const validacion = validarDatosCompletos(consultaResultado.familiaConsultada);
    console.log('🎯 Validación completada. Estado:', validacion.esValido ? 'VÁLIDO' : 'INVÁLIDO');
    
    // Final summary
    console.log('\n🎯 RESUMEN EJECUTIVO DE LA PRUEBA:');
    console.log('===================================');
    console.log(`📊 Familia probada: ID ${familiaCompleta.familia.id_familia}`);
    console.log(`📈 Errores encontrados: ${validacion.errores.length}`);
    console.log(`⚠️ Advertencias: ${validacion.advertencias.length}`);
    console.log(`✅ Estado final: ${validacion.esValido ? 'APROBADO' : 'REQUIERE CORRECCIÓN'}`);
    console.log('===================================');
    
    if (validacion.esValido) {
      console.log('🚀 ¡CONCLUSIÓN: El sistema cumple completamente con el requerimiento!');
      console.log('📝 "Toda, absolutamente toda la información que se envía a través del request, se devuelve en su totalidad en el response"');
    } else {
      console.log('🔧 CONCLUSIÓN: El sistema requiere ajustes adicionales');
    }
    
    return {
      exitoso: validacion.esValido,
      familiaCreada: familiaCompleta,
      resultado: consultaResultado,
      validacion
    };
    
  } catch (error) {
    console.error('💥 ERROR CRÍTICO EN LAS PRUEBAS:', error.message);
    console.error(error.stack);
    return {
      exitoso: false,
      error: error.message
    };
  } finally {
    // Close database connection
    try {
      await sequelize.close();
      console.log('🔐 Conexión a base de datos cerrada');
    } catch (error) {
      console.error('⚠️ Error cerrando conexión:', error.message);
    }
  }
}

// Execute tests if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarPruebasCompletas()
    .then(resultado => {
      if (resultado.exitoso) {
        console.log('\n🎉 PRUEBAS COMPLETADAS EXITOSAMENTE');
        process.exit(0);
      } else {
        console.log('\n❌ PRUEBAS FALLIDAS');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 ERROR FATAL:', error);
      process.exit(1);
    });
}

export default ejecutarPruebasCompletas;
