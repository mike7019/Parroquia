import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

async function testReutilizacionIds() {
  console.log('🔄 PROBANDO REUTILIZACIÓN DE IDs CORREGIDA\n');

  try {
    await sequelize.sync({ alter: false });

    // 1. Ver estado actual
    console.log('1️⃣ ESTADO ACTUAL');
    const existentes = await SituacionCivilService.getAllSituacionesCiviles({ includeInactive: true });
    console.log('   📋 Registros actuales:');
    existentes.forEach(sc => {
      const estado = sc.deletedAt ? '(ELIMINADO)' : sc.activo ? '(ACTIVO)' : '(INACTIVO)';
      console.log(`      ID ${sc.id_situacion_civil}: ${sc.nombre} ${estado}`);
    });

    // 2. Eliminar un registro para crear un gap
    if (existentes.length > 0) {
      const aEliminar = existentes.find(sc => sc.nombre.includes('Test ID'));
      if (aEliminar) {
        console.log(`\n2️⃣ ELIMINANDO REGISTRO ID ${aEliminar.id_situacion_civil}`);
        await SituacionCivilService.deleteSituacionCivil(aEliminar.id_situacion_civil);
        console.log(`   ✅ Eliminado: ${aEliminar.nombre}`);
      } else {
        console.log('\n2️⃣ No hay registros de test para eliminar');
      }
    }

    // 3. Verificar próximo ID
    console.log('\n3️⃣ VERIFICANDO PRÓXIMO ID');
    const nextId = await SituacionCivilService.findNextAvailableId();
    console.log(`   🔢 Próximo ID calculado: ${nextId}`);

    // 4. Crear nuevo registro
    console.log('\n4️⃣ CREANDO NUEVO REGISTRO');
    const timestamp = Date.now();
    const nuevoNombre = `Test Reutilización ${timestamp}`;
    
    const nuevo = await SituacionCivilService.createSituacionCivil({
      nombre: nuevoNombre,
      descripcion: "Test de reutilización de ID"
    });
    
    console.log(`   ✅ Creado con ID: ${nuevo.id} - ${nuevoNombre}`);

    // 5. Verificar estado final
    console.log('\n5️⃣ ESTADO FINAL');
    const finales = await SituacionCivilService.getAllSituacionesCiviles({ includeInactive: true });
    console.log('   📋 Registros finales:');
    finales.forEach(sc => {
      const estado = sc.deletedAt ? '(ELIMINADO)' : sc.activo ? '(ACTIVO)' : '(INACTIVO)';
      console.log(`      ID ${sc.id_situacion_civil}: ${sc.nombre} ${estado}`);
    });

    // 6. Análisis de gaps
    console.log('\n6️⃣ ANÁLISIS DE GAPS');
    const idsActivos = finales.filter(sc => !sc.deletedAt).map(sc => sc.id_situacion_civil).sort((a, b) => a - b);
    const idsTotal = finales.map(sc => sc.id_situacion_civil).sort((a, b) => a - b);
    
    console.log(`   📊 IDs activos: [${idsActivos.join(', ')}]`);
    console.log(`   📊 IDs totales: [${idsTotal.join(', ')}]`);
    
    // Buscar gaps en IDs totales
    const gaps = [];
    for (let i = 1; i <= Math.max(...idsTotal); i++) {
      if (!idsTotal.includes(i)) {
        gaps.push(i);
      }
    }
    
    if (gaps.length > 0) {
      console.log(`   ⚠️  Gaps encontrados: [${gaps.join(', ')}]`);
    } else {
      console.log('   ✅ No hay gaps en la secuencia total');
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.details) {
      console.error('   Detalles:', error.details);
    }
  } finally {
    process.exit(0);
  }
}

testReutilizacionIds();