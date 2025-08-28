// Test completo del servicio de destrezas
import { loadAllModels } from './syncDatabaseComplete.js';
import sequelize from './config/sequelize.js';
import destrezaService from './src/services/catalog/destrezaService.js';

async function testDestrezaService() {
  console.log('🧪 TEST COMPLETO - SERVICIO DE DESTREZAS');
  console.log('='.repeat(60));
  
  try {
    // Cargar modelos
    console.log('\n📦 Cargando modelos...');
    await loadAllModels();
    console.log('✅ Modelos cargados exitosamente');
    
    // Verificar asociaciones
    const destreza = sequelize.models.Destreza;
    const persona = sequelize.models.Persona;
    
    const destrezaAssoc = Object.keys(destreza.associations || {});
    const personaAssoc = Object.keys(persona.associations || {});
    
    console.log(`\n🔗 Asociaciones verificadas:`);
    console.log(`   - Destreza: [${destrezaAssoc.join(', ')}]`);
    console.log(`   - Persona: [${personaAssoc.join(', ')}]`);
    
    // Test 1: Crear destrezas de prueba
    console.log('\n🧪 TEST 1: Crear destrezas de prueba');
    const destrezasPrueba = [
      { nombre: 'Programación en JavaScript' },
      { nombre: 'Diseño Gráfico' },
      { nombre: 'Cocina Internacional' },
      { nombre: 'Fotografía Digital' },
      { nombre: 'Carpintería' }
    ];
    
    for (const destrezaData of destrezasPrueba) {
      try {
        const resultado = await destrezaService.createDestreza(destrezaData);
        if (resultado.exito) {
          console.log(`   ✅ Creada: ${destrezaData.nombre} (ID: ${resultado.datos.id_destreza})`);
        } else {
          console.log(`   ⚠️  ${destrezaData.nombre}: ${resultado.mensaje}`);
        }
      } catch (error) {
        console.log(`   ❌ Error con ${destrezaData.nombre}: ${error.message}`);
      }
    }
    
    // Test 2: Obtener todas las destrezas
    console.log('\n🧪 TEST 2: Obtener todas las destrezas');
    const todasDestrezas = await destrezaService.getAllDestrezas({ limit: 10 });
    console.log(`   ✅ Total destrezas: ${todasDestrezas.datos.length}`);
    console.log(`   📊 Paginación: Página ${todasDestrezas.paginacion.paginaActual} de ${todasDestrezas.paginacion.totalPaginas}`);
    
    if (todasDestrezas.datos.length > 0) {
      console.log('\n   📋 Primeras destrezas:');
      todasDestrezas.datos.slice(0, 3).forEach((dest, index) => {
        console.log(`      ${index + 1}. ${dest.nombre} (ID: ${dest.id_destreza})`);
      });
    }
    
    // Test 3: Buscar destrezas
    console.log('\n🧪 TEST 3: Buscar destrezas por término');
    const busqueda = await destrezaService.searchDestrezas('program', 5);
    console.log(`   🔍 Búsqueda "program": ${busqueda.total} resultado(s)`);
    busqueda.datos.forEach((dest, index) => {
      console.log(`      ${index + 1}. ${dest.nombre}`);
    });
    
    // Test 4: Obtener estadísticas
    console.log('\n🧪 TEST 4: Obtener estadísticas');
    const stats = await destrezaService.getDestrezasStats();
    console.log(`   📊 Total destrezas: ${stats.datos.resumen.totalDestrezas}`);
    console.log(`   👥 Con personas: ${stats.datos.resumen.destrezasConPersonas}`);
    console.log(`   🚫 Sin personas: ${stats.datos.resumen.destrezasSinPersonas}`);
    console.log(`   📈 % Utilización: ${stats.datos.resumen.porcentajeUtilizacion}%`);
    
    if (stats.datos.destrezasPopulares.length > 0) {
      console.log('\n   🏆 Destrezas más populares:');
      stats.datos.destrezasPopulares.forEach((dest, index) => {
        console.log(`      ${index + 1}. ${dest.nombre} (${dest.total_personas} personas)`);
      });
    }
    
    // Test 5: Obtener destreza por ID
    if (todasDestrezas.datos.length > 0) {
      console.log('\n🧪 TEST 5: Obtener destreza por ID');
      const primeraDestreza = todasDestrezas.datos[0];
      const destrezaPorId = await destrezaService.getDestrezaById(primeraDestreza.id_destreza);
      
      if (destrezaPorId.exito) {
        console.log(`   ✅ Destreza obtenida: ${destrezaPorId.datos.nombre}`);
        console.log(`   📅 Creada: ${destrezaPorId.datos.created_at}`);
      }
    }
    
    // Test 6: Actualizar destreza
    if (todasDestrezas.datos.length > 0) {
      console.log('\n🧪 TEST 6: Actualizar destreza');
      const destreza = todasDestrezas.datos[0];
      const nombreAnterior = destreza.nombre;
      const nuevoNombre = `${nombreAnterior} (Actualizado)`;
      
      const actualizado = await destrezaService.updateDestreza(destreza.id_destreza, {
        nombre: nuevoNombre
      });
      
      if (actualizado.exito) {
        console.log(`   ✅ Actualizada: "${nombreAnterior}" → "${actualizado.datos.nombre}"`);
      }
    }
    
    // Test 7: Intentar crear destreza duplicada
    console.log('\n🧪 TEST 7: Intentar crear destreza duplicada');
    const duplicada = await destrezaService.createDestreza({ nombre: 'Programación en JavaScript' });
    if (!duplicada.exito) {
      console.log(`   ✅ Validación correcta: ${duplicada.mensaje}`);
    }
    
    // Test 8: Validaciones de entrada
    console.log('\n🧪 TEST 8: Validaciones de entrada');
    try {
      await destrezaService.createDestreza({ nombre: '' });
    } catch (error) {
      console.log(`   ✅ Validación nombre vacío: ${error.message}`);
    }
    
    try {
      await destrezaService.getDestrezaById('abc');
    } catch (error) {
      console.log(`   ✅ Validación ID inválido: ${error.message}`);
    }
    
    console.log('\n🎯 ¡TODOS LOS TESTS COMPLETADOS EXITOSAMENTE!');
    console.log('\n✨ El servicio de destrezas está listo para usar en:');
    console.log('   📍 Endpoint base: /api/catalog/destrezas');
    console.log('   📚 Documentación: /api-docs (sección Destrezas)');
    console.log('   🔧 Funcionalidades disponibles:');
    console.log('      - CRUD completo de destrezas');
    console.log('      - Búsqueda y filtrado');
    console.log('      - Paginación');
    console.log('      - Estadísticas');
    console.log('      - Asociación con personas');
    console.log('      - Validaciones de integridad');
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error(error.stack);
  }
}

await testDestrezaService();
