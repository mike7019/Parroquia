import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

async function probarReutilizacionReal() {
  console.log('🎯 PRUEBA REAL DE REUTILIZACIÓN DE IDs\n');

  try {
    await sequelize.sync({ alter: false });

    // 1. Estado inicial
    console.log('1️⃣ ESTADO ANTES DE LA PRUEBA');
    const iniciales = await SituacionCivilService.getAllSituacionesCiviles();
    console.log(`   Total registros activos: ${iniciales.length}`);
    console.log(`   IDs activos: [${iniciales.map(r => r.id_situacion_civil).sort((a,b) => a-b).join(', ')}]`);

    // 2. Crear registro temporal
    console.log('\n2️⃣ CREANDO REGISTRO TEMPORAL');
    const temporal = await SituacionCivilService.createSituacionCivil({
      nombre: `Temporal ${Date.now()}`,
      descripcion: "Registro temporal para test"
    });
    console.log(`   ✅ Creado temporal: ID ${temporal.id}`);

    // 3. Eliminar físicamente el registro temporal (crear gap)
    console.log('\n3️⃣ ELIMINANDO FÍSICAMENTE (CREAR GAP)');
    await SituacionCivilService.deleteSituacionCivil(temporal.id);
    console.log(`   ✅ Eliminado físicamente: ID ${temporal.id}`);

    // 4. Verificar que hay gap
    console.log('\n4️⃣ VERIFICANDO GAP CREADO');
    const actuales = await SituacionCivilService.getAllSituacionesCiviles();
    const idsActuales = actuales.map(r => r.id_situacion_civil).sort((a,b) => a-b);
    console.log(`   IDs activos después de eliminación: [${idsActuales.join(', ')}]`);
    
    if (!idsActuales.includes(temporal.id)) {
      console.log(`   ✅ GAP CONFIRMADO: ID ${temporal.id} ya no existe`);
    }

    // 5. Crear nuevo registro (debería reutilizar el gap)
    console.log('\n5️⃣ CREANDO NUEVO REGISTRO (DEBERÍA REUTILIZAR GAP)');
    const nuevo = await SituacionCivilService.createSituacionCivil({
      nombre: `Reutilizado ${Date.now()}`,
      descripcion: "Test de reutilización de gap"
    });
    console.log(`   ✅ Nuevo registro creado con ID: ${nuevo.id}`);

    // 6. Verificar reutilización
    console.log('\n6️⃣ RESULTADO DE LA PRUEBA');
    if (nuevo.id === temporal.id) {
      console.log(`   🎉 ¡REUTILIZACIÓN EXITOSA! ID ${temporal.id} fue reutilizado`);
    } else if (nuevo.id < temporal.id) {
      console.log(`   🔄 Reutilizó un gap anterior: ${nuevo.id} (esperaba: ${temporal.id})`);
    } else {
      console.log(`   ❌ NO REUTILIZÓ - Usó ID secuencial: ${nuevo.id} (esperaba: ${temporal.id})`);
    }

    // 7. Estado final
    console.log('\n7️⃣ ESTADO FINAL');
    const finales = await SituacionCivilService.getAllSituacionesCiviles();
    const idsFinales = finales.map(r => r.id_situacion_civil).sort((a,b) => a-b);
    console.log(`   IDs finales: [${idsFinales.join(', ')}]`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

probarReutilizacionReal();