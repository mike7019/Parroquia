import sequelize from './config/sequelize.js';

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Verificar tabla familias
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as count,
        MAX(id_familia) as max_id,
        MIN(id_familia) as min_id
      FROM familias;
    `);
    
    console.log(`📊 Estado de la tabla familias:`);
    console.log(`   - Total de familias: ${results[0].count}`);
    console.log(`   - ID máximo: ${results[0].max_id}`);
    console.log(`   - ID mínimo: ${results[0].min_id}`);
    
    // Verificar secuencias
    const [sequences] = await sequelize.query(`
      SELECT schemaname, sequencename, last_value 
      FROM pg_sequences 
      WHERE sequencename LIKE '%familias%';
    `);
    
    console.log('🔢 Secuencias relacionadas con familias:');
    if (sequences.length === 0) {
      console.log('   - No se encontraron secuencias');
    } else {
      sequences.forEach(seq => {
        console.log(`   - ${seq.sequencename}: ${seq.last_value}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
