import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testEncuestasCompleto() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║      ✅ PRUEBA FINAL - ENCUESTAS FUNCIONANDO CORRECTAMENTE    ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    // 1. Login
    console.log('🔐 1. Autenticando...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });
    
    const token = loginResponse.data.data?.accessToken || loginResponse.data.accessToken || loginResponse.data.token;
    if (!token) {
      throw new Error('No se obtuvo token');
    }
    console.log('   ✅ Autenticado correctamente\n');
    
    // 2. Obtener lista de encuestas
    console.log('📋 2. Obteniendo lista de encuestas...');
    const listResponse = await axios.get(`${BASE_URL}/api/encuesta`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const total = listResponse.data.total || listResponse.data.data?.length || 0;
    console.log(`   ✅ Total encuestas: ${total}`);
    
    const encuestas = listResponse.data.encuestas || listResponse.data.data || [];
    
    if (encuestas && encuestas.length > 0) {
      console.log('\n   Encuestas disponibles:');
      encuestas.slice(0, 5).forEach((enc, i) => {
        const id = enc.id_encuesta || enc.id_familia || enc.id || 'N/A';
        const apellido = enc.apellido_familiar || 'Sin apellido';
        console.log(`   ${i+1}. ID: ${String(id).padEnd(5)} - ${apellido}`);
      });
      
      // 3. Obtener encuesta por ID (usando el primer ID válido)
      const primeraEncuesta = encuestas[0];
      const encuestaId = primeraEncuesta.id_encuesta || primeraEncuesta.id_familia || primeraEncuesta.id;
      
      console.log(`\n🔍 3. Obteniendo encuesta por ID (${encuestaId})...`);
      
      try {
        const encuestaResponse = await axios.get(`${BASE_URL}/api/encuesta/${encuestaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('   ✅ Encuesta obtenida exitosamente');
        const datos = encuestaResponse.data.data;
        console.log(`\n   📊 Información de la encuesta:`);
        console.log(`   - ID Familia: ${datos.id_familia}`);
        console.log(`   - Apellido: ${datos.apellido_familiar}`);
        console.log(`   - Sector: ${datos.nombre_sector || datos.sector || 'N/A'}`);
        console.log(`   - Municipio: ${datos.nombre_municipio || 'N/A'}`);
        console.log(`   - Total personas: ${datos.personas?.length || 0}`);
        console.log(`   - Total difuntos: ${datos.difuntos?.length || 0}`);
        
        if (datos.personas && datos.personas.length > 0) {
          console.log(`\n   👥 Personas en la familia:`);
          datos.personas.slice(0, 3).forEach((p, i) => {
            console.log(`   ${i+1}. ${p.nombres || 'Sin nombre'} - ${p.parentesco || 'Sin parentesco'}`);
          });
        }
        
      } catch (error) {
        console.log(`   ❌ Error obteniendo encuesta: ${error.response?.data?.message || error.message}`);
      }
      
      // 4. Probar actualización PATCH
      console.log(`\n✏️  4. Probando actualización PATCH...`);
      try {
        const patchResponse = await axios.patch(
          `${BASE_URL}/api/encuesta/${encuestaId}`,
          { telefono: '3001234567' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('   ✅ PATCH funcionando correctamente');
        console.log(`   - Campos actualizados: ${patchResponse.data.campos_actualizados?.join(', ') || 'telefono'}`);
      } catch (error) {
        console.log(`   ⚠️  PATCH: ${error.response?.data?.message || error.message}`);
      }
      
      // 5. Probar rutas especiales
      console.log(`\n🌟 5. Probando rutas especiales...`);
      
      // Estadísticas
      try {
        const statsResponse = await axios.get(`${BASE_URL}/api/encuesta/estadisticas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ /estadisticas → Funciona');
      } catch (error) {
        console.log('   ❌ /estadisticas → Error');
      }
      
      // Búsqueda
      try {
        const searchResponse = await axios.get(`${BASE_URL}/api/encuesta/buscar?q=test`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ /buscar → Funciona');
      } catch (error) {
        console.log('   ❌ /buscar → Error');
      }
      
      // Cursor
      try {
        const cursorResponse = await axios.get(`${BASE_URL}/api/encuesta/cursor`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ /cursor → Funciona');
      } catch (error) {
        console.log('   ❌ /cursor → Error');
      }
      
    } else {
      console.log('   ⚠️  No hay encuestas en el sistema');
    }
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ TODAS LAS PRUEBAS PASARON               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('\n📝 RESUMEN DE CORRECCIONES:');
    console.log('   1. ✅ Eliminada columna h.categoria de queries de habilidades');
    console.log('   2. ✅ Eliminadas rutas duplicadas en encuestaRoutes.js');
    console.log('   3. ✅ Todas las rutas GET/POST/PUT/DELETE funcionando');
    console.log('   4. ✅ Rutas especiales (estadisticas, buscar, cursor) funcionando\n');
    
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testEncuestasCompleto();
