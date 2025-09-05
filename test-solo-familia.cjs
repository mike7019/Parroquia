const axios = require('axios');

async function testSoloFamilia() {
    console.log('🔍 TEST SOLO FAMILIA - SIN MIEMBROS');
    
    try {
        // 1. Login
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });
        
        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso');
        
        // 2. Request SOLO familia, sin ningún miembro
        const timestamp = Date.now();
        const requestSoloFamilia = {
            "informacionGeneral": {
                "municipio": {
                    "id": 3,
                    "nombre": "Bogotá"
                },
                "parroquia": {
                    "id": 1,
                    "nombre": "San José"
                },
                "sector": {
                    "id": 1,
                    "nombre": "Centro"
                },
                "fecha": "2025-08-25",
                "apellido_familiar": `SoloFamilia_${timestamp}`,
                "direccion": "Carrera 45 # 23-67",
                "telefono": "3001234567"
            },
            "vivienda": {
                "tipo_vivienda": {
                    "id": 1,
                    "nombre": "Casa"
                },
                "disposicion_basuras": {
                    "recolector": true,
                    "quemada": false,
                    "enterrada": false,
                    "recicla": false,
                    "aire_libre": false,
                    "no_aplica": false
                }
            },
            "servicios_agua": {
                "sistema_acueducto": {
                    "id": 1,
                    "nombre": "Acueducto Público"
                },
                "aguas_residuales": {
                    "id": 1,
                    "nombre": "Alcantarillado"
                }
            },
            "observaciones": {
                "sustento_familia": "Test solo familia",
                "observaciones_encuestador": "Sin miembros para evitar conflictos",
                "autorizacion_datos": true
            },
            "familyMembers": [], // VACÍO COMPLETAMENTE
            "deceasedMembers": [], // VACÍO COMPLETAMENTE
            "metadata": {
                "timestamp": "2025-08-25T10:30:00.000Z",
                "completed": false,
                "currentStage": 1
            }
        };
        
        console.log('📤 Enviando request SOLO FAMILIA...');
        console.log('🎯 PARROQUIA:', requestSoloFamilia.informacionGeneral.parroquia);
        
        const response = await axios.post('http://localhost:3000/api/encuesta', requestSoloFamilia, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ ÉXITO! Familia creada sin miembros');
        console.log('📋 Respuesta:', JSON.stringify(response.data, null, 2));
        
        const familiaId = response.data.data?.familia_id;
        
        if (familiaId) {
            console.log(`\n🔍 VERIFICAR FAMILIA ${familiaId}:`);
            
            // Dar tiempo para que se guarde
            setTimeout(() => {
                console.log('Ejecutar en BD:');
                console.log(`SELECT f.id_familia, f.apellido_familiar, f.id_parroquia, p.nombre FROM familias f LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia WHERE f.id_familia = ${familiaId}`);
            }, 1000);
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

testSoloFamilia();
