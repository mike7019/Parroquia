/**
 * Verificación directa de datos en la base de datos
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

async function verifyDataEndpoints() {
    console.log('🔍 VERIFICACIÓN DIRECTA DE ENDPOINTS CON DATOS');
    console.log('='.repeat(60));

    // Primero hacer login
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

        if (loginResponse.status !== 200) {
            console.log('❌ Error en login');
            return;
        }

        const loginData = JSON.parse(loginResponse.data);
        const token = loginData.data.accessToken;
        console.log('✅ Login exitoso');

        // Verificar cada endpoint con detalles
        const endpoints = [
            '/api/catalog/departamentos',
            '/api/catalog/municipios', 
            '/api/catalog/aguas-residuales',
            '/api/catalog/sexos',
            '/api/catalog/parentescos'
        ];

        for (const endpoint of endpoints) {
            console.log(`\n🧪 Probando: ${endpoint}`);
            
            try {
                const response = await makeRequest(`http://localhost:3000${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log(`   Status: ${response.status}`);
                
                if (response.status === 200) {
                    const data = JSON.parse(response.data);
                    console.log(`   Estructura de respuesta: ${Object.keys(data)}`);
                    
                    if (data.datos) {
                        console.log(`   ✅ Datos encontrados: ${data.datos.length} registros`);
                        if (data.datos.length > 0) {
                            console.log(`   📄 Primer registro: ${JSON.stringify(data.datos[0], null, 2)}`);
                        }
                    } else if (Array.isArray(data)) {
                        console.log(`   ✅ Array directo: ${data.length} registros`);
                    } else {
                        console.log(`   📄 Respuesta completa: ${JSON.stringify(data, null, 2)}`);
                    }
                } else {
                    console.log(`   ❌ Error: ${response.status}`);
                    console.log(`   Respuesta: ${response.data.substring(0, 200)}`);
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }

    } catch (error) {
        console.log(`❌ Error general: ${error.message}`);
    }
}

verifyDataEndpoints();
