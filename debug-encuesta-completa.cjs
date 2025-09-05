const axios = require('axios');

async function debugParroquiaCompleta() {
    console.log('🔍 DEBUG: Prueba con estructura completa de encuesta');
    
    const baseURL = 'http://localhost:3000';
    
    try {
        // 1. Login
        console.log('\n1. Haciendo login...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });
        
        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso');
        
        // 2. Crear encuesta completa con estructura mínima requerida
        const timestamp = Date.now();
        const encuestaCompleta = {
            // INFORMACIÓN GENERAL (obligatoria)
            informacionGeneral: {
                apellido_familiar: `FAMILIA_PARROQUIA_${timestamp}`,
                direccion: 'Calle Prueba Parroquia 123',
                telefono: '3001234567',
                municipio: { id: 2 },
                parroquia: { id: 3 },  // ¡PARROQUIA VÁLIDA PARA MEDELLÍN!
                sector: { id: 1, nombre: 'Sector Centro' },
                zona: 'urbana'
            },
            
            // VIVIENDA (obligatoria)
            vivienda: {
                tipo_vivienda: {
                    id: 1,
                    nombre: 'Casa'
                },
                tenencia_vivienda: 'propia',
                material_paredes: 'ladrillo',
                material_piso: 'cemento',
                material_techo: 'eternit'
            },
            
            // SERVICIOS AGUA (obligatoria)
            servicios_agua: {
                sistema_acueducto: {
                    id: 1,
                    nombre: 'Acueducto Público'
                },
                aguas_residuales: {
                    id: 1,
                    nombre: 'Alcantarillado'
                },
                disposicion_basuras: {
                    recolector: true,
                    quemada: false,
                    enterrada: false,
                    recicla: false,
                    aire_libre: false
                }
            },
            
            // OBSERVACIONES (obligatoria)
            observaciones: {
                observaciones_generales: 'Encuesta de prueba para verificar parroquia',
                observaciones_vivienda: 'Sin observaciones adicionales'
            },
            
            // MIEMBROS FAMILIA (opcional pero agreguemos uno mínimo)
            familyMembers: [
                {
                    nombres: 'Juan Carlos',
                    apellidos: `CABEZA_FAMILIA_${timestamp}`,
                    fecha_nacimiento: '1980-01-01',
                    sexo: 'M',
                    tipo_identificacion: 'cedula_ciudadania',
                    numeroIdentificacion: `123456789${timestamp.toString().slice(-3)}`,
                    parentesco: 'jefe_hogar',
                    estado_civil: 'soltero',
                    ocupacion: 'empleado',
                    nivel_estudios: 'secundaria_completa'
                }
            ],
            
            // METADATA
            metadata: {
                tipo_encuesta: 'inicial',
                fecha_encuesta: new Date().toISOString(),
                encuestador: 'Sistema Debug'
            }
        };
        
        console.log('\n2. Enviando encuesta completa...');
        console.log('🎯 ID_PARROQUIA enviado:', encuestaCompleta.informacionGeneral.parroquia.id);
        
        const createResponse = await axios.post(`${baseURL}/api/encuesta`, encuestaCompleta, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ Encuesta creada exitosamente:');
        console.log('Respuesta:', JSON.stringify(createResponse.data, null, 2));
        
        const familiaId = createResponse.data.data?.familia_id;
        
        if (familiaId) {
            // 3. Verificar en base de datos
            const { Client } = require('pg');
            const client = new Client({
                host: 'localhost',
                port: 5432,
                database: 'parroquia_db',
                user: 'parroquia_user',
                password: 'parroquia_password'
            });
            
            await client.connect();
            
            // Consulta con JOIN para obtener nombre de parroquia
            const result = await client.query(`
                SELECT 
                    f.id_familia,
                    f.apellido_familiar,
                    f.id_parroquia,
                    p.nombre as nombre_parroquia,
                    f.id_municipio,
                    f.id_sector
                FROM familias f
                LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia
                WHERE f.id_familia = $1
            `, [familiaId]);
            
            console.log('\n📊 RESULTADO EN BASE DE DATOS:');
            console.log(result.rows[0]);
            
            if (result.rows[0].id_parroquia === null) {
                console.log('\n❌ PROBLEMA PERSISTE: id_parroquia es NULL');
                console.log('🔍 La parroquia no se está guardando en la base de datos');
            } else {
                console.log('\n✅ SUCCESS: Parroquia guardada correctamente!');
                console.log(`🎉 ID: ${result.rows[0].id_parroquia}, Nombre: ${result.rows[0].nombre_parroquia}`);
            }
            
            await client.end();
        } else {
            console.log('\n❌ No se obtuvo ID de familia en la respuesta');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.log('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugParroquiaCompleta();
