const axios = require('axios');

async function debugParroquiaCreation() {
    console.log('🔍 DEBUG: Investigando problema de parroquia en creación de familia');
    
    const baseURL = 'http://localhost:3000';
    
    try {
        // 1. Login para obtener token
        console.log('\n1. Haciendo login...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });
        
        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso, token obtenido');
        
        // 2. Verificar que parroquia ID=1 existe
        console.log('\n2. Verificando que parroquia ID=1 existe...');
        const parroquiaResponse = await axios.get(`${baseURL}/api/catalog/parroquias/1`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Parroquia encontrada:', parroquiaResponse.data.datos);
        
        // 3. Crear familia con datos mínimos pero incluyendo id_parroquia
        const timestamp = Date.now();
        const familiaData = {
            apellido_familiar: `DEBUG_PARROQUIA_${timestamp}`,
            direccion: 'Calle Debug 123',
            id_municipio: 1,
            id_parroquia: 1, // ¡ESTE ES EL DATO CRÍTICO!
            id_sector: 1,
            zona: 'urbana',
            tipo_encuesta: 'inicial'
        };
        
        console.log('\n3. Creando familia con datos:');
        console.log(JSON.stringify(familiaData, null, 2));
        
        const createResponse = await axios.post(`${baseURL}/api/encuesta`, familiaData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ Familia creada exitosamente:');
        console.log('Respuesta del servidor:', JSON.stringify(createResponse.data, null, 2));
        
        const familiaId = createResponse.data.datos.id_familia;
        
        // 4. Verificar inmediatamente en la base de datos
        console.log('\n4. Verificando en base de datos...');
        const axios2 = require('axios');
        
        // Simular consulta directa usando otro script
        const { Client } = require('pg');
        const client = new Client({
            host: 'localhost',
            port: 5432,
            database: 'parroquia_db',
            user: 'parroquia_user',
            password: 'parroquia_password'
        });
        
        await client.connect();
        const result = await client.query(
            'SELECT id_familia, apellido_familiar, id_parroquia, id_municipio, id_sector FROM familias WHERE id_familia = $1',
            [familiaId]
        );
        
        console.log('\n📊 RESULTADO EN BASE DE DATOS:');
        console.log(result.rows[0]);
        
        if (result.rows[0].id_parroquia === null) {
            console.log('\n❌ ERROR: id_parroquia es NULL en la base de datos');
            console.log('🔍 ANÁLISIS:');
            console.log('- Datos enviados incluían id_parroquia: 1');
            console.log('- Servidor respondió exitosamente');
            console.log('- Pero el dato no se guardó en la base de datos');
            console.log('- Problema está en el controlador o servicio');
        } else {
            console.log('\n✅ SUCCESS: id_parroquia se guardó correctamente');
        }
        
        await client.end();
        
    } catch (error) {
        console.error('\n❌ Error en debug:', error.response?.data || error.message);
    }
}

debugParroquiaCreation();
