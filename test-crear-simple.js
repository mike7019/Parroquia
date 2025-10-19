import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let token = '';

const login = async () => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    correo_electronico: 'admin@parroquia.com',
    contrasena: 'Admin123!'
  });
  
  token = response.data.data?.accessToken || response.data.accessToken;
  console.log('✅ Login exitoso\n');
};

const testCreacion = async () => {
  console.log('📝 TEST: Creando corregimientos con código automático\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const nombres = [
    'Corregimiento La Primavera',
    'Corregimiento El Paraíso',
    'Corregimiento San Isidro'
  ];
  
  for (const nombre of nombres) {
    try {
      const response = await axios.post(`${BASE_URL}/catalog/corregimientos`, {
        nombre,
        id_municipio_municipios: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const corr = response.data.data;
      console.log(`✅ Creado exitosamente:`);
      console.log(`   ID: ${corr.id_corregimiento}`);
      console.log(`   Código: ${corr.codigo_corregimiento}`);
      console.log(`   Nombre: ${corr.nombre}`);
      console.log('');
    } catch (error) {
      console.log(`❌ Error creando "${nombre}":`);
      console.log(`   ${error.response?.data?.message || error.message}`);
      console.log(`   Detalles:`, error.response?.data);
      console.log('');
    }
  }
};

const verCorregimientos = async () => {
  console.log('\n📋 Corregimientos en la base de datos:\n');
  
  const response = await axios.get(`${BASE_URL}/catalog/corregimientos?limit=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const corregimientos = response.data.data || [];
  
  console.log('ID  | Código      | Nombre');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const corr of corregimientos) {
    console.log(`${String(corr.id_corregimiento).padStart(3)} | ${corr.codigo_corregimiento.padEnd(11)} | ${corr.nombre}`);
  }
  
  console.log('');
};

(async () => {
  await login();
  await testCreacion();
  await verCorregimientos();
})();
