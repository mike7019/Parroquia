/**
 * Script para eliminar REALMENTE todos los registros y corregir secuencia
 */

import './src/models/index.js';
import sequelize from './config/sequelize.js';

async function corregirTablaSituacionesCiviles() {
  console.log('🔧 CORRIGIENDO TABLA SITUACIONES CIVILES');
  
  try {
    console.log('\n1️⃣ Eliminando TODOS los registros físicamente...');
    
    // Eliminación física completa usando SQL directo
    const [deleteResult] = await sequelize.query(
      'DELETE FROM situaciones_civiles',
      { type: sequelize.QueryTypes.DELETE }
    );
    
    console.log(`✅ Registros eliminados: ${deleteResult || 'todos'}`);
    
    // Verificar que la tabla esté vacía
    console.log('\n2️⃣ Verificando tabla vacía...');
    const SituacionCivil = sequelize.models.SituacionCivil;
    const count = await SituacionCivil.count({ paranoid: false });
    console.log(`   Registros restantes: ${count}`);
    
    if (count > 0) {
      console.log('❌ Aún quedan registros. Intentando eliminación más agresiva...');
      await sequelize.query('TRUNCATE TABLE situaciones_civiles RESTART IDENTITY CASCADE');
      console.log('✅ TRUNCATE ejecutado');
    }
    
    // Resetear secuencia correctamente
    console.log('\n3️⃣ Reseteando secuencia...');
    await sequelize.query(
      "SELECT setval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil'), 1, false)"
    );
    console.log('✅ Secuencia reseteada a 1');
    
    // Verificar final
    console.log('\n4️⃣ Verificación final...');
    const finalCount = await SituacionCivil.count({ paranoid: false });
    console.log(`   Registros finales: ${finalCount}`);
    
    // Test de creación
    console.log('\n5️⃣ Test de creación...');
    const testRegistro = await SituacionCivil.create({
      nombre: 'Test Funcionamiento',
      descripcion: 'Prueba que la secuencia funciona'
    });
    
    console.log(`✅ Test exitoso - Registro creado con ID: ${testRegistro.id_situacion_civil}`);
    
    // Limpiar test
    await testRegistro.destroy({ force: true });
    await sequelize.query(
      "SELECT setval(pg_get_serial_sequence('situaciones_civiles', 'id_situacion_civil'), 1, false)"
    );
    
    console.log('✅ CORRECCIÓN COMPLETADA - Tabla lista para usar');
    
  } catch (error) {
    console.error('💥 Error:', error);
  }

  process.exit(0);
}

corregirTablaSituacionesCiviles();