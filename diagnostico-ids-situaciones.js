import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
import models from './src/models/index.js';

async function diagnosticarIDs() {
  console.log('🔍 DIAGNÓSTICO DE PROBLEMA DE IDs\n');

  try {
    await sequelize.sync({ alter: false });

    const SituacionCivil = sequelize.models.SituacionCivil;

    // 1. Ver TODOS los registros físicamente existentes
    console.log('1️⃣ REGISTROS FÍSICAMENTE EXISTENTES (paranoid: false)');
    const todosRegistros = await SituacionCivil.findAll({
      paranoid: false,
      order: [['id_situacion_civil', 'ASC']]
    });

    console.log(`   Total físicos: ${todosRegistros.length}`);
    todosRegistros.forEach(reg => {
      const estado = reg.fechaEliminacion ? '(SOFT DELETED)' : reg.activo ? '(ACTIVO)' : '(INACTIVO)';
      console.log(`   ID ${reg.id_situacion_civil}: ${reg.nombre} ${estado}`);
    });

    // 2. IDs físicamente existentes
    const idsExistentes = todosRegistros.map(r => r.id_situacion_civil).sort((a, b) => a - b);
    console.log(`\n2️⃣ IDs FÍSICAMENTE EXISTENTES: [${idsExistentes.join(', ')}]`);

    // 3. Simular algoritmo actual
    console.log('\n3️⃣ SIMULANDO ALGORITMO ACTUAL:');
    
    if (idsExistentes.length === 0) {
      console.log('   → Caso: Sin registros → ID 1');
    } else {
      console.log(`   → IDs ordenados: [${idsExistentes.join(', ')}]`);
      console.log(`   → Rango a evaluar: 1 hasta ${idsExistentes[idsExistentes.length - 1]}`);
      
      let gapEncontrado = false;
      for (let i = 1; i <= idsExistentes[idsExistentes.length - 1]; i++) {
        if (!idsExistentes.includes(i)) {
          console.log(`   → GAP ENCONTRADO: ID ${i} está libre`);
          gapEncontrado = true;
          break;
        }
      }
      
      if (!gapEncontrado) {
        const siguienteId = idsExistentes[idsExistentes.length - 1] + 1;
        console.log(`   → Sin gaps → Siguiente secuencial: ID ${siguienteId}`);
      }
    }

    // 4. Probar función real
    console.log('\n4️⃣ RESULTADO FUNCIÓN REAL:');
    const proximoId = await SituacionCivilService.findNextAvailableId();
    console.log(`   Próximo ID calculado: ${proximoId}`);

    // 5. Análisis de problema
    console.log('\n5️⃣ ANÁLISIS:');
    if (idsExistentes.includes(1) && idsExistentes.includes(2)) {
      if (proximoId === 6 && !idsExistentes.includes(3) && !idsExistentes.includes(4) && !idsExistentes.includes(5)) {
        console.log('   ❌ PROBLEMA: Algoritmo no detecta gaps entre 2 y 6');
      } else if (proximoId === 6 && idsExistentes.includes(3) && idsExistentes.includes(4) && idsExistentes.includes(5)) {
        console.log('   ✅ NORMAL: Secuencia continua 1,2,3,4,5 → siguiente es 6');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

diagnosticarIDs();