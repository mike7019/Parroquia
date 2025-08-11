/**
 * Script para sincronizar el modelo SistemaAcueducto con la base de datos
 */

import sequelize from './config/sequelize.js';
import SistemaAcueducto from './src/models/catalog/SistemaAcueducto.js';

async function syncSistemaAcueducto() {
  try {
    console.log('🔄 Sincronizando modelo SistemaAcueducto con la base de datos...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Verificar estado actual de la tabla
    console.log('📋 Estado actual de la tabla sistemas_acueducto:');
    const [currentStructure] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'sistemas_acueducto'
      ORDER BY ordinal_position
    `);
    console.log('Estructura actual:', currentStructure);

    // Verificar índices únicos existentes
    console.log('\n🔍 Verificando índices únicos existentes:');
    const [uniqueConstraints] = await sequelize.query(`
      SELECT constraint_name, column_name
      FROM information_schema.key_column_usage 
      WHERE table_name = 'sistemas_acueducto' 
      AND constraint_name LIKE '%unique%' OR constraint_name LIKE '%pkey%'
    `);
    console.log('Restricciones únicas:', uniqueConstraints);

    // Sincronizar el modelo (alter: true para actualizar la estructura)
    console.log('\n🔧 Sincronizando modelo...');
    await SistemaAcueducto.sync({ alter: true });
    console.log('✅ Modelo sincronizado exitosamente');

    // Verificar nueva estructura
    console.log('\n📋 Nueva estructura de la tabla:');
    const [newStructure] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'sistemas_acueducto'
      ORDER BY ordinal_position
    `);
    console.log('Nueva estructura:', newStructure);

    // Verificar nuevos índices únicos
    console.log('\n🔍 Verificando nuevos índices únicos:');
    const [newUniqueConstraints] = await sequelize.query(`
      SELECT constraint_name, column_name
      FROM information_schema.key_column_usage 
      WHERE table_name = 'sistemas_acueducto' 
      AND constraint_name LIKE '%unique%' OR constraint_name LIKE '%pkey%'
    `);
    console.log('Nuevas restricciones únicas:', newUniqueConstraints);

    // Probar la restricción única
    console.log('\n🧪 Probando restricción única...');
    try {
      // Intentar crear dos registros con el mismo nombre
      const testName = `Test Único ${Date.now()}`;
      
      const sistema1 = await SistemaAcueducto.create({
        nombre: testName,
        descripcion: 'Primer sistema de prueba'
      });
      console.log('✅ Primer sistema creado:', sistema1.nombre);

      try {
        const sistema2 = await SistemaAcueducto.create({
          nombre: testName, // Mismo nombre
          descripcion: 'Segundo sistema de prueba'
        });
        console.log('❌ ERROR: Se permitió crear sistema duplicado');
      } catch (uniqueError) {
        console.log('✅ Restricción única funcionando:', uniqueError.name);
      }

      // Limpiar el registro de prueba
      await sistema1.destroy();
      console.log('🧹 Registro de prueba eliminado');

    } catch (testError) {
      console.log('⚠️ Error durante la prueba:', testError.message);
    }

    console.log('\n🎉 Sincronización completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n📪 Conexión cerrada');
  }
}

// Ejecutar la sincronización
syncSistemaAcueducto();
