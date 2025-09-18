/**
 * 🧪 CREAR DATOS DE PRUEBA COMPLETOS PARA ENCUESTAS
 * 
 * Este script crea datos de prueba reales en la base de datos:
 * - Familias completas con padres, madres e hijos
 * - Personas fallecidas con diferentes parentescos
 * - Datos geográficos completos
 * - Servicios de vivienda y agua
 */

const axios = require('axios');
const fs = require('fs');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Credenciales de autenticación
const AUTH_CREDENTIALS = {
    correo_electronico: "admin@parroquia.com",
    contrasena: "Admin123!"
};

let authToken = null;

/**
 * 🔐 Autenticación
 */
async function authenticate() {
    try {
        console.log('🔐 Iniciando autenticación...');
        
        const response = await axios.post(`${API_BASE}/auth/login`, AUTH_CREDENTIALS, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data && response.data.data && response.data.data.accessToken) {
            authToken = response.data.data.accessToken;
            console.log('✅ Autenticación exitosa');
            console.log(`👤 Usuario: ${response.data.data.user.nombre}`);
            return true;
        } else {
            console.error('❌ Respuesta de autenticación inválida');
            return false;
        }
    } catch (error) {
        console.error('❌ Error en autenticación:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
        return false;
    }
}

/**
 * 📝 Crear encuesta completa con datos de prueba
 */
async function crearEncuestaPrueba(numeroFamilia) {
    const timestamp = Date.now();
    const familyCode = `TEST_${timestamp}_${numeroFamilia}`;
    
    const encuestaData = {
        // 📋 INFORMACIÓN GENERAL
        informacionGeneral: {
            municipio: {
                id: 1,
                nombre: "Abejorral"
            },
            parroquia: {
                id: 1,
                nombre: "Parroquia San José"
            },
            sector: {
                id: 1,
                nombre: "Sector Centro"
            },
            vereda: {
                id: 1,
                nombre: "Vereda Central Abejorral"
            },
            fecha: new Date().toISOString().split('T')[0],
            apellido_familiar: `Familia Test ${numeroFamilia}`,
            direccion: `Calle ${numeroFamilia} # ${numeroFamilia + 10}-${numeroFamilia + 20}`,
            telefono: `30012345${numeroFamilia.toString().padStart(2, '0')}`,
            numero_contrato_epm: `EPM${timestamp}${numeroFamilia}`,
            comunionEnCasa: false
        },

        // 🏠 INFORMACIÓN DE VIVIENDA
        vivienda: {
            tipo_vivienda: {
                id: 1,
                nombre: "Casa"
            },
            disposicion_basuras: {
                recolector: true,
                quemada: false,
                enterrada: false,
                recicla: true,
                aire_libre: false,
                no_aplica: false
            }
        },

        // 💧 SERVICIOS DE AGUA
        servicios_agua: {
            sistema_acueducto: {
                id: 1,
                nombre: "Acueducto Público"
            },
            aguas_residuales: {
                id: 1,
                nombre: "Alcantarillado"
            },
            pozo_septico: false,
            letrina: false,
            campo_abierto: false
        },

        // 👥 MIEMBROS DE LA FAMILIA (VIVOS)
        familyMembers: [
            // Padre de familia
            {
                nombres: `Carlos Test ${numeroFamilia} García Pérez`,
                numeroIdentificacion: `8765432${numeroFamilia}${timestamp.toString().slice(-3)}`,
                tipoIdentificacion: {
                    id: 1,
                    nombre: "Cédula de Ciudadanía"
                },
                fechaNacimiento: "1980-03-15",
                sexo: {
                    id: 1,
                    nombre: "Masculino"
                },
                telefono: `32066666${numeroFamilia}`,
                situacionCivil: {
                    id: 1,
                    nombre: "Casado Civil"
                },
                estudio: {
                    id: 6,
                    nombre: "Universitario"
                },
                parentesco: {
                    id: 1,
                    nombre: "Jefe de Hogar"
                },
                comunidadCultural: {
                    id: 1,
                    nombre: "Ninguna"
                },
                enfermedad: {
                    id: 1,
                    nombre: "Ninguna"
                },
                "talla_camisa/blusa": "L",
                talla_pantalon: "32",
                talla_zapato: "42",
                profesion: {
                    id: 1,
                    nombre: "Empleado"
                },
                motivoFechaCelebrar: {
                    motivo: "Cumpleaños",
                    dia: "15",
                    mes: "03"
                }
            },
            // Madre de familia  
            {
                nombres: `María Test ${numeroFamilia} López Rodríguez`,
                numeroIdentificacion: `9876543${numeroFamilia}${timestamp.toString().slice(-3)}`,
                tipoIdentificacion: {
                    id: 1,
                    nombre: "Cédula de Ciudadanía"
                },
                fechaNacimiento: "1985-07-22",
                sexo: {
                    id: 1,
                    nombre: "Masculino"
                },
                telefono: `31077777${numeroFamilia}`,
                situacionCivil: {
                    id: 1,
                    nombre: "Casada Civil"
                },
                estudio: {
                    id: 6,
                    nombre: "Universitario"
                },
                parentesco: {
                    id: 2,
                    nombre: "Padre"
                },
                comunidadCultural: {
                    id: 1,
                    nombre: "Ninguna"
                },
                enfermedad: {
                    id: 1,
                    nombre: "Ninguna"
                },
                "talla_camisa/blusa": "M",
                talla_pantalon: "30",
                talla_zapato: "38",
                profesion: {
                    id: 2,
                    nombre: "Ama de Casa"
                },
                motivoFechaCelebrar: {
                    motivo: "Cumpleaños",
                    dia: "22",
                    mes: "07"
                }
            },
            // Hijo mayor
            {
                nombres: `Juan Test ${numeroFamilia} García López`,
                numeroIdentificacion: `1122334${numeroFamilia}${timestamp.toString().slice(-3)}`,
                tipoIdentificacion: {
                    id: 1,
                    nombre: "Cédula de Ciudadanía"
                },
                fechaNacimiento: "2005-12-10",
                sexo: {
                    id: 1,
                    nombre: "Masculino"
                },
                telefono: `30088888${numeroFamilia}`,
                situacionCivil: {
                    id: 1,
                    nombre: "Soltero"
                },
                estudio: {
                    id: 6,
                    nombre: "Universitario"
                },
                parentesco: {
                    id: 2,
                    nombre: "Padre"
                },
                comunidadCultural: {
                    id: 1,
                    nombre: "Ninguna"
                },
                enfermedad: {
                    id: 1,
                    nombre: "Ninguna"
                },
                "talla_camisa/blusa": "S",
                talla_pantalon: "28",
                talla_zapato: "40",
                profesion: {
                    id: 1,
                    nombre: "Estudiante"
                },
                motivoFechaCelebrar: {
                    motivo: "Cumpleaños",
                    dia: "10",
                    mes: "12"
                }
            },
            // Hija menor
            {
                nombres: `Ana Test ${numeroFamilia} García López`,
                numeroIdentificacion: `5566778${numeroFamilia}${timestamp.toString().slice(-3)}`,
                tipoIdentificacion: {
                    id: 1,
                    nombre: "Cédula de Ciudadanía"
                },
                fechaNacimiento: "2010-05-18",
                sexo: {
                    id: 1,
                    nombre: "Masculino"
                },
                situacionCivil: {
                    id: 1,
                    nombre: "Soltera"
                },
                estudio: {
                    id: 6,
                    nombre: "Universitario"
                },
                parentesco: {
                    id: 2,
                    nombre: "Padre"
                },
                comunidadCultural: {
                    id: 1,
                    nombre: "Ninguna"
                },
                enfermedad: {
                    id: 1,
                    nombre: "Ninguna"
                },
                "talla_camisa/blusa": "XS",
                talla_pantalon: "26",
                talla_zapato: "35",
                profesion: {
                    id: 1,
                    nombre: "Estudiante"
                },
                motivoFechaCelebrar: {
                    motivo: "Cumpleaños",
                    dia: "18",
                    mes: "05"
                }
            }
        ],

        // ⚰️ MIEMBROS FALLECIDOS
        deceasedMembers: [
            // Familiar fallecido
            {
                nombres: `Pedro Test ${numeroFamilia} García Martínez`,
                fechaFallecimiento: "2018-03-15",
                sexo: {
                    id: 1,
                    nombre: "Masculino"
                },
                parentesco: {
                    id: 2,
                    nombre: "Padre"
                },
                causaFallecimiento: "Enfermedad cardiovascular"
            },
            // Otro familiar fallecido
            {
                nombres: `Rosa Test ${numeroFamilia} Rodríguez Silva`,
                fechaFallecimiento: "2020-11-08",
                sexo: {
                    id: 1,
                    nombre: "Masculino"
                },
                parentesco: {
                    id: 2,
                    nombre: "Padre"
                },
                causaFallecimiento: "Causas naturales"
            }
        ],

        // 📋 OBSERVACIONES
        observaciones: {
            sustento_familia: "Trabajo independiente y pensión",
            observaciones_encuestador: `Familia Test ${numeroFamilia} - Datos generados automáticamente para pruebas del sistema. Familia colaborativa y dispuesta a participar en el censo parroquial.`,
            autorizacion_datos: true
        },

        // 📊 METADATA
        metadata: {
            timestamp: new Date().toISOString(),
            completed: true,
            currentStage: 6
        }
    };

    try {
        console.log(`\n📝 Creando Familia Test ${numeroFamilia}...`);
        
        const response = await axios.post(`${API_BASE}/encuesta`, encuestaData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log(`✅ Familia Test ${numeroFamilia} creada exitosamente`);
        console.log(`📊 Status: ${response.status}`);
        console.log(`👥 Personas creadas: ${response.data.data.personas_creadas}`);
        console.log(`⚰️ Difuntos registrados: ${response.data.data.personas_fallecidas}`);
        console.log(`🏠 Código familia: ${response.data.data.codigo_familia}`);
        
        return {
            success: true,
            familia_id: response.data.data.familia_id,
            codigo_familia: response.data.data.codigo_familia,
            personas_creadas: response.data.data.personas_creadas,
            personas_fallecidas: response.data.data.personas_fallecidas
        };

    } catch (error) {
        console.error(`❌ Error creando Familia Test ${numeroFamilia}:`, {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            details: error.response?.data?.details || 'No hay detalles adicionales'
        });
        
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

/**
 * 🔍 Verificar datos creados
 */
async function verificarDatosCreados() {
    try {
        console.log('\n🔍 Verificando datos creados...');
        
        const response = await axios.get(`${API_BASE}/encuesta?page=1&limit=10`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        console.log(`✅ Encuestas encontradas: ${response.data.pagination.totalItems}`);
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('\n📋 RESUMEN DE FAMILIAS CREADAS:');
            response.data.data.forEach((familia, index) => {
                console.log(`${index + 1}. ${familia.apellido_familiar}`);
                console.log(`   📱 ${familia.telefono}`);
                console.log(`   👥 ${familia.tamaño_familia} miembros`);
                console.log(`   🏠 ${familia.codigo_familia}`);
                if (familia.deceasedMembers && familia.deceasedMembers.length > 0) {
                    console.log(`   ⚰️ ${familia.deceasedMembers.length} difunto(s)`);
                }
                console.log('');
            });
        }

        return response.data;

    } catch (error) {
        console.error('❌ Error verificando datos:', error.message);
        return null;
    }
}

/**
 * 🎯 Función principal
 */
async function main() {
    console.log('🚀 INICIANDO CREACIÓN DE DATOS DE PRUEBA COMPLETOS');
    console.log('==================================================');
    
    const resultados = {
        timestamp: new Date().toISOString(),
        familias_creadas: [],
        errores: []
    };

    // Autenticación
    const authSuccess = await authenticate();
    if (!authSuccess) {
        console.error('❌ No se pudo autenticar. Terminando proceso.');
        return;
    }

    // Crear múltiples familias de prueba
    const numFamilias = 3;
    
    for (let i = 1; i <= numFamilias; i++) {
        const resultado = await crearEncuestaPrueba(i);
        
        if (resultado.success) {
            resultados.familias_creadas.push(resultado);
        } else {
            resultados.errores.push({
                familia: i,
                error: resultado.error
            });
        }
        
        // Pausa entre creaciones para evitar sobrecarga
        if (i < numFamilias) {
            console.log('⏳ Pausando 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Verificar datos creados
    await verificarDatosCreados();

    // Guardar resultados
    fs.writeFileSync('resultados-datos-prueba.json', JSON.stringify(resultados, null, 2));

    // Resumen final
    console.log('\n🎊 PROCESO COMPLETADO');
    console.log('====================');
    console.log(`✅ Familias creadas exitosamente: ${resultados.familias_creadas.length}`);
    console.log(`❌ Errores encontrados: ${resultados.errores.length}`);
    console.log(`📄 Resultados guardados en: resultados-datos-prueba.json`);
    
    if (resultados.familias_creadas.length > 0) {
        console.log('\n🎯 PRÓXIMOS PASOS:');
        console.log('1. Ejecutar: node probar-encuestas-reales.js');
        console.log('2. Verificar que las consultas devuelvan los datos creados');
        console.log('3. Probar funcionalidades de actualización y eliminación');
    }
}

// Ejecutar script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, crearEncuestaPrueba, authenticate };