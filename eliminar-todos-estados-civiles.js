/**
 * Script para eliminar TODOS los estados civiles para creación manual
 */

import './src/models/index.js';
import sequelize from './config/sequelize.js';

async function eliminarTodosEstadosCiviles() {
  console.log('🗑️ ELIMINANDO TODOS LOS ESTADOS CIVILES PARA CREACIÓN MANUAL');
  
  try {
    const SituacionCivil = sequelize.models.SituacionCivil;
    
    // 1. Mostrar registros actuales
    console.log('\n1️⃣ Estados civiles actuales:');
    const registrosActuales = await SituacionCivil.findAll({
      attributes: ['id_situacion_civil', 'nombre'],
      order: [['id_situacion_civil', 'ASC']],
      paranoid: false,
      raw: true
    });
    
    console.log(`   Total registros: ${registrosActuales.length}`);
    registrosActuales.forEach(registro => {
      console.log(`   ID ${registro.id_situacion_civil}: ${registro.nombre}`);
    });
    
    if (registrosActuales.length === 0) {
      console.log('   ✅ No hay registros para eliminar');
      process.exit(0);
    }
    
    // 2. Eliminación física completa
    console.log('\n2️⃣ Eliminando TODOS los registros físicamente...');
    
    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar todos los registros físicamente
      await sequelize.query(
        'DELETE FROM situaciones_civiles',
        {
          type: sequelize.QueryTypes.DELETE,
          transaction
        }
      );
      
      await transaction.commit();
      console.log(`   ✅ ${registrosActuales.length} registros eliminados físicamente`);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
    // 3. Verificar eliminación completa
    console.log('\n3️⃣ Verificando eliminación...');
    const verificacion = await SituacionCivil.count({ paranoid: false });
    
    if (verificacion === 0) {
      console.log('   ✅ Tabla completamente vacía');
    } else {
      console.log(`   ❌ Aún quedan ${verificacion} registros`);
    }
    
    // 4. Resetear secuencia AUTO_INCREMENT
    console.log('\n4️⃣ Reseteando secuencia AUTO_INCREMENT...');
    await sequelize.query(
      "SELECT setval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil'), 1, false)"
    );
    console.log('   ✅ Secuencia reseteada - próximo ID será 1');
    
    // 5. Verificación final
    console.log('\n5️⃣ Verificación final...');
    const countFinal = await SituacionCivil.count({ paranoid: false });
    console.log(`   Registros finales: ${countFinal}`);
    
    if (countFinal === 0) {
      console.log('\n🎉 ¡ELIMINACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('   ✅ Tabla situaciones_civiles completamente vacía');
      console.log('   ✅ Secuencia AUTO_INCREMENT reseteada a 1');
      console.log('   ✅ Listo para crear estados civiles manualmente');
      console.log('');
      console.log('📝 PRÓXIMOS PASOS:');
      console.log('   1. Los nuevos registros empezarán con ID = 1');
      console.log('   2. Puedes crear los estados civiles que necesites');
      console.log('   3. Los IDs se asignarán secuencialmente: 1, 2, 3, ...');
      console.log('   4. El algoritmo de reutilización funcionará para futuros gaps');
    } else {
      console.log('\n❌ Error: La tabla no está completamente vacía');
    }
    
  } catch (error) {
    console.error('💥 Error durante eliminación:', error);
  }

  process.exit(0);
}

eliminarTodosEstadosCiviles();