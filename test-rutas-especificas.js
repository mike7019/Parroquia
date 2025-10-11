import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testRutasEspecificas() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         TEST ESPECÍFICO DE RUTAS DE ENCUESTAS                ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Autenticado\n');
    
    // Obtener lista para sacar un ID
    const listResponse = await axios.get(`${BASE_URL}/api/encuesta`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 Total encuestas: ${listResponse.data.total || listResponse.data.data?.length || 0}`);
    
    if (listResponse.data.data && listResponse.data.data.length > 0) {
      const encuestaId = listResponse.data.data[0].id_familia || listResponse.data.data[0].id;
      console.log(`📌 ID de prueba: ${encuestaId}\n`);
      
      // Probar diferentes variaciones de la URL
      const urlsToTest = [
        `/api/encuesta/${encuestaId}`,
        `/api/encuesta/1`,
        `/api/encuesta/5`,
        `/api/encuesta/999`,
      ];
      
      console.log('🔍 Probando diferentes URLs:\n');
      
      for (const url of urlsToTest) {
        try {
          const response = await axios.get(`${BASE_URL}${url}`, {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true // No lanzar error en ningún status
          });
          
          console.log(`   ${url.padEnd(30)} → ${response.status} ${response.statusText}`);
          if (response.status === 200) {
            console.log(`      ✅ Datos: apellido=${response.data.data?.apellido_familiar}`);
          } else {
            console.log(`      ❌ ${response.data.message || response.data.error || 'Sin mensaje'}`);
          }
        } catch (error) {
          console.log(`   ${url.padEnd(30)} → ERROR: ${error.message}`);
        }
      }
      
      console.log('\n🔍 Probando rutas específicas (no deberían dar 404):\n');
      
      const specificRoutes = [
        '/api/encuesta/estadisticas',
        '/api/encuesta/buscar?q=test',
        '/api/encuesta/cursor'
      ];
      
      for (const url of specificRoutes) {
        try {
          const response = await axios.get(`${BASE_URL}${url}`, {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true
          });
          
          console.log(`   ${url.padEnd(40)} → ${response.status}`);
        } catch (error) {
          console.log(`   ${url.padEnd(40)} → ERROR`);
        }
      }
      
    } else {
      console.log('⚠️  No hay encuestas para probar');
    }
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    PRUEBA COMPLETADA                          ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRutasEspecificas();
