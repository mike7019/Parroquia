const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function authenticateAndTestEncuestas() {
    try {
        console.log('🧪 Iniciando test completo de autenticación y encuestas...');
        
        // Paso 1: Intentar hacer login con credenciales por defecto
        console.log('\n🔐 Paso 1: Intentando autenticación...');
        
        const loginData = {
            email: 'admin@parroquia.local',
            password: 'admin123'
        };

        let authResponse;
        try {
            authResponse = await axios.post(`${BASE_URL}/auth/login`, loginData, {
                timeout: 10000,
                validateStatus: function (status) {
                    return status < 500;
                }
            });
        } catch (error) {
            console.log('❌ Error en login:', error.message);
            console.log('\n🔍 Intentando verificar estado del servidor...');
            
            // Verificar si el servidor responde
            try {
                const healthCheck = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
                console.log('✅ Servidor respondió health check:', healthCheck.status);
            } catch (healthError) {
                console.log('🔴 Servidor no responde en health check');
                return;
            }
            
            // Intentar probar encuestas sin autenticación para ver el error específico
            console.log('\n🔍 Intentando acceso directo a encuestas sin autenticación...');
            try {
                const encuestasResponse = await axios.get(`${BASE_URL}/encuestas`, {
                    timeout: 10000,
                    validateStatus: function (status) {
                        return status < 500;
                    }
                });
                
                console.log('📊 Status respuesta encuestas sin auth:', encuestasResponse.status);
                if (encuestasResponse.status === 401) {
                    console.log('✅ Endpoint encuestas existe pero requiere autenticación (esperado)');
                    console.log('📋 Mensaje:', encuestasResponse.data.message || JSON.stringify(encuestasResponse.data));
                }
                
            } catch (encuestasError) {
                console.log('❌ Error accediendo a encuestas:', encuestasError.message);
                if (encuestasError.response) {
                    console.log('📊 Status:', encuestasError.response.status);
                    console.log('📋 Data:', encuestasError.response.data);
                }
            }
            return;
        }

        console.log('📊 Status autenticación:', authResponse.status);
        
        if (authResponse.status === 200 && authResponse.data.token) {
            console.log('✅ Autenticación exitosa');
            const token = authResponse.data.token;
            
            // Paso 2: Probar endpoint de encuestas con token
            console.log('\n📋 Paso 2: Probando endpoint de encuestas con autenticación...');
            
            try {
                const encuestasResponse = await axios.get(`${BASE_URL}/encuestas`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 15000,
                    validateStatus: function (status) {
                        return status < 500;
                    }
                });
                
                console.log('📊 Status encuestas:', encuestasResponse.status);
                
                if (encuestasResponse.status === 200) {
                    console.log('✅ API de encuestas respondió exitosamente');
                    const familias = encuestasResponse.data.data || encuestasResponse.data;
                    console.log('📦 Familias recibidas:', Array.isArray(familias) ? familias.length : 'No es array');
                    
                    if (Array.isArray(familias) && familias.length > 0) {
                        console.log('\n🔍 Verificando primeras familias para valores null:');
                        
                        familias.slice(0, 3).forEach((familia, index) => {
                            console.log(`\n--- Familia ${familia.id} ---`);
                            console.log('Acueducto:', familia.acueducto);
                            console.log('Aguas Residuales:', familia.aguas_residuales);
                            console.log('Tipo Vivienda:', familia.tipo_vivienda);
                            
                            // Verificar si hay objetos con id: null (problema original)
                            if (familia.acueducto && typeof familia.acueducto === 'object' && familia.acueducto.id === null) {
                                console.log('❌ PROBLEMA: acueducto tiene objeto con id: null');
                            } else if (familia.acueducto === null) {
                                console.log('✅ acueducto es null (correcto)');
                            } else if (familia.acueducto && familia.acueducto.id) {
                                console.log('✅ acueducto tiene datos válidos');
                            }
                            
                            if (familia.aguas_residuales && typeof familia.aguas_residuales === 'object' && familia.aguas_residuales.id === null) {
                                console.log('❌ PROBLEMA: aguas_residuales tiene objeto con id: null');
                            } else if (familia.aguas_residuales === null) {
                                console.log('✅ aguas_residuales es null (correcto)');
                            } else if (familia.aguas_residuales && familia.aguas_residuales.id) {
                                console.log('✅ aguas_residuales tiene datos válidos');
                            }
                        });
                        
                        console.log('\n🎯 RESULTADO DEL TEST:');
                        console.log('✅ Servidor funcionando');
                        console.log('✅ Autenticación exitosa');
                        console.log('✅ API de encuestas accesible');
                        console.log('✅ Datos recibidos correctamente');
                        console.log('📋 Revisar arriba para verificar que no hay objetos con id: null');
                        
                    } else {
                        console.log('⚠️ No se recibieron familias o formato inesperado');
                    }
                    
                } else {
                    console.log('⚠️ Respuesta inesperada del endpoint encuestas:', encuestasResponse.status);
                    console.log('📋 Data:', encuestasResponse.data);
                }
                
            } catch (encuestasError) {
                console.log('❌ Error probando encuestas:', encuestasError.message);
                if (encuestasError.response) {
                    console.log('📊 Status:', encuestasError.response.status);
                    console.log('📋 Data:', encuestasError.response.data);
                }
            }
            
        } else {
            console.log('⚠️ Autenticación falló:', authResponse.status);
            console.log('📋 Respuesta:', authResponse.data);
        }
        
    } catch (error) {
        console.log('❌ Error general en el test:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('🔴 Error: No se puede conectar al servidor. ¿Está ejecutándose en el puerto 3000?');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('⏰ Error: Timeout - el servidor no respondió a tiempo');
        }
    }
}

// Ejecutar el test
authenticateAndTestEncuestas();
