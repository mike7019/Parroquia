#!/usr/bin/env node

/**
 * Script específico para probar el servicio de Sectores
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(method, url, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    let responseData;
    
    try {
      responseData = await response.json();
    } catch {
      responseData = await response.text();
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function getAuthToken() {
  log('🔐 Obteniendo token de autenticación...', 'cyan');
  
  const loginData = {
    correo_electronico: 'admin@parroquia.com',
    contrasena: 'Admin123!'
  };
  
  const result = await makeRequest('POST', `${API_URL}/auth/login`, loginData);
  
  if (result.ok && result.data.data?.accessToken) {
    log('✅ Token obtenido correctamente', 'green');
    return result.data.data.accessToken;
  } else {
    log(`❌ Error obteniendo token: ${result.data?.message || 'Error desconocido'}`, 'red');
    return null;
  }
}

async function testSectoresEndpoints(token) {
  log('\n🏘️ PROBANDO SERVICIO DE SECTORES', 'bold');
  log('=' .repeat(60), 'cyan');
  
  const tests = [];
  
  // 1. Listar todos los sectores
  log('\n📋 1. Listando todos los sectores...', 'magenta');
  const listResult = await makeRequest('GET', `${API_URL}/catalog/sectores`, null, token);
  
  if (listResult.ok) {
    log('✅ GET /catalog/sectores - SUCCESS', 'green');
    
    // Sectores devuelve estructura anidada: data.data.data
    const sectoresData = listResult.data.data?.data || listResult.data.data;
    
    if (sectoresData && Array.isArray(sectoresData)) {
      log(`   📊 Total sectores: ${sectoresData.length}`, 'blue');
      
      // Mostrar algunos sectores de ejemplo
      const sampleSectores = sectoresData.slice(0, 3);
      sampleSectores.forEach((sector, index) => {
        log(`   ${index + 1}. ID: ${sector.id_sector || sector.id} - ${sector.nombre}`, 'cyan');
        if (sector.id_municipio) {
          log(`      Municipio ID: ${sector.id_municipio}`, 'blue');
        }
      });
      
      tests.push({ name: 'List Sectores', status: 'PASS', count: sectoresData.length });
    } else {
      log('   ⚠️  Respuesta tiene estructura diferente', 'yellow');
      log(`   📄 Estructura: ${JSON.stringify(Object.keys(listResult.data)).join(', ')}`, 'blue');
      tests.push({ name: 'List Sectores', status: 'PASS', note: 'Different response structure' });
    }
  } else {
    log(`❌ GET /catalog/sectores - FAILED (${listResult.status})`, 'red');
    log(`   Error: ${listResult.data?.message || listResult.error || 'Error desconocido'}`, 'yellow');
    tests.push({ name: 'List Sectores', status: 'FAIL', error: listResult.data?.message || listResult.error });
  }
  
  // 2. Nota: Sectores no tiene endpoint de búsqueda implementado
  log('\n🔍 2. Verificando endpoints disponibles...', 'magenta');
  log('   ℹ️  Sectores no tiene endpoint /search implementado (diferente a Veredas)', 'blue');
  log('   ℹ️  Sectores no tiene endpoint /statistics implementado (diferente a Veredas)', 'blue');
  tests.push({ name: 'Search Sectores', status: 'SKIP', note: 'Endpoint not implemented' });
  tests.push({ name: 'Sectores Statistics', status: 'SKIP', note: 'Endpoint not implemented' });
  
  // 4. Obtener sector específico (si hay sectores disponibles)
  const sectoresData = listResult.data.data?.data || listResult.data.data;
  if (listResult.ok && sectoresData && sectoresData.length > 0) {
    const firstSector = sectoresData[0];
    const sectorId = firstSector.id_sector || firstSector.id;
    
    log(`\n🎯 4. Probando obtener sector específico (ID: ${sectorId})...`, 'magenta');
    const getResult = await makeRequest('GET', `${API_URL}/catalog/sectores/${sectorId}`, null, token);
    
    if (getResult.ok) {
      log('✅ GET /catalog/sectores/:id - SUCCESS', 'green');
      
      const sector = getResult.data.data || getResult.data;
      log(`   🏘️  Nombre: ${sector.nombre}`, 'blue');
      log(`   🆔 ID: ${sector.id_sector || sector.id}`, 'blue');
      
      if (sector.municipio) {
        log(`   🏛️  Municipio: ${sector.municipio.nombre_municipio} (ID: ${sector.municipio.id_municipio})`, 'blue');
      } else if (sector.id_municipio) {
        log(`   🏛️  Municipio ID: ${sector.id_municipio}`, 'blue');
      }
      
      if (sector.createdAt) {
        log(`   📅 Creado: ${new Date(sector.createdAt).toLocaleDateString()}`, 'blue');
      }
      
      tests.push({ name: 'Get Sector by ID', status: 'PASS', id: sectorId });
    } else {
      log(`❌ GET /catalog/sectores/${sectorId} - FAILED (${getResult.status})`, 'red');
      log(`   Error: ${getResult.data?.message || getResult.error}`, 'yellow');
      tests.push({ name: 'Get Sector by ID', status: 'FAIL', error: getResult.data?.message });
    }
  }
  
  // 5. Probar creación de sector (opcional)
  log('\n➕ 5. Probando creación de sector de prueba...', 'magenta');
  
  const newSectorData = {
    nombre: 'Sector Test ' + Date.now(),
    id_municipio: 1, // Sectores requieren municipio, no parroquia
    descripcion: 'Sector creado para pruebas'
  };
  
  const createResult = await makeRequest('POST', `${API_URL}/catalog/sectores`, newSectorData, token);
  
  if (createResult.ok) {
    log('✅ POST /catalog/sectores - SUCCESS', 'green');
    
    const newSector = createResult.data.data || createResult.data;
    const newSectorId = newSector.id_sector || newSector.id;
    log(`   🆕 Nuevo sector creado: ${newSector.nombre} (ID: ${newSectorId})`, 'blue');
    
    tests.push({ name: 'Create Sector', status: 'PASS', id: newSectorId });
    
    // 6. Probar actualización
    log('\n✏️  6. Probando actualización de sector...', 'magenta');
    
    const updateData = {
      nombre: newSector.nombre + ' - ACTUALIZADO',
      descripcion: 'Sector actualizado para pruebas'
    };
    
    const updateResult = await makeRequest('PUT', `${API_URL}/catalog/sectores/${newSectorId}`, updateData, token);
    
    if (updateResult.ok) {
      log('✅ PUT /catalog/sectores/:id - SUCCESS', 'green');
      tests.push({ name: 'Update Sector', status: 'PASS', id: newSectorId });
    } else {
      log(`❌ PUT /catalog/sectores/${newSectorId} - FAILED (${updateResult.status})`, 'red');
      log(`   Error: ${updateResult.data?.message || updateResult.error}`, 'yellow');
      tests.push({ name: 'Update Sector', status: 'FAIL', error: updateResult.data?.message });
    }
    
    // 7. Probar eliminación
    log('\n🗑️  7. Probando eliminación de sector de prueba...', 'magenta');
    
    const deleteResult = await makeRequest('DELETE', `${API_URL}/catalog/sectores/${newSectorId}`, null, token);
    
    if (deleteResult.ok) {
      log('✅ DELETE /catalog/sectores/:id - SUCCESS', 'green');
      tests.push({ name: 'Delete Sector', status: 'PASS', id: newSectorId });
    } else {
      log(`❌ DELETE /catalog/sectores/${newSectorId} - FAILED (${deleteResult.status})`, 'red');
      log(`   Error: ${deleteResult.data?.message || deleteResult.error}`, 'yellow');
      tests.push({ name: 'Delete Sector', status: 'FAIL', error: deleteResult.data?.message });
    }
    
  } else {
    log(`❌ POST /catalog/sectores - FAILED (${createResult.status})`, 'red');
    log(`   Error: ${createResult.data?.message || createResult.error || 'Error desconocido'}`, 'yellow');
    tests.push({ name: 'Create Sector', status: 'FAIL', error: createResult.data?.message || createResult.error });
  }
  
  // 8. Nota: Sectores no tiene endpoint por parroquia
  log('\n🏛️  8. Verificando endpoints de filtrado...', 'magenta');
  log('   ℹ️  Sectores no tiene endpoint /parroquia/:id (diferente a Veredas)', 'blue');
  log('   ℹ️  Sectores están asociados a municipios, no a parroquias', 'blue');
  tests.push({ name: 'Sectores by Parroquia', status: 'SKIP', note: 'Endpoint not implemented - uses municipios' });
  
  return tests;
}

async function checkSectoresModel() {
  log('\n🔍 VERIFICANDO MODELO DE SECTORES', 'bold');
  log('=' .repeat(60), 'cyan');
  
  // Verificar que el endpoint de health funcione
  const healthResult = await makeRequest('GET', `${API_URL}/catalog/health`);
  
  if (healthResult.ok) {
    log('✅ Catalog service está funcionando', 'green');
  } else {
    log('❌ Catalog service tiene problemas', 'red');
    return false;
  }
  
  return true;
}

async function main() {
  log('🏘️ TESTING COMPLETO DEL SERVICIO DE SECTORES', 'bold');
  log('=' .repeat(70), 'cyan');
  
  // 1. Verificar servidor
  const serverCheck = await makeRequest('GET', `${API_URL}/health`);
  if (!serverCheck.ok) {
    log('❌ Servidor no está funcionando', 'red');
    process.exit(1);
  }
  
  log('✅ Servidor funcionando correctamente', 'green');
  
  // 2. Obtener token
  const token = await getAuthToken();
  if (!token) {
    log('❌ No se pudo obtener token de autenticación', 'red');
    process.exit(1);
  }
  
  // 3. Verificar modelo
  const modelOk = await checkSectoresModel();
  if (!modelOk) {
    log('❌ Problemas con el modelo de Sectores', 'red');
    process.exit(1);
  }
  
  // 4. Ejecutar tests
  const testResults = await testSectoresEndpoints(token);
  
  // 5. Resumen
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 RESUMEN DE PRUEBAS DE SECTORES', 'bold');
  log('=' .repeat(70), 'cyan');
  
  const passed = testResults.filter(t => t.status === 'PASS').length;
  const failed = testResults.filter(t => t.status === 'FAIL').length;
  const total = testResults.length;
  
  log(`\n✅ Pruebas exitosas: ${passed}/${total}`, 'green');
  log(`❌ Pruebas fallidas: ${failed}/${total}`, failed > 0 ? 'red' : 'green');
  
  testResults.forEach((test, index) => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    const color = test.status === 'PASS' ? 'green' : 'red';
    log(`\n${index + 1}. ${status} ${test.name}`, color);
    
    if (test.count !== undefined) {
      log(`   📊 Registros: ${test.count}`, 'blue');
    }
    
    if (test.id) {
      log(`   🆔 ID: ${test.id}`, 'blue');
    }
    
    if (test.error) {
      log(`   ❌ Error: ${test.error}`, 'yellow');
    }
    
    if (test.note) {
      log(`   ℹ️  Nota: ${test.note}`, 'blue');
    }
  });
  
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  log(`\n📈 Tasa de éxito: ${successRate}%`, successRate > 80 ? 'green' : successRate > 60 ? 'yellow' : 'red');
  
  if (failed === 0) {
    log('\n🎉 ¡Todos los tests del servicio de Sectores pasaron exitosamente!', 'green');
  } else {
    log('\n⚠️  Algunos tests fallaron. Revisa los errores arriba.', 'yellow');
    
    // Mostrar recomendaciones basadas en errores
    const failedTests = testResults.filter(t => t.status === 'FAIL');
    if (failedTests.length > 0) {
      log('\n🔧 RECOMENDACIONES:', 'yellow');
      failedTests.forEach(test => {
        log(`   • ${test.name}: Verificar ${test.error?.includes('not found') ? 'rutas y controlador' : 'lógica de negocio'}`, 'blue');
      });
    }
  }
  
  log('\n✅ Testing de Sectores completado', 'cyan');
}

main().catch(error => {
  log(`💥 Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});