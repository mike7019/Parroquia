import axios from 'axios';

async function testEstadisticasPoblacion() {
  try {
    console.log('🔐 Paso 1: Autenticando usuario...\n');
    
    // Login para obtener token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });

    const token = loginResponse.data.data?.accessToken;
    console.log('✅ Token obtenido exitosamente\n');

    console.log('📊 Paso 2: Consultando estadísticas de población...\n');
    
    // Consultar estadísticas de población
    const estadisticasResponse = await axios.get('http://localhost:3000/api/estadisticas/poblacion', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Respuesta exitosa!\n');
    console.log('📈 Estadísticas de Población:');
    console.log('=====================================\n');
    console.log(JSON.stringify(estadisticasResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error en la prueba:');
    console.error('Status:', error.response?.status);
    console.error('Mensaje:', error.response?.data?.mensaje || error.response?.data?.message);
    console.error('\n🔍 Error detallado:');
    console.error(error.response?.data?.error || error.message);
    console.error('\n📦 Respuesta completa:');
    console.error(JSON.stringify(error.response?.data, null, 2));
  }
}

testEstadisticasPoblacion();
