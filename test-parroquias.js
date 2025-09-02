const fetch = require('node-fetch');

// Configuración de la API
const API_BASE = 'http://localhost:3000/api';
let authToken = null;

// Función de login
async function login() {
    try {
        console.log('🔐 Iniciando sesión...');
        
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        
        if (response.ok && data.datos && data.datos.token) {
            authToken = data.datos.token;
            console.log('✅ Login exitoso');
            console.log(`🔑 Token obtenido: ${authToken.substring(0, 20)}...`);
            return true;
        } else {
            console.log('❌ Error en login:', data.mensaje || data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
}

// Función para hacer request autenticado
async function authenticatedRequest(url, options = {}) {
    if (!authToken) {
        console.log('❌ No hay token de autenticación');
        return null;
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const response = await fetch(url, { ...options, ...defaultOptions });
    return response;
}

// Test 1: Obtener todas las parroquias
async function testGetParroquias() {
    try {
        console.log('\n📋 Test 1: Obteniendo todas las parroquias...');
        
        const response = await authenticatedRequest(`${API_BASE}/catalog/parroquias`);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Parroquias obtenidas exitosamente`);
            console.log(`📊 Total de parroquias: ${data.total || 0}`);
            if (data.datos && data.datos.length > 0) {
                console.log('📋 Primeras parroquias:');
                data.datos.slice(0, 3).forEach(parroquia => {
                    console.log(`   - ID: ${parroquia.id_parroquia}, Nombre: ${parroquia.nombre}, Municipio: ${parroquia.id_municipio}`);
                });
            }
            return data.datos || [];
        } else {
            console.log('❌ Error obteniendo parroquias:', data.mensaje || data.message);
            return [];
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

// Test 2: Crear una nueva parroquia
async function testCreateParroquia() {
    try {
        console.log('\n🆕 Test 2: Creando nueva parroquia...');
        
        const nuevaParroquia = {
            nombre: `Parroquia Test ${Date.now()}`,
            id_municipio: 66 // Asumiendo que existe el municipio 66
        };
        
        const response = await authenticatedRequest(`${API_BASE}/catalog/parroquias`, {
            method: 'POST',
            body: JSON.stringify(nuevaParroquia)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Parroquia creada exitosamente');
            console.log(`📄 Nueva parroquia: ID ${data.datos.id_parroquia}, Nombre: ${data.datos.nombre}`);
            return data.datos;
        } else {
            console.log('❌ Error creando parroquia:', data.mensaje || data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// Test 3: Buscar parroquias
async function testSearchParroquias() {
    try {
        console.log('\n🔍 Test 3: Buscando parroquias...');
        
        const response = await authenticatedRequest(`${API_BASE}/catalog/parroquias/search?q=san`);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Búsqueda exitosa`);
            console.log(`📊 Resultados encontrados: ${data.datos ? data.datos.length : 0}`);
            if (data.datos && data.datos.length > 0) {
                console.log('📋 Resultados de búsqueda:');
                data.datos.slice(0, 3).forEach(parroquia => {
                    console.log(`   - ${parroquia.nombre} (ID: ${parroquia.id_parroquia})`);
                });
            }
        } else {
            console.log('❌ Error en búsqueda:', data.mensaje || data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 4: Obtener estadísticas de parroquias
async function testParroquiasStatistics() {
    try {
        console.log('\n📊 Test 4: Obteniendo estadísticas de parroquias...');
        
        const response = await authenticatedRequest(`${API_BASE}/catalog/parroquias/statistics`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Estadísticas obtenidas');
            console.log('📊 Estadísticas:', JSON.stringify(data.datos, null, 2));
        } else {
            console.log('❌ Error obteniendo estadísticas:', data.mensaje || data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 5: Obtener una parroquia específica
async function testGetParroquiaById(parroquias) {
    if (!parroquias || parroquias.length === 0) {
        console.log('\n⚠️ Test 5: No hay parroquias para probar obtención por ID');
        return;
    }

    try {
        console.log('\n🎯 Test 5: Obteniendo parroquia por ID...');
        
        const parroquiaId = parroquias[0].id_parroquia;
        const response = await authenticatedRequest(`${API_BASE}/catalog/parroquias/${parroquiaId}`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Parroquia obtenida por ID');
            console.log(`📄 Parroquia: ${data.datos.nombre} (ID: ${data.datos.id_parroquia})`);
            console.log(`🏛️ Municipio: ${data.datos.id_municipio}`);
        } else {
            console.log('❌ Error obteniendo parroquia por ID:', data.mensaje || data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 6: Verificar relación con municipios
async function testParroquiaMunicipioRelation() {
    try {
        console.log('\n🔗 Test 6: Verificando relación parroquia-municipio...');
        
        // Primero obtenemos municipios
        const municResponse = await authenticatedRequest(`${API_BASE}/catalog/municipios`);
        const municData = await municResponse.json();
        
        if (municResponse.ok && municData.datos && municData.datos.length > 0) {
            const municipio = municData.datos[0];
            console.log(`✅ Municipio encontrado: ${municipio.nombre} (ID: ${municipio.id_municipio})`);
            
            // Ahora buscamos parroquias de ese municipio
            const parroResponse = await authenticatedRequest(`${API_BASE}/catalog/parroquias?municipio=${municipio.id_municipio}`);
            const parroData = await parroResponse.json();
            
            if (parroResponse.ok) {
                console.log(`✅ Parroquias del municipio ${municipio.nombre}: ${parroData.total || 0}`);
                if (parroData.datos && parroData.datos.length > 0) {
                    parroData.datos.slice(0, 3).forEach(parroquia => {
                        console.log(`   - ${parroquia.nombre}`);
                    });
                }
            } else {
                console.log('❌ Error obteniendo parroquias del municipio:', parroData.mensaje);
            }
        } else {
            console.log('❌ No se pudieron obtener municipios para probar la relación');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar todas las pruebas
async function runAllTests() {
    console.log('🧪 INICIANDO PRUEBAS DE PARROQUIAS\n');
    console.log('='.repeat(50));
    
    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ No se pudo hacer login. Abortando pruebas.');
        return;
    }
    
    // Ejecutar pruebas
    const parroquias = await testGetParroquias();
    await testCreateParroquia();
    await testSearchParroquias();
    await testParroquiasStatistics();
    await testGetParroquiaById(parroquias);
    await testParroquiaMunicipioRelation();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 PRUEBAS DE PARROQUIAS COMPLETADAS');
}

// Ejecutar las pruebas
runAllTests().catch(console.error);
