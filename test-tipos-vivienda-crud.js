import { request } from 'http';
import { URL } from 'url';

// Configuración del servidor
const BASE_URL = 'http://localhost:5000';
const API_BASE = '/api/catalog/tipos-vivienda';

// Token de autenticación (deberás obtener uno válido)
let authToken = '';

// Función auxiliar para hacer peticiones HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    };

    const req = request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testTiposViviendaCRUD() {
  console.log('🏠 Iniciando pruebas del CRUD de Tipos de Vivienda\n');

  try {
    // 1. Probar obtener todos los tipos (GET /)
    console.log('1️⃣ Probando GET /tipos-vivienda');
    const getAllResponse = await makeRequest('GET', API_BASE);
    console.log(`Status: ${getAllResponse.status}`);
    console.log('Response:', JSON.stringify(getAllResponse.data, null, 2));
    console.log('---\n');

    // 2. Probar crear un nuevo tipo (POST /)
    console.log('2️⃣ Probando POST /tipos-vivienda');
    const newTipo = {
      nombre: 'Casa de Prueba',
      descripcion: 'Tipo de vivienda creado para pruebas',
      activo: true
    };
    const createResponse = await makeRequest('POST', API_BASE, newTipo);
    console.log(`Status: ${createResponse.status}`);
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));
    
    let createdId = null;
    if (createResponse.status === 201 && createResponse.data.data?.tipo?.id_tipo_vivienda) {
      createdId = createResponse.data.data.tipo.id_tipo_vivienda;
      console.log(`✅ Tipo creado con ID: ${createdId}`);
    }
    console.log('---\n');

    // 3. Probar obtener por ID (GET /:id)
    if (createdId) {
      console.log('3️⃣ Probando GET /tipos-vivienda/:id');
      const getByIdResponse = await makeRequest('GET', `${API_BASE}/${createdId}`);
      console.log(`Status: ${getByIdResponse.status}`);
      console.log('Response:', JSON.stringify(getByIdResponse.data, null, 2));
      console.log('---\n');
    }

    // 4. Probar actualizar (PUT /:id)
    if (createdId) {
      console.log('4️⃣ Probando PUT /tipos-vivienda/:id');
      const updateData = {
        nombre: 'Casa de Prueba Actualizada',
        descripcion: 'Descripción actualizada para pruebas'
      };
      const updateResponse = await makeRequest('PUT', `${API_BASE}/${createdId}`, updateData);
      console.log(`Status: ${updateResponse.status}`);
      console.log('Response:', JSON.stringify(updateResponse.data, null, 2));
      console.log('---\n');
    }

    // 5. Probar toggle estado (PATCH /:id/toggle-estado)
    if (createdId) {
      console.log('5️⃣ Probando PATCH /tipos-vivienda/:id/toggle-estado');
      const toggleResponse = await makeRequest('PATCH', `${API_BASE}/${createdId}/toggle-estado`);
      console.log(`Status: ${toggleResponse.status}`);
      console.log('Response:', JSON.stringify(toggleResponse.data, null, 2));
      console.log('---\n');
    }

    // 6. Probar obtener activos (GET /activos)
    console.log('6️⃣ Probando GET /tipos-vivienda/activos');
    const getActivosResponse = await makeRequest('GET', `${API_BASE}/activos`);
    console.log(`Status: ${getActivosResponse.status}`);
    console.log('Response:', JSON.stringify(getActivosResponse.data, null, 2));
    console.log('---\n');

    // 7. Probar estadísticas (GET /estadisticas)
    console.log('7️⃣ Probando GET /tipos-vivienda/estadisticas');
    const getEstadisticasResponse = await makeRequest('GET', `${API_BASE}/estadisticas`);
    console.log(`Status: ${getEstadisticasResponse.status}`);
    console.log('Response:', JSON.stringify(getEstadisticasResponse.data, null, 2));
    console.log('---\n');

    // 8. Probar eliminación (DELETE /:id)
    if (createdId) {
      console.log('8️⃣ Probando DELETE /tipos-vivienda/:id');
      const deleteResponse = await makeRequest('DELETE', `${API_BASE}/${createdId}`);
      console.log(`Status: ${deleteResponse.status}`);
      console.log('Response:', JSON.stringify(deleteResponse.data, null, 2));
      console.log('---\n');
    }

    console.log('✅ Pruebas completadas');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
console.log('⚠️  NOTA: Asegúrate de que el servidor esté ejecutándose en el puerto 5000');
console.log('⚠️  NOTA: Necesitarás un token de autenticación válido para las pruebas');
console.log('⚠️  NOTA: Modifica la variable authToken con un token válido\n');

testTiposViviendaCRUD();
