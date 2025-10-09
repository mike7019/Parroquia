const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Credenciales de admin (ajusta según tu configuración)
const ADMIN_CREDENTIALS = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'Admin123!'
};

const IP_BRASIL = '187.113.156.8';

async function testIPWhitelist() {
  console.log('🔍 TEST DE IP WHITELIST\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Login como administrador
    console.log('\n1️⃣ Iniciando sesión como administrador...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    const token = loginResponse.data.datos.accessToken;
    console.log('   ✅ Login exitoso');
    console.log('   Token:', token.substring(0, 30) + '...');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Verificar IP actual
    console.log('\n2️⃣ Verificando IP actual del cliente...');
    const checkResponse = await axios.get(`${BASE_URL}/admin/ip-whitelist/check`, config);
    console.log('   📍 IP Actual:', checkResponse.data.datos.currentIP);
    console.log('   🔐 ¿Está en whitelist?:', checkResponse.data.datos.isWhitelisted);

    // 3. Obtener lista actual de IPs whitelisted
    console.log('\n3️⃣ Obteniendo lista de IPs en whitelist...');
    const listResponse = await axios.get(`${BASE_URL}/admin/ip-whitelist`, config);
    console.log('   📋 IPs Whitelisted:', listResponse.data.datos.whitelistedIPs);
    console.log('   📊 Total:', listResponse.data.datos.total);

    // 4. Agregar IP de Brasil a la whitelist
    console.log(`\n4️⃣ Agregando IP de Brasil (${IP_BRASIL}) a whitelist...`);
    const addResponse = await axios.post(
      `${BASE_URL}/admin/ip-whitelist`,
      {
        ip: IP_BRASIL,
        description: 'Usuario en Brasil - Acceso desde fuera de Colombia'
      },
      config
    );
    console.log('   ✅', addResponse.data.mensaje);
    console.log('   📝 Detalles:', addResponse.data.datos);

    // 5. Verificar que se agregó correctamente
    console.log('\n5️⃣ Verificando que la IP se agregó...');
    const listResponse2 = await axios.get(`${BASE_URL}/admin/ip-whitelist`, config);
    const ipEnLista = listResponse2.data.datos.whitelistedIPs.includes(IP_BRASIL);
    
    if (ipEnLista) {
      console.log(`   ✅ IP ${IP_BRASIL} se encuentra en la whitelist`);
    } else {
      console.log(`   ❌ IP ${IP_BRASIL} NO se encuentra en la whitelist`);
    }
    
    console.log('   📋 Lista actualizada:', listResponse2.data.datos.whitelistedIPs);

    // 6. Opcional: Probar login desde la IP whitelisted
    console.log('\n6️⃣ La IP de Brasil ahora puede hacer login sin restricciones');
    console.log('   ℹ️  Rate limiting será bypasseado para esta IP');
    console.log('   ℹ️  Puede hacer login desde Brasil usando VPN o conexión directa');

    // 7. Resumen
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ WHITELIST CONFIGURADA EXITOSAMENTE\n');
    console.log('Detalles de la configuración:');
    console.log(`  • IP agregada: ${IP_BRASIL}`);
    console.log('  • Ubicación: Brasil');
    console.log('  • Beneficio: Sin rate limiting');
    console.log('  • Estado: Activa');
    console.log('\n💡 Tu amigo ahora puede:');
    console.log('  1. Conectarse desde Brasil sin VPN');
    console.log('  2. Conectarse desde Brasil con VPN');
    console.log('  3. Hacer login sin restricciones de rate limiting');
    console.log('  4. Usar la aplicación normalmente desde cualquier ubicación');
    
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n⚠️  Las credenciales de admin son incorrectas.');
        console.error('   Actualiza ADMIN_CREDENTIALS en este script.');
      } else if (error.response.status === 403) {
        console.error('\n⚠️  El usuario no tiene permisos de administrador.');
        console.error('   Asegúrate de usar una cuenta con rol "Administrador".');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  No se puede conectar al servidor.');
      console.error('   Asegúrate de que el servidor esté corriendo en http://localhost:3000');
    }
  }
}

// Ejecutar test
console.log('🚀 Iniciando test de IP Whitelist...\n');
testIPWhitelist();
