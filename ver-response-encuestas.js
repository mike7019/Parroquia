import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function verRespuesta() {
  const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
    correo_electronico: 'admin@parroquia.com',
    contrasena: 'Admin123!'
  });
  
  const token = loginResponse.data.data?.accessToken || loginResponse.data.accessToken;
  
  const listResponse = await axios.get(`${BASE_URL}/api/encuesta`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('\n📊 Estructura completa del response:\n');
  console.log(JSON.stringify(listResponse.data, null, 2));
}

verRespuesta().catch(console.error);
