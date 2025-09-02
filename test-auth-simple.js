const fetch = require('node-fetch');

// Test login simple
async function testLogin() {
    try {
        console.log('🔐 Intentando login...');
        
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            console.log('✅ Login exitoso');
            console.log('🔑 Token:', loginData.datos.token);
            return loginData.datos.token;
        } else {
            console.log('❌ Error en login:', loginData.mensaje || loginData.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// Test sectores endpoint
async function testSectores(token) {
    try {
        console.log('\n🏢 Probando endpoint de sectores...');
        
        const response = await fetch('http://localhost:3000/api/catalog/sectores', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Sectores obtenidos exitosamente');
            console.log('📊 Total sectores:', data.total || 0);
            console.log('📋 Datos:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Error en sectores:', data.mensaje || data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar pruebas
async function runTests() {
    const token = await testLogin();
    if (token) {
        await testSectores(token);
    }
}

runTests();
