import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

async function testReutilizacionFinal() {
  console.log('🎯 PRUEBA FINAL - REUTILIZACIÓN DE IDs\n');

  try {
    await sequelize.sync({ alter: false });

    // 1. Ver estado inicial
    console.log('1️⃣ ESTADO INICIAL');
    const iniciales = await SituacionCivilService.getAllSituacionesCiviles();
    console.log('   📋 Registros activos actuales:');
    iniciales.forEach(sc => {
      console.log(`      ID ${sc.id_situacion_civil}: ${sc.nombre}`);
    });

    // 2. Crear un registro para luego eliminarlo
    console.log('\n2️⃣ CREANDO REGISTRO PARA TEST');
    const timestamp = Date.now();
    const nombreTest = `Test Eliminación ${timestamp}`;
    
    const nuevo = await SituacionCivilService.createSituacionCivil({
      nombre: nombreTest,
      descripcion: "Registro para prueba de eliminación"
    });
    
    console.log(`   ✅ Creado: ID ${nuevo.id} - ${nombreTest}`);

    // 3. Eliminar el registro recién creado
    console.log('\n3️⃣ ELIMINANDO REGISTRO RECIÉN CREADO');
    await SituacionCivilService.deleteSituacionCivil(nuevo.id);
    console.log(`   ✅ Eliminado: ID ${nuevo.id}`);

    // 4. Verificar próximo ID (debería reutilizar el eliminado)
    console.log('\n4️⃣ VERIFICANDO PRÓXIMO ID');
    const nextId = await SituacionCivilService.findNextAvailableId();
    console.log(`   🔢 Próximo ID calculado: ${nextId}`);

    // 5. Crear otro registro para ver si reutiliza el ID
    console.log('\n5️⃣ CREANDO NUEVO REGISTRO');
    const nombrePrueba = `Prueba Reutilización ${timestamp}`;
    
    const reutilizado = await SituacionCivilService.createSituacionCivil({
      nombre: nombrePrueba,
      descripcion: "Test de reutilización de ID eliminado"
    });
    
    console.log(`   ✅ Nuevo registro creado con ID: ${reutilizado.id} - ${nombrePrueba}`);

    // 6. Verificar si reutilizó el ID
    console.log('\n6️⃣ ANÁLISIS DE REUTILIZACIÓN');
    if (reutilizado.id === nuevo.id) {
      console.log(`   🎉 ¡ÉXITO! Se reutilizó el ID ${nuevo.id} del registro eliminado`);
    } else if (reutilizado.id < nuevo.id) {
      console.log(`   🔄 Se reutilizó un ID anterior: ${reutilizado.id} (había gap)`);
    } else {
      console.log(`   ⚠️  No se reutilizó - ID secuencial: ${reutilizado.id} (esperaba: ${nuevo.id})`);
    }

    // 7. Estado final
    console.log('\n7️⃣ ESTADO FINAL');
    const finales = await SituacionCivilService.getAllSituacionesCiviles();
    console.log('   📋 Registros activos finales:');
    finales.forEach(sc => {
      console.log(`      ID ${sc.id_situacion_civil}: ${sc.nombre}`);
    });

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.details) {
      console.error('   Detalles:', error.details);
    }
  } finally {
    process.exit(0);
  }
}

testReutilizacionFinal();