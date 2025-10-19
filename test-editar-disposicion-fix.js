import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Credenciales de autenticación
const credentials = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'Admin123!'
};

let token = '';

async function login() {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    token = response.data.data?.token || response.data.token;
    console.log('Token recibido:', token ? 'OK' : 'NO');
    console.log('✅ Sesión iniciada exitosamente\n');
    return token;
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testEditarDisposicion() {
  try {
    await login();

    console.log('📝 TEST: Editar disposición de basura ID 6');
    console.log('='.repeat(50));

    // Datos para actualizar
    const updateData = {
      nombre: 'Recolección Municipal Actualizada',
      descripcion: 'Servicio de recolección actualizado por el municipio'
    };

    console.log('\n📤 Datos a enviar:', JSON.stringify(updateData, null, 2));

    const response = await axios.put(
      `${BASE_URL}/catalog/disposicion-basura/tipos/6`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ ÉXITO - Disposición actualizada:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

// Ejecutar el test
testEditarDisposicion();
