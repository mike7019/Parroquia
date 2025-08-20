/**
 * Prueba de HU-CONFIG-001 para veredaController.js
 * Verifica que las respuestas cumplan con el estándar implementado
 */

const baseURL = 'http://localhost:3000/api';

// Función helper para hacer requests
async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${baseURL}${endpoint}`, config);
    const data = await response.json();
    return {
      status: response.status,
      data,
      ok: response.ok
    };
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

// Función para obtener token de autenticación
async function getAuthToken() {
  console.log('🔐 Obteniendo token de autenticación...');
  
  const loginData = {
    email: 'admin@parroquia.com', // Cambiar por un usuario válido
    password: 'admin123' // Cambiar por la contraseña correcta
  };

  const result = await makeRequest('/auth/login', 'POST', loginData);
  
  if (result && result.ok) {
    console.log('✅ Token obtenido correctamente');
    return result.data.data.accessToken;
  } else {
    console.log('⚠️  No se pudo obtener token. Usando sin autenticación...');
    return null;
  }
}

// Función para probar el endpoint GET de veredas
async function testGetVeredas(token) {
  console.log('\n📋 Probando GET /api/catalog/veredas...');
  
  const result = await makeRequest('/catalog/veredas', 'GET', null, token);
  
  if (!result) {
    console.log('❌ No se pudo conectar al servidor');
    return false;
  }

  console.log(`Status: ${result.status}`);
  
  if (result.ok) {
    // Verificar estructura HU-CONFIG-001
    const { data } = result.data;
    
    if (data.status && data.data && Array.isArray(data.data) && data.message) {
      console.log('✅ Respuesta cumple HU-CONFIG-001');
      console.log(`   Status: ${data.status}`);
      console.log(`   Data: Array con ${data.data.length} elementos`);
      console.log(`   Total: ${data.total || 'N/A'}`);
      console.log(`   Message: ${data.message}`);
      
      // Verificar estructura de elementos
      if (data.data.length > 0) {
        const firstItem = data.data[0];
        if (firstItem.id && firstItem.nombre) {
          console.log('✅ Estructura de datos correcta');
          return true;
        } else {
          console.log('❌ Estructura de datos incorrecta');
        }
      } else {
        console.log('✅ Array vacío - estructura válida');
        return true;
      }
    } else {
      console.log('❌ Respuesta NO cumple HU-CONFIG-001');
      console.log('   Estructura esperada: {status, data[], total, message}');
      console.log('   Estructura recibida:', Object.keys(data));
    }
  } else {
    console.log('❌ Error en la respuesta');
    console.log('   Response:', result.data);
  }
  
  return false;
}

// Función para probar la búsqueda
async function testSearchVeredas(token) {
  console.log('\n🔍 Probando GET /api/catalog/veredas/search...');
  
  const result = await makeRequest('/catalog/veredas/search?q=test', 'GET', null, token);
  
  if (!result) {
    console.log('❌ No se pudo conectar al servidor');
    return false;
  }

  console.log(`Status: ${result.status}`);
  
  if (result.ok) {
    const { data } = result.data;
    
    if (data.status && data.data && Array.isArray(data.data) && data.message) {
      console.log('✅ Búsqueda cumple HU-CONFIG-001');
      console.log(`   Message: ${data.message}`);
      return true;
    }
  }
  
  console.log('❌ Búsqueda no cumple estándar');
  return false;
}

// Función principal
async function runTests() {
  console.log('🧪 Iniciando pruebas HU-CONFIG-001 para veredaController\n');
  console.log('=' .repeat(60));
  
  // Obtener token (opcional)
  const token = await getAuthToken();
  
  // Probar endpoints
  const tests = [
    testGetVeredas,
    testSearchVeredas
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test(token);
    if (result) passed++;
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Resultados: ${passed}/${total} pruebas exitosas`);
  
  if (passed === total) {
    console.log('🎉 ¡Todas las pruebas pasaron! veredaController cumple HU-CONFIG-001');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisar implementación.');
  }
  
  console.log('\n✅ Servidor corriendo en: http://localhost:3000');
  console.log('📚 Documentación: http://localhost:3000/api-docs');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
