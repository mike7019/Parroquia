import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function test() {
  try {
    // 1. Login
    console.log('1. Autenticando...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✅ Token obtenido\n');
    
    // 2. POST encuesta
    console.log('2. Creando encuesta...');
    const encuesta = {
      "informacionGeneral": {
        "municipio": { "id": 1 },
        "parroquia": { "id": 1 },
        "fecha": "2025-08-25",
        "apellido_familiar": `TestSimple-${Date.now()}`,
        "direccion": `Calle ${Date.now()}`,
        "telefono": "3001234567"
      },
      "vivienda": { "tipo_vivienda": { "id": 1 } },
      "servicios_agua": { "sistema_acueducto": { "id": 1 } },
      "observaciones": { "autorizacion_datos": true },
      "familyMembers": [],
      "deceasedMembers": []
    };
    
    const response = await axios.post(`${BASE_URL}/encuesta`, encuesta, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Encuesta creada exitosamente!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ ERROR:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Code:', error.response?.data?.code);
    console.error('Errors:', JSON.stringify(error.response?.data?.errors, null, 2));
    console.error('Details:', JSON.stringify(error.response?.data, null, 2));
  }
}

test();
