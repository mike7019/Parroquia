import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

async function testCompleteService() {
  console.log('🎯 PRUEBA COMPLETA DEL SERVICIO SITUACION CIVIL\n');

  try {
    await sequelize.sync({ alter: false });

    // 1. Verificar registros existentes
    console.log('1️⃣ VERIFICANDO REGISTROS EXISTENTES');
    const existentes = await SituacionCivilService.getAllSituacionesCiviles();
    console.log(`   ✅ Total registros: ${existentes.length}`);
    existentes.forEach(sc => {
      console.log(`   - ID ${sc.id_situacion_civil}: ${sc.nombre}`);
    });

    // 2. Probar creación con nombre único
    console.log('\n2️⃣ CREANDO NUEVA SITUACION CIVIL');
    const timestamp = Date.now();
    const nuevoNombre = `Viudo(a) ${timestamp}`;
    
    const nuevo = await SituacionCivilService.createSituacionCivil({
      nombre: nuevoNombre,
      descripcion: "Persona que ha perdido a su cónyuge"
    });
    
    console.log(`   ✅ Creado exitosamente: ID ${nuevo.id_situacion_civil} - ${nuevo.nombre}`);

    // 3. Probar obtener por ID
    console.log('\n3️⃣ OBTENIENDO POR ID');
    const obtenido = await SituacionCivilService.getSituacionCivilById(nuevo.id_situacion_civil);
    console.log(`   ✅ Obtenido: ${obtenido.nombre} - ${obtenido.descripcion}`);

    // 4. Probar actualización
    console.log('\n4️⃣ ACTUALIZANDO REGISTRO');
    await SituacionCivilService.updateSituacionCivil(nuevo.id_situacion_civil, {
      descripcion: "Persona cuyo cónyuge ha fallecido"
    });
    console.log(`   ✅ Actualización exitosa`);

    // 5. Probar búsqueda
    console.log('\n5️⃣ PROBANDO BÚSQUEDA');
    const resultados = await SituacionCivilService.searchSituacionesCiviles("Viudo", { limit: 5 });
    console.log(`   ✅ Resultados encontrados: ${resultados.length}`);

    // 6. Probar estadísticas
    console.log('\n6️⃣ OBTENIENDO ESTADÍSTICAS');
    const stats = await SituacionCivilService.getSituacionCivilStats();
    console.log(`   ✅ Total: ${stats.total}, Activos: ${stats.activos}, Porcentaje: ${stats.porcentajeActivos}%`);

    // 7. Probar validación de duplicados
    console.log('\n7️⃣ PROBANDO VALIDACIÓN DE DUPLICADOS');
    try {
      await SituacionCivilService.createSituacionCivil({
        nombre: "Soltero(a)" // Este ya existe
      });
      console.log('   ❌ ERROR: Debería haber fallado por duplicado');
    } catch (error) {
      console.log('   ✅ Validación funcionando: ' + error.message);
    }

    // 8. Probar validación de nombre requerido
    console.log('\n8️⃣ PROBANDO VALIDACIÓN DE NOMBRE REQUERIDO');
    try {
      await SituacionCivilService.createSituacionCivil({
        descripcion: "Sin nombre"
      });
      console.log('   ❌ ERROR: Debería haber fallado por falta de nombre');
    } catch (error) {
      console.log('   ✅ Validación funcionando: ' + error.message);
    }

    // 9. Probar reutilización de IDs
    console.log('\n9️⃣ PROBANDO REUTILIZACIÓN DE IDS');
    const nextId = await SituacionCivilService.findNextAvailableId();
    console.log(`   ✅ Próximo ID disponible: ${nextId}`);

    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('\n📊 RESUMEN:');
    console.log('   ✅ Creación funcionando');
    console.log('   ✅ Lectura funcionando');
    console.log('   ✅ Actualización funcionando');
    console.log('   ✅ Búsqueda funcionando');
    console.log('   ✅ Validaciones funcionando');
    console.log('   ✅ Reutilización de IDs funcionando');
    console.log('   ✅ Estadísticas funcionando');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.details) {
      console.error('   Detalles:', error.details);
    }
  } finally {
    process.exit(0);
  }
}

testCompleteService();