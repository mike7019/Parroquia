// Script para validar la sintaxis JSON del archivo swagger.js
import { swaggerConfig, specs } from './src/config/swagger.js';

console.log('🔍 Validando archivo swagger.js...\n');

try {
    // Intentar acceder al spec
    if (specs) {
        console.log('✅ Archivo swagger.js se puede importar (usando specs)');
        
        const spec = specs;
        
        if (spec.components) {
            console.log('✅ components section existe');
            
            if (spec.components.schemas) {
                console.log('✅ schemas section existe');
                
                const schemaNames = Object.keys(spec.components.schemas);
                console.log(`📊 Total de schemas encontrados: ${schemaNames.length}`);
                
                // Buscar schemas de encuesta
                const encuestaSchemas = schemaNames.filter(name => 
                    name.toLowerCase().includes('encuesta')
                );
                
                console.log('\n📋 Schemas de encuesta encontrados:');
                if (encuestaSchemas.length > 0) {
                    encuestaSchemas.forEach(schema => {
                        console.log(`   ✅ ${schema}`);
                    });
                } else {
                    console.log('   ❌ No se encontraron schemas de encuesta');
                }
                
                // Verificar schemas específicos
                const requiredSchemas = [
                    'EncuestaCompleta',
                    'EncuestaResponse',
                    'EncuestaResumen',
                    'EncuestaDetallada',
                    'PaginationInfo'
                ];
                
                console.log('\n🔍 Verificando schemas requeridos:');
                requiredSchemas.forEach(schemaName => {
                    if (spec.components.schemas[schemaName]) {
                        console.log(`   ✅ ${schemaName}: Presente`);
                    } else {
                        console.log(`   ❌ ${schemaName}: Faltante`);
                    }
                });
                
            } else {
                console.log('❌ schemas section no existe');
            }
        } else {
            console.log('❌ components section no existe');
        }
        
    } else if (swaggerConfig && swaggerConfig.definition) {
        console.log('✅ Archivo swagger.js se puede importar (usando swaggerConfig)');
        
        const spec = swaggerConfig.definition;
        
        if (spec.components) {
            console.log('✅ components section existe');
            
            if (spec.components.schemas) {
                console.log('✅ schemas section existe');
                
                const schemaNames = Object.keys(spec.components.schemas);
                console.log(`📊 Total de schemas encontrados: ${schemaNames.length}`);
                
                // Buscar schemas de encuesta
                const encuestaSchemas = schemaNames.filter(name => 
                    name.toLowerCase().includes('encuesta')
                );
                
                console.log('\n📋 Schemas de encuesta encontrados:');
                if (encuestaSchemas.length > 0) {
                    encuestaSchemas.forEach(schema => {
                        console.log(`   ✅ ${schema}`);
                    });
                } else {
                    console.log('   ❌ No se encontraron schemas de encuesta');
                }
                
                // Verificar schemas específicos
                const requiredSchemas = [
                    'EncuestaCompleta',
                    'EncuestaResponse',
                    'EncuestaResumen',
                    'EncuestaDetallada',
                    'PaginationInfo'
                ];
                
                console.log('\n🔍 Verificando schemas requeridos:');
                requiredSchemas.forEach(schemaName => {
                    if (spec.components.schemas[schemaName]) {
                        console.log(`   ✅ ${schemaName}: Presente`);
                    } else {
                        console.log(`   ❌ ${schemaName}: Faltante`);
                    }
                });
                
            } else {
                console.log('❌ schemas section no existe');
            }
        } else {
            console.log('❌ components section no existe');
        }
        
    } else {
        console.log('❌ No se pudo acceder al spec de swagger');
    }
    
} catch (error) {
    console.error('❌ Error al validar swagger.js:', error.message);
    console.log('\n🔍 Posibles problemas:');
    console.log('   • Error de sintaxis JavaScript');
    console.log('   • Error de sintaxis JSON');
    console.log('   • Problema en la estructura de exports');
    console.log('   • Dependencias faltantes');
}
