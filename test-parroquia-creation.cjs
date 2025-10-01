const axios = require('axios');

async function testParroquiaCreation() {
    console.log('⛪ Diagnosticando creación de parroquias...\n');

    try {
        // 1. Primero hacer login para obtener token
        console.log('🔐 Haciendo login...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso\n');

        // 2. Obtener municipios disponibles
        console.log('🏘️  Consultando municipios disponibles...');
        const municipiosResponse = await axios.get('http://localhost:3000/api/catalog/municipios', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✅ ${municipiosResponse.data.total || municipiosResponse.data.data?.length || 0} municipios encontrados`);
        
        if (municipiosResponse.data.total === 0 && (!municipiosResponse.data.data || municipiosResponse.data.data.length === 0)) {
            console.log('❌ No hay municipios disponibles para asociar la parroquia');
            return;
        }

        const municipios = municipiosResponse.data.data || municipiosResponse.data.datos;
        const primerMunicipio = municipios[0];
        console.log(`   Usando municipio: ${primerMunicipio.nombre_municipio} (ID: ${primerMunicipio.id_municipio})\n`);

        // 3. Intentar crear una parroquia
        console.log('⛪ Intentando crear nueva parroquia...');
        const nuevaParroquia = {
            nombre: 'Parroquia de Prueba Diagnóstico',
            direccion: 'Calle de Diagnóstico #123',
            telefono: '+57 300 555 0123',
            email: 'diagnostico@parroquia.test',
            id_municipio: primerMunicipio.id_municipio
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
        console.log('📋 Respuesta del servidor:');
        console.log(JSON.stringify(createResponse.data, null, 2));

        // 4. Verificar que la parroquia se creó correctamente
        console.log('\n🔍 Verificando parroquia creada...');
        const parroquiasResponse = await axios.get('http://localhost:3000/api/catalog/parroquias', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const parroquias = parroquiasResponse.data.data || parroquiasResponse.data.datos;
        const parroquiaCreada = parroquias.find(p => p.nombre === nuevaParroquia.nombre);

        if (parroquiaCreada) {
            console.log('✅ Parroquia encontrada en la lista:');
            console.log(`   ID: ${parroquiaCreada.id_parroquia}`);
            console.log(`   Nombre: ${parroquiaCreada.nombre}`);
            console.log(`   Email: ${parroquiaCreada.email}`);
            console.log(`   Teléfono: ${parroquiaCreada.telefono}`);
            console.log(`   Dirección: ${parroquiaCreada.direccion}`);
            console.log(`   Created: ${parroquiaCreada.created_at}`);
        } else {
            console.log('⚠️  Parroquia no encontrada en la lista');
        }

        console.log('\n🎉 ¡Diagnóstico completado exitosamente!');
        console.log('✅ La creación de parroquias está funcionando correctamente');

    } catch (error) {
        console.error('\n❌ Error durante el diagnóstico:');
        
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`URL: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
            console.error('Response Data:');
            console.error(JSON.stringify(error.response.data, null, 2));
            
            if (error.response.headers) {
                console.error('\nResponse Headers:');
                console.error(JSON.stringify(error.response.headers, null, 2));
            }
        } else if (error.request) {
            console.error('No response received:');
            console.error(error.request);
        } else {
            console.error('Error:', error.message);
        }
        
        if (error.config) {
            console.error('\nRequest Config:');
            console.error(JSON.stringify({
                method: error.config.method,
                url: error.config.url,
                headers: error.config.headers,
                data: error.config.data
            }, null, 2));
        }
    }
}

testParroquiaCreation();