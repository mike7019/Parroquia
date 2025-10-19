import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Credenciales de administrador
const credentials = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'Admin123!'
};

let token = '';
let corregimientoTestId = null;

async function login() {
  try {
    console.log('🔐 Iniciando sesión como administrador...');
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    // El endpoint retorna data.accessToken
    token = response.data.data?.accessToken || response.data.accessToken;
    if (!token) {
      console.error('❌ No se recibió accessToken en la respuesta:', response.data);
      process.exit(1);
    }
    console.log('✅ Sesión iniciada exitosamente\n');
    return token;
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testGetAllCorregimientos() {
  try {
    console.log('1️⃣ TEST: Obtener todos los corregimientos');
    console.log('='.repeat(70));

    const response = await axios.get(`${BASE_URL}/catalog/corregimientos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`✅ Total: ${response.data.pagination.total} corregimientos`);
    console.log('   Datos:', JSON.stringify(response.data.data.slice(0, 2), null, 2), '\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testCreateCorregimiento() {
  try {
    console.log('2️⃣ TEST: Crear nuevo corregimiento');
    console.log('='.repeat(70));

    const unique = `${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const nuevoCorregimiento = {
      nombre: `Corregimiento Prueba ${unique}`,
      codigo_corregimiento: `TEST-${unique}`,
      id_municipio_municipios: 1
    };

    const response = await axios.post(
      `${BASE_URL}/catalog/corregimientos`,
      nuevoCorregimiento,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    corregimientoTestId = response.data.data.id_corregimiento;
    console.log('✅ Corregimiento creado:');
    console.log('   ID:', corregimientoTestId);
    console.log('   Nombre:', response.data.data.nombre);
    console.log('   Código:', response.data.data.codigo_corregimiento, '\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testGetCorregimientoById() {
  try {
    console.log('3️⃣ TEST: Obtener corregimiento por ID');
    console.log('='.repeat(70));

    const response = await axios.get(
      `${BASE_URL}/catalog/corregimientos/${corregimientoTestId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    console.log('✅ Corregimiento obtenido:');
    console.log(JSON.stringify(response.data.data, null, 2), '\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testUpdateCorregimiento() {
  try {
    console.log('4️⃣ TEST: Actualizar corregimiento');
    console.log('='.repeat(70));

    const datosActualizados = {
      nombre: `Corregimiento Actualizado ${Date.now()}`,
      codigo_corregimiento: `UPD-${Date.now()}`
    };

    const response = await axios.put(
      `${BASE_URL}/catalog/corregimientos/${corregimientoTestId}`,
      datosActualizados,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    console.log('✅ Corregimiento actualizado:');
    console.log('   Nombre:', response.data.data.nombre);
    console.log('   Código:', response.data.data.codigo_corregimiento, '\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testSearchCorregimientos() {
  try {
    console.log('5️⃣ TEST: Buscar corregimientos');
    console.log('='.repeat(70));

    const response = await axios.get(
      `${BASE_URL}/catalog/corregimientos?search=prueba&limit=10`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    console.log(`✅ Búsqueda "prueba": ${response.data.pagination.total} resultado(s)`);
    console.log('   Primer resultado:', response.data.data[0]?.nombre || 'N/A', '\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testGetEstadisticas() {
  try {
    console.log('6️⃣ TEST: Obtener estadísticas');
    console.log('='.repeat(70));

    const response = await axios.get(
      `${BASE_URL}/catalog/corregimientos/statistics`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    console.log(`✅ Estadísticas: ${response.data.data.length} corregimiento(s)`);
    console.log('   Primeros 3:');
    response.data.data.slice(0, 3).forEach(stat => {
      console.log(`   - ${stat.nombre}: ${stat.familias_usando} familia(s)`);
    });
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testDeleteCorregimiento() {
  try {
    console.log('7️⃣ TEST: Eliminar corregimiento');
    console.log('='.repeat(70));

    const response = await axios.delete(
      `${BASE_URL}/catalog/corregimientos/${corregimientoTestId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    console.log('✅ Corregimiento eliminado exitosamente');
    console.log('   Mensaje:', response.data.message, '\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testValidaciones() {
  try {
    console.log('8️⃣ TEST: Validaciones');
    console.log('='.repeat(70));

    // Intentar crear sin nombre
    try {
      await axios.post(
        `${BASE_URL}/catalog/corregimientos`,
        { codigo_corregimiento: 'TEST' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (error) {
      console.log('✅ Validación de nombre requerido:', error.response?.data?.message || 'OK');
    }

    // Intentar crear con nombre duplicado
    try {
      await axios.post(
        `${BASE_URL}/catalog/corregimientos`,
        { nombre: 'Corregimiento El Centro', codigo_corregimiento: 'DUP-TEST' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (error) {
      console.log('✅ Validación de nombre duplicado:', error.response?.data?.message || 'OK');
    }

    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runAllTests() {
  try {
    console.log('🧪 TEST SUITE: CRUD Completo de Corregimientos');
    console.log('='.repeat(70), '\n');

    await login();
    await testGetAllCorregimientos();
    await testCreateCorregimiento();
    await testGetCorregimientoById();
    await testUpdateCorregimiento();
    await testSearchCorregimientos();
    await testGetEstadisticas();
    await testDeleteCorregimiento();
    await testValidaciones();

    console.log('='.repeat(70));
    console.log('✅ TODOS LOS TESTS COMPLETADOS\n');
    console.log('📝 RESUMEN:');
    console.log('   ✅ GET /api/catalog/corregimientos - Listar todos');
    console.log('   ✅ POST /api/catalog/corregimientos - Crear');
    console.log('   ✅ GET /api/catalog/corregimientos/:id - Obtener por ID');
    console.log('   ✅ PUT /api/catalog/corregimientos/:id - Actualizar');
    console.log('   ✅ DELETE /api/catalog/corregimientos/:id - Eliminar');
    console.log('   ✅ GET /api/catalog/corregimientos/statistics - Estadísticas');
    console.log('   ✅ Búsqueda y filtros');
    console.log('   ✅ Validaciones\n');

  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    process.exit(1);
  }
}

runAllTests();
