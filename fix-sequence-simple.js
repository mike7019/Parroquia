import sequelize from './config/sequelize.js';

console.log('🔧 Fixing familias sequence...');

async function fixSequence() {
  try {
    // Get current max ID
    const [maxResult] = await sequelize.query(`
      SELECT MAX(id_familia) as max_id FROM familias
    `);
    
    const maxId = maxResult[0]?.max_id || 0;
    console.log(`Current max ID: ${maxId}`);
    
    // Check current sequence value
    try {
      const [seqResult] = await sequelize.query(`
        SELECT last_value, is_called FROM familias_id_familia_seq
      `);
      console.log('Current sequence:', seqResult[0]);
      
      // Fix sequence - set it to max_id + 1
      const nextValue = maxId + 1;
      await sequelize.query(`
        SELECT setval('familias_id_familia_seq', ${nextValue}, false)
      `);
      
      console.log(`✅ Sequence reset to ${nextValue}`);
      
    } catch (error) {
      console.log('⚠️ Sequence does not exist, creating...');
      
      // Create sequence
      await sequelize.query(`
        CREATE SEQUENCE familias_id_familia_seq START ${maxId + 1}
      `);
      
      // Set as default
      await sequelize.query(`
        ALTER TABLE familias ALTER COLUMN id_familia 
        SET DEFAULT nextval('familias_id_familia_seq')
      `);
      
      console.log('✅ Sequence created and configured');
    }
    
    // Test insert
    console.log('🧪 Testing insert...');
    
    const [testResult] = await sequelize.query(`
      INSERT INTO familias (
        apellido_familiar, sector, direccion_familia, tamaño_familia, 
        tipo_vivienda, estado_encuesta, numero_encuestas
      ) VALUES (
        'TEST', 'TEST', 'TEST', 1, 'Casa', 'pending', 0
      ) RETURNING id_familia
    `);
    
    const newId = testResult[0]?.id_familia;
    console.log(`✅ Test insert successful, new ID: ${newId}`);
    
    // Clean up
    await sequelize.query(`DELETE FROM familias WHERE id_familia = ${newId}`);
    console.log('🧹 Test data cleaned');
    
    await sequelize.close();
    console.log('🎉 Sequence fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

fixSequence();
