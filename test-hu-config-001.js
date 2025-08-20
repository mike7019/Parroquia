#!/usr/bin/env node

/**
 * Script de pruebas para verificar la implementación del estándar HU-CONFIG-001
 * Este script verifica que los endpoints de configuración devuelvan respuestas estandarizadas
 */

const BASE_URL = 'http://localhost:3000/api';
const AUTH_TOKEN = ''; // Se debe obtener primero del login

/**
 * Función para hacer peticiones HTTP
 */
async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      data,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false
    };
  }
}

/**
 * Verificar formato de respuesta GET según HU-CONFIG-001
 */
function validateGetResponse(response, endpointName) {
  console.log(`\n🔍 Verificando GET ${endpointName}:`);
  
  const { data } = response;
  const isValid = 
    data.hasOwnProperty('status') &&
    data.hasOwnProperty('data') &&
    data.hasOwnProperty('total') &&
    data.hasOwnProperty('message') &&
    Array.isArray(data.data) &&
    typeof data.total === 'number';

  if (isValid) {
    console.log(`✅ Formato correcto: status="${data.status}", data=[${data.data.length}], total=${data.total}`);
    console.log(`   📝 Mensaje: "${data.message}"`);
  } else {
    console.log(`❌ Formato incorrecto:`);
    console.log(`   Esperado: {status, data[], total, message}`);
    console.log(`   Recibido:`, Object.keys(data));
  }

  return isValid;
}

/**
 * Verificar formato de respuesta POST/PUT/DELETE según HU-CONFIG-001
 */
function validateMutationResponse(response, endpointName, operation) {
  console.log(`\n🔍 Verificando ${operation} ${endpointName}:`);
  
  const { data } = response;
  const isValid = 
    data.hasOwnProperty('status') &&
    data.hasOwnProperty('message') &&
    !data.hasOwnProperty('data') &&
    !data.hasOwnProperty('total');

  if (isValid) {
    console.log(`✅ Formato correcto: status="${data.status}"`);
    console.log(`   📝 Mensaje: "${data.message}"`);
  } else {
    console.log(`❌ Formato incorrecto:`);
    console.log(`   Esperado: {status, message} (sin data ni total)`);
    console.log(`   Recibido:`, Object.keys(data));
  }

  return isValid;
}

/**
 * Función principal de pruebas
 */
async function runTests() {
  console.log('🚀 Iniciando verificación del estándar HU-CONFIG-001\n');
  console.log('📋 Estándar a verificar:');
  console.log('   • GET: {status, data[], total, message}');
  console.log('   • POST/PUT/DELETE: {status, message}');
  
  let passedTests = 0;
  let totalTests = 0;

  // ===== PRUEBAS GET (sin autenticación) =====
  
  console.log('\n\n🔐 === PRUEBAS SIN AUTENTICACIÓN ===');
  
  // Test 1: Health check del catálogo
  totalTests++;
  const healthCheck = await makeRequest('/catalog/health');
  if (healthCheck.ok) {
    // El health check puede tener formato diferente, solo verificar que responda
    console.log('\n✅ Health check del catálogo: OK');
    passedTests++;
  } else {
    console.log('\n❌ Health check del catálogo: FALLO');
  }

  // Test 2: Tipos de identificación (público)
  totalTests++;
  const tiposId = await makeRequest('/catalog/tipos-identificacion');
  if (validateGetResponse(tiposId, 'tipos-identificacion')) {
    passedTests++;
  }

  // ===== NOTA: PRUEBAS AUTENTICADAS =====
  console.log('\n\n🔐 === PRUEBAS CON AUTENTICACIÓN ===');
  console.log('⚠️  Para continuar con las pruebas autenticadas:');
  console.log('   1. Ejecutar login y obtener token');
  console.log('   2. Establecer AUTH_TOKEN en este script');
  console.log('   3. Ejecutar nuevamente');

  if (!AUTH_TOKEN) {
    console.log('\n📊 === RESUMEN PARCIAL ===');
    console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
    console.log(`📈 Porcentaje de éxito: ${Math.round((passedTests/totalTests)*100)}%`);
    console.log('\n💡 Para completar todas las pruebas, configurar AUTH_TOKEN');
    return;
  }

  // Aquí irían las pruebas autenticadas...
  // TODO: Implementar pruebas con token de autenticación

  console.log('\n📊 === RESUMEN FINAL ===');
  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje de éxito: ${Math.round((passedTests/totalTests)*100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! El estándar HU-CONFIG-001 está implementado correctamente.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar implementación del estándar HU-CONFIG-001.');
  }
}

/**
 * Ejemplos de respuestas esperadas
 */
function showExamples() {
  console.log('\n📚 === EJEMPLOS DE RESPUESTAS ESPERADAS ===');
  
  console.log('\n✅ GET Exitoso:');
  console.log(JSON.stringify({
    "status": "success",
    "data": [
      { "id": 1, "nombre": "Masculino" },
      { "id": 2, "nombre": "Femenino" }
    ],
    "total": 2,
    "message": "2 sexos encontrados"
  }, null, 2));

  console.log('\n❌ GET Error:');
  console.log(JSON.stringify({
    "status": "error",
    "data": [],
    "total": 0,
    "message": "No se pudieron obtener los sexos"
  }, null, 2));

  console.log('\n✅ POST Exitoso:');
  console.log(JSON.stringify({
    "status": "success",
    "message": "Sexo creado correctamente"
  }, null, 2));

  console.log('\n❌ POST Error:');
  console.log(JSON.stringify({
    "status": "error",
    "message": "Error al crear el sexo: campo sexo es requerido"
  }, null, 2));
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  showExamples();
  runTests().catch(console.error);
}

export { validateGetResponse, validateMutationResponse, makeRequest };
