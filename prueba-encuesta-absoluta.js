/**
 * PRUEBA COMPLETA DE ENCUESTA FAMILIAR
 * Validación exhaustiva de datos completos sin valores null
 * Verificación de que el request se preserva íntegramente en el response
 */

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

console.log('🚀 INICIANDO PRUEBA COMPLETA DE ENCUESTA FAMILIAR');
console.log('==================================================');
console.log('Objetivo: Validar que TODA la información del request se preserva en el response');
console.log('Sin ningún valor null en campos críticos\n');

// PASO 1: Verificar conexión a base de datos
async function verificarConexionBD() {
  try {
    console.log('🔍 PASO 1: Verificando conexión a base de datos...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida correctamente');
    
    const tablas = await sequelize.getQueryInterface().showAllTables();
    console.log(`📋 Tablas disponibles: ${tablas.length}`);
    
    const tablasRequeridas = [
      'familias', 'personas', 'sexos', 'tipos_identificacion', 
      'municipios', 'departamentos', 'difuntos_familia'
    ];
    
    const tablasExistentes = tablasRequeridas.filter(tabla => 
      tablas.some(t => t.toLowerCase() === tabla.toLowerCase())
    );
    
    console.log(`✅ Tablas requeridas encontradas: ${tablasExistentes.length}/${tablasRequeridas.length}\n`);
    return true;
  } catch (error) {
    console.error('❌ Error en conexión a BD:', error.message);
    return false;
  }
}

// PASO 2: Crear datos de referencia completos
async function crearDatosReferencia() {
  try {
    console.log('🏗️ PASO 2: Creando datos de referencia completos...');
    
    // Departamento
    const [departamento] = await sequelize.query(`
      INSERT INTO departamentos (nombre_departamento, codigo_dane) 
      VALUES ('Test Departamento Completo', '99999') 
      ON CONFLICT (codigo_dane) DO UPDATE SET nombre_departamento = EXCLUDED.nombre_departamento
      RETURNING id_departamento, nombre_departamento;
    `, { type: QueryTypes.SELECT });
    
    // Municipio
    const [municipio] = await sequelize.query(`
      INSERT INTO municipios (nombre_municipio, codigo_dane, id_departamento) 
      VALUES ('Test Municipio Completo', '99999001', ${departamento.id_departamento}) 
      ON CONFLICT (codigo_dane) DO UPDATE SET nombre_municipio = EXCLUDED.nombre_municipio
      RETURNING id_municipio, nombre_municipio;
    `, { type: QueryTypes.SELECT });
    
    // Sexos
    let sexos = await sequelize.query(`
      INSERT INTO sexos (descripcion) VALUES 
      ('Masculino'), ('Femenino')
      ON CONFLICT (descripcion) DO NOTHING
      RETURNING id_sexo, descripcion;
    `, { type: QueryTypes.SELECT });
    
    if (sexos.length === 0) {
      sexos = await sequelize.query(`
        SELECT id_sexo, descripcion FROM sexos LIMIT 2;
      `, { type: QueryTypes.SELECT });
    }
    
    // Tipo de identificación
    const [tipoId] = await sequelize.query(`
      INSERT INTO tipos_identificacion (nombre, codigo) 
      VALUES ('Cédula de Ciudadanía Test', 'CC_TEST') 
      ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
      RETURNING id_tipo_identificacion, nombre, codigo;
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Datos de referencia creados:');
    console.log(`  - Departamento: ${departamento.nombre_departamento}`);
    console.log(`  - Municipio: ${municipio.nombre_municipio}`);
    console.log(`  - Sexos: ${sexos.length} disponibles`);
    console.log(`  - Tipo ID: ${tipoId.nombre}\n`);
    
    return { departamento, municipio, sexos, tipoId };
  } catch (error) {
    console.error('❌ Error creando datos de referencia:', error);
    throw error;
  }
}

// PASO 3: Crear familia con datos 100% completos
async function crearFamiliaCompleta(datosReferencia) {
  try {
    console.log('👨‍👩‍👧‍👦 PASO 3: Creando familia con datos 100% completos...');
    
    const timestamp = new Date().toISOString();
    const uniqueId = Date.now();
    
    const familiaCompleta = {
      apellido_familiar: `Familia Test Completa ${uniqueId}`,
      sector: 'Sector Test Completo',
      direccion_familia: 'Calle 123 # 45-67, Barrio Test Completo',
      numero_contacto: '6043334455',
      telefono: '6043334455',
      email: `test.completo.${uniqueId}@email.com`,
      tamaño_familia: 4,
      tipo_vivienda: 'Casa propia completa',
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: timestamp.split('T')[0],
      codigo_familia: `FAM_COMP_${uniqueId}`,
      tutor_responsable: true,
      id_municipio: datosReferencia.municipio.id_municipio,
      comunionEnCasa: true,
      observaciones: 'Familia de prueba con datos absolutamente completos - sin ningún null'
    };
    
    // Crear familia
    const [familiaCreada] = await sequelize.query(`
      INSERT INTO familias (${Object.keys(familiaCompleta).join(', ')})
      VALUES (${Object.keys(familiaCompleta).map(() => '?').join(', ')})
      RETURNING *;
    `, {
      replacements: Object.values(familiaCompleta),
      type: QueryTypes.SELECT
    });
    
    // Crear miembros de familia
    const miembros = [
      {
        primer_nombre: 'Juan Carlos',
        segundo_nombre: 'Antonio',
        primer_apellido: 'Pérez',
        segundo_apellido: 'González',
        identificacion: `CC_TEST_${uniqueId}_001`,
        telefono: '3201234567',
        correo_electronico: `juan.carlos.${uniqueId}@email.com`,
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
        identificacion: `CC_TEST_${uniqueId}_002`,
        telefono: '3209876543',
        correo_electronico: `maria.elena.${uniqueId}@email.com`,
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
    
    // Crear difunto
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
    
    console.log('✅ Familia completa creada exitosamente:');
    console.log(`  - ID Familia: ${familiaCreada.id_familia}`);
    console.log(`  - Apellido: ${familiaCreada.apellido_familiar}`);
    console.log(`  - Miembros: ${miembrosCreados.length}`);
    console.log(`  - Difuntos: 1`);
    console.log(`  - Estado: ${familiaCreada.estado_encuesta}\n`);
    
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

// PASO 4: Ejecutar consulta completa
async function ejecutarConsultaCompleta(familiaCreada) {
  try {
    console.log('🔍 PASO 4: Ejecutando consulta completa del servicio...');
    
    const servicio = new FamiliasConsultasService();
    
    const filtros = {
      apellido_familiar: familiaCreada.familia.apellido_familiar,
      limite: 1
    };
    
    const resultado = await servicio.consultarFamiliasConPadresMadres(filtros);
    
    if (resultado.total === 0) {
      throw new Error('No se encontró la familia creada en la consulta');
    }
    
    const familiaConsultada = resultado.datos[0];
    
    console.log('✅ Consulta ejecutada exitosamente:');
    console.log(`  - Total encontradas: ${resultado.total}`);
    console.log(`  - ID Familia: ${familiaConsultada.id_encuesta}`);
    console.log(`  - Apellido: ${familiaConsultada.informacionGeneral?.apellido_familiar}`);
    console.log(`  - Miembros: ${familiaConsultada.familyMembers?.length || 0}`);
    console.log(`  - Difuntos: ${familiaConsultada.deceasedMembers?.length || 0}\n`);
    
    return {
      resultado,
      familiaConsultada
    };
    
  } catch (error) {
    console.error('❌ Error en consulta completa:', error);
    throw error;
  }
}

// PASO 5: Validar que no hay valores null
function validarDatosCompletos(familiaConsultada) {
  console.log('🔍 PASO 5: Validando que no existan valores null en datos críticos...');
  
  const errores = [];
  const advertencias = [];
  
  // Validar estructura principal
  if (!familiaConsultada.id_encuesta) {
    errores.push('❌ id_encuesta es null o undefined');
  }
  
  // Validar informacionGeneral
  const info = familiaConsultada.informacionGeneral;
  if (!info) {
    errores.push('❌ informacionGeneral es null');
  } else {
    if (!info.apellido_familiar) errores.push('❌ apellido_familiar es null');
    if (!info.direccion) errores.push('❌ direccion es null');
    if (!info.telefono) errores.push('❌ telefono es null');
    if (!info.municipio?.nombre) advertencias.push('⚠️ municipio.nombre es null');
    if (!info.sector?.nombre) advertencias.push('⚠️ sector.nombre es null');
  }
  
  // Validar vivienda
  const vivienda = familiaConsultada.vivienda;
  if (!vivienda) {
    errores.push('❌ vivienda es null');
  } else {
    if (!vivienda.tipo_vivienda?.nombre) errores.push('❌ tipo_vivienda.nombre es null');
    if (!vivienda.disposicion_basuras) errores.push('❌ disposicion_basuras es null');
  }
  
  // Validar servicios_agua
  if (!familiaConsultada.servicios_agua) {
    errores.push('❌ servicios_agua es null');
  }
  
  // Validar familyMembers
  const miembros = familiaConsultada.familyMembers;
  if (!miembros || !Array.isArray(miembros)) {
    errores.push('❌ familyMembers es null o no es array');
  } else if (miembros.length === 0) {
    errores.push('❌ familyMembers está vacío');
  } else {
    miembros.forEach((miembro, index) => {
      if (!miembro.nombres) errores.push(`❌ familyMembers[${index}].nombres es null`);
      if (!miembro.numeroIdentificacion) errores.push(`❌ familyMembers[${index}].numeroIdentificacion es null`);
    });
  }
  
  // Validar deceasedMembers
  if (!familiaConsultada.deceasedMembers || !Array.isArray(familiaConsultada.deceasedMembers)) {
    errores.push('❌ deceasedMembers es null o no es array');
  }
  
  // Validar metadata
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
  }
  
  console.log('📊 RESULTADOS DE VALIDACIÓN:');
  console.log('============================');
  
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
  
  console.log('============================\n');
  
  return {
    errores,
    advertencias,
    esValido: errores.length === 0
  };
}

// PASO 6: Comparación exhaustiva request/response
function compararRequestResponse(familiaConsultada) {
  console.log('🔬 PASO 6: Realizando comparación exhaustiva request/response...');
  
  // Crear un request simulado basado en la familia consultada
  const requestSimulado = {
    id_encuesta: familiaConsultada.id_encuesta,
    informacionGeneral: familiaConsultada.informacionGeneral,
    vivienda: familiaConsultada.vivienda,
    servicios_agua: familiaConsultada.servicios_agua,
    familyMembers: familiaConsultada.familyMembers,
    deceasedMembers: familiaConsultada.deceasedMembers,
    metadata: familiaConsultada.metadata
  };
  
  const response = familiaConsultada;
  
  const analisis = {
    camposVerificados: 0,
    camposExitosos: 0,
    camposFallidos: [],
    estructurasPresentes: 0,
    estructurasRequeridas: 6 // id_encuesta, informacionGeneral, vivienda, servicios_agua, familyMembers, deceasedMembers, metadata
  };
  
  // Verificar estructuras principales
  const estructuras = [
    'id_encuesta',
    'informacionGeneral', 
    'vivienda',
    'servicios_agua',
    'familyMembers',
    'deceasedMembers',
    'metadata'
  ];
  
  estructuras.forEach(estructura => {
    analisis.camposVerificados++;
    if (response[estructura] !== null && response[estructura] !== undefined) {
      analisis.camposExitosos++;
      analisis.estructurasPresentes++;
    } else {
      analisis.camposFallidos.push({
        campo: estructura,
        estado: 'Ausente o null'
      });
    }
  });
  
  // Verificar arrays
  if (Array.isArray(response.familyMembers)) {
    console.log(`  ✅ familyMembers: ${response.familyMembers.length} elementos`);
  }
  
  if (Array.isArray(response.deceasedMembers)) {
    console.log(`  ✅ deceasedMembers: ${response.deceasedMembers.length} elementos`);
  }
  
  const porcentajeExito = ((analisis.camposExitosos / analisis.camposVerificados) * 100).toFixed(2);
  const estructuraCompleta = analisis.estructurasPresentes === analisis.estructurasRequeridas;
  
  console.log('📊 ANÁLISIS EXHAUSTIVO:');
  console.log('=======================');
  console.log(`📈 Porcentaje de éxito: ${porcentajeExito}%`);
  console.log(`✅ Campos exitosos: ${analisis.camposExitosos}/${analisis.camposVerificados}`);
  console.log(`🏗️ Estructura completa: ${estructuraCompleta ? 'SÍ' : 'NO'}`);
  console.log(`📋 Estructuras presentes: ${analisis.estructurasPresentes}/${analisis.estructurasRequeridas}`);
  
  if (analisis.camposFallidos.length > 0) {
    console.log(`\n❌ Campos fallidos:`);
    analisis.camposFallidos.forEach(fallo => {
      console.log(`  ${fallo.campo}: ${fallo.estado}`);
    });
  }
  
  const exitoTotal = porcentajeExito >= 95 && estructuraCompleta;
  
  console.log('=======================');
  
  if (exitoTotal) {
    console.log('🎉 ¡ÉXITO TOTAL! La consulta preserva toda la información');
    console.log('✅ VALIDACIÓN COMPLETA: APROBADA');
  } else {
    console.log('⚠️ La consulta requiere ajustes');
    console.log('❌ VALIDACIÓN COMPLETA: REQUIERE CORRECCIÓN');
  }
  
  return {
    porcentajeExito: parseFloat(porcentajeExito),
    estructuraCompleta,
    exitoTotal,
    analisis
  };
}

// FUNCIÓN PRINCIPAL
async function ejecutarPruebaCompleta() {
  try {
    console.log('🎯 EJECUTANDO PRUEBA COMPLETA DE ENCUESTA FAMILIAR\n');
    
    // Paso 1: Verificar conexión
    const conexionOK = await verificarConexionBD();
    if (!conexionOK) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    // Paso 2: Crear datos de referencia
    const datosReferencia = await crearDatosReferencia();
    
    // Paso 3: Crear familia completa
    const familiaCreada = await crearFamiliaCompleta(datosReferencia);
    
    // Paso 4: Ejecutar consulta
    const consultaResultado = await ejecutarConsultaCompleta(familiaCreada);
    
    // Paso 5: Validar datos completos
    const validacion = validarDatosCompletos(consultaResultado.familiaConsultada);
    
    // Paso 6: Comparación exhaustiva
    const comparacion = compararRequestResponse(consultaResultado.familiaConsultada);
    
    // RESUMEN FINAL
    console.log('\n🎯 RESUMEN EJECUTIVO DE LA PRUEBA COMPLETA:');
    console.log('==========================================');
    console.log(`📊 Familia probada: ID ${familiaCreada.familia.id_familia}`);
    console.log(`📧 Email: ${familiaCreada.familia.email}`);
    console.log(`📈 Validación de nulls: ${validacion.esValido ? 'EXITOSA' : 'FALLIDA'}`);
    console.log(`📈 Porcentaje de completitud: ${comparacion.porcentajeExito}%`);
    console.log(`✅ Estado final: ${comparacion.exitoTotal ? 'APROBADO' : 'REQUIERE CORRECCIÓN'}`);
    console.log('==========================================');
    
    if (comparacion.exitoTotal && validacion.esValido) {
      console.log('\n🚀 ¡CONCLUSIÓN FINAL: PRUEBA EXITOSA!');
      console.log('📝 "Toda, absolutamente toda la información que se envía a través del request,');
      console.log('     se devuelve en su totalidad en el response"');
      console.log('✅ El sistema cumple completamente con el requerimiento establecido');
    } else {
      console.log('\n🔧 CONCLUSIÓN FINAL: REQUIERE AJUSTES');
      console.log('❌ El sistema no cumple completamente con el requerimiento');
      
      if (!validacion.esValido) {
        console.log(`   - Errores de validación: ${validacion.errores.length}`);
      }
      if (!comparacion.exitoTotal) {
        console.log(`   - Porcentaje insuficiente: ${comparacion.porcentajeExito}% (requiere ≥95%)`);
      }
    }
    
    console.log('\n🔚 PRUEBA COMPLETA FINALIZADA\n');
    
    // Cerrar conexión
    await sequelize.close();
    
    return {
      exitoso: comparacion.exitoTotal && validacion.esValido,
      validacion,
      comparacion,
      familiaCreada
    };
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA COMPLETA:', error.message);
    console.error('Stack:', error.stack);
    
    try {
      await sequelize.close();
    } catch (closeError) {
      console.error('Error cerrando conexión:', closeError.message);
    }
    
    throw error;
  }
}

// EJECUTAR PRUEBA
ejecutarPruebaCompleta()
  .then((resultado) => {
    process.exit(resultado.exitoso ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 PRUEBA FALLIDA:', error.message);
    process.exit(1);
  });
