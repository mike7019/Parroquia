import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

async function testProblemas() {
  console.log('🔍 PROBANDO PROBLEMAS IDENTIFICADOS\n');

  try {
    await sequelize.sync({ alter: false });

    // Problema 1: Verificar si las validaciones funcionan
    console.log('1️⃣ PROBLEMA: VALIDACIÓN DE DUPLICADOS');
    
    try {
      // Intentar crear "Soltero(a)" que ya existe
      console.log('   Intentando crear "Soltero(a)" (debería fallar)...');
      const resultado1 = await SituacionCivilService.createSituacionCivil({
        nombre: "Soltero(a)",
        descripcion: "Test duplicado"
      });
      console.log('   ❌ ERROR: Se creó duplicado cuando debería fallar!', resultado1);
    } catch (error) {
      console.log('   ✅ CORRECTO: Validación funcionó -', error.message);
    }

    // Problema 2: Verificar reutilización de IDs
    console.log('\n2️⃣ PROBLEMA: REUTILIZACIÓN DE IDS');
    
    // Ver registros actuales
    const todos = await SituacionCivilService.getAllSituacionesCiviles({ includeInactive: true });
    console.log('   📋 Registros actuales:');
    todos.forEach(sc => {
      const estado = sc.deletedAt ? '(ELIMINADO)' : sc.activo ? '(ACTIVO)' : '(INACTIVO)';
      console.log(`      ID ${sc.id_situacion_civil}: ${sc.nombre} ${estado}`);
    });

    // Verificar próximo ID
    const nextId = await SituacionCivilService.findNextAvailableId();
    console.log(`\n   🔢 Próximo ID que se asignará: ${nextId}`);

    // Crear uno nuevo para ver qué ID obtiene
    const timestamp = Date.now();
    const nuevoNombre = `Test ID ${timestamp}`;
    console.log(`   📝 Creando "${nuevoNombre}"...`);
    
    const nuevo = await SituacionCivilService.createSituacionCivil({
      nombre: nuevoNombre,
      descripcion: "Test para verificar ID"
    });
    
    console.log(`   ✅ Creado con ID: ${nuevo.id}`);
    
    // Verificar si reutilizó un gap o siguió secuencial
    const idsUsados = todos.map(sc => sc.id_situacion_civil).sort((a, b) => a - b);
    console.log(`   📊 IDs en uso: [${idsUsados.join(', ')}]`);
    
    let hayGaps = false;
    for (let i = 0; i < idsUsados.length; i++) {
      if (idsUsados[i] !== i + 1) {
        hayGaps = true;
        console.log(`   ⚠️  Gap encontrado: esperaba ID ${i + 1}, encontró ${idsUsados[i]}`);
        break;
      }
    }
    
    if (!hayGaps) {
      console.log('   ✅ No hay gaps en la secuencia');
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

testProblemas();