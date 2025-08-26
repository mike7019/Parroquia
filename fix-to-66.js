import sequelize from './config/sequelize.js';

async function fixSequenceTo66() {
  try {
    console.log('Setting familias sequence to 66...');
    
    await sequelize.query("SELECT setval('familias_id_familia_seq', 66, false)");
    
    const [result] = await sequelize.query('SELECT last_value FROM familias_id_familia_seq');
    console.log('✅ Sequence set to:', result[0]?.last_value);
    
    // Test that next insert will use 66
    console.log('Testing next insert...');
    const [testResult] = await sequelize.query(`
      INSERT INTO familias (
        apellido_familiar, sector, direccion_familia, tamaño_familia, 
        tipo_vivienda, estado_encuesta, numero_encuestas
      ) VALUES (
        'TEST_66', 'TEST', 'TEST', 1, 'Casa', 'pending', 0
      ) RETURNING id_familia
    `);
    
    const newId = testResult[0]?.id_familia;
    console.log('✅ New insert got ID:', newId);
    
    // Clean up test
    await sequelize.query(`DELETE FROM familias WHERE id_familia = ${newId}`);
    console.log('🧹 Test data cleaned');
    
    await sequelize.close();
    console.log('🎉 Sequence fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

fixSequenceTo66();
