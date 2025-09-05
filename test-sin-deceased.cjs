const axios = require('axios');

async function testSinDeceasedMembers() {
    console.log('🔍 TEST SIN MIEMBROS FALLECIDOS');
    
    try {
        // 1. Login
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });
        
        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso');
        
        // 2. Request sin deceasedMembers
        const timestamp = Date.now();
        const requestSinDeceased = {
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
                "vereda": {
                    "id": 1,
                    "nombre": "La Macarena"
                },
                "fecha": "2025-08-25",
                "apellido_familiar": `TestSinDeceased_${timestamp}`,
                "direccion": "Carrera 45 # 23-67",
                "telefono": "3001234567",
                "numero_contrato_epm": "12345678",
                "comunionEnCasa": false
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
                    "recicla": true,
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
                },
                "pozo_septico": false,
                "letrina": false,
                "campo_abierto": false
            },
            "observaciones": {
                "sustento_familia": "Trabajo independiente en ventas",
                "observaciones_encuestador": "Test sin miembros fallecidos",
                "autorizacion_datos": true
            },
            "familyMembers": [
                {
                    "nombres": "Carlos Andrés Rodríguez García",
                    "numeroIdentificacion": `67648${timestamp.toString().slice(-3)}`,
                    "tipoIdentificacion": {
                        "id": 1,
                        "nombre": "Cédula de Ciudadanía"
                    },
                    "fechaNacimiento": "1985-03-15",
                    "sexo": {
                        "id": 1,
                        "nombre": "Masculino"
                    },
                    "telefono": "32066666666",
                    "correo_electronico": "test@gmail.com",
                    "situacionCivil": {
                        "id": 1,
                        "nombre": "Casado Civil"
                    },
                    "estudio": {
                        "id": 1,
                        "nombre": "Universitario"
                    },
                    "parentesco": {
                        "id": 1,
                        "nombre": "Jefe de Hogar"
                    },
                    "comunidadCultural": {
                        "id": 1,
                        "nombre": "Ninguna"
                    },
                    "enfermedad": {
                        "id": 2,
                        "nombre": "Diabetes"
                    },
                    "talla_camisa/blusa": "L",
                    "talla_pantalon": "32",
                    "talla_zapato": "42",
                    "profesion": {
                        "id": 1,
                        "nombre": "Estudiante"
                    },
                    "motivoFechaCelebrar": {
                        "motivo": "Cumpleaños",
                        "dia": "15",
                        "mes": "03"
                    }
                }
            ],
            "deceasedMembers": [], // VACÍO PARA EVITAR PROBLEMAS
            "metadata": {
                "timestamp": "2025-08-25T10:30:00.000Z",
                "completed": true,
                "currentStage": 6
            }
        };
        
        console.log('📤 Enviando request SIN miembros fallecidos...');
        console.log('🎯 PARROQUIA:', requestSinDeceased.informacionGeneral.parroquia);
        
        const response = await axios.post('http://localhost:3000/api/encuesta', requestSinDeceased, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ ÉXITO! Encuesta creada sin rollback');
        console.log('📋 Respuesta:', JSON.stringify(response.data, null, 2));
        
        const familiaId = response.data.data?.familia_id;
        
        if (familiaId) {
            console.log(`\n🔍 VERIFICAR FAMILIA ${familiaId} EN BD:`);
            console.log(`Query: SELECT f.id_familia, f.apellido_familiar, f.id_parroquia, p.nombre as nombre_parroquia FROM familias f LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia WHERE f.id_familia = ${familiaId}`);
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

testSinDeceasedMembers();
