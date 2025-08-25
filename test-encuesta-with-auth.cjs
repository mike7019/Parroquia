// Test completo con autenticación para verificar el fix del constraint
const http = require('http');

const loginAndTestEncuesta = async () => {
    console.log('🔐 Iniciando sesión...\n');
    
    const loginData = JSON.stringify({
        "correo_electronico": "admin@parroquia.com",
        "contrasena": "Admin123!"
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            },
            timeout: 10000
        };

        const req = http.request(options, (res) => {
            console.log(`📡 Login response: ${res.statusCode}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode === 200 && response.data && response.data.accessToken) {
                        console.log('✅ Login exitoso');
                        console.log(`   - Token obtenido: ${response.data.accessToken.substring(0, 20)}...`);
                        resolve(response.data.accessToken);
                    } else {
                        console.error('❌ Error en login:', response);
                        reject(new Error('Login failed'));
                    }
                } catch (e) {
                    console.error('❌ Error parsing login response:', data);
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Login timeout'));
        });

        req.write(loginData);
        req.end();
    });
};

const testEncuestaWithAuth = (token) => {
    console.log('\n🧪 Probando creación de encuesta con autenticación...\n');
    
    const encuestaData = JSON.stringify({
        "id_parroquia": 1,
        "id_municipio": 1,
        "fecha": "2024-01-15",
        "id_sector": 1,
        "id_vereda": 1,
        "observaciones": "Encuesta de prueba post-sync",
        "tratamiento_datos": true,
        "familia": {
            "numero_casa": `TEST-${Date.now()}`,
            "tamaño_familia": 4,
            "id_municipio": 1,
            "id_vereda": 1,
            "id_sector": 1,
            "ubicacion_geografica": "12.345,-67.890",
            "observaciones": "Familia de prueba",
            "activo": true
        },
        "personas": [
            {
                "primer_nombre": "Juan",
                "primer_apellido": "Pérez",
                "id_tipo_identificacion_tipo_identificacion": 1,
                "identificacion": `TEST${Date.now()}`,
                "telefono": "3001234567",
                "correo_electronico": `test${Date.now()}@test.com`,
                "fecha_nacimiento": "1990-05-15",
                "direccion": "Calle 123 #45-67",
                "id_sexo": 1
            }
        ]
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/encuesta',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(encuestaData)
            },
            timeout: 15000
        };

        const req = http.request(options, (res) => {
            console.log(`📡 Encuesta response: ${res.statusCode}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('📋 Respuesta completa:', JSON.stringify(response, null, 2));
                    
                    if (res.statusCode === 201 || res.statusCode === 200) {
                        console.log('\n🎉 ¡ÉXITO! Encuesta creada correctamente');
                        console.log('✅ El problema del constraint "id_familia null" ha sido RESUELTO');
                        
                        if (response.id_familia) {
                            console.log(`   - ID Familia generado: ${response.id_familia}`);
                        }
                        if (response.id_encuesta) {
                            console.log(`   - ID Encuesta generado: ${response.id_encuesta}`);
                        }
                        
                    } else if (data.includes('id_familia') && data.includes('null')) {
                        console.log('\n❌ El problema del constraint PERSISTE');
                        console.log('🔍 Se requiere revisar nuevamente el modelo Familias');
                        
                    } else {
                        console.log('\n⚠️  Error diferente al constraint original:');
                        console.log(`   - Status: ${res.statusCode}`);
                        console.log(`   - Error: ${response.message || response.error || 'Unknown'}`);
                    }
                    
                    resolve(response);
                } catch (e) {
                    console.log('📋 Respuesta (texto):', data);
                    if (data.includes('id_familia') && data.includes('null')) {
                        console.log('\n❌ El problema del constraint PERSISTE (raw response)');
                    }
                    resolve(data);
                }
            });
        });

        req.on('error', (err) => {
            console.error('❌ Error en request encuesta:', err.message);
            reject(err);
        });

        req.on('timeout', () => {
            console.error('❌ Timeout en request encuesta');
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(encuestaData);
        req.end();
    });
};

// Ejecutar prueba completa
const runFullTest = async () => {
    try {
        console.log('🚀 Iniciando prueba completa del fix de constraint...\n');
        
        const token = await loginAndTestEncuesta();
        await testEncuestaWithAuth(token);
        
        console.log('\n🏁 Prueba completada');
        
    } catch (error) {
        console.error('\n❌ Error en la prueba:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('🔍 El servidor no está ejecutándose en localhost:3000');
        }
    }
};

runFullTest();
