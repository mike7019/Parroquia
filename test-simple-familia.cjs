const axios = require('axios');

async function testSimpleFamilia() {
    console.log('🔍 TEST SIMPLE: Solo crear familia sin servicios');
    
    try {
        // 1. Login
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });
        
        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso');
        
        // 2. Datos mínimos SOLO para crear familia
        const timestamp = Date.now();
        const encuestaMinima = {
            informacionGeneral: {
                apellido_familiar: `SIMPLE_PARROQUIA_${timestamp}`,
                direccion: 'Calle Simple 123',
                telefono: '3001234567',
                municipio: { id: 2 },
                parroquia: { id: 3 },
                sector: { id: 1, nombre: 'Centro' }
            },
            vivienda: {
                tipo_vivienda: { id: 1 },
                tenencia_vivienda: 'propia'
            },
            servicios_agua: {
                sistema_acueducto: { id: 1 },
                aguas_residuales: { id: 1 },
                disposicion_basuras: { recolector: true }
            },
            observaciones: {
                observaciones_generales: 'Test simple parroquia'
            },
            familyMembers: [],
            deceasedMembers: [],
            metadata: { tipo_encuesta: 'inicial' }
        };
        
        console.log('📤 Enviando datos...');
        console.log('🎯 Parroquia ID:', encuestaMinima.informacionGeneral.parroquia.id);
        
        const response = await axios.post('http://localhost:3000/api/encuesta', encuestaMinima, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ ÉXITO! Familia creada');
        console.log('📋 Respuesta:', JSON.stringify(response.data, null, 2));
        
        const familiaId = response.data.data?.familia_id;
        
        if (familiaId) {
            // Verificar en BD
            const { Client } = require('pg');
            const client = new Client({
                host: 'localhost',
                port: 5432,
                database: 'parroquia_db',
                user: 'parroquia_user',
                password: 'parroquia_password'
            });
            
            await client.connect();
            const result = await client.query(`
                SELECT 
                    f.id_familia,
                    f.apellido_familiar,
                    f.id_parroquia,
                    p.nombre as nombre_parroquia,
                    f.id_municipio,
                    m.nombre_municipio
                FROM familias f
                LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
                LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
                WHERE f.id_familia = $1
            `, [familiaId]);
            
            console.log('\n📊 RESULTADO FINAL:');
            const familia = result.rows[0];
            console.log(`ID Familia: ${familia.id_familia}`);
            console.log(`Apellido: ${familia.apellido_familiar}`);
            console.log(`Municipio: ${familia.id_municipio} - ${familia.nombre_municipio}`);
            console.log(`Parroquia: ${familia.id_parroquia} - ${familia.nombre_parroquia}`);
            
            if (familia.id_parroquia && familia.nombre_parroquia) {
                console.log('\n🎉 ¡PROBLEMA RESUELTO! La parroquia se guardó correctamente');
            } else {
                console.log('\n❌ Problema persiste: parroquia sigue siendo null');
            }
            
            await client.end();
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.status) {
            console.log('Status HTTP:', error.response.status);
        }
    }
}

testSimpleFamilia();
