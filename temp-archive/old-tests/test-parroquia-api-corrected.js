import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Datos de autenticación
const loginData = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'admin123'
};

async function testParroquiaAPI() {
  try {
    console.log('🔐 Iniciando sesión...');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    const token = loginResponse.data.token;
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Login exitoso');
    console.log('📋 Token obtenido');
    
    // 1. Obtener todos los municipios para usar en las pruebas
    console.log('\n🏙️  Obteniendo municipios...');
    const municipiosResponse = await axios.get(`${BASE_URL}/catalog/municipios`, { headers: authHeaders });
    const municipios = municipiosResponse.data.data || municipiosResponse.data;
    
    if (municipios.length === 0) {
      console.log('❌ No hay municipios disponibles para la prueba');
      return;
    }
    
    const municipio = municipios[0]; // Usar el primer municipio
    console.log(`✅ Usando municipio: ${municipio.nombre_municipio} (ID: ${municipio.id_municipio})`);
    
    // 2. Crear una nueva parroquia con todos los campos
    console.log('\n➕ Creando nueva parroquia...');
    const nuevaParroquia = {
      nombre: 'Parroquia San José',
      id_municipio: municipio.id_municipio,
      descripcion: 'Parroquia dedicada a San José, patrón de los trabajadores',
      direccion: 'Calle 123 #45-67, Centro',
      telefono: '+57 301 234 5678',
      email: 'sanjose@parroquia.com',
      activo: true
    };
    
    const createResponse = await axios.post(`${BASE_URL}/catalog/parroquias`, nuevaParroquia, { headers: authHeaders });
    const parroquiaCreada = createResponse.data.data;
    
    console.log('✅ Parroquia creada exitosamente:');
    console.log(`   ID: ${parroquiaCreada.id_parroquia}`);
    console.log(`   Nombre: ${parroquiaCreada.nombre}`);
    console.log(`   Municipio: ${parroquiaCreada.municipio?.nombre_municipio || 'N/A'}`);
    console.log(`   Descripción: ${parroquiaCreada.descripcion}`);
    console.log(`   Dirección: ${parroquiaCreada.direccion}`);
    console.log(`   Teléfono: ${parroquiaCreada.telefono}`);
    console.log(`   Email: ${parroquiaCreada.email}`);
    console.log(`   Activo: ${parroquiaCreada.activo}`);
    
    // 3. Obtener parroquia por ID
    console.log('\n🔍 Obteniendo parroquia por ID...');
    const getResponse = await axios.get(`${BASE_URL}/catalog/parroquias/${parroquiaCreada.id_parroquia}`, { headers: authHeaders });
    const parroquiaObtenida = getResponse.data.data;
    
    console.log('✅ Parroquia obtenida:');
    console.log(`   Nombre: ${parroquiaObtenida.nombre}`);
    console.log(`   Municipio: ${parroquiaObtenida.municipio?.nombre_municipio || 'N/A'}`);
    
    // 4. Actualizar parroquia
    console.log('\n✏️  Actualizando parroquia...');
    const datosActualizacion = {
      descripcion: 'Parroquia actualizada - San José, patrón de la familia y el trabajo',
      telefono: '+57 301 987 6543'
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/catalog/parroquias/${parroquiaCreada.id_parroquia}`, datosActualizacion, { headers: authHeaders });
    const parroquiaActualizada = updateResponse.data.data;
    
    console.log('✅ Parroquia actualizada:');
    console.log(`   Descripción: ${parroquiaActualizada.descripcion}`);
    console.log(`   Teléfono: ${parroquiaActualizada.telefono}`);
    
    // 5. Obtener parroquias por municipio  
    console.log('\n🏙️  Obteniendo parroquias por municipio...');
    try {
      const parroquiasMunicipioResponse = await axios.get(`${BASE_URL}/catalog/parroquias/municipio/${municipio.id_municipio}`, { headers: authHeaders });
      const parroquiasMunicipio = parroquiasMunicipioResponse.data.data;
      console.log(`✅ Parroquias encontradas en municipio ${municipio.nombre_municipio}: ${parroquiasMunicipio.length}`);
    } catch (error) {
      console.log('⚠️  Endpoint de municipio no disponible, continuando...');
    }
    
    // 6. Buscar parroquias
    console.log('\n🔎 Buscando parroquias con "San"...');
    const searchResponse = await axios.get(`${BASE_URL}/catalog/parroquias?search=San`, { headers: authHeaders });
    const resultadosBusqueda = searchResponse.data.data;
    
    console.log(`✅ Resultados de búsqueda: ${resultadosBusqueda.parroquias?.length || resultadosBusqueda.length || 0} parroquias encontradas`);
    
    // 7. Obtener todas las parroquias
    console.log('\n📋 Obteniendo todas las parroquias...');
    const allResponse = await axios.get(`${BASE_URL}/catalog/parroquias`, { headers: authHeaders });
    const todasParroquias = allResponse.data.data;
    
    console.log(`✅ Total de parroquias: ${todasParroquias.total || todasParroquias.parroquias?.length || todasParroquias.length || 'N/A'}`);
    
    console.log('\n🎉 ¡Todas las pruebas del API de Parroquias completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('🔒 Error de autenticación. Verifica las credenciales.');
    }
  }
}

testParroquiaAPI();
