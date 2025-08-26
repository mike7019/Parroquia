// Script para verificar si los schemas de encuesta están presentes en Swagger
const http = require('http');

const verifySwaggerSchemas = () => {
    console.log('🔍 Verificando schemas de encuesta en Swagger...\n');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api-docs.json',
        method: 'GET',
        timeout: 10000
    };

    const req = http.request(options, (res) => {
        console.log(`📡 Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const swaggerSpec = JSON.parse(data);
                
                console.log('✅ Swagger JSON cargado correctamente\n');
                
                // Verificar components
                if (swaggerSpec.components) {
                    console.log('✅ components section existe');
                    
                    if (swaggerSpec.components.schemas) {
                        console.log('✅ schemas section existe');
                        
                        // Verificar schemas específicos de encuesta
                        const requiredSchemas = [
                            'EncuestaCompleta',
                            'EncuestaResponse',
                            'EncuestaResumen',
                            'EncuestaDetallada',
                            'PaginationInfo'
                        ];
                        
                        console.log('\n📋 Verificando schemas de encuesta:');
                        console.log('=====================================');
                        
                        let allSchemasPresent = true;
                        
                        requiredSchemas.forEach(schemaName => {
                            if (swaggerSpec.components.schemas[schemaName]) {
                                console.log(`✅ ${schemaName}: Presente`);
                            } else {
                                console.log(`❌ ${schemaName}: FALTANTE`);
                                allSchemasPresent = false;
                            }
                        });
                        
                        console.log('\n🔍 Verificando referencias en paths...');
                        
                        // Verificar path de encuesta
                        if (swaggerSpec.paths && swaggerSpec.paths['/api/encuesta']) {
                            console.log('✅ Path /api/encuesta existe');
                            
                            const encuestaPath = swaggerSpec.paths['/api/encuesta'];
                            
                            if (encuestaPath.post) {
                                console.log('✅ POST /api/encuesta existe');
                                
                                // Verificar requestBody
                                if (encuestaPath.post.requestBody && 
                                    encuestaPath.post.requestBody.content && 
                                    encuestaPath.post.requestBody.content['application/json'] &&
                                    encuestaPath.post.requestBody.content['application/json'].schema &&
                                    encuestaPath.post.requestBody.content['application/json'].schema.$ref) {
                                    
                                    const requestRef = encuestaPath.post.requestBody.content['application/json'].schema.$ref;
                                    console.log(`✅ RequestBody ref: ${requestRef}`);
                                    
                                    if (requestRef === '#/components/schemas/EncuestaCompleta') {
                                        console.log('✅ RequestBody apunta a EncuestaCompleta correctamente');
                                    } else {
                                        console.log('❌ RequestBody NO apunta a EncuestaCompleta');
                                    }
                                } else {
                                    console.log('❌ RequestBody schema reference no encontrada');
                                }
                                
                                // Verificar response 200
                                if (encuestaPath.post.responses && 
                                    encuestaPath.post.responses['200'] &&
                                    encuestaPath.post.responses['200'].content &&
                                    encuestaPath.post.responses['200'].content['application/json'] &&
                                    encuestaPath.post.responses['200'].content['application/json'].schema &&
                                    encuestaPath.post.responses['200'].content['application/json'].schema.$ref) {
                                    
                                    const responseRef = encuestaPath.post.responses['200'].content['application/json'].schema.$ref;
                                    console.log(`✅ Response 200 ref: ${responseRef}`);
                                    
                                    if (responseRef === '#/components/schemas/EncuestaResponse') {
                                        console.log('✅ Response 200 apunta a EncuestaResponse correctamente');
                                    } else {
                                        console.log('❌ Response 200 NO apunta a EncuestaResponse');
                                    }
                                } else {
                                    console.log('❌ Response 200 schema reference no encontrada');
                                }
                            } else {
                                console.log('❌ POST method no encontrado en /api/encuesta');
                            }
                        } else {
                            console.log('❌ Path /api/encuesta no encontrado');
                        }
                        
                        // Resumen final
                        console.log('\n📊 RESUMEN:');
                        console.log('===========');
                        
                        if (allSchemasPresent) {
                            console.log('✅ Todos los schemas de encuesta están presentes');
                            console.log('✅ El problema NO está en los schemas');
                            console.log('🔍 Posibles causas:');
                            console.log('   • Cache del navegador');
                            console.log('   • Servidor necesita reinicio');
                            console.log('   • Problema en la UI de Swagger');
                            console.log('\n💡 Soluciones:');
                            console.log('   • Ctrl+F5 para hard refresh en el navegador');
                            console.log('   • Reiniciar el servidor');
                            console.log('   • Abrir en ventana privada/incógnito');
                        } else {
                            console.log('❌ Faltan schemas de encuesta');
                            console.log('🔧 Se requiere revisar el archivo swagger.js');
                        }
                        
                    } else {
                        console.log('❌ schemas section no existe');
                    }
                } else {
                    console.log('❌ components section no existe');
                }
                
            } catch (parseError) {
                console.error('❌ Error parsing Swagger JSON:', parseError.message);
            }
        });
    });

    req.on('error', (err) => {
        console.error('❌ Error conectando al servidor:', err.message);
        console.log('🔍 Verificar que el servidor esté ejecutándose en http://localhost:3000');
    });

    req.on('timeout', () => {
        console.error('❌ Timeout conectando al servidor');
        req.destroy();
    });

    req.end();
};

verifySwaggerSchemas();
