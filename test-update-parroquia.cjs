const axios = require('axios');

async function testUpdateParroquia() {
    console.log('🔍 TEST: Actualizar parroquia en familia existente');
    
    try {
        // 1. Login
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });
        
        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso');
        
        // 2. Intentar actualizar la familia 43 directamente con id_parroquia
        console.log('📝 Intentando actualizar familia 43 con id_parroquia = 1');
        
        const updateResponse = await axios.patch('http://localhost:3000/api/encuesta/43', {
            informacionGeneral: {
                parroquia: {
                    id: 1,
                    nombre: "San José"
                }
            }
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ Actualización exitosa:');
        console.log('📋 Respuesta:', JSON.stringify(updateResponse.data, null, 2));
        
        console.log('\n🔍 Ahora verificar en BD si se actualizó:');
        console.log('SELECT id_familia, apellido_familiar, id_parroquia FROM familias WHERE id_familia = 43');
        
    } catch (error) {
        console.error('\n❌ Error en actualización:', error.response?.data || error.message);
        
        // Si el PATCH falla, probar con un approach directo usando Sequelize
        console.log('\n🔧 Probando approach directo...');
        
        // Crear script para actualización directa
        console.log('Alternativa: usar UPDATE directo en BD');
        console.log('UPDATE familias SET id_parroquia = 1 WHERE id_familia = 43');
    }
}

testUpdateParroquia();
