import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });
    authToken = response.data.data?.accessToken || response.data.accessToken;
    console.log('✅ Login exitoso\n');
    return true;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

async function queryEncuesta54() {
  console.log('═'.repeat(80));
  console.log('🔍 DIAGNÓSTICO: Encuesta ID 54');
  console.log('═'.repeat(80));
  console.log('');

  const loginOk = await login();
  if (!loginOk) return;

  try {
    console.log('📥 Consultando encuesta ID 54...');
    const getResponse = await axios.get(`${API_URL}/encuesta/54`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const familia = getResponse.data.data;
    console.log('');
    console.log('═'.repeat(80));
    console.log('📊 DATOS GEOGRÁFICOS:');
    console.log('═'.repeat(80));
    console.log('   - Municipio:', JSON.stringify(familia.municipio));
    console.log('   - Parroquia:', JSON.stringify(familia.parroquia));
    console.log('   - Sector:', JSON.stringify(familia.sector));
    console.log('   - Vereda:', JSON.stringify(familia.vereda));
    console.log('   - Corregimiento:', JSON.stringify(familia.corregimiento));
    console.log('');
    console.log('═'.repeat(80));
    console.log('📊 OTROS CAMPOS:');
    console.log('═'.repeat(80));
    console.log('   - numero_contrato_epm:', familia.numero_contrato_epm);
    console.log('   - comunion_en_casa:', familia.comunion_en_casa);
    console.log('');

    // Verificar en la base de datos directamente
    console.log('═'.repeat(80));
    console.log('🔍 CONSULTA DIRECTA A BD:');
    console.log('═'.repeat(80));
    console.log('Ejecuta este query en tu base de datos para verificar:');
    console.log('');
    console.log(`SELECT id_familia, apellido_familiar, id_corregimiento, numero_contrato_epm`);
    console.log(`FROM familias WHERE id_familia = 54;`);
    console.log('');

    if (!familia.corregimiento) {
      console.log('❌ PROBLEMA 1: corregimiento no está en la respuesta');
      console.log('   Posibles causas:');
      console.log('   • El campo id_corregimiento es NULL en la BD (encuesta creada antes del fix)');
      console.log('   • El LEFT JOIN no está funcionando');
      console.log('   • El campo no se está incluyendo en la respuesta');
    } else {
      console.log('✅ corregimiento SÍ está en la respuesta');
    }

    if (!familia.numero_contrato_epm) {
      console.log('');
      console.log('❌ PROBLEMA 2: numero_contrato_epm es null');
      console.log('   Posibles causas:');
      console.log('   • El campo no se guardó al crear la encuesta');
      console.log('   • El campo es NULL en la BD');
      console.log('   • El campo no se está mapeando correctamente');
    } else {
      console.log('✅ numero_contrato_epm tiene valor:', familia.numero_contrato_epm);
    }
    
    console.log('');
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

queryEncuesta54();
