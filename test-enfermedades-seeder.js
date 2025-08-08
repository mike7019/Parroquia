import sequelize from './config/sequelize.js';
import { seedEnfermedades } from './src/seeders/configSeeder.js';

/**
 * Script para probar específicamente el seeder de enfermedades
 * Uso: node test-enfermedades-seeder.js
 */

async function testEnfermedadesSeeder() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('\n🧪 Probando seeder de enfermedades...');
    
    // Verificar si la tabla existe
    try {
      const [results] = await sequelize.query(
        "SELECT COUNT(*) as count FROM enfermedades"
      );
      console.log(`📊 Registros actuales en enfermedades: ${results[0].count}`);
    } catch (error) {
      console.log('⚠️  La tabla enfermedades no existe o no se puede consultar');
      console.log('   Esto es normal si no has ejecutado las migraciones');
      return;
    }

    // Ejecutar el seeder
    const result = await seedEnfermedades();
    
    if (result) {
      console.log('✅ Seeder de enfermedades ejecutado exitosamente');
      
      // Verificar que se insertaron los datos
      const [finalResults] = await sequelize.query(
        "SELECT COUNT(*) as count FROM enfermedades"
      );
      console.log(`📊 Registros finales en enfermedades: ${finalResults[0].count}`);
      
      // Mostrar algunas enfermedades como ejemplo
      const [sampleResults] = await sequelize.query(
        "SELECT id_enfermedad, nombre, descripcion FROM enfermedades LIMIT 5"
      );
      
      console.log('\n📋 Ejemplos de enfermedades insertadas:');
      sampleResults.forEach((enfermedad, index) => {
        console.log(`  ${index + 1}. ${enfermedad.nombre}`);
        console.log(`     📝 ${enfermedad.descripcion?.substring(0, 100)}...`);
      });
      
    } else {
      console.log('ℹ️  Seeder omitido - La tabla ya contenía datos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 Sugerencia: Ejecuta las migraciones primero:');
      console.log('   npx sequelize-cli db:migrate');
      console.log('   o');
      console.log('   node syncDatabase.js');
    }
  } finally {
    try {
      await sequelize.close();
      console.log('🔌 Conexión cerrada');
    } catch (closeError) {
      console.warn('⚠️  Error cerrando conexión:', closeError.message);
    }
  }
}

// Ejecutar el test
testEnfermedadesSeeder();
