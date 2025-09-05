const axios = require('axios');

async function testRequestCompleto() {
    console.log('🔍 TEST CON REQUEST COMPLETO DEL USUARIO');
    
    try {
        // 1. Login
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            correo_electronico: 'admin@parroquia.com',
            contrasena: 'Admin123!'
        });
        
        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login exitoso');
        
        // 2. Request completo del usuario (con timestamp único)
        const timestamp = Date.now();
        const requestCompleto = {
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
                "apellido_familiar": `Rada_Rojas_${timestamp}`,
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
                "observaciones_encuestador": "Familia colaborativa, información completa",
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
                    "correo_electronico": "esto_esuncorrreo@gmail.com",
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
            "deceasedMembers": [
                {
                    "nombres": "Pedro Antonio Rodríguez",
                    "fechaFallecimiento": "2020-05-15",
                    "sexo": {
                        "id": 1,
                        "nombre": "Masculino"
                    },
                    "parentesco": {
                        "id": "PADRE",
                        "nombre": "Padre"
                    },
                    "causaFallecimiento": "Enfermedad cardiovascular"
                }
            ],
            "metadata": {
                "timestamp": "2025-08-25T10:30:00.000Z",
                "completed": true,
                "currentStage": 6
            }
        };
        
        console.log('📤 Enviando request completo...');
        console.log('🎯 PARROQUIA:', requestCompleto.informacionGeneral.parroquia);
        
        const response = await axios.post('http://localhost:3000/api/encuesta', requestCompleto, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ ÉXITO! Encuesta creada completamente');
        console.log('📋 Respuesta:', JSON.stringify(response.data, null, 2));
        
        const familiaId = response.data.data?.familia_id;
        
        if (familiaId) {
            // Verificar en BD con las credenciales correctas del servidor
            console.log(`\n🔍 Verificando familia ${familiaId} en base de datos...`);
            
            // Usar la verificación con la herramienta de BD disponible
            setTimeout(async () => {
                console.log('\n📊 Verificar manualmente la familia en BD con:');
                console.log(`SELECT f.id_familia, f.apellido_familiar, f.id_parroquia, p.nombre as nombre_parroquia FROM familias f LEFT JOIN parroquias p ON f.id_parroquia = p.id_parroquia WHERE f.id_familia = ${familiaId}`);
            }, 1000);
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.log('📋 Detalles completos:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testRequestCompleto();
