import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         DIAGNÓSTICO DE PROBLEMA CON ENCUESTAS                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

async function test() {
  try {
    // 1. Login
    console.log('🔐 1. Autenticando...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });
    
    if (!loginRes.ok) {
      console.log('   ❌ Error en login:', loginRes.status, loginRes.statusText);
      const error = await loginRes.text();
      console.log('   Detalles:', error);
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken || loginData.accessToken;
    console.log('   ✅ Autenticado correctamente\n');
    
    // 2. Test GET /api/encuesta
    console.log('📋 2. Probando GET /api/encuesta...');
    const getRes = await fetch(`${BASE_URL}/api/encuesta?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`   Status: ${getRes.status} ${getRes.statusText}`);
    
    if (!getRes.ok) {
      console.log('   ❌ ERROR en GET /api/encuesta');
      const errorText = await getRes.text();
      console.log('   Response:', errorText);
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('\n   📊 Error detallado:');
        console.log('   -', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('   Error no es JSON');
      }
    } else {
      const data = await getRes.json();
      console.log('   ✅ GET exitoso');
      console.log('   Total encuestas:', data.total || data.data?.length || 0);
      if (data.data && data.data.length > 0) {
        console.log('   Primera encuesta:', data.data[0].id_familia);
      }
    }
    
    console.log('\n' + '═'.repeat(65));
    
    // 3. Test POST /api/encuesta (crear nueva)
    console.log('\n📝 3. Probando POST /api/encuesta (crear nueva encuesta)...');
    
    const nuevaEncuesta = {
      // Datos mínimos para crear encuesta
      familia: {
        apellido_familiar: "Test Diagnóstico",
        nombre_familiar: "Familia",
        telefono_uno: "3001234567"
      }
    };
    
    const postRes = await fetch(`${BASE_URL}/api/encuesta`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevaEncuesta)
    });
    
    console.log(`   Status: ${postRes.status} ${postRes.statusText}`);
    
    if (!postRes.ok) {
      console.log('   ❌ ERROR en POST /api/encuesta');
      const errorText = await postRes.text();
      console.log('   Response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('\n   📊 Error detallado:');
        console.log(JSON.stringify(errorJson, null, 2));
        
        if (errorJson.errors) {
          console.log('\n   Errores de validación:');
          errorJson.errors.forEach(err => {
            console.log(`   - ${err.field}: ${err.message}`);
          });
        }
      } catch (e) {
        console.log('   Error no es JSON');
      }
    } else {
      const data = await postRes.json();
      console.log('   ✅ POST exitoso');
      console.log('   Nueva encuesta ID:', data.data?.id_familia);
    }
    
    console.log('\n' + '═'.repeat(65));
    
    // 4. Verificar rutas registradas
    console.log('\n🔍 4. Verificando endpoints de encuestas disponibles...');
    
    const endpoints = [
      { method: 'GET', path: '/api/encuesta' },
      { method: 'GET', path: '/api/encuestas' },
      { method: 'POST', path: '/api/encuesta' },
      { method: 'POST', path: '/api/encuestas' },
      { method: 'GET', path: '/api/encuesta/1' },
      { method: 'PUT', path: '/api/encuesta/1' },
      { method: 'DELETE', path: '/api/encuesta/1' }
    ];
    
    for (const endpoint of endpoints) {
      const testRes = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method === 'GET' ? 'GET' : endpoint.method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        ...(endpoint.method === 'POST' ? { body: JSON.stringify({}) } : {})
      });
      
      const status = testRes.status;
      const icon = status === 404 ? '❌' : status < 500 ? '✅' : '⚠️';
      console.log(`   ${icon} ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(25)} → ${status}`);
    }
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    DIAGNÓSTICO COMPLETADO                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error.message);
    console.error(error.stack);
  }
}

test();
