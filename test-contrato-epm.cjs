const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const TEST_CREDENTIALS = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'Admin123!'
};

async function testContratoEPM() {
  console.log('🧪 TEST: Verificar campo numero_contrato_epm\n');
  console.log('='.repeat(70));
  
  try {
    // 1. Login
    console.log('\n1️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    const token = loginResponse.data.data.accessToken;
    console.log('   ✅ Login exitoso');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Obtener encuesta
    console.log('\n2️⃣ Obteniendo encuesta por ID 48...');
    const response = await axios.get(`${BASE_URL}/encuesta/48`, config);
    const encuesta = response.data.data || response.data.datos;
    
    // 3. Verificar campo numero_contrato_epm
    console.log('\n3️⃣ Verificando campo numero_contrato_epm...\n');
    
    const contratoEPM = encuesta.numero_contrato_epm;
    
    if (contratoEPM !== undefined) {
      console.log(`   ✅ Campo numero_contrato_epm PRESENTE`);
      console.log(`   📄 Valor: ${JSON.stringify(contratoEPM)}`);
    } else {
      console.log(`   ❌ Campo numero_contrato_epm NO PRESENTE`);
    }
    
    console.log('\n' + '='.repeat(70));
    
    if (contratoEPM !== undefined) {
      console.log('\n✅ ¡CAMPO PRESENTE! FIX EXITOSO');
    } else {
      console.log('\n❌ CAMPO FALTANTE');
    }
    
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testContratoEPM();
