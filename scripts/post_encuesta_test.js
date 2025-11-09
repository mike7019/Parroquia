import fs from 'fs';
import path from 'path';
import axios from 'axios';

const API = 'http://localhost:3000/api';
const payloadPath = path.resolve('payloads', 'encuesta-test.json');

async function run() {
  const login = { correo_electronico: 'admin@parroquia.com', contrasena: 'Admin123!' };

  try {
    const loginRes = await axios.post(`${API}/auth/login`, login);
    const token = loginRes.data?.data?.accessToken || loginRes.data?.access_token || loginRes.data?.token;
    if (!token) throw new Error('No token returned from login');

    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

    const res = await axios.post(`${API}/encuesta`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('POST /api/encuesta response status:', res.status);
    console.log('Response data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error during test POST:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
