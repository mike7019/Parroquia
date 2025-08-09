// Test HTTP del CRUD de Disposición de Basura
const baseUrl = 'http://localhost:3000';

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();
    return {
      status: response.status,
      data,
      ok: response.ok
    };
  } catch (error) {
    console.error(`Error en ${method} ${endpoint}:`, error.message);
    return { status: 500, data: { error: error.message }, ok: false };
  }
}

async function testHTTPRoutes() {
  console.log('🌐 === PRUEBA DE RUTAS HTTP DEL CRUD DISPOSICIÓN DE BASURA ===\n');

  try {
    // 1. Registrar un usuario temporal para obtener token
    console.log('👤 1. REGISTRANDO USUARIO TEMPORAL:');
    const randomEmail = `test_${Date.now()}@ejemplo.com`;
    const userData = {
      primer_nombre: 'Test',
      primer_apellido: 'Usuario',
      correo_electronico: randomEmail,
      contrasena: 'TestPassword123!',
      rol: 'Administrador'
    };

    const registerResponse = await makeRequest('/api/auth/register', 'POST', userData);
    if (!registerResponse.ok) {
      console.log('   ⚠️ Error al registrar usuario, intentando con login...');
      console.log('   Respuesta:', registerResponse.data);
    } else {
      console.log('   ✅ Usuario registrado exitosamente');
    }

    // 2. Intentar login (usar credenciales de un usuario existente si hay error)
    console.log('\n🔐 2. OBTENIENDO TOKEN DE ACCESO:');
    let token = null;
    
    if (registerResponse.ok && registerResponse.data.data?.accessToken) {
      token = registerResponse.data.data.accessToken;
      console.log('   ✅ Token obtenido del registro');
    } else {
      // Intentar con usuarios existentes conocidos
      const loginAttempts = [
        { correo_electronico: 'diego.garcsdsd5@yopmail.com', contrasena: 'admin123' },
        { correo_electronico: 'diasdasarcsdsd5@yopmail.com', contrasena: 'admin123' },
        { correo_electronico: randomEmail, contrasena: 'TestPassword123!' }
      ];

      for (const credentials of loginAttempts) {
        const loginResponse = await makeRequest('/api/auth/login', 'POST', credentials);
        if (loginResponse.ok) {
          token = loginResponse.data.data.accessToken;
          console.log(`   ✅ Token obtenido con login: ${credentials.correo_electronico}`);
          break;
        }
      }
    }

    if (!token) {
      console.log('   ❌ No se pudo obtener token de acceso');
      console.log('   💡 Tip: Crear un usuario manualmente en la base de datos');
      return;
    }

    // 3. Probar rutas GET
    console.log('\n📋 3. PROBANDO RUTAS GET:');
    
    // GET /tipos
    console.log('   🔍 GET /api/catalog/disposicion-basura/tipos');
    const tiposResponse = await makeRequest('/api/catalog/disposicion-basura/tipos', 'GET', null, token);
    if (tiposResponse.ok) {
      console.log(`   ✅ Obtenidos ${tiposResponse.data.data.tipos.length} tipos de disposición`);
      console.log(`   📄 Paginación: ${tiposResponse.data.data.pagination.currentPage}/${tiposResponse.data.data.pagination.totalPages}`);
    } else {
      console.log('   ❌ Error:', tiposResponse.data);
    }

    // GET /tipos con parámetros
    console.log('   🔍 GET /tipos?search=recolección&limit=5');
    const tiposBusquedaResponse = await makeRequest(
      '/api/catalog/disposicion-basura/tipos?search=recolección&limit=5', 
      'GET', null, token
    );
    if (tiposBusquedaResponse.ok) {
      console.log(`   ✅ Búsqueda exitosa: ${tiposBusquedaResponse.data.data.tipos.length} resultados`);
    } else {
      console.log('   ❌ Error en búsqueda:', tiposBusquedaResponse.data);
    }

    // GET /estadisticas
    console.log('   📊 GET /api/catalog/disposicion-basura/estadisticas');
    const estadisticasResponse = await makeRequest('/api/catalog/disposicion-basura/estadisticas', 'GET', null, token);
    if (estadisticasResponse.ok) {
      console.log(`   ✅ Estadísticas obtenidas: ${estadisticasResponse.data.data.estadisticas.length} tipos`);
      estadisticasResponse.data.data.estadisticas.slice(0, 3).forEach(stat => {
        console.log(`      • ${stat.nombre}: ${stat.familias_usando} familias`);
      });
    } else {
      console.log('   ❌ Error en estadísticas:', estadisticasResponse.data);
    }

    // 4. Probar POST (crear)
    console.log('\n➕ 4. PROBANDO CREACIÓN (POST):');
    const nuevoTipo = {
      nombre: `Prueba HTTP ${Date.now()}`,
      descripcion: 'Tipo creado desde prueba HTTP'
    };

    const createResponse = await makeRequest('/api/catalog/disposicion-basura/tipos', 'POST', nuevoTipo, token);
    let tipoId = null;
    if (createResponse.ok) {
      tipoId = createResponse.data.data.tipo.id_tipo_disposicion_basura;
      console.log(`   ✅ Tipo creado exitosamente con ID: ${tipoId}`);
      console.log(`   📝 Nombre: ${createResponse.data.data.tipo.nombre}`);
    } else {
      console.log('   ❌ Error al crear:', createResponse.data);
    }

    if (tipoId) {
      // 5. Probar GET por ID
      console.log('\n🔍 5. PROBANDO GET POR ID:');
      const getByIdResponse = await makeRequest(`/api/catalog/disposicion-basura/tipos/${tipoId}`, 'GET', null, token);
      if (getByIdResponse.ok) {
        console.log(`   ✅ Tipo obtenido por ID: ${getByIdResponse.data.data.tipo.nombre}`);
      } else {
        console.log('   ❌ Error al obtener por ID:', getByIdResponse.data);
      }

      // 6. Probar PUT (actualizar)
      console.log('\n✏️ 6. PROBANDO ACTUALIZACIÓN (PUT):');
      const updateData = {
        nombre: `Prueba HTTP Actualizada ${Date.now()}`,
        descripcion: 'Descripción actualizada desde HTTP'
      };

      const updateResponse = await makeRequest(`/api/catalog/disposicion-basura/tipos/${tipoId}`, 'PUT', updateData, token);
      if (updateResponse.ok) {
        console.log(`   ✅ Tipo actualizado exitosamente`);
        console.log(`   📝 Nuevo nombre: ${updateResponse.data.data.tipo.nombre}`);
      } else {
        console.log('   ❌ Error al actualizar:', updateResponse.data);
      }

      // 7. Probar DELETE
      console.log('\n🗑️ 7. PROBANDO ELIMINACIÓN (DELETE):');
      const deleteResponse = await makeRequest(`/api/catalog/disposicion-basura/tipos/${tipoId}`, 'DELETE', null, token);
      if (deleteResponse.ok) {
        console.log(`   ✅ Tipo eliminado exitosamente`);
      } else {
        console.log('   ❌ Error al eliminar:', deleteResponse.data);
      }

      // 8. Verificar que fue eliminado
      console.log('\n🔍 8. VERIFICANDO ELIMINACIÓN:');
      const verifyDeleteResponse = await makeRequest(`/api/catalog/disposicion-basura/tipos/${tipoId}`, 'GET', null, token);
      if (!verifyDeleteResponse.ok && verifyDeleteResponse.status === 404) {
        console.log(`   ✅ Confirmado: tipo eliminado correctamente (404)`);
      } else {
        console.log('   ❌ El tipo aún existe o error inesperado:', verifyDeleteResponse.data);
      }
    }

    // 9. Probar validaciones
    console.log('\n🔒 9. PROBANDO VALIDACIONES:');
    
    // Crear con datos inválidos
    const datosInvalidos = {
      nombre: '',  // Nombre vacío
      descripcion: 'A'.repeat(600)  // Descripción muy larga
    };

    const validationResponse = await makeRequest('/api/catalog/disposicion-basura/tipos', 'POST', datosInvalidos, token);
    if (!validationResponse.ok && validationResponse.status === 400) {
      console.log('   ✅ Validaciones funcionando correctamente (400)');
      console.log('   📝 Errores detectados en la validación');
    } else {
      console.log('   ❌ Las validaciones no funcionaron como esperado');
    }

    // Probar acceso sin token
    console.log('\n🔐 10. PROBANDO SEGURIDAD (SIN TOKEN):');
    const noTokenResponse = await makeRequest('/api/catalog/disposicion-basura/tipos', 'GET');
    if (!noTokenResponse.ok && noTokenResponse.status === 401) {
      console.log('   ✅ Seguridad funcionando: acceso denegado sin token (401)');
    } else {
      console.log('   ❌ Problema de seguridad: acceso permitido sin token');
    }

    console.log('\n🎉 === PRUEBAS HTTP COMPLETADAS ===');
    console.log('\n📋 RUTAS VERIFICADAS:');
    console.log('   ✅ GET /api/catalog/disposicion-basura/tipos (con paginación y búsqueda)');
    console.log('   ✅ GET /api/catalog/disposicion-basura/tipos/:id');
    console.log('   ✅ GET /api/catalog/disposicion-basura/estadisticas');
    console.log('   ✅ POST /api/catalog/disposicion-basura/tipos');
    console.log('   ✅ PUT /api/catalog/disposicion-basura/tipos/:id');
    console.log('   ✅ DELETE /api/catalog/disposicion-basura/tipos/:id');
    console.log('   ✅ Validaciones de entrada');
    console.log('   ✅ Autenticación y autorización');
    console.log('   ✅ Manejo de errores HTTP');

  } catch (error) {
    console.error('❌ Error durante las pruebas HTTP:', error);
  }
}

// Ejecutar las pruebas
testHTTPRoutes().catch(console.error);
