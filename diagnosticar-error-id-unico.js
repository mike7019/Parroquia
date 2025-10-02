/**
 * Diagnóstico del error: "id_situacion_civil must be unique"
 */

import './src/models/index.js';
import sequelize from './config/sequelize.js';

async function diagnosticarErrorID() {
  console.log('🔍 DIAGNOSTICANDO ERROR: "id_situacion_civil must be unique"');
  
  try {
    const SituacionCivil = sequelize.models.SituacionCivil;
    
    // 1. Verificar registros existentes
    console.log('\n1️⃣ Verificando registros existentes...');
    const todosLosRegistros = await SituacionCivil.findAll({
      attributes: ['id_situacion_civil', 'nombre', 'fechaEliminacion'],
      order: [['id_situacion_civil', 'ASC']],
      paranoid: false,
      raw: true
    });
    
    console.log(`   Total registros físicos: ${todosLosRegistros.length}`);
    todosLosRegistros.forEach(registro => {
      const estado = registro.fechaEliminacion ? 'SOFT DELETED' : 'ACTIVO';
      console.log(`   ID ${registro.id_situacion_civil}: ${registro.nombre} (${estado})`);
    });
    
    // 2. Verificar secuencia actual
    console.log('\n2️⃣ Verificando estado de la secuencia...');
    try {
      // Obtener el siguiente valor que la secuencia intentará usar
      const [nextSeqResult] = await sequelize.query(
        "SELECT nextval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil')) as next_value"
      );
      const nextSeqValue = nextSeqResult[0].next_value;
      console.log(`   Próximo valor de secuencia: ${nextSeqValue}`);
      
      // Verificar si ese ID ya existe
      const existeRegistro = todosLosRegistros.find(r => r.id_situacion_civil == nextSeqValue);
      if (existeRegistro) {
        console.log(`   ❌ PROBLEMA: ID ${nextSeqValue} ya existe (${existeRegistro.nombre})`);
        console.log('   🔧 La secuencia está desincronizada');
      } else {
        console.log(`   ✅ ID ${nextSeqValue} está disponible`);
      }
      
    } catch (error) {
      console.log('   ⚠️ No se pudo obtener el próximo valor de secuencia');
    }
    
    // 3. Encontrar el ID más alto
    console.log('\n3️⃣ Encontrando ID más alto...');
    const maxId = Math.max(...todosLosRegistros.map(r => r.id_situacion_civil));
    console.log(`   ID más alto encontrado: ${maxId}`);
    
    // 4. Corregir la secuencia
    console.log('\n4️⃣ Corrigiendo secuencia...');
    const nuevoValorSecuencia = maxId + 1;
    
    await sequelize.query(
      `SELECT setval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil'), ${maxId}, true)`
    );
    
    console.log(`   ✅ Secuencia ajustada. Próximo ID será: ${nuevoValorSecuencia}`);
    
    // 5. Verificar corrección
    console.log('\n5️⃣ Verificando corrección...');
    const [verifyResult] = await sequelize.query(
      "SELECT nextval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil')) as next_value"
    );
    const newNextValue = verifyResult[0].next_value;
    console.log(`   Nuevo próximo valor: ${newNextValue}`);
    
    // Verificar que no existe conflicto
    const conflicto = todosLosRegistros.find(r => r.id_situacion_civil == newNextValue);
    if (!conflicto) {
      console.log(`   ✅ ID ${newNextValue} está libre - problema resuelto`);
    } else {
      console.log(`   ❌ Aún hay conflicto con ID ${newNextValue}`);
    }
    
  } catch (error) {
    console.error('💥 Error durante diagnóstico:', error);
  }

  process.exit(0);
}

diagnosticarErrorID();