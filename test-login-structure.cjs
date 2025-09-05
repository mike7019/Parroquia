const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });
        
        console.log('📊 RESPUESTA COMPLETA DEL LOGIN:');
        console.log(JSON.stringify(response.data, null, 2));
        
        console.log('\n📋 ESTRUCTURA DE LA RESPUESTA:');
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testLogin();
