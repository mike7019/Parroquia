const axios = require('axios');

async function testParroquiaResponseFormat() {
    console.log('⛪ Probando formato de respuesta al crear parroquia...\n');

    try {
        // 1. Login
        console.log('🔐 Haciendo login...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso\n');

        // 2. Crear parroquia de prueba
        console.log('⛪ Creando parroquia de prueba...');
        const nuevaParroquia = {
            nombre: 'Parroquia Santa María - Prueba Formato',
            direccion: 'Avenida Principal #456',
            telefono: '+57 4 987-6543',
            email: 'santamaria@parroquia.test',
            id_municipio: 1
        };

        console.log('📋 Datos a enviar:');
        console.log(JSON.stringify(nuevaParroquia, null, 2));

        const createResponse = await axios.post('http://localhost:3000/api/catalog/parroquias', nuevaParroquia, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ ¡Parroquia creada exitosamente!');
        console.log('📋 Respuesta con formato corregido:');
        console.log(JSON.stringify(createResponse.data, null, 2));

        // 3. Verificar que tiene los campos correctos
        console.log('\n🔍 Verificando formato de respuesta:');
        const data = createResponse.data.data;
        
        // Verificar que NO tiene timestamp
        if (!createResponse.data.timestamp) {
            console.log('✅ Campo "timestamp" removido correctamente');
        } else {
            console.log('❌ Campo "timestamp" aún presente');
        }

        // Verificar que NO tiene id_municipio en data
        if (!data.id_municipio) {
            console.log('✅ Campo "id_municipio" removido de data');
        } else {
            console.log('❌ Campo "id_municipio" aún presente en data');
        }

        // Verificar que tiene created_at y updated_at
        if (data.created_at && data.updated_at) {
            console.log('✅ Campos "created_at" y "updated_at" presentes');
            console.log(`   Created: ${data.created_at}`);
            console.log(`   Updated: ${data.updated_at}`);
        } else {
            console.log('❌ Campos "created_at" o "updated_at" faltantes');
        }

        // Verificar que tiene municipio con datos completos
        if (data.municipio) {
            console.log('✅ Objeto "municipio" presente con:');
            console.log(`   Nombre: ${data.municipio.nombre_municipio}`);
            console.log(`   Departamento: ${data.municipio.departamento?.nombre}`);
        } else {
            console.log('❌ Objeto "municipio" faltante');
        }

        console.log('\n🎉 ¡Formato de respuesta verificado!');

    } catch (error) {
        console.error('\n❌ Error durante la prueba:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Response Data:');
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testParroquiaResponseFormat();