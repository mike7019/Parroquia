const axios = require('axios');

async function testLogin() {
    console.log('🔐 Probando login después de las correcciones...\n');

    try {
        // Probar el login
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'admin123'
        });

        console.log('✅ ¡Login exitoso!');
        console.log('📋 Respuesta completa:');
        console.log(JSON.stringify(response.data, null, 2));

        // Probar usar el token
        if (response.data.data && response.data.data.accessToken) {
            console.log('\n🔗 Probando token en endpoint protegido...');
            
            const protectedResponse = await axios.get('http://localhost:3000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${response.data.data.accessToken}`
                }
            });

            console.log('✅ Token funciona correctamente');
            console.log('👤 Perfil de usuario:');
            console.log(JSON.stringify(protectedResponse.data, null, 2));
        }

    } catch (error) {
        console.error('❌ Error en el login:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();