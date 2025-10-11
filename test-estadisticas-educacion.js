import axios from 'axios';

async function testEstadisticasEducacion() {
  try {
    console.log('🔐 Paso 1: Autenticando usuario...\n');
    
    // Login para obtener token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });

    console.log('Respuesta de login:', JSON.stringify(loginResponse.data, null, 2));
    const token = loginResponse.data.data?.accessToken || loginResponse.data.datos?.accessToken || loginResponse.data.accessToken || loginResponse.data.token;
    
    if (!token) {
      console.error('❌ No se pudo obtener el token de la respuesta');
      return;
    }
    
    console.log('✅ Token obtenido exitosamente\n');

    console.log('📊 Paso 2: Consultando estadísticas de educación...\n');
    
    // Consultar estadísticas de educación
    const estadisticasResponse = await axios.get('http://localhost:3000/api/estadisticas/educacion', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Respuesta exitosa!\n');
    console.log('📈 Estadísticas de Educación:');
    console.log('=====================================\n');
    console.log(JSON.stringify(estadisticasResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error en la prueba:');
    console.error('Status:', error.response?.status);
    console.error('Mensaje:', error.response?.data?.mensaje || error.response?.data?.message);
    console.error('\n🔍 Error detallado:');
    console.error(error.response?.data?.error || error.message);
    
    if (error.response?.data?.details) {
      console.error('\n📋 Detalles adicionales:');
      console.error(error.response.data.details);
    }
    
    // Mostrar stack trace si está disponible
    if (error.response?.data?.stack) {
      console.error('\n📚 Stack trace:');
      console.error(error.response.data.stack);
    }
    
    // Mostrar datos completos
    console.error('\n📦 Respuesta completa:');
    console.error(JSON.stringify(error.response?.data, null, 2));
  }
}

testEstadisticasEducacion();
