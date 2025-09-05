/**
 * Test completo final para el sistema de parroquia
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');

// Función para hacer requests HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const req = http.request({
            hostname: urlObj.hostname,
            port: urlObj.port || 80,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data,
                    headers: res.headers
                });
            });
        });

        req.on('error', reject);
        req.setTimeout(10000);

        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function runComprehensiveTests() {
    console.log('🎯 PRUEBAS COMPLETAS DEL SISTEMA DE PARROQUIA');
    console.log('='.repeat(60));
    console.log('');

    let testsPassedCount = 0;
    let totalTests = 0;

    // Test 1: Health check
    totalTests++;
    console.log('1️⃣ Probando Health Check...');
    try {
        const healthResponse = await makeRequest('http://localhost:3000/api/health');
        if (healthResponse.status === 200) {
            console.log('   ✅ Health Check: FUNCIONANDO');
            testsPassedCount++;
        } else {
            console.log(`   ❌ Health Check: Error ${healthResponse.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Health Check: Error - ${error.message}`);
    }
    console.log('');

    // Test 2: Status endpoint
    totalTests++;
    console.log('2️⃣ Probando Status endpoint...');
    try {
        const statusResponse = await makeRequest('http://localhost:3000/api/status');
        if (statusResponse.status === 200) {
            console.log('   ✅ Status: FUNCIONANDO');
            testsPassedCount++;
        } else {
            console.log(`   ❌ Status: Error ${statusResponse.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Status: Error - ${error.message}`);
    }
    console.log('');

    // Test 3: Swagger docs (seguir redirección)
    totalTests++;
    console.log('3️⃣ Probando documentación Swagger...');
    try {
        const docsResponse = await makeRequest('http://localhost:3000/api-docs/');
        if (docsResponse.status === 200 || docsResponse.status === 301) {
            console.log('   ✅ Swagger Docs: FUNCIONANDO');
            testsPassedCount++;
        } else {
            console.log(`   ❌ Swagger Docs: Error ${docsResponse.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Swagger Docs: Error - ${error.message}`);
    }
    console.log('');

    // Test 4: Endpoint público - tipos identificación
    totalTests++;
    console.log('4️⃣ Probando endpoint público (tipos identificación)...');
    try {
        const tiposResponse = await makeRequest('http://localhost:3000/api/catalog/tipos-identificacion');
        if (tiposResponse.status === 200) {
            console.log('   ✅ Tipos Identificación: FUNCIONANDO');
            testsPassedCount++;
        } else {
            console.log(`   ❌ Tipos Identificación: Error ${tiposResponse.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Tipos Identificación: Error - ${error.message}`);
    }
    console.log('');

    // Test 5: Login (admin creado)
    totalTests++;
    console.log('5️⃣ Probando autenticación...');
    let authToken = null;
    try {
        const loginBody = JSON.stringify({
            correo_electronico: 'admin@admin.com',
            contrasena: 'admin123'
        });

        const loginResponse = await makeRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginBody)
            },
            body: loginBody
        });

        console.log(`   Status del login: ${loginResponse.status}`);
        if (loginResponse.status === 200) {
            try {
                const loginData = JSON.parse(loginResponse.data);
                console.log(`   Datos de respuesta:`, JSON.stringify(loginData, null, 2));
                
                // Probar diferentes ubicaciones del token
                authToken = loginData.token || 
                           loginData.accessToken || 
                           loginData.data?.token || 
                           loginData.data?.accessToken;
                           
                if (authToken) {
                    console.log('   ✅ Autenticación: FUNCIONANDO - Token obtenido');
                    testsPassedCount++;
                } else {
                    console.log('   ⚠️ Autenticación: Login OK pero sin token');
                    console.log(`   Estructura de respuesta: ${Object.keys(loginData)}`);
                }
            } catch (e) {
                console.log('   ⚠️ Autenticación: Respuesta no es JSON válido');
                console.log(`   Respuesta raw: ${loginResponse.data.substring(0, 200)}`);
            }
        } else {
            console.log(`   ❌ Autenticación: Error ${loginResponse.status}`);
            console.log(`   Respuesta: ${loginResponse.data.substring(0, 200)}`);
        }
    } catch (error) {
        console.log(`   ❌ Autenticación: Error - ${error.message}`);
    }
    console.log('');

    // Tests de endpoints protegidos (solo si tenemos token)
    if (authToken) {
        // Test 6: Departamentos
        totalTests++;
        console.log('6️⃣ Probando endpoint protegido: Departamentos...');
        try {
            const deptResponse = await makeRequest('http://localhost:3000/api/catalog/departamentos', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (deptResponse.status === 200) {
                const deptData = JSON.parse(deptResponse.data);
                const count = deptData.datos ? deptData.datos.length : 0;
                console.log(`   ✅ Departamentos: FUNCIONANDO - ${count} registros`);
                testsPassedCount++;
            } else {
                console.log(`   ❌ Departamentos: Error ${deptResponse.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Departamentos: Error - ${error.message}`);
        }
        console.log('');

        // Test 7: Municipios
        totalTests++;
        console.log('7️⃣ Probando endpoint protegido: Municipios...');
        try {
            const munResponse = await makeRequest('http://localhost:3000/api/catalog/municipios', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (munResponse.status === 200) {
                const munData = JSON.parse(munResponse.data);
                const count = munData.datos ? munData.datos.length : 0;
                console.log(`   ✅ Municipios: FUNCIONANDO - ${count} registros`);
                testsPassedCount++;
            } else {
                console.log(`   ❌ Municipios: Error ${munResponse.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Municipios: Error - ${error.message}`);
        }
        console.log('');

        // Test 8: Consultas estadísticas
        totalTests++;
        console.log('8️⃣ Probando consultas estadísticas...');
        try {
            const statsResponse = await makeRequest('http://localhost:3000/api/consultas/estadisticas', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (statsResponse.status === 200) {
                console.log('   ✅ Estadísticas: FUNCIONANDO');
                testsPassedCount++;
            } else {
                console.log(`   ❌ Estadísticas: Error ${statsResponse.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Estadísticas: Error - ${error.message}`);
        }
        console.log('');
    } else {
        console.log('⚠️ Sin token de autenticación - saltando tests de endpoints protegidos');
        console.log('');
    }

    // Resumen final
    console.log('🎯 RESUMEN FINAL DE PRUEBAS');
    console.log('='.repeat(60));
    const percentage = Math.round((testsPassedCount / totalTests) * 100);
    console.log(`✅ Pruebas pasadas: ${testsPassedCount}/${totalTests} (${percentage}%)`);
    console.log('');

    if (testsPassedCount === totalTests) {
        console.log('🎉 ¡FELICITACIONES! TODAS LAS PRUEBAS PASARON');
        console.log('✅ El sistema está completamente funcional');
        console.log('✅ Base de datos conectada y con datos');
        console.log('✅ Autenticación funcionando');
        console.log('✅ Endpoints públicos y protegidos funcionando');
        console.log('✅ API completamente operativa');
    } else if (testsPassedCount >= totalTests * 0.8) {
        console.log('🎯 SISTEMA MAYORMENTE FUNCIONAL');
        console.log('✅ Funcionalidades críticas operativas');
        console.log('⚠️ Algunas funcionalidades requieren ajustes menores');
    } else {
        console.log('⚠️ SISTEMA REQUIERE ATENCIÓN');
        console.log('❌ Varias funcionalidades no están funcionando correctamente');
    }

    console.log('');
    console.log('📊 VALIDACIÓN COMPLETA FINALIZADA');
    console.log('='.repeat(60));

    return testsPassedCount === totalTests;
}

// Ejecutar las pruebas
runComprehensiveTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.log(`❌ Error fatal: ${error.message}`);
        process.exit(1);
    });
