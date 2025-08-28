#!/usr/bin/env node

/**
 * Script para probar si las rutas de destrezas se pueden cargar correctamente
 */

console.log('🧪 Probando importación de rutas de destrezas...\n');

async function testDestrezasRoutes() {
    try {
        console.log('1️⃣ Intentando importar destrezaRoutes...');
        const destrezaRoutes = await import('./src/routes/catalog/destrezaRoutes.js');
        console.log('✅ destrezaRoutes importado exitosamente:', typeof destrezaRoutes.default);
        
        console.log('\n2️⃣ Intentando importar destrezaController...');
        const destrezaController = await import('./src/controllers/catalog/destrezaController.js');
        console.log('✅ destrezaController importado exitosamente:', typeof destrezaController.default);
        
        console.log('\n3️⃣ Intentando importar destrezaService...');
        const destrezaService = await import('./src/services/catalog/destrezaService.js');
        console.log('✅ destrezaService importado exitosamente:', typeof destrezaService.default);
        
        console.log('\n4️⃣ Probando las rutas del router...');
        const router = destrezaRoutes.default;
        console.log('✅ Router de destrezas cargado correctamente');
        console.log('   - Tipo:', typeof router);
        console.log('   - Stack length:', router.stack ? router.stack.length : 'N/A');
        
        if (router.stack) {
            console.log('\n📋 Rutas encontradas en el router:');
            router.stack.forEach((layer, index) => {
                const route = layer.route;
                if (route) {
                    const methods = Object.keys(route.methods).join(', ').toUpperCase();
                    console.log(`   ${index + 1}. ${methods} ${route.path}`);
                }
            });
        }
        
        console.log('\n✅ ¡Todas las importaciones exitosas!');
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testDestrezasRoutes();
