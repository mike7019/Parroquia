#!/usr/bin/env node

/**
 * Script específico para probar el servicio de Veredas
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Colores para output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(method, url, data = null, token = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        let responseData;

        try {
            responseData = await response.json();
        } catch {
            responseData = await response.text();
        }

        return {
            status: response.status,
            ok: response.ok,
            data: responseData,
            headers: Object.fromEntries(response.headers.entries())
        };
    } catch (error) {
        return {
            status: 0,
            ok: false,
            error: error.message
        };
    }
}

async function getAuthToken() {
    log('🔐 Obteniendo token de autenticación...', 'cyan');

    const loginData = {
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
    };

    const result = await makeRequest('POST', `${API_URL}/auth/login`, loginData);

    if (result.ok && result.data.data?.accessToken) {
        log('✅ Token obtenido correctamente', 'green');
        return result.data.data.accessToken;
    } else {
        log(`❌ Error obteniendo token: ${result.data?.message || 'Error desconocido'}`, 'red');
        return null;
    }
}

async function testVeredasEndpoints(token) {
    log('\n🌿 PROBANDO SERVICIO DE VEREDAS', 'bold');
    log('='.repeat(60), 'cyan');

    const tests = [];

    // 1. Listar todas las veredas
    log('\n📋 1. Listando todas las veredas...', 'magenta');
    const listResult = await makeRequest('GET', `${API_URL}/catalog/veredas`, null, token);

    if (listResult.ok) {
        log('✅ GET /catalog/veredas - SUCCESS', 'green');

        if (listResult.data.data && Array.isArray(listResult.data.data)) {
            log(`   📊 Total veredas: ${listResult.data.data.length}`, 'blue');

            // Mostrar algunas veredas de ejemplo
            const sampleVeredas = listResult.data.data.slice(0, 3);
            sampleVeredas.forEach((vereda, index) => {
                log(`   ${index + 1}. ID: ${vereda.id_vereda || vereda.id} - ${vereda.nombre}`, 'cyan');
                if (vereda.sector || vereda.id_sector) {
                    log(`      Sector: ${vereda.sector?.nombre || vereda.id_sector}`, 'blue');
                }
            });

            tests.push({ name: 'List Veredas', status: 'PASS', count: listResult.data.data.length });
        } else {
            log('   ⚠️  Respuesta no contiene array de datos', 'yellow');
            tests.push({ name: 'List Veredas', status: 'PASS', note: 'No data array' });
        }
    } else {
        log(`❌ GET /catalog/veredas - FAILED (${listResult.status})`, 'red');
        log(`   Error: ${listResult.data?.message || 'Error desconocido'}`, 'yellow');
        tests.push({ name: 'List Veredas', status: 'FAIL', error: listResult.data?.message });
    }

    // 2. Búsqueda de veredas
    log('\n🔍 2. Probando búsqueda de veredas...', 'magenta');
    const searchResult = await makeRequest('GET', `${API_URL}/catalog/veredas/search?q=san`, null, token);

    if (searchResult.ok) {
        log('✅ GET /catalog/veredas/search - SUCCESS', 'green');

        if (searchResult.data.data && Array.isArray(searchResult.data.data)) {
            log(`   🔍 Resultados encontrados: ${searchResult.data.data.length}`, 'blue');

            searchResult.data.data.slice(0, 3).forEach((vereda, index) => {
                log(`   ${index + 1}. ${vereda.nombre} (ID: ${vereda.id_vereda || vereda.id})`, 'cyan');
            });

            tests.push({ name: 'Search Veredas', status: 'PASS', count: searchResult.data.data.length });
        } else {
            log('   ℹ️  No se encontraron resultados', 'blue');
            tests.push({ name: 'Search Veredas', status: 'PASS', note: 'No results' });
        }
    } else {
        log(`❌ GET /catalog/veredas/search - FAILED (${searchResult.status})`, 'red');
        tests.push({ name: 'Search Veredas', status: 'FAIL', error: searchResult.data?.message });
    }

    // 3. Estadísticas de veredas
    log('\n📊 3. Probando estadísticas de veredas...', 'magenta');
    const statsResult = await makeRequest('GET', `${API_URL}/catalog/veredas/statistics`, null, token);

    if (statsResult.ok) {
        log('✅ GET /catalog/veredas/statistics - SUCCESS', 'green');

        if (statsResult.data.data) {
            const stats = statsResult.data.data;
            log(`   📈 Total: ${stats.total || 'N/A'}`, 'blue');
            log(`   🏘️  Por sector: ${stats.porSector || 'N/A'}`, 'blue');
            log(`   📍 Por municipio: ${stats.porMunicipio || 'N/A'}`, 'blue');

            tests.push({ name: 'Veredas Statistics', status: 'PASS', data: stats });
        } else {
            log('   ℹ️  Estadísticas no disponibles', 'blue');
            tests.push({ name: 'Veredas Statistics', status: 'PASS', note: 'No stats data' });
        }
    } else {
        log(`❌ GET /catalog/veredas/statistics - FAILED (${statsResult.status})`, 'red');
        tests.push({ name: 'Veredas Statistics', status: 'FAIL', error: statsResult.data?.message });
    }

    // 4. Obtener vereda específica (si hay veredas disponibles)
    if (listResult.ok && listResult.data.data && listResult.data.data.length > 0) {
        const firstVereda = listResult.data.data[0];
        const veredaId = firstVereda.id_vereda || firstVereda.id;

        log(`\n🎯 4. Probando obtener vereda específica (ID: ${veredaId})...`, 'magenta');
        const getResult = await makeRequest('GET', `${API_URL}/catalog/veredas/${veredaId}`, null, token);

        if (getResult.ok) {
            log('✅ GET /catalog/veredas/:id - SUCCESS', 'green');

            const vereda = getResult.data.data || getResult.data;
            log(`   📍 Nombre: ${vereda.nombre}`, 'blue');
            log(`   🆔 ID: ${vereda.id_vereda || vereda.id}`, 'blue');

            if (vereda.sector) {
                log(`   🏘️  Sector: ${vereda.sector.nombre} (ID: ${vereda.sector.id_sector})`, 'blue');
            }

            if (vereda.createdAt) {
                log(`   📅 Creado: ${new Date(vereda.createdAt).toLocaleDateString()}`, 'blue');
            }

            tests.push({ name: 'Get Vereda by ID', status: 'PASS', id: veredaId });
        } else {
            log(`❌ GET /catalog/veredas/${veredaId} - FAILED (${getResult.status})`, 'red');
            tests.push({ name: 'Get Vereda by ID', status: 'FAIL', error: getResult.data?.message });
        }
    }

    // 5. Probar creación de vereda (opcional)
    log('\n➕ 5. Probando creación de vereda de prueba...', 'magenta');

    const newVeredaData = {
        nombre: 'Vereda Test ' + Date.now(),
        id_sector: 1, // Asumiendo que existe sector con ID 1
        descripcion: 'Vereda creada para pruebas'
    };

    const createResult = await makeRequest('POST', `${API_URL}/catalog/veredas`, newVeredaData, token);

    if (createResult.ok) {
        log('✅ POST /catalog/veredas - SUCCESS', 'green');

        const newVereda = createResult.data.data || createResult.data;
        const newVeredaId = newVereda.id_vereda || newVereda.id;
        log(`   🆕 Nueva vereda creada: ${newVereda.nombre} (ID: ${newVeredaId})`, 'blue');

        tests.push({ name: 'Create Vereda', status: 'PASS', id: newVeredaId });

        // 6. Probar actualización
        log('\n✏️  6. Probando actualización de vereda...', 'magenta');

        const updateData = {
            nombre: newVereda.nombre + ' - ACTUALIZADA',
            descripcion: 'Vereda actualizada para pruebas'
        };

        const updateResult = await makeRequest('PUT', `${API_URL}/catalog/veredas/${newVeredaId}`, updateData, token);

        if (updateResult.ok) {
            log('✅ PUT /catalog/veredas/:id - SUCCESS', 'green');
            tests.push({ name: 'Update Vereda', status: 'PASS', id: newVeredaId });
        } else {
            log(`❌ PUT /catalog/veredas/${newVeredaId} - FAILED (${updateResult.status})`, 'red');
            tests.push({ name: 'Update Vereda', status: 'FAIL', error: updateResult.data?.message });
        }

        // 7. Probar eliminación
        log('\n🗑️  7. Probando eliminación de vereda de prueba...', 'magenta');

        const deleteResult = await makeRequest('DELETE', `${API_URL}/catalog/veredas/${newVeredaId}`, null, token);

        if (deleteResult.ok) {
            log('✅ DELETE /catalog/veredas/:id - SUCCESS', 'green');
            tests.push({ name: 'Delete Vereda', status: 'PASS', id: newVeredaId });
        } else {
            log(`❌ DELETE /catalog/veredas/${newVeredaId} - FAILED (${deleteResult.status})`, 'red');
            tests.push({ name: 'Delete Vereda', status: 'FAIL', error: deleteResult.data?.message });
        }

    } else {
        log(`❌ POST /catalog/veredas - FAILED (${createResult.status})`, 'red');
        log(`   Error: ${createResult.data?.message || 'Error desconocido'}`, 'yellow');
        tests.push({ name: 'Create Vereda', status: 'FAIL', error: createResult.data?.message });
    }

    return tests;
}

async function checkVeredasModel() {
    log('\n🔍 VERIFICANDO MODELO DE VEREDAS', 'bold');
    log('='.repeat(60), 'cyan');

    // Verificar que el endpoint de health funcione
    const healthResult = await makeRequest('GET', `${API_URL}/catalog/health`);

    if (healthResult.ok) {
        log('✅ Catalog service está funcionando', 'green');
    } else {
        log('❌ Catalog service tiene problemas', 'red');
        return false;
    }

    return true;
}

async function main() {
    log('🌿 TESTING COMPLETO DEL SERVICIO DE VEREDAS', 'bold');
    log('='.repeat(70), 'cyan');

    // 1. Verificar servidor
    const serverCheck = await makeRequest('GET', `${API_URL}/health`);
    if (!serverCheck.ok) {
        log('❌ Servidor no está funcionando', 'red');
        process.exit(1);
    }

    log('✅ Servidor funcionando correctamente', 'green');

    // 2. Obtener token
    const token = await getAuthToken();
    if (!token) {
        log('❌ No se pudo obtener token de autenticación', 'red');
        process.exit(1);
    }

    // 3. Verificar modelo
    const modelOk = await checkVeredasModel();
    if (!modelOk) {
        log('❌ Problemas con el modelo de Veredas', 'red');
        process.exit(1);
    }

    // 4. Ejecutar tests
    const testResults = await testVeredasEndpoints(token);

    // 5. Resumen
    log('\n' + '='.repeat(70), 'cyan');
    log('📊 RESUMEN DE PRUEBAS DE VEREDAS', 'bold');
    log('='.repeat(70), 'cyan');

    const passed = testResults.filter(t => t.status === 'PASS').length;
    const failed = testResults.filter(t => t.status === 'FAIL').length;
    const total = testResults.length;

    log(`\n✅ Pruebas exitosas: ${passed}/${total}`, 'green');
    log(`❌ Pruebas fallidas: ${failed}/${total}`, failed > 0 ? 'red' : 'green');

    testResults.forEach((test, index) => {
        const status = test.status === 'PASS' ? '✅' : '❌';
        const color = test.status === 'PASS' ? 'green' : 'red';
        log(`\n${index + 1}. ${status} ${test.name}`, color);

        if (test.count !== undefined) {
            log(`   📊 Registros: ${test.count}`, 'blue');
        }

        if (test.id) {
            log(`   🆔 ID: ${test.id}`, 'blue');
        }

        if (test.error) {
            log(`   ❌ Error: ${test.error}`, 'yellow');
        }

        if (test.note) {
            log(`   ℹ️  Nota: ${test.note}`, 'blue');
        }
    });

    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    log(`\n📈 Tasa de éxito: ${successRate}%`, successRate > 80 ? 'green' : 'yellow');

    if (failed === 0) {
        log('\n🎉 ¡Todos los tests del servicio de Veredas pasaron exitosamente!', 'green');
    } else {
        log('\n⚠️  Algunos tests fallaron. Revisa los errores arriba.', 'yellow');
    }

    log('\n✅ Testing de Veredas completado', 'cyan');
}

main().catch(error => {
    log(`💥 Error fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});